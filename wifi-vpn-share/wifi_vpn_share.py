#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
wifi_vpn_share — Single-file VPN/Proxy Wi-Fi sharing tool.

Turn a machine into a Wi-Fi hotspot and route the connected clients' traffic
through a VPN (WireGuard / OpenVPN) or an upstream proxy (SOCKS5 / HTTP).
Everything is in this one file and depends only on the Python standard library.

Subcommands
-----------
  doctor    Check that the tools needed on this OS are available.
  proxy     Run only the local proxy (SOCKS5 + HTTP CONNECT). Optionally
            chain every outgoing connection through an upstream proxy.
  share     Bring up a Wi-Fi hotspot and route its clients out through a VPN
            (default) or through the built-in proxy chain, applying NAT.
  stop      Tear down the hotspot / NAT that `share` created.
  status    Show what is currently running.

Highlights
----------
  * Pure standard library — no pip install required to run the script.
  * Cross-platform hotspot back-ends: Linux (NetworkManager `nmcli`, or
    `hostapd`+`dnsmasq`), Windows (`netsh` hosted network), macOS (guided
    Internet Sharing, since Apple has no scriptable AP API).
  * Built-in async SOCKS5 + HTTP-CONNECT proxy that can forward to an
    upstream SOCKS5/HTTP proxy (traffic chaining).
  * VPN bring-up via `wg-quick` (WireGuard) or `openvpn`.
  * Config from CLI flags and/or a JSON config file.

IMPORTANT: creating a hotspot, bringing up a VPN and editing NAT rules needs
root/Administrator privileges and a wireless adapter that supports AP mode.
The `proxy` subcommand needs neither and runs anywhere.

Author: generated for the "232" workspace.
License: MIT
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
import platform
import select
import shutil
import signal
import socket
import struct
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field, asdict
from typing import Optional

APP_NAME = "wifi_vpn_share"
VERSION = "1.0.0"
STATE_DIR = os.path.join(
    os.environ.get("XDG_STATE_HOME", os.path.expanduser("~/.local/state")),
    APP_NAME,
)
STATE_FILE = os.path.join(STATE_DIR, "state.json")


# --------------------------------------------------------------------------- #
# Small utilities
# --------------------------------------------------------------------------- #
def log(msg: str, *, level: str = "info") -> None:
    prefix = {
        "info": "[*]",
        "ok": "[+]",
        "warn": "[!]",
        "err": "[x]",
        "step": "==>",
    }.get(level, "[*]")
    stream = sys.stderr if level in ("warn", "err") else sys.stdout
    print(f"{prefix} {msg}", file=stream, flush=True)


def which(name: str) -> Optional[str]:
    return shutil.which(name)


def is_root() -> bool:
    if hasattr(os, "geteuid"):
        return os.geteuid() == 0
    # Windows: best-effort admin check
    try:
        import ctypes  # noqa: WPS433 (local import is intentional)

        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def run(cmd: list[str], *, check: bool = True, capture: bool = False,
        dry_run: bool = False) -> subprocess.CompletedProcess:
    """Run a command, echoing it. With dry_run only print what would happen."""
    printable = " ".join(cmd)
    if dry_run:
        log(f"DRY-RUN: {printable}", level="step")
        return subprocess.CompletedProcess(cmd, 0, "", "")
    log(printable, level="step")
    return subprocess.run(
        cmd,
        check=check,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )


def ensure_state_dir() -> None:
    os.makedirs(STATE_DIR, exist_ok=True)


def save_state(state: dict) -> None:
    ensure_state_dir()
    with open(STATE_FILE, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2)


def load_state() -> dict:
    try:
        with open(STATE_FILE, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def clear_state() -> None:
    try:
        os.remove(STATE_FILE)
    except OSError:
        pass


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
@dataclass
class Config:
    # Hotspot
    ssid: str = "VPN-Share"
    password: str = "changeme123"
    wifi_iface: str = ""          # e.g. wlan0 / "Wi-Fi"; auto-detected if empty
    share_iface: str = ""         # upstream/uplink iface for NAT (auto if empty)
    band: str = "bg"              # bg (2.4GHz) or a (5GHz)
    channel: int = 6
    gateway_ip: str = "10.42.0.1"
    dhcp_start: str = "10.42.0.10"
    dhcp_end: str = "10.42.0.100"

    # Routing mode: "vpn" or "proxy"
    mode: str = "vpn"

    # VPN
    vpn_kind: str = "wireguard"   # wireguard | openvpn
    vpn_config: str = ""          # path to .conf / .ovpn

    # Local proxy
    proxy_host: str = "0.0.0.0"
    proxy_port: int = 1080

    # Upstream proxy to chain through (optional): scheme://[user:pass@]host:port
    upstream: str = ""

    # Behaviour
    dry_run: bool = False

    @staticmethod
    def from_args(args: argparse.Namespace) -> "Config":
        cfg = Config()
        # start from JSON file if given
        if getattr(args, "config", None):
            with open(args.config, encoding="utf-8") as fh:
                data = json.load(fh)
            for key, val in data.items():
                if hasattr(cfg, key):
                    setattr(cfg, key, val)
        # CLI flags override file values when explicitly provided
        for key in vars(cfg):
            if hasattr(args, key):
                val = getattr(args, key)
                if val is not None:
                    setattr(cfg, key, val)
        return cfg


# --------------------------------------------------------------------------- #
# Upstream proxy parsing + client-side handshake (for chaining)
# --------------------------------------------------------------------------- #
@dataclass
class Upstream:
    scheme: str            # socks5 | http
    host: str
    port: int
    user: Optional[str] = None
    password: Optional[str] = None

    @staticmethod
    def parse(url: str) -> Optional["Upstream"]:
        if not url:
            return None
        raw = url.strip()
        if "://" not in raw:
            raw = "socks5://" + raw
        scheme, rest = raw.split("://", 1)
        scheme = scheme.lower()
        if scheme in ("socks", "socks5", "socks5h"):
            scheme = "socks5"
        elif scheme in ("http", "https", "connect"):
            scheme = "http"
        else:
            raise ValueError(f"Unsupported upstream scheme: {scheme}")
        user = password = None
        if "@" in rest:
            creds, rest = rest.rsplit("@", 1)
            if ":" in creds:
                user, password = creds.split(":", 1)
            else:
                user = creds
        if ":" not in rest:
            raise ValueError("Upstream must include a port, e.g. host:1080")
        host, port_s = rest.rsplit(":", 1)
        return Upstream(scheme, host, int(port_s), user, password)


def _recv_exact(sock: socket.socket, n: int) -> bytes:
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("connection closed during read")
        buf += chunk
    return buf


def open_via_upstream(up: Upstream, dst_host: str, dst_port: int,
                      timeout: float = 15.0) -> socket.socket:
    """Return a socket connected to dst through the upstream proxy."""
    sock = socket.create_connection((up.host, up.port), timeout=timeout)
    try:
        if up.scheme == "socks5":
            _socks5_client_handshake(sock, up, dst_host, dst_port)
        else:
            _http_connect_client(sock, up, dst_host, dst_port)
        return sock
    except Exception:
        sock.close()
        raise


def _socks5_client_handshake(sock, up: Upstream, host: str, port: int) -> None:
    if up.user:
        sock.sendall(b"\x05\x02\x00\x02")  # no-auth + user/pass
    else:
        sock.sendall(b"\x05\x01\x00")
    ver, method = _recv_exact(sock, 2)
    if ver != 0x05:
        raise ConnectionError("bad SOCKS5 version from upstream")
    if method == 0x02:
        u = (up.user or "").encode()
        p = (up.password or "").encode()
        sock.sendall(b"\x01" + bytes([len(u)]) + u + bytes([len(p)]) + p)
        _, status = _recv_exact(sock, 2)
        if status != 0x00:
            raise ConnectionError("upstream SOCKS5 auth failed")
    elif method != 0x00:
        raise ConnectionError("upstream SOCKS5 refused auth methods")
    # CONNECT request with domain name (let upstream resolve)
    h = host.encode()
    req = b"\x05\x01\x00\x03" + bytes([len(h)]) + h + struct.pack("!H", port)
    sock.sendall(req)
    reply = _recv_exact(sock, 4)
    if reply[1] != 0x00:
        raise ConnectionError(f"upstream SOCKS5 connect failed (code {reply[1]})")
    atyp = reply[3]
    if atyp == 0x01:
        _recv_exact(sock, 4)
    elif atyp == 0x04:
        _recv_exact(sock, 16)
    elif atyp == 0x03:
        ln = _recv_exact(sock, 1)[0]
        _recv_exact(sock, ln)
    _recv_exact(sock, 2)  # bound port


def _http_connect_client(sock, up: Upstream, host: str, port: int) -> None:
    req = f"CONNECT {host}:{port} HTTP/1.1\r\nHost: {host}:{port}\r\n"
    if up.user:
        import base64

        token = base64.b64encode(
            f"{up.user}:{up.password or ''}".encode()
        ).decode()
        req += f"Proxy-Authorization: Basic {token}\r\n"
    req += "\r\n"
    sock.sendall(req.encode())
    # read until end of headers
    data = b""
    while b"\r\n\r\n" not in data:
        chunk = sock.recv(4096)
        if not chunk:
            raise ConnectionError("upstream closed during CONNECT")
        data += chunk
    status_line = data.split(b"\r\n", 1)[0].decode(errors="replace")
    if " 200 " not in status_line:
        raise ConnectionError(f"upstream CONNECT failed: {status_line}")


# --------------------------------------------------------------------------- #
# Local proxy server: SOCKS5 + HTTP CONNECT on one port
# --------------------------------------------------------------------------- #
class ProxyServer:
    def __init__(self, host: str, port: int, upstream: Optional[Upstream] = None):
        self.host = host
        self.port = port
        self.upstream = upstream
        self._srv: Optional[socket.socket] = None
        self._threads: list[threading.Thread] = []
        self._stop = threading.Event()
        self.bytes_up = 0
        self.bytes_down = 0
        self._lock = threading.Lock()

    def start(self) -> None:
        self._srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._srv.bind((self.host, self.port))
        self._srv.listen(128)
        self._srv.settimeout(1.0)
        via = f" -> upstream {self.upstream.scheme}://{self.upstream.host}:{self.upstream.port}" \
            if self.upstream else " (direct)"
        log(f"proxy listening on {self.host}:{self.port}{via}", level="ok")

    def serve_forever(self) -> None:
        assert self._srv is not None
        while not self._stop.is_set():
            try:
                client, addr = self._srv.accept()
            except socket.timeout:
                continue
            except OSError:
                break
            t = threading.Thread(target=self._handle, args=(client, addr),
                                 daemon=True)
            t.start()
            self._threads.append(t)

    def stop(self) -> None:
        self._stop.set()
        if self._srv:
            try:
                self._srv.close()
            except OSError:
                pass

    # -- request handling ------------------------------------------------- #
    def _handle(self, client: socket.socket, addr) -> None:
        try:
            client.settimeout(30)
            first = client.recv(1, socket.MSG_PEEK)
            if not first:
                return
            if first == b"\x05":
                self._handle_socks5(client)
            else:
                self._handle_http(client)
        except Exception as exc:  # keep one bad client from killing the server
            log(f"client {addr} error: {exc}", level="warn")
        finally:
            try:
                client.close()
            except OSError:
                pass

    def _connect_out(self, host: str, port: int) -> socket.socket:
        if self.upstream:
            return open_via_upstream(self.upstream, host, port)
        return socket.create_connection((host, port), timeout=15)

    def _handle_socks5(self, client: socket.socket) -> None:
        ver, nmethods = _recv_exact(client, 2)
        _recv_exact(client, nmethods)  # ignore offered methods
        client.sendall(b"\x05\x00")    # no auth required to the LAN client
        header = _recv_exact(client, 4)
        if header[1] != 0x01:          # only CONNECT
            client.sendall(b"\x05\x07\x00\x01\x00\x00\x00\x00\x00\x00")
            return
        atyp = header[3]
        if atyp == 0x01:
            host = socket.inet_ntoa(_recv_exact(client, 4))
        elif atyp == 0x03:
            ln = _recv_exact(client, 1)[0]
            host = _recv_exact(client, ln).decode()
        elif atyp == 0x04:
            host = socket.inet_ntop(socket.AF_INET6, _recv_exact(client, 16))
        else:
            client.sendall(b"\x05\x08\x00\x01\x00\x00\x00\x00\x00\x00")
            return
        port = struct.unpack("!H", _recv_exact(client, 2))[0]
        try:
            remote = self._connect_out(host, port)
        except Exception:
            client.sendall(b"\x05\x05\x00\x01\x00\x00\x00\x00\x00\x00")
            return
        client.sendall(b"\x05\x00\x00\x01\x00\x00\x00\x00\x00\x00")
        self._pump(client, remote)

    def _handle_http(self, client: socket.socket) -> None:
        data = b""
        while b"\r\n\r\n" not in data:
            chunk = client.recv(4096)
            if not chunk:
                return
            data += chunk
        head, _, rest = data.partition(b"\r\n\r\n")
        request_line = head.split(b"\r\n", 1)[0].decode(errors="replace")
        try:
            method, target, _ = request_line.split(" ", 2)
        except ValueError:
            return

        if method.upper() == "CONNECT":
            host, _, port_s = target.partition(":")
            port = int(port_s or 443)
            try:
                remote = self._connect_out(host, port)
            except Exception:
                client.sendall(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
                return
            client.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")
            self._pump(client, remote)
        else:
            # plain HTTP proxying: target is an absolute URL
            host, port, path = _split_http_target(target)
            try:
                remote = self._connect_out(host, port)
            except Exception:
                client.sendall(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
                return
            new_head = head.replace(target.encode(), path.encode(), 1)
            remote.sendall(new_head + b"\r\n\r\n" + rest)
            self._pump(client, remote)

    def _pump(self, a: socket.socket, b: socket.socket) -> None:
        a.settimeout(None)
        b.settimeout(None)
        sockets = [a, b]
        try:
            while True:
                r, _, x = select.select(sockets, [], sockets, 60)
                if x:
                    break
                if not r:
                    continue
                for s in r:
                    other = b if s is a else a
                    buf = s.recv(65536)
                    if not buf:
                        return
                    other.sendall(buf)
                    with self._lock:
                        if s is a:
                            self.bytes_up += len(buf)
                        else:
                            self.bytes_down += len(buf)
        finally:
            for s in sockets:
                try:
                    s.close()
                except OSError:
                    pass


def _split_http_target(target: str) -> tuple[str, int, str]:
    if "://" in target:
        target = target.split("://", 1)[1]
    host_part, _, path = target.partition("/")
    path = "/" + path
    if ":" in host_part:
        host, port_s = host_part.rsplit(":", 1)
        return host, int(port_s), path
    return host_part, 80, path


# --------------------------------------------------------------------------- #
# Platform helpers
# --------------------------------------------------------------------------- #
def current_os() -> str:
    return platform.system().lower()  # linux | windows | darwin


def detect_default_iface_linux() -> str:
    try:
        out = subprocess.run(
            ["ip", "route", "show", "default"],
            text=True, capture_output=True, check=False,
        ).stdout
        parts = out.split()
        if "dev" in parts:
            return parts[parts.index("dev") + 1]
    except Exception:
        pass
    return ""


def detect_wifi_iface_linux() -> str:
    # Prefer a wireless device from /sys/class/net/*/wireless
    net = "/sys/class/net"
    try:
        for name in sorted(os.listdir(net)):
            if os.path.isdir(os.path.join(net, name, "wireless")):
                return name
    except OSError:
        pass
    return ""


# --------------------------------------------------------------------------- #
# VPN management
# --------------------------------------------------------------------------- #
class VPNManager:
    def __init__(self, cfg: Config):
        self.cfg = cfg

    def up(self) -> Optional[str]:
        cfg = self.cfg
        if not cfg.vpn_config:
            raise SystemExit("VPN mode needs --vpn-config <path to .conf/.ovpn>")
        if not os.path.exists(cfg.vpn_config) and not cfg.dry_run:
            raise SystemExit(f"VPN config not found: {cfg.vpn_config}")
        if cfg.vpn_kind == "wireguard":
            if not which("wg-quick") and not cfg.dry_run:
                raise SystemExit("wg-quick not found (install wireguard-tools)")
            run(["wg-quick", "up", cfg.vpn_config], dry_run=cfg.dry_run)
            iface = os.path.splitext(os.path.basename(cfg.vpn_config))[0]
            return iface
        if cfg.vpn_kind == "openvpn":
            if not which("openvpn") and not cfg.dry_run:
                raise SystemExit("openvpn not found (install openvpn)")
            run(["openvpn", "--config", cfg.vpn_config, "--daemon",
                 f"ovpn-{APP_NAME}"], dry_run=cfg.dry_run)
            return "tun0"
        raise SystemExit(f"Unknown vpn kind: {cfg.vpn_kind}")

    def down(self, iface: Optional[str]) -> None:
        cfg = self.cfg
        if cfg.vpn_kind == "wireguard" and cfg.vpn_config:
            run(["wg-quick", "down", cfg.vpn_config],
                check=False, dry_run=cfg.dry_run)
        elif cfg.vpn_kind == "openvpn":
            run(["pkill", "-f", f"ovpn-{APP_NAME}"],
                check=False, dry_run=cfg.dry_run)


# --------------------------------------------------------------------------- #
# Linux hotspot + NAT
# --------------------------------------------------------------------------- #
class LinuxHotspot:
    def __init__(self, cfg: Config):
        self.cfg = cfg

    def _backend(self) -> str:
        if which("nmcli"):
            return "nmcli"
        if which("hostapd") and which("dnsmasq"):
            return "hostapd"
        raise SystemExit(
            "No hotspot backend found. Install NetworkManager (nmcli) "
            "or both hostapd and dnsmasq."
        )

    def up(self) -> dict:
        cfg = self.cfg
        wifi = cfg.wifi_iface or detect_wifi_iface_linux()
        if not wifi and not cfg.dry_run:
            raise SystemExit("Could not detect a Wi-Fi interface; pass --wifi-iface")
        wifi = wifi or "wlan0"
        backend = "nmcli" if cfg.dry_run and not which("hostapd") else self._backend()
        log(f"hotspot backend: {backend}, wifi iface: {wifi}", level="info")
        if backend == "nmcli":
            self._up_nmcli(wifi)
        else:
            self._up_hostapd(wifi)
        return {"backend": backend, "wifi_iface": wifi}

    def _up_nmcli(self, wifi: str) -> None:
        cfg = self.cfg
        con = f"{APP_NAME}-{cfg.ssid}"
        run(["nmcli", "connection", "delete", con], check=False,
            dry_run=cfg.dry_run)
        run(["nmcli", "device", "wifi", "hotspot", "ifname", wifi,
             "con-name", con, "ssid", cfg.ssid, "password", cfg.password],
            dry_run=cfg.dry_run)
        run(["nmcli", "connection", "modify", con,
             "802-11-wireless.band", cfg.band,
             "802-11-wireless.channel", str(cfg.channel)],
            check=False, dry_run=cfg.dry_run)

    def _up_hostapd(self, wifi: str) -> None:
        cfg = self.cfg
        hostapd_conf = os.path.join(STATE_DIR, "hostapd.conf")
        dnsmasq_conf = os.path.join(STATE_DIR, "dnsmasq.conf")
        ensure_state_dir()
        hw = "a" if cfg.band == "a" else "g"
        if not cfg.dry_run:
            with open(hostapd_conf, "w", encoding="utf-8") as fh:
                fh.write(
                    f"interface={wifi}\ndriver=nl80211\nssid={cfg.ssid}\n"
                    f"hw_mode={hw}\nchannel={cfg.channel}\n"
                    f"wpa=2\nwpa_key_mgmt=WPA-PSK\nrsn_pairwise=CCMP\n"
                    f"wpa_passphrase={cfg.password}\n"
                )
            with open(dnsmasq_conf, "w", encoding="utf-8") as fh:
                fh.write(
                    f"interface={wifi}\nbind-interfaces\n"
                    f"dhcp-range={cfg.dhcp_start},{cfg.dhcp_end},12h\n"
                    f"dhcp-option=3,{cfg.gateway_ip}\n"
                    f"dhcp-option=6,{cfg.gateway_ip}\n"
                )
        run(["ip", "addr", "add", f"{cfg.gateway_ip}/24", "dev", wifi],
            check=False, dry_run=cfg.dry_run)
        run(["ip", "link", "set", wifi, "up"], check=False, dry_run=cfg.dry_run)
        run(["dnsmasq", "-C", dnsmasq_conf], check=False, dry_run=cfg.dry_run)
        run(["hostapd", "-B", hostapd_conf], dry_run=cfg.dry_run)

    def down(self, state: dict) -> None:
        cfg = self.cfg
        backend = state.get("backend", "nmcli")
        if backend == "nmcli":
            con = f"{APP_NAME}-{cfg.ssid}"
            run(["nmcli", "connection", "down", con], check=False,
                dry_run=cfg.dry_run)
            run(["nmcli", "connection", "delete", con], check=False,
                dry_run=cfg.dry_run)
        else:
            run(["pkill", "hostapd"], check=False, dry_run=cfg.dry_run)
            run(["pkill", "-f", os.path.join(STATE_DIR, "dnsmasq.conf")],
                check=False, dry_run=cfg.dry_run)


def linux_nat_up(cfg: Config, wifi: str, out_iface: str) -> None:
    """Enable IP forwarding and MASQUERADE from the hotspot to the uplink."""
    run(["sysctl", "-w", "net.ipv4.ip_forward=1"], dry_run=cfg.dry_run)
    run(["iptables", "-t", "nat", "-A", "POSTROUTING",
         "-o", out_iface, "-j", "MASQUERADE"], dry_run=cfg.dry_run)
    run(["iptables", "-A", "FORWARD", "-i", out_iface, "-o", wifi,
         "-m", "state", "--state", "RELATED,ESTABLISHED", "-j", "ACCEPT"],
        dry_run=cfg.dry_run)
    run(["iptables", "-A", "FORWARD", "-i", wifi, "-o", out_iface,
         "-j", "ACCEPT"], dry_run=cfg.dry_run)


def linux_nat_down(cfg: Config, wifi: str, out_iface: str) -> None:
    run(["iptables", "-t", "nat", "-D", "POSTROUTING",
         "-o", out_iface, "-j", "MASQUERADE"], check=False, dry_run=cfg.dry_run)
    run(["iptables", "-D", "FORWARD", "-i", out_iface, "-o", wifi,
         "-m", "state", "--state", "RELATED,ESTABLISHED", "-j", "ACCEPT"],
        check=False, dry_run=cfg.dry_run)
    run(["iptables", "-D", "FORWARD", "-i", wifi, "-o", out_iface,
         "-j", "ACCEPT"], check=False, dry_run=cfg.dry_run)


# --------------------------------------------------------------------------- #
# Windows hotspot (netsh hosted network)
# --------------------------------------------------------------------------- #
class WindowsHotspot:
    def __init__(self, cfg: Config):
        self.cfg = cfg

    def up(self) -> dict:
        cfg = self.cfg
        run(["netsh", "wlan", "set", "hostednetwork", "mode=allow",
             f"ssid={cfg.ssid}", f"key={cfg.password}"], dry_run=cfg.dry_run)
        run(["netsh", "wlan", "start", "hostednetwork"], dry_run=cfg.dry_run)
        log("On Windows also enable Internet Connection Sharing (ICS) on the "
            "uplink adapter, or route the hosted-network adapter through the "
            "VPN/proxy.", level="warn")
        return {"backend": "netsh"}

    def down(self, state: dict) -> None:
        run(["netsh", "wlan", "stop", "hostednetwork"],
            check=False, dry_run=self.cfg.dry_run)


# --------------------------------------------------------------------------- #
# macOS helpers
# --------------------------------------------------------------------------- #
def mac_primary_service() -> str:
    """Best-effort: the first active network service (e.g. 'Wi-Fi')."""
    try:
        out = subprocess.run(
            ["networksetup", "-listallnetworkservices"],
            text=True, capture_output=True, check=False,
        ).stdout.splitlines()
        for line in out[1:]:  # first line is an informational header
            name = line.strip().lstrip("*").strip()
            if name:
                return name
    except Exception:
        pass
    return "Wi-Fi"


def mac_set_socks_proxy(cfg: Config, service: str, host: str, port: int) -> None:
    run(["networksetup", "-setsocksfirewallproxy", service, host, str(port)],
        check=False, dry_run=cfg.dry_run)
    run(["networksetup", "-setsocksfirewallproxystate", service, "on"],
        check=False, dry_run=cfg.dry_run)


def mac_clear_socks_proxy(cfg: Config, service: str) -> None:
    run(["networksetup", "-setsocksfirewallproxystate", service, "off"],
        check=False, dry_run=cfg.dry_run)


# --------------------------------------------------------------------------- #
# Command implementations
# --------------------------------------------------------------------------- #
REQUIRED_TOOLS = {
    "linux": {
        "hotspot": ["nmcli", "hostapd", "dnsmasq"],
        "nat": ["iptables", "sysctl", "ip"],
        "vpn": ["wg-quick", "openvpn"],
    },
    "windows": {"hotspot": ["netsh"], "nat": [], "vpn": ["openvpn"]},
    "darwin": {"hotspot": ["networksetup"], "nat": ["pfctl"],
               "vpn": ["openvpn", "wg-quick"]},
}


def cmd_doctor(cfg: Config) -> int:
    osname = current_os()
    log(f"{APP_NAME} {VERSION} — doctor on {osname} "
        f"(root/admin: {is_root()})", level="step")
    groups = REQUIRED_TOOLS.get(osname, {})
    all_ok = True
    # Print through a single stream so the report never interleaves.
    for group, tools in groups.items():
        print(f"[*] {group}:", flush=True)
        if not tools:
            print("      (no external tool needed / handled by the OS UI)",
                  flush=True)
        for tool in tools:
            path = which(tool)
            if path:
                print(f"    [+] {tool}: {path}", flush=True)
            else:
                print(f"    [!] {tool}: not found", flush=True)
                all_ok = False
    if osname == "linux":
        log(f"default uplink iface: {detect_default_iface_linux() or '?'}")
        log(f"detected wifi iface : {detect_wifi_iface_linux() or '?'}")
    log("proxy subcommand needs no external tools and works anywhere.",
        level="ok")
    return 0 if all_ok else 1


def cmd_proxy(cfg: Config) -> int:
    upstream = Upstream.parse(cfg.upstream) if cfg.upstream else None
    server = ProxyServer(cfg.proxy_host, cfg.proxy_port, upstream)
    server.start()

    stop_evt = threading.Event()

    def _sig(_signum, _frame):
        log("shutting down proxy...", level="info")
        stop_evt.set()
        server.stop()

    signal.signal(signal.SIGINT, _sig)
    signal.signal(signal.SIGTERM, _sig)

    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    log("Configure clients to use this host as a SOCKS5 or HTTP proxy "
        f"on port {cfg.proxy_port}. Ctrl+C to stop.", level="ok")
    try:
        while not stop_evt.is_set():
            time.sleep(1)
    finally:
        server.stop()
    log(f"transferred up={server.bytes_up}B down={server.bytes_down}B")
    return 0


def cmd_share(cfg: Config) -> int:
    osname = current_os()
    if not is_root() and not cfg.dry_run:
        log("share needs root/Administrator privileges. Re-run with sudo, "
            "or use --dry-run to preview the commands.", level="err")
        return 2

    state: dict = {"ssid": cfg.ssid, "mode": cfg.mode, "os": osname,
                   "config": asdict(cfg)}

    proxy_server: Optional[ProxyServer] = None
    try:
        if osname == "linux":
            hotspot = LinuxHotspot(cfg)
            hs_state = hotspot.up()
            state.update(hs_state)
            wifi = hs_state["wifi_iface"]

            if cfg.mode == "vpn":
                vpn = VPNManager(cfg)
                vpn_iface = vpn.up() or "tun0"
                state["vpn_iface"] = vpn_iface
                linux_nat_up(cfg, wifi, vpn_iface)
            else:  # proxy mode: NAT to uplink + local proxy for clients
                out_iface = cfg.share_iface or detect_default_iface_linux() or "eth0"
                state["out_iface"] = out_iface
                linux_nat_up(cfg, wifi, out_iface)
                upstream = Upstream.parse(cfg.upstream) if cfg.upstream else None
                proxy_server = ProxyServer(cfg.gateway_ip, cfg.proxy_port, upstream)
                if not cfg.dry_run:
                    proxy_server.start()
                    threading.Thread(target=proxy_server.serve_forever,
                                     daemon=True).start()
                log(f"Clients: set proxy to {cfg.gateway_ip}:{cfg.proxy_port} "
                    "(SOCKS5 or HTTP).", level="ok")
        elif osname == "windows":
            hotspot = WindowsHotspot(cfg)
            state.update(hotspot.up())
            if cfg.mode == "vpn":
                VPNManager(cfg).up()
        else:  # darwin / macOS
            if cfg.mode == "proxy":
                # Route THIS Mac's traffic through the (optionally chained)
                # local proxy. Combine with Internet Sharing to extend it to
                # Wi-Fi clients.
                upstream = Upstream.parse(cfg.upstream) if cfg.upstream else None
                proxy_server = ProxyServer("127.0.0.1", cfg.proxy_port, upstream)
                if not cfg.dry_run:
                    proxy_server.start()
                    threading.Thread(target=proxy_server.serve_forever,
                                     daemon=True).start()
                service = cfg.share_iface or mac_primary_service()
                state["mac_service"] = service
                mac_set_socks_proxy(cfg, service, "127.0.0.1", cfg.proxy_port)
                log(f"System SOCKS proxy set to 127.0.0.1:{cfg.proxy_port} "
                    f"on '{service}'.", level="ok")
                log("To share to Wi-Fi clients too: System Settings > General "
                    "> Sharing > Internet Sharing (share to Wi-Fi).",
                    level="info")
            else:
                if cfg.mode == "vpn":
                    VPNManager(cfg).up()
                log("macOS has no scriptable Wi-Fi AP API. Enable System "
                    "Settings > General > Sharing > Internet Sharing to share "
                    "your VPN/uplink to Wi-Fi.", level="warn")

        log(f"Hotspot '{cfg.ssid}' is up in {cfg.mode} mode.", level="ok")
        if cfg.dry_run:
            log("dry-run complete (no changes were made).", level="ok")
            return 0
        save_state(state)

        log("Press Ctrl+C to stop and tear everything down.", level="info")
        stop_evt = threading.Event()
        signal.signal(signal.SIGINT, lambda *_: stop_evt.set())
        signal.signal(signal.SIGTERM, lambda *_: stop_evt.set())
        while not stop_evt.is_set():
            time.sleep(1)
    finally:
        if proxy_server:
            proxy_server.stop()
        if not cfg.dry_run:
            _teardown(cfg, state)
    return 0


def _teardown(cfg: Config, state: dict) -> None:
    osname = state.get("os", current_os())
    log("tearing down...", level="step")
    try:
        if osname == "linux":
            wifi = state.get("wifi_iface", cfg.wifi_iface or "wlan0")
            if cfg.mode == "vpn":
                out = state.get("vpn_iface", "tun0")
            else:
                out = state.get("out_iface", "eth0")
            linux_nat_down(cfg, wifi, out)
            if cfg.mode == "vpn":
                VPNManager(cfg).down(state.get("vpn_iface"))
            LinuxHotspot(cfg).down(state)
        elif osname == "windows":
            WindowsHotspot(cfg).down(state)
        elif osname == "darwin":
            service = state.get("mac_service")
            if service:
                mac_clear_socks_proxy(cfg, service)
            if cfg.mode == "vpn":
                VPNManager(cfg).down(state.get("vpn_iface"))
    finally:
        clear_state()
        log("teardown complete.", level="ok")


def cmd_stop(cfg: Config) -> int:
    state = load_state()
    if not state:
        log("nothing to stop (no saved state).", level="warn")
        return 0
    # merge stored config so teardown uses the same names
    stored = state.get("config", {})
    for key, val in stored.items():
        if hasattr(cfg, key):
            setattr(cfg, key, val)
    _teardown(cfg, state)
    return 0


def cmd_status(cfg: Config) -> int:
    state = load_state()
    if not state:
        log("not running (no active hotspot started by this tool).", level="info")
        return 0
    print(json.dumps(state, indent=2))
    return 0


# --------------------------------------------------------------------------- #
# Argument parsing
# --------------------------------------------------------------------------- #
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog=APP_NAME,
        description="VPN/Proxy Wi-Fi sharing tool (single file, stdlib only).",
    )
    p.add_argument("--version", action="version",
                   version=f"{APP_NAME} {VERSION}")
    p.add_argument("--config", help="Path to a JSON config file.")
    p.add_argument("--dry-run", dest="dry_run", action="store_true",
                   default=None, help="Print actions without changing the system.")

    sub = p.add_subparsers(dest="command", required=True)

    def add_common(sp):
        sp.add_argument("--config", help="Path to a JSON config file.")
        sp.add_argument("--dry-run", dest="dry_run", action="store_true",
                        default=None)

    d = sub.add_parser("doctor", help="Check required tools for this OS.")
    add_common(d)

    pr = sub.add_parser("proxy", help="Run the local SOCKS5/HTTP proxy only.")
    add_common(pr)
    pr.add_argument("--proxy-host", dest="proxy_host")
    pr.add_argument("--proxy-port", dest="proxy_port", type=int)
    pr.add_argument("--upstream", help="Chain via socks5://|http:// host:port")

    sh = sub.add_parser("share", help="Bring up a hotspot routed via VPN/proxy.")
    add_common(sh)
    sh.add_argument("--ssid")
    sh.add_argument("--password")
    sh.add_argument("--wifi-iface", dest="wifi_iface")
    sh.add_argument("--share-iface", dest="share_iface",
                    help="Uplink interface used for NAT (proxy mode).")
    sh.add_argument("--band", choices=["bg", "a"])
    sh.add_argument("--channel", type=int)
    sh.add_argument("--mode", choices=["vpn", "proxy"])
    sh.add_argument("--vpn-kind", dest="vpn_kind",
                    choices=["wireguard", "openvpn"])
    sh.add_argument("--vpn-config", dest="vpn_config",
                    help="Path to WireGuard .conf or OpenVPN .ovpn")
    sh.add_argument("--upstream", help="Upstream proxy for proxy mode.")
    sh.add_argument("--proxy-port", dest="proxy_port", type=int)
    sh.add_argument("--gateway-ip", dest="gateway_ip")

    sub.add_parser("stop", help="Tear down the hotspot/NAT created by share.")
    sub.add_parser("status", help="Show current state.")
    return p


def main(argv: Optional[list[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    cfg = Config.from_args(args)
    dispatch = {
        "doctor": cmd_doctor,
        "proxy": cmd_proxy,
        "share": cmd_share,
        "stop": cmd_stop,
        "status": cmd_status,
    }
    handler = dispatch.get(args.command)
    if not handler:
        build_parser().print_help()
        return 1
    try:
        return handler(cfg)
    except KeyboardInterrupt:
        log("interrupted.", level="warn")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
