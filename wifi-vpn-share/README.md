# wifi_vpn_share

Single-file VPN/Proxy **Wi‑Fi sharing** tool. Turn a machine into a Wi‑Fi
hotspot and route the connected clients' traffic through a **VPN**
(WireGuard / OpenVPN) or an **upstream proxy** (SOCKS5 / HTTP) — or just route
this machine's own traffic through a chained proxy.

Everything lives in one file — [`wifi_vpn_share.py`](./wifi_vpn_share.py) — and
uses **only the Python standard library** (Python 3.9+). No `pip install`
required to run it.

## Commands

| Command | What it does | Needs root? |
|---------|--------------|-------------|
| `doctor` | Check the tools required on this OS. | no |
| `proxy`  | Run the local SOCKS5 + HTTP‑CONNECT proxy; optionally chain to an upstream proxy. | no |
| `share`  | Bring up a Wi‑Fi hotspot and route its clients via VPN (default) or the built‑in proxy, applying NAT. | yes |
| `stop`   | Tear down whatever `share` created. | yes |
| `status` | Show current state. | no |

Add `--dry-run` to any command to **print the exact system commands without
changing anything** — great for reviewing before you run for real.

## Quick start

```bash
# 1) Runs anywhere, no privileges: a proxy that chains to your VPN provider's proxy
python3 wifi_vpn_share.py proxy --proxy-port 1080 --upstream socks5://user:pass@proxy.example:1080

# 2) Preview a hotspot that routes clients through WireGuard (no changes made)
python3 wifi_vpn_share.py share --dry-run --mode vpn \
    --vpn-kind wireguard --vpn-config ~/wg0.conf \
    --ssid MyHotspot --password 'S3cret123'

# 3) For real (Linux, needs sudo + a Wi-Fi card that supports AP mode)
sudo python3 wifi_vpn_share.py share --mode vpn --vpn-config /etc/wireguard/wg0.conf
```

## macOS (MacBook)

The script runs directly on macOS with the system Python:

```bash
python3 wifi_vpn_share.py proxy --proxy-port 1080 --upstream socks5://…
# Route the Mac's own traffic through the (chained) proxy, then optionally
# turn on Internet Sharing to extend it to Wi-Fi clients:
sudo python3 wifi_vpn_share.py share --mode proxy --proxy-port 1080 --upstream socks5://…
```

macOS has **no scriptable Wi‑Fi Access‑Point API**, so for a true hotspot enable
**System Settings → General → Sharing → Internet Sharing** (share your VPN/uplink
to Wi‑Fi). In `proxy` mode the tool configures the Mac's **system SOCKS proxy**
(`networksetup`) to point at the local chain and clears it again on `stop`.

### Build a native binary + `.pkg` installer (on the Mac)

```bash
chmod +x build_macos.sh
./build_macos.sh
# produces:
#   dist/wifi-vpn-share                  (single-file executable)
#   dist/wifi-vpn-share-1.0.0.pkg        (double-clickable installer -> /usr/local/bin)
```

> A macOS `.pkg`/Mach‑O binary can only be built **on macOS** — PyInstaller and
> `pkgbuild` do not cross‑compile from Linux. Run `build_macos.sh` on your
> MacBook to produce them.

## Linux binary

`build.sh` (or `python3 -m PyInstaller --onefile wifi_vpn_share.py`) produces a
single-file Linux executable in `dist/`.

## Config file

Any flag can also come from a JSON file passed with `--config`:

```json
{
  "ssid": "MyHotspot",
  "password": "S3cret123",
  "mode": "vpn",
  "vpn_kind": "wireguard",
  "vpn_config": "/etc/wireguard/wg0.conf",
  "proxy_port": 1080
}
```

## Notes & requirements

- **Linux hotspot**: NetworkManager (`nmcli`) *or* `hostapd` + `dnsmasq`; NAT via
  `iptables` + `sysctl`. Needs a Wi‑Fi adapter that supports AP mode and root.
- **Windows**: `netsh wlan` hosted network + Internet Connection Sharing.
- **VPN**: `wg-quick` (WireGuard) or `openvpn`.
- The `proxy` core (SOCKS5, HTTP‑CONNECT, plain HTTP, upstream chaining) needs
  no external tools and is the most portable part.

## License

MIT.
