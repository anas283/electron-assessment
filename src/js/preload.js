const { contextBridge } = require('electron');

// Expose a minimal, safe API to the renderer process.
// We intentionally do NOT expose Node APIs or the full Electron API.
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  appVersion: process.env.npm_package_version || '1.0.0'
});
