// 要素の取得
const view1 = document.getElementById('view1');
const view2 = document.getElementById('view2');
const input1 = document.getElementById('url-input-1');
const input2 = document.getElementById('url-input-2');
const btnMute1 = document.getElementById('btn-mute-1');
const btnMute2 = document.getElementById('btn-mute-2');
const btnReload1 = document.getElementById('btn-reload-1');
const btnReload2 = document.getElementById('btn-reload-2');
const resizer = document.getElementById('resizer');
const pane1 = document.getElementById('pane-1');
const container = document.getElementById('container');

// ■初期設定：保存されたURLがあれば読み込む
window.addEventListener('DOMContentLoaded', () => {
    const savedUrl1 = localStorage.getItem('url1');
    const savedUrl2 = localStorage.getItem('url2');
    if (savedUrl1) navigate(view1, input1, savedUrl1);
    if (savedUrl2) navigate(view2, input2, savedUrl2);
});

// ■URL移動関数（ここを修正：localhost対応）
function navigate(webview, input, url) {
    // プロトコル(http/https)がない場合の自動補完ロジック
    if (!url.startsWith('http')) {
        // localhost または 127.0.0.1 で始まる場合は http:// にする
        if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
            url = 'http://' + url;
        } else {
            // それ以外（一般的なWebサイト）は https:// にする
            url = 'https://' + url;
        }
    }
    
    webview.src = url;
    input.value = url;
    
    // URLを保存
    if(webview.id === 'view1') localStorage.setItem('url1', url);
    if(webview.id === 'view2') localStorage.setItem('url2', url);
}

// EnterキーでURL移動
input1.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(view1, input1, input1.value); });
input2.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(view2, input2, input2.value); });

// ■リロードボタン
btnReload1.addEventListener('click', () => view1.reload());
btnReload2.addEventListener('click', () => view2.reload());

// ■ミュート切り替え機能
function toggleMute(webview, btn) {
    const isMuted = webview.isAudioMuted();
    webview.setAudioMuted(!isMuted);
    btn.textContent = !isMuted ? '🔇' : '🔊';
    btn.classList.toggle('muted', !isMuted); // CSSクラス切り替え
}
btnMute1.addEventListener('click', () => toggleMute(view1, btnMute1));
btnMute2.addEventListener('click', () => toggleMute(view2, btnMute2));

// ■読み込み中表示の制御
const setupLoading = (view, loaderId) => {
    const loader = document.getElementById(loaderId);
    view.addEventListener('did-start-loading', () => loader.classList.add('show'));
    view.addEventListener('did-stop-loading', () => loader.classList.remove('show'));
    // 読み込み失敗時も消す
    view.addEventListener('did-fail-load', () => loader.classList.remove('show'));
};
setupLoading(view1, 'loading-1');
setupLoading(view2, 'loading-2');

// ■スライダーによるリサイズ処理
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    view1.style.pointerEvents = 'none';
    view2.style.pointerEvents = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = container.getBoundingClientRect();
    const newFlexBasis = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newFlexBasis > 10 && newFlexBasis < 90) {
        pane1.style.flex = `0 0 ${newFlexBasis}%`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        view1.style.pointerEvents = 'auto';
        view2.style.pointerEvents = 'auto';
    }
});