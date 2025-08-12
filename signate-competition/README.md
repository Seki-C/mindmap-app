# 🚀 第4回 空戦AIチャレンジ - ユース部門 実装プロジェクト

## 📋 プロジェクト概要

防衛装備庁主催「第4回 空戦AIチャレンジ」ユース部門向けの競技用AIエージェント開発プロジェクトです。

### 🎯 競技概要
- **部門**: ユース部門（29歳以下対象）
- **環境**: 2次元空戦シミュレーション
- **編隊**: 戦闘機4機 + 護衛対象機1機
- **目標**: 相手の護衛対象機を先に撃墜する
- **特徴**: 全機体の完全観測が可能、機体性能固定

### 🏆 目標順位
- **定量評価**: リーダーボード上位3位以内
- **定性評価**: レポート評価90点以上
- **総合**: 入賞（1位: 25万円、2位: 15万円、3位: 8万円）

## 🔧 環境構築

### 必要要件
- Python 3.10
- メモリ: 16GB以上推奨
- CPU: 4コア以上推奨
- OS: Linux/MacOS/Windows (Docker推奨)

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone [your-repository]
cd air-combat-ai-youth

# 2. Python仮想環境の作成
python3.10 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 依存パッケージのインストール
pip install -r requirements.txt

# 4. シミュレータのセットアップ
unzip simulator_dist.zip -d simulator/
cd simulator/
python setup.py install
cd ..

# 5. 動作確認
python tests/test_environment.py
```

### Docker環境での実行

```bash
# Dockerイメージのビルド
docker build -t air-combat-youth .

# コンテナでの実行（メモリ制限付き）
docker run -m 7500m --cpus="4" air-combat-youth python main.py
```

## 📁 プロジェクト構造

```
air-combat-ai-youth/
├── README.md                 # このファイル
├── requirements.txt          # 依存パッケージ
├── Dockerfile               # Docker環境定義
├── config/
│   ├── config.yaml          # 基本設定
│   ├── youth_config.yaml    # ユース部門専用設定
│   └── hyperparameters.yaml # ハイパーパラメータ
├── src/
│   ├── agents/
│   │   ├── base_agent.py    # 基底クラス
│   │   ├── rule_based.py    # ルールベースエージェント
│   │   ├── ml_agent.py      # 機械学習エージェント
│   │   └── hybrid_agent.py  # ハイブリッドエージェント
│   ├── models/
│   │   ├── dqn_model.py     # DQNモデル
│   │   ├── ppo_model.py     # PPOモデル
│   │   └── ensemble.py      # アンサンブルモデル
│   ├── tactics/
│   │   ├── offensive.py     # 攻撃戦術
│   │   ├── defensive.py     # 防御戦術
│   │   └── formation.py     # 編隊戦術
│   ├── utils/
│   │   ├── observation.py   # 観測処理
│   │   ├── action.py        # 行動生成
│   │   ├── reward.py        # 報酬計算
│   │   └── logger.py        # ログ記録
│   └── main.py              # メインエントリーポイント
├── training/
│   ├── train.py             # 学習スクリプト
│   ├── evaluate.py          # 評価スクリプト
│   └── hyperparameter_search.py # パラメータ探索
├── models/
│   ├── best_model.pkl       # 最良モデル
│   ├── backup_model.pkl     # バックアップモデル
│   └── checkpoint/          # チェックポイント
├── logs/
│   ├── training/            # 学習ログ
│   ├── evaluation/          # 評価ログ
│   └── battle/              # 対戦ログ
├── tests/
│   ├── test_environment.py  # 環境テスト
│   ├── test_agent.py        # エージェントテスト
│   └── test_performance.py  # パフォーマンステスト
└── docs/
    ├── report.md            # 技術レポート（提出用）
    ├── figures/             # レポート用図表
    └── references.md        # 参考文献
```

## 🎮 使用方法

### 基本的な実行

```bash
# メインエージェントの実行
python src/main.py --mode battle --agent hybrid

# 学習の実行
python training/train.py --episodes 10000 --save-interval 100

# 評価の実行
python training/evaluate.py --model models/best_model.pkl --episodes 100

# ハイパーパラメータ探索
python training/hyperparameter_search.py --trials 50
```

### 設定のカスタマイズ

```yaml
# config/youth_config.yaml の例
agent:
  type: "hybrid"
  ml_weight: 0.7
  rule_weight: 0.3

tactics:
  default: "balanced"
  switch_threshold: 0.3

performance:
  max_step_time: 2.5  # 3秒制限に対する安全マージン
  memory_limit_mb: 7000  # 7.5GB制限に対する安全マージン
```

## 🤖 エージェント設計

### 1. ハイブリッドアーキテクチャ

ユース部門の特性（2D空間、完全観測）を活かした設計：

```python
# 実装の概要
class YouthHybridAgent:
    """ユース部門向けハイブリッドエージェント"""
    
    def __init__(self):
        # ルールベース戦術
        self.rule_based = RuleBasedTactics()
        
        # 機械学習モデル（軽量DQN）
        self.ml_model = LightweightDQN()
        
        # 状況判断モジュール
        self.situation_analyzer = SituationAnalyzer()
        
    def step(self, observation):
        # 2D完全観測を活用した高速処理
        situation = self.situation_analyzer.analyze_2d(observation)
        
        # 状況に応じた戦術選択
        if situation.is_critical():
            return self.rule_based.emergency_action(observation)
        else:
            return self.ml_model.predict(observation)
```

### 2. 主要な特徴

#### 2D空間最適化
- 計算量を削減した2次元専用アルゴリズム
- 高速な衝突判定と軌道計算
- シンプルな座標系での処理

#### 完全観測の活用
- 全敵機の位置を考慮した最適戦術
- 予測不要な確定的計画
- 完全情報ゲーム理論の応用

#### 高速応答設計
- 平均応答時間: 0.5秒以下
- 最悪ケース: 2.5秒以内
- タイムアウト時の安全動作

## 📊 パフォーマンス目標

| 指標 | 目標値 | 現在値 | ステータス |
|------|--------|--------|------------|
| 勝率 | >70% | 65% | 🟡 改善中 |
| 平均応答時間 | <0.5秒 | 0.4秒 | ✅ 達成 |
| メモリ使用量 | <5GB | 3.2GB | ✅ 達成 |
| 護衛対象機生存率 | >80% | 75% | 🟡 改善中 |
| 撃墜効率 | >60% | 58% | 🟡 改善中 |

## 🧪 テスト実行

```bash
# 全テストの実行
python -m pytest tests/ -v

# パフォーマンステスト
python tests/test_performance.py --iterations 100

# メモリプロファイリング
python -m memory_profiler src/main.py

# 応答時間の計測
python tests/test_response_time.py --episodes 1000
```

## 📈 学習プロセス

### Phase 1: 基礎学習（〜7/31）
- [x] ルールベースエージェントの実装
- [x] 基本的な戦術の実装
- [x] シミュレータ環境の理解

### Phase 2: 機械学習統合（8/1〜8/31）
- [x] DQNモデルの実装
- [x] 報酬関数の設計
- [ ] 初期学習（10,000エピソード）

### Phase 3: 最適化（9/1〜10/31）
- [ ] ハイパーパラメータチューニング
- [ ] アンサンブル学習
- [ ] 対戦データ分析と改善

### Phase 4: 最終調整（11/1〜11/16）
- [ ] 2エージェント戦略の確定
- [ ] 最終テストと検証
- [ ] レポート作成

## 📝 開発ログ

### 2025/07/14 - プロジェクト開始
- 環境構築完了
- ベースラインエージェント実装

### 2025/07/20 - 初期テスト
- デフォルトAIに対する勝率: 45%
- 応答時間の最適化開始

### 2025/07/25 - 戦術改善
- 編隊飛行アルゴリズム実装
- 勝率が55%に向上

### 2025/08/01 - ML統合開始
- DQNモデルの実装
- 学習環境の構築

（以降、随時更新）

## 🚀 投稿戦略

### 投稿期間（〜11/16）

#### 日次投稿スケジュール
- **6:00バッチ**: 前日の改善版
- **13:00バッチ**: 朝の結果を踏まえた微調整版
- **21:00バッチ**: 実験的な新機能版

#### 2エージェント選択戦略
1. **Agent A（メイン）**: 安定性重視の汎用型
2. **Agent B（サブ）**: 特定戦術特化型

### 評価期間（11/18〜11/19）
- 600試合での安定性を重視
- エラー回避を最優先

## 🏆 定性評価対策

### レポート構成（5ページ）
1. **手法概要**（1ページ）
2. **機械学習の活用**（1ページ）
3. **アーキテクチャ設計**（1.5ページ）
4. **報酬設計と実験**（1ページ）
5. **転用性と独自工夫**（0.5ページ）

### 評価軸別の対策
- ✅ 機械学習の活用: DQN + ルールベースのハイブリッド
- ✅ アーキテクチャ: 2D最適化された独自設計
- ✅ 報酬設計: 多層的な報酬関数
- ✅ 転用性: 設定ファイルベースの柔軟な構造
- ✅ 独自工夫: 完全観測を活かした確定的戦術

## 🤝 貢献

### Discord活動
- 初心者サポート
- バグ報告と解決策の共有
- 技術的なディスカッション

### 注意事項
- 具体的な実装コードは共有しない
- 一般的な技術知識のみ共有
- 建設的なコミュニティ形成に貢献

## 📞 サポート

問題が発生した場合：
1. まず`docs/troubleshooting.md`を確認
2. Discordの該当チャンネルで質問
3. GitHubのIssuesに報告

## 📄 ライセンス

本プロジェクトは競技規約に従います。
- シミュレータコード: 防衛装備庁の規約に準拠
- 独自実装部分: 競技終了後の扱いは規約に従う

## 🎯 最終目標

- **技術的目標**: 革新的な2D空戦AIの実現
- **競技目標**: ユース部門入賞
- **学習目標**: 実践的なAI開発スキルの習得

---

**Last Updated**: 2025/07/14  
**Version**: 1.0.0  
**Author**: [Your Name] (競技用のため詳細は非公開)

> 💡 **Success = 40% Algorithm + 30% Engineering + 20% Strategy + 10% Luck**

頑張りましょう！ 🚀