# Claude Code SDK プロジェクト情報

## 概要
Claude Code SDK は、Claude Code と対話するための公式 TypeScript SDK です。
セッション管理、ストリーミング、ツール統合、自動リトライなどの機能を提供します。

## プロジェクト構造

```
claude-code-sdk/
├── src/                  # ソースコード
│   ├── client/          # APIクライアント実装
│   │   ├── base.ts      # 基底クライアントクラス（リトライロジック含む）
│   │   └── index.ts     # メインクライアントクラス
│   ├── config/          # 設定管理
│   │   └── index.ts     # ConfigManagerクラス
│   ├── errors/          # カスタムエラークラス
│   │   └── index.ts     # 各種エラー定義
│   ├── types/           # TypeScript型定義
│   │   └── index.ts     # インターフェース定義
│   ├── utils/           # ユーティリティ
│   │   └── logger.ts    # ロギング機能
│   └── index.ts         # メインエクスポート
├── tests/               # テストコード
│   ├── client.test.ts   # クライアントのテスト
│   └── config.test.ts   # 設定管理のテスト
├── examples/            # サンプルコード
│   ├── basic.ts         # 基本的な使用例
│   ├── streaming.ts     # ストリーミングの例
│   └── error-handling.ts # エラーハンドリングの例
├── dist/                # ビルド成果物（自動生成）
└── node_modules/        # 依存パッケージ（自動生成）
```

## 主要コマンド

```bash
# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build

# ビルドの監視モード
npm run build:watch

# テストの実行
npm test

# テストの監視モード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# コードのLint
npm run lint

# Lintエラーの自動修正
npm run lint:fix

# コードのフォーマット
npm run format

# サンプルコードの実行
npm run example
```

## 主要機能

1. **基本的な補完機能**
   - シンプルなプロンプトの送信と応答の受信

2. **セッション管理**
   - 会話のコンテキストを維持
   - 複数のセッションの管理

3. **ストリーミングサポート**
   - リアルタイムでの応答ストリーミング
   - チャンクごとのコールバック処理

4. **ツール統合**
   - 外部ツールとの連携
   - 実行コンテキストの管理

5. **エラーハンドリング**
   - 各種エラーの分類と処理
   - 自動リトライ機能（エクスポネンシャルバックオフ）

## 技術スタック

- **言語**: TypeScript 5.3+
- **ビルドツール**: TypeScript Compiler (tsc)
- **テストフレームワーク**: Jest
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **主要ライブラリ**:
  - axios: HTTPクライアント
  - winston: ロギング
  - chalk: コンソール出力の色付け
  - uuid: セッションID生成
  - dotenv: 環境変数管理

## 開発上の注意点

1. **TypeScript設定**
   - strictモードが有効
   - 未使用の変数・パラメータのチェック有効

2. **テスト**
   - テストカバレッジの維持
   - モックを使用してAPIリクエストをテスト

3. **エラーハンドリング**
   - カスタムエラークラスの使用
   - 適切なエラーメッセージとコード

4. **設定管理**
   - 環境変数、設定ファイル、コードからの設定に対応
   - 優先順位: コード > 環境変数 > ファイル > デフォルト

## バージョニング

現在のバージョン: 0.1.0

セマンティックバージョニングに従います:
- MAJOR: 後方互換性のない変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正