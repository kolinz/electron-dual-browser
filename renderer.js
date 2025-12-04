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

// ブックマーク・手動入力関連
const btnBookmarkToggle = document.getElementById('btn-bookmark-toggle');
const bookmarkMenu = document.getElementById('bookmark-menu');
const btnAddBookmark = document.getElementById('btn-add-bookmark');
const bookmarkListEl = document.getElementById('bookmark-list');
const btnShowManual = document.getElementById('btn-show-manual');
const manualInputArea = document.getElementById('manual-input-area');
const manualTitle = document.getElementById('manual-title');
const manualUrl = document.getElementById('manual-url');
const btnSaveManual = document.getElementById('btn-save-manual');

// ■初期設定：保存されたURLとブックマークを読み込む
window.addEventListener('DOMContentLoaded', () => {
    // 0.5秒待ってから読み込むことで、確実にロードさせる
    setTimeout(() => {
        restoreSession(view1, input1, 'url1');
        restoreSession(view2, input2, 'url2');
    }, 500);

    renderBookmarks();
});

function restoreSession(view, input, storageKey) {
    let savedUrl = localStorage.getItem(storageKey);
    
    // 履歴の自動修復 (https -> http for localhost)
    if (savedUrl && savedUrl.includes('localhost') && savedUrl.startsWith('https://')) {
        savedUrl = savedUrl.replace('https://', 'http://');
    }

    if (savedUrl) {
        // 入力欄にはすぐに表示
        input.value = savedUrl;
        // 実際に移動処理を行う (srcに入れるだけでなくnavigateを通す)
        navigate(view, input, savedUrl, storageKey);
    }
}

// ■URL移動関数（プロトコル自動補完付き）
function navigate(webview, input, url, storageKey) {
    url = url.trim();
    if (!url) return;

    // プロトコルがない場合の補完
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
            url = 'http://' + url;
        } else {
            url = 'https://' + url;
        }
    }
    
    // Webviewにロードさせる
    webview.src = url;
    input.value = url;
    localStorage.setItem(storageKey, url);
}

// Enterキーで移動
input1.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(view1, input1, input1.value, 'url1'); });
input2.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(view2, input2, input2.value, 'url2'); });

// ■ブックマーク機能
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

btnBookmarkToggle.addEventListener('click', () => {
    bookmarkMenu.classList.toggle('show');
    manualInputArea.classList.remove('show');
});

btnShowManual.addEventListener('click', () => {
    manualInputArea.classList.toggle('show');
    if(manualInputArea.classList.contains('show')) manualTitle.focus();
});

btnSaveManual.addEventListener('click', () => {
    const title = manualTitle.value.trim();
    const url = manualUrl.value.trim();
    if(!title || !url) { alert("タイトルとURLを入力してください"); return; }
    bookmarks.push({ title, url });
    saveBookmarks();
    renderBookmarks();
    manualTitle.value = ''; manualUrl.value = ''; manualInputArea.classList.remove('show');
});

btnAddBookmark.addEventListener('click', () => {
    const title = view1.getTitle() || input1.value;
    const url = input1.value;
    if(!url) return alert("URLがありません");
    bookmarks.push({ title, url });
    saveBookmarks();
    renderBookmarks();
});

function saveBookmarks() { localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); }

function renderBookmarks() {
    bookmarkListEl.innerHTML = '';
    bookmarks.forEach((bm, index) => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <div class="bookmark-title" title="${bm.url}">${bm.title}</div>
            <div class="bookmark-actions">
                <button class="btn-open-left">⇦ 左で開く</button>
                <button class="btn-open-right">右で開く ⇨</button>
                <button class="btn-delete">🗑</button>
            </div>
        `;
        item.querySelector('.btn-open-left').addEventListener('click', () => {
            navigate(view1, input1, bm.url, 'url1');
            bookmarkMenu.classList.remove('show');
        });
        item.querySelector('.btn-open-right').addEventListener('click', () => {
            navigate(view2, input2, bm.url, 'url2');
            bookmarkMenu.classList.remove('show');
        });
        item.querySelector('.btn-delete').addEventListener('click', () => {
            if(confirm('削除しますか？')) {
                bookmarks.splice(index, 1);
                saveBookmarks();
                renderBookmarks();
            }
        });
        bookmarkListEl.appendChild(item);
    });
}

document.addEventListener('click', (e) => {
    if (!bookmarkMenu.contains(e.target) && e.target !== btnBookmarkToggle) {
        bookmarkMenu.classList.remove('show');
    }
});

// ■その他の機能
btnReload1.addEventListener('click', () => view1.reload());
btnReload2.addEventListener('click', () => view2.reload());

function toggleMute(webview, btn) {
    const isMuted = webview.isAudioMuted();
    webview.setAudioMuted(!isMuted);
    btn.textContent = !isMuted ? '🔇' : '🔊';
    btn.classList.toggle('muted', !isMuted);
}
btnMute1.addEventListener('click', () => toggleMute(view1, btnMute1));
btnMute2.addEventListener('click', () => toggleMute(view2, btnMute2));

const setupLoading = (view, loaderId) => {
    const loader = document.getElementById(loaderId);
    view.addEventListener('did-start-loading', () => loader.classList.add('show'));
    view.addEventListener('did-stop-loading', () => loader.classList.remove('show'));
    view.addEventListener('did-fail-load', () => loader.classList.remove('show'));
};
setupLoading(view1, 'loading-1');
setupLoading(view2, 'loading-2');

let isResizing = false;
resizer.addEventListener('mousedown', () => { isResizing = true; view1.style.pointerEvents = 'none'; view2.style.pointerEvents = 'none'; });
document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = container.getBoundingClientRect();
    const newFlexBasis = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newFlexBasis > 10 && newFlexBasis < 90) pane1.style.flex = `0 0 ${newFlexBasis}%`;
});
document.addEventListener('mouseup', () => {
    if (isResizing) { isResizing = false; view1.style.pointerEvents = 'auto'; view2.style.pointerEvents = 'auto'; }
});