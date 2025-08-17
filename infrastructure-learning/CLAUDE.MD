# Global Development Settings

## 🖥️ My Development Environment
- OS: Windows with WSL2 (Ubuntu)
- Editors: VSCode, Vim/Neovim
- Shell: zsh
- Location: 自宅PC + AWS無料枠

## 👤 Personal Profile
- 経験レベル: プログラミング初心者（Pythonでprint文を書いた程度）
- 目標: インフラエンジニア（クラウド/ネットワーク/SRE）
- 学習スタイル: 手を動かしながら学ぶ（実践重視）
- 学習時間: 1日最低1時間
- 記録方法: GitHubまたはブログに学習記録を残したい

## 🔤 Programming Languages - 学習予定言語（優先順）

### 1. Shell Script (Bash) - 最優先
- **理由**: インフラ自動化の基礎、すべての基本
- **用途**: 環境構築、自動化スクリプト、運用タスク
- **目標**: 日常的な作業を自動化できるレベル

### 2. Python - 優先度高
- **理由**: インフラ自動化で最も使われる言語
- **用途**: Ansible, 自動化スクリプト, API操作, ログ解析
- **目標**: 簡単な自動化ツールを作れるレベル
- **現状**: print文を書いた程度なので基礎から学習

### 3. Rust - 低レイヤー理解のため
- **理由**: メモリ安全性を学びながら低レイヤーを理解できる
- **選んだ理由**: 
  - Cより現代的で学習しやすい
  - メモリ管理の概念を安全に学べる
  - インフラ系ツールでの採用が増加中
- **用途**: システムプログラミング、パフォーマンスが重要なツール
- **目標**: 低レイヤーの仕組みを理解する

### 4. Go - クラウドネイティブ
- **理由**: Docker, Kubernetes等の主要ツールがGoで書かれている
- **用途**: クラウドネイティブツール開発、API開発
- **目標**: 簡単なCLIツールを作れるレベル

### 言語学習の方針
- まずShell ScriptとPythonで自動化の基礎を固める
- その後、興味と必要性に応じてRustかGoを選択
- 「完璧に覚える」より「使いながら覚える」

## 🛠️ WSL2 Commands & Settings
### WSL2とWindows連携
```bash
# VSCodeをWSLから起動
code .

# WindowsのエクスプローラーをWSLから開く
explorer.exe .

# WSLのファイルパス確認
pwd

# WindowsからWSLへのアクセス
# \\wsl$\Ubuntu\home\ユーザー名
```

## 📂 Project Structure - インフラ学習プロジェクト
```
infrastructure-learning/
├── docker/           # Docker関連の設定・学習
├── nginx/           # Webサーバー設定
├── monitoring/      # 監視ツール（Grafana, Prometheus等）
├── app/            # アプリケーション実装
├── docs/           # ドキュメント
└── docker-compose.yml  # 統合環境設定
```

## 🚀 Frequently Used Commands - よく使うコマンド

### Docker操作
```bash
# コンテナ起動
docker-compose up -d

# コンテナ状態確認
docker-compose ps

# ログ確認
docker-compose logs -f [サービス名]

# コンテナ再起動
docker-compose restart [サービス名]

# クリーンアップ
docker-compose down -v  # ボリュームも削除
```

### Git操作
```bash
# 変更状況確認
git status

# 変更内容確認
git diff

# コミット（学習記録として）
git add .
git commit -m "feat: [学習内容] の実装"

# プッシュ
git push origin main
```

### システム確認
```bash
# ポート使用状況
sudo lsof -i -P -n | grep LISTEN

# プロセス確認
ps aux | grep [プロセス名]

# リソース使用状況
htop  # or top

# ディスク使用量
df -h
du -sh *
```

## 📚 Learning Resources - 学習リソース

### インフラ基礎
- **Linux基礎**: LPICレベル1相当の知識
- **ネットワーク**: TCP/IP, HTTP/HTTPS, DNS基礎
- **仮想化技術**: Docker, Kubernetes基礎

### クラウド学習パス
1. **AWS無料枠活用**
   - EC2, S3, VPC基礎
   - CloudFormation/Terraformでのインフラコード化
   - 月額請求アラート設定必須

2. **実践プロジェクト案**
   - Webアプリケーションの3層構成
   - CI/CDパイプライン構築
   - 監視・ログ収集システム

### 推奨学習順序
1. Shell Script基礎 → 自動化スクリプト作成
2. Docker → コンテナ化の理解
3. Python基礎 → Ansible等の自動化
4. クラウド基礎 → AWS/GCP実践

## 🎯 Current Learning Goals - 現在の学習目標
- [ ] Dockerでの環境構築を完全に理解
- [ ] nginx設定をカスタマイズできる
- [ ] 監視システムの基本設定ができる
- [ ] Shell Scriptで基本的な自動化ができる
- [ ] Pythonで簡単なツールを作れる

## 💡 Tips & Best Practices

### コード記述時の注意
- インデントは言語に合わせる（Python: 4スペース、YAML: 2スペース）
- エラーハンドリングを必ず含める
- ログ出力を適切に設定する
- セキュリティを考慮（秘密情報のハードコード禁止）

### トラブルシューティング手順
1. エラーメッセージを正確に読む
2. ログを確認する
3. 設定ファイルの構文チェック
4. ネットワーク接続確認
5. 権限設定確認

## 🔧 Development Preferences - 開発時の好み
- **コメント**: 日本語でOK（理解優先）
- **命名規則**: snake_case（Python/Shell）、kebab-case（ファイル名）
- **Git commit**: 日本語メッセージOK、prefixつき（feat:, fix:, docs:等）
- **デバッグ**: print文/echo文での確認から始める

## 📝 Notes - メモ
- WSL2のメモリ制限: .wslconfigで調整可能
- Docker Desktop使用時はリソース設定に注意
- AWS無料枠: 12ヶ月間、使用量に注意