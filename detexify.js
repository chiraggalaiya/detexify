const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  new BrowserWindow({
    width: 576,
    height: 192,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    transparent: true, 
    frame: false,
    resizable: false,
    hasShadow: true,
    icon: path.join(__dirname, "assets/images/icon.png")
  }).loadFile(path.join(__dirname, 'detexify.html'));
});