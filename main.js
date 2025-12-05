const { app, BrowserWindow, session, dialog, shell, Menu, clipboard } = require('electron');
const https = require('https');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config();
const USER_AGENT = process.env.USER_AGENT;

// アプリの動作設定
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-certificate-errors');

// WebRTC（音声通話）の接続を安定させるための設定を追加
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile('index.html');

  // ■webviewごとの設定
  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    
    // 1. UserAgent設定
    webContents.setUserAgent(USER_AGENT);
    
    // 2. 権限許可（リクエストが来たとき）
    webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications', 'clipboard-read'];
      callback(allowedPermissions.includes(permission));
    });

    // 3. 【追加】権限確認（状態確認が来たとき）
    // 最近のWebRTCはここもチェックすることがあります
    webContents.session.setPermissionCheckHandler((webContents, permission, origin) => {
      const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications', 'clipboard-read'];
      return allowedPermissions.includes(permission);
    });

    // 4. 【追加】デバイス選択の自動化（ここがエラー解決のキモ）
    // 「どのマイクを使いますか？」と聞かれたら、自動で「最初のデバイス」を選択して返します
    webContents.on('select-media', (event, requests, callback) => {
      const item = requests.find(item => item.kind === 'audioInput') || requests[0];
      if (item) {
        callback(item);
      } else {
        callback(null);
      }
    });

    // 5. ポップアップ許可
    webContents.setWindowOpenHandler((details) => {
      return { 
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        }
      };
    });

    // 6. 右クリックメニュー
    webContents.on('context-menu', (event, params) => {
      const menuTemplate = [];

      if (params.linkURL && params.linkURL.length > 0) {
        menuTemplate.push({
          label: 'リンクのアドレスをコピー',
          click: () => { clipboard.writeText(params.linkURL); }
        });
        menuTemplate.push({ type: 'separator' });
      }

      menuTemplate.push(
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
        { role: 'selectAll', label: 'すべて選択' },
        { type: 'separator' },
        {
          label: '検証 (Inspect)',
          click: () => { webContents.inspectElement(params.x, params.y); }
        }
      );
      
      const menu = Menu.buildFromTemplate(menuTemplate);
      menu.popup();
    });

  });
}



// アプリ起動時の処理
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();

});
