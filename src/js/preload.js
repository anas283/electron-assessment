const { contextBridge } = require('electron');

// Expose a minimal, safe API to the renderer process.
// Additional methods can be added here as the app grows.
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
});
