# Dual Metaverse Browser (デュアル・メタバース・ブラウザ)

メタバース空間と、ローコードツール（Node-RED, Langflowなど）やAIチャット（ChatGPT）を、1つの画面で同時に操作するために開発された、Electron製デュアルウィンドウ・ブラウザです。

このソフトウェアは、開発時に生成AIをつかうことがあります。生成AIを使わずにコードを書くこともあります。

## 🌟 特徴

* **完全独立した2画面ブラウザ:** 左右の画面でセッション（Cookie/ログイン情報）が完全に分離されています。
    * 例: 左で「Vket CloudのアバターA」、右で「Vket CloudのアバターB」として同時入室が可能。
* **高機能ブックマーク:**
    * 左右どちらの画面で開くかワンクリックで選択可能。
    * 手動登録に対応。

## 🚀 使い方
### インストールと起動
#### 稼働環境
- Windows 11
- Node.js がインストール済みであること。Node.js v20とv22で動作を確認済み。

#### リポジトリのクローン
```
git clone https://github.com/kolinz/electron-dual-browser.git
cd electron-dual-browser
```
#### 依存関係のインストール
```
npm install
```
#### 開発モードで起動
```
npm start
```
### ビルド
Windows 11 の環境で、管理者権限で「[ターミナル](https://learn.microsoft.com/ja-jp/windows/terminal/)」を起動。
管理者権限で起動後、コマンドを実行
```
npm rum build
```
dist ディレクトリが作成される。
### ビルド結果のインストールと起動
1. dist ディレクトリ下に作成されている、「Dual-Metaverse-Browser Setup x.x.x.exe」をダブルクリックして起動。インストールを行う。
2. Windows11のスタートメニューで、「Dual-Metaverse-Browser」を起動する。

