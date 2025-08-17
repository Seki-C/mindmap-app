# プロジェクト構造

```
personal-blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 認証が必要なルート
│   │   │   └── admin/          # 管理画面
│   │   ├── api/                # API Routes
│   │   │   ├── posts/
│   │   │   ├── categories/
│   │   │   └── tags/
│   │   ├── posts/              # ブログ記事ページ
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── categories/         # カテゴリー別ページ
│   │   ├── tags/               # タグ別ページ
│   │   ├── search/             # 検索ページ
│   │   ├── layout.tsx
│   │   ├── page.tsx            # ホームページ
│   │   └── globals.css
│   │
│   ├── components/              # Reactコンポーネント
│   │   ├── common/             # 共通コンポーネント
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Navigation/
│   │   │   └── ThemeToggle/
│   │   ├── posts/              # 記事関連コンポーネント
│   │   │   ├── PostCard/
│   │   │   ├── PostList/
│   │   │   ├── PostDetail/
│   │   │   └── TableOfContents/
│   │   ├── ui/                 # UIコンポーネント
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   └── Modal/
│   │   └── admin/              # 管理画面コンポーネント
│   │       ├── PostEditor/
│   │       └── Dashboard/
│   │
│   ├── lib/                     # ライブラリ・ユーティリティ
│   │   ├── api/                # API関連
│   │   ├── auth/               # 認証関連
│   │   ├── db/                 # データベース接続
│   │   ├── markdown/           # Markdown処理
│   │   └── utils/              # 汎用ユーティリティ
│   │
│   ├── hooks/                   # カスタムフック
│   │   ├── usePosts.ts
│   │   ├── useAuth.ts
│   │   └── useTheme.ts
│   │
│   ├── styles/                  # スタイル関連
│   │   └── themes/             # テーマ設定
│   │
│   ├── types/                   # TypeScript型定義
│   │   ├── post.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── config/                  # 設定ファイル
│       ├── site.ts             # サイト設定
│       └── constants.ts        # 定数
│
├── public/                      # 静的ファイル
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
├── prisma/                      # Prisma設定（使用する場合）
│   ├── schema.prisma
│   └── migrations/
│
├── content/                     # Markdownコンテンツ（静的な場合）
│   └── posts/
│
├── tests/                       # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                     # ビルド・デプロイスクリプト
│   ├── generate-sitemap.js
│   └── seed-db.js
│
├── .github/                     # GitHub関連
│   └── workflows/              # GitHub Actions
│       ├── ci.yml
│       └── deploy.yml
│
├── docker/                      # Docker関連（開発環境用）
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/                        # ドキュメント
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
├── .env.example                 # 環境変数サンプル
├── .env.local                   # ローカル環境変数（gitignore）
├── .eslintrc.json              # ESLint設定
├── .gitignore
├── .prettierrc                 # Prettier設定
├── next.config.js              # Next.js設定
├── package.json
├── postcss.config.js           # PostCSS設定
├── README.md
├── tailwind.config.js          # Tailwind CSS設定
└── tsconfig.json               # TypeScript設定
```

## ディレクトリ詳細説明

### `/src/app/`
Next.js 14のApp Routerを使用。ファイルベースルーティング。

### `/src/components/`
再利用可能なReactコンポーネント。機能別に整理。

### `/src/lib/`
ビジネスロジック、API通信、データベース接続などの処理。

### `/src/hooks/`
カスタムReactフック。状態管理やデータフェッチングのロジック。

### `/src/types/`
TypeScriptの型定義ファイル。

### `/content/`
Markdownファイルでコンテンツを管理する場合に使用。

### `/prisma/`
Prisma ORMを使用する場合のスキーマとマイグレーション。

### `/tests/`
単体テスト、統合テスト、E2Eテストを格納。