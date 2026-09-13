"use strict";

const { app, BrowserWindow, session, shell } = require("electron");
const path = require("path");
const site = require("./site.json");

const SITE_URL = process.env.CANLISITE_URL || site.url;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: "CanlıSite",
    backgroundColor: "#0b1511",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
    },
  });

  win.loadURL(SITE_URL, { extraHeaders: "pragma: no-cache\n" });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("mailto:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

function readInAppConsent(webContents, key) {
  return webContents
    .executeJavaScript(
      `(() => {
        try {
          const raw = localStorage.getItem("canlisite.firstLaunchConsent.v1");
          const parsed = raw ? JSON.parse(raw) : null;
          return Boolean(parsed && parsed.${key});
        } catch {
          return false;
        }
      })()`,
    )
    .catch(() => false);
}

app.whenReady().then(() => {
  // OS dialogs only after the in-app first-launch screen stores consent.
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    if (permission === "geolocation") {
      void readInAppConsent(wc, "location").then((ok) => callback(Boolean(ok)));
      return;
    }
    if (permission === "notifications") {
      void readInAppConsent(wc, "notifications").then((ok) => callback(Boolean(ok)));
      return;
    }
    callback(false);
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
