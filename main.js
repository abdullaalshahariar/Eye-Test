const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const createWindow = () => {
  //hiding menu bar
  Menu.setApplicationMenu(null);

  const window = new BrowserWindow({
    width: 800,
    height: 600,
  })

  const filePath = path.join(__dirname, '/docs/index.html');
  //const filePath = path.join(__dirname, '/docs/index.html');
  window.loadFile(filePath);

  window.once('ready-to-show', () => {
    window.show();
  });
}

app.on('ready', () => {
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});