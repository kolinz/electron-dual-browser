const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// ChromeのふりをするためのUserAgent文字列（Googleログイン対策）
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-certificate-errors');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // ■webviewごとの設定
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    
    // 1. Googleログイン等でUserAgentを正しく認識させる
    webContents.setUserAgent(USER_AGENT);

    // 2. 権限（マイク・カメラ）の自動許可
    webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications', 'clipboard-read'];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    // 3. ポップアップウィンドウ（ログイン画面など）の挙動制御
    webContents.setWindowOpenHandler((details) => {
      // ログイン画面などは許可(allow)する
      return { 
        action: 'allow',
        overrideBrowserWindowOptions: {
          // ポップアップもメインと同じ設定にする（これでログイン後の連携が切れない）
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true, // セキュリティのためポップアップは分離
          }
        }
      };
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});