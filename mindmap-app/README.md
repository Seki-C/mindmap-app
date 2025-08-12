# 超軽量マインドマップアプリ

高速で軽量なマインドマップアプリケーション。Vanilla JavaScriptとCanvas APIで実装。

## 特徴

- 🚀 **超高速** - 初期レンダリング < 100ms
- 🪶 **超軽量** - フレームワークなし、最小依存
- ⌨️ **キーボード操作** - すべての操作をキーボードで実行可能
- 💾 **自動保存** - LocalStorageで自動保存
- 📦 **オフラインファースト** - ネットワーク接続不要

## 起動方法

### Dockerで起動（推奨）

```bash
# 開発環境
docker-compose up -d

# ブラウザで開く
# http://localhost:3000
```

### 本番環境用ビルド

```bash
# 本番用コンテナをビルド・起動
docker-compose -f docker-compose.prod.yml up -d

# ブラウザで開く
# http://localhost:8080
```

## 操作方法

### キーボードショートカット

- `Tab` - 子ノード追加
- `Enter` - 兄弟ノード追加
- `Delete` - ノード削除
- `F2` - ノード編集
- `↑↓←→` - ノード選択移動
- `Space` - ドラッグモード
- `+/-` - ズーム
- `R` - ビューリセット
- `Ctrl+S` - 保存

### マウス操作

- クリック - ノード選択
- ダブルクリック - ノード編集
- ドラッグ - ノード移動/画面移動
- ホイール - ズーム

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# ビルド
npm run build
```

## 技術スタック

- TypeScript
- Vite
- Canvas API
- Docker
- LocalStorage API