const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("havuzDesktop", {
  platform: process.platform,
});
