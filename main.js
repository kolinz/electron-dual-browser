const { app, BrowserWindow, session, dialog, shell, Menu, clipboard } = require('electron'); // ■修正: clipboard を追加
const https = require('https');
const path = require('path');

// ■■■ 設定エリア ■■■
const UPDATE_CHECK_URL = 'https://gist.githubusercontent.com/あなたのID/ランダム文字列/raw/version.json';

// Googleログイン用の偽装設定
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// アプリの動作設定
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-certificate-errors');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
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
    
    // 1. UserAgent設定
    webContents.setUserAgent(USER_AGENT);
    
    // 2. 権限許可
    webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'audioCapture', 'videoCapture', 'notifications', 'clipboard-read'];
      callback(allowedPermissions.includes(permission));
    });

    // 3. ポップアップ許可
    webContents.setWindowOpenHandler((details) => {
      return { 
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        }
      };
    });

    // 4. 【修正】右クリックメニュー（リンク対応版）
    webContents.on('context-menu', (event, params) => {
      const menuTemplate = [];

      // ■もしリンクの上で右クリックされたら、URLコピー機能を追加
      if (params.linkURL && params.linkURL.length > 0) {
        menuTemplate.push({
          label: 'リンクのアドレスをコピー',
          click: () => {
            clipboard.writeText(params.linkURL); // クリップボードにURLを書き込む
          }
        });
        menuTemplate.push({ type: 'separator' }); // 区切り線
      }

      // 既存のメニュー項目（元に戻す、コピー、貼り付けなど）
      menuTemplate.push(
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' }, // これはテキスト選択時のコピー用
        { role: 'paste', label: '貼り付け' },
        { role: 'selectAll', label: 'すべて選択' },
        { type: 'separator' },
        {
          label: '検証 (Inspect)',
          click: () => {
            webContents.inspectElement(params.x, params.y);
          }
        }
      );
      
      const menu = Menu.buildFromTemplate(menuTemplate);
      menu.popup();
    });

  });
}

// ■■■ キルスイッチ ■■■
function checkUpdate() {
  // if (!app.isPackaged) return;

  https.get(UPDATE_CHECK_URL, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      try {
        const remoteInfo = JSON.parse(body);
        const currentVersion = app.getVersion();

        console.log(`Current: ${currentVersion}, Remote Min: ${remoteInfo.minVersion}`);

        if (remoteInfo.minVersion > currentVersion) {
            const choice = dialog.showMessageBoxSync({
            type: 'error',
            buttons: ['ダウンロードページへ', '終了'],
            defaultId: 0,
            title: 'アップデートが必要です',
            message: `このバージョン (${currentVersion}) は利用できません。`,
            detail: `最新版 (${remoteInfo.minVersion}) をダウンロードしてください。`
          });

          if (choice === 0) {
            shell.openExternal(remoteInfo.downloadUrl);
          }
          app.quit();
        }
      } catch (e) {
        console.error('バージョンチェック失敗（無視して続行）:', e);
      }
    });
  }).on('error', (err) => {
    console.error('ネットワークエラー（無視して続行）');
  });
}

// アプリ起動時の処理
app.whenReady().then(() => {
  createWindow();
  checkUpdate();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});