# 🏠 Global Project Context

## 🔴 最重要：Git運用ルール（全プロジェクト必須）

### 絶対ルール
**すべての機能追加・変更・修正後は必ずGitでコミット・プッシュすること**

### 標準ワークフロー
```bash
# 1. ビルド・テスト（プロジェクトに応じて）
cargo build      # Rust
npm run build    # Node.js
python test.py   # Python

# 2. Git操作（共通）
git add .
git commit -m "type: 簡潔な説明"
git push
```

### コミットメッセージ規約
- `feat:` 新機能追加
- `fix:` バグ修正  
- `refactor:` リファクタリング
- `docs:` ドキュメント更新
- `perf:` パフォーマンス改善
- `chore:` その他の変更
- `style:` コードスタイル

### 重要性
- 作業内容の保全
- 履歴管理とトレーサビリティ
- チーム開発での情報共有

---

## 📁 Repository Overview
このリポジトリは複数の学習プロジェクトを管理するモノレポです。

### Projects
- **infrastructure-learning/**: インフラ学習用プロジェクト（Docker, nginx, 監視）
- **mindmap-app/**: Rust製超高速マインドマップアプリケーション（Lightning MindMap）
- **mitsui-commodity-prediction/**: 三井物産商品価格予測チャレンジ
- **signate-competition/**: SIGNATE AIコンペティション
- **personal-blog/**: 個人ブログプロジェクト
- **claude-code-sdk/**: Claude Code SDK開発

## 🖥️ Development Environment
- **OS**: Windows with WSL2 (Ubuntu)
- **Shell**: zsh
- **Editors**: VSCode, Vim/Neovim
- **Version Control**: Git
- **Container**: Docker Desktop for Windows
- **Location**: 自宅PC + AWS無料枠

## 👤 Developer Profile
- **Level**: プログラミング初心者（Pythonでprint文を書いた程度）
- **Goal**: インフラエンジニア（クラウド/ネットワーク/SRE）
- **Learning Style**: 実践重視、手を動かしながら学ぶ
- **Time**: 1日最低1時間の学習
- **記録方法**: GitHubまたはブログに学習記録を残したい

## 🛠️ Technology Stack

### Languages (Priority Order)
1. **Shell Script (Bash)**: インフラ自動化の基礎
2. **Python**: 自動化、データ分析、機械学習
3. **TypeScript/JavaScript**: Webアプリケーション開発
4. **Rust**: システムプログラミング（将来的に）
5. **Go**: クラウドネイティブツール（将来的に）

### Infrastructure & DevOps
- **Containerization**: Docker, Docker Compose
- **Web Server**: nginx
- **Monitoring**: Grafana, Prometheus
- **Cloud**: AWS (無料枠)
- **IaC**: Terraform, Ansible (学習予定)

## 📝 Coding Conventions

### General Rules
- **Comments**: 日本語OK（理解を優先）
- **Error Handling**: 必須（try-catch、エラーチェック）
- **Security**: ハードコードされた認証情報禁止
- **Testing**: 基本的なテストは書く

### Language-Specific
- **Python**: PEP 8準拠、4スペースインデント
- **TypeScript**: ESLint設定に従う、2スペースインデント
- **Shell**: ShellCheck準拠
- **YAML**: 2スペースインデント

### Git Conventions
```bash
# Commit message format
<type>: <description>

# Types
feat:     新機能
fix:      バグ修正
docs:     ドキュメント
style:    コードスタイル
refactor: リファクタリング
test:     テスト
chore:    雑務
```

## 🚀 Common Commands

### Project Navigation
```bash
# プロジェクト間の移動
cd ~/claude/infrastructure-learning
cd ~/claude/mindmap-app
cd ~/claude/signate-competition

# プロジェクト全体の状態確認
ls -la ~/claude/
```

### Docker Operations
```bash
# 全プロジェクトのコンテナ確認
docker ps -a

# イメージ一覧
docker images

# クリーンアップ
docker system prune -a
```

### WSL2 Specific
```bash
# VSCodeをWSLから起動
code .

# WindowsのエクスプローラーをWSLから開く
explorer.exe .

# WSLのファイルパス確認
pwd

# メモリ使用状況確認
free -h

# WSL再起動（Windowsから）
wsl --shutdown
wsl

# ファイルシステムアクセス
# Windows → WSL: /mnt/c/Users/...
# WSL → Windows: \\wsl$\Ubuntu\home\chikato\...
```

## 🎯 Learning Path

### Current Focus
1. ✅ Docker基礎
2. 🔄 Shell Script自動化
3. 📅 Python基礎強化
4. 📅 クラウド（AWS）入門

### Project-Based Learning
- **infrastructure-learning**: DevOps実践
- **mindmap-app**: フロントエンド開発
- **ML projects**: データサイエンス基礎

## 💡 Development Tips

### Debugging Approach
1. エラーメッセージを正確に読む
2. ログを確認（docker logs, console.log）
3. 最小限の再現コードを作る
4. 段階的に複雑さを追加

### Performance Considerations
- Docker: 不要なレイヤーを減らす
- Python: プロファイリングして最適化
- TypeScript: バンドルサイズに注意

### Security Best Practices
- 環境変数で機密情報管理
- .gitignoreの適切な設定
- 依存関係の定期更新
- 最小権限の原則

## 📚 Resources

### Documentation
- [Docker Docs](https://docs.docker.com/)
- [Python公式チュートリアル](https://docs.python.org/ja/3/tutorial/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)

### Learning Platforms
- GitHub（コード例の宝庫）
- Zenn/Qiita（日本語技術記事）
- YouTube（ビジュアル学習）

## 🔄 Workflow

### Daily Routine
1. 前回の続きを確認（git status）
2. 今日の目標を設定
3. 実装・学習
4. コミット（学習記録）
5. 次回のTODOをメモ

### Code Review Checklist
- [ ] 動作確認済み
- [ ] エラーハンドリング実装
- [ ] 不要なコメント・console.log削除
- [ ] READMEやドキュメント更新

## 📌 Important Notes
- AWS無料枠の使用量に注意（請求アラート設定済み）
- WSL2のメモリ制限: 必要に応じて.wslconfig調整
- 定期的なバックアップ（GitHub push）
- 学習記録のブログ化を検討中