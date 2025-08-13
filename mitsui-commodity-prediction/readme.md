# 🏆 Kaggle 三井物産商品価格予測チャレンジ - 完全ガイド

[![Kaggle](https://img.shields.io/badge/Kaggle-Competition-20BEFF?style=for-the-badge&logo=kaggle)](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

## 📌 目次
- [コンペティション概要](#コンペティション概要)
- [クイックスタート（Docker版）](#クイックスタートdocker版)
- [重要な日程](#重要な日程)
- [環境構築](#環境構築)
- [プロジェクト構造](#プロジェクト構造)
- [データについて](#データについて)
- [評価方法](#評価方法)
- [提出方法](#提出方法)
- [初心者向けステップバイステップガイド](#初心者向けステップバイステップガイド)
- [Docker環境の使い方](#docker環境の使い方)
- [よくある質問](#よくある質問)
- [トラブルシューティング](#トラブルシューティング)
- [リソース](#リソース)

---

## 🎯 コンペティション概要

### **ミッション**
ロンドン金属取引所（LME）、日本取引所グループ（JPX）、米国株式市場、外国為替市場の過去データを使用して、将来の商品リターンを予測する高精度AIモデルを開発する。

### **なぜ重要？**
- 🌍 世界の商品市場の安定化に貢献
- 💼 企業の財務リスク軽減
- 📊 取引戦略の最適化
- 🎯 より正確な価格予測の実現

### **主催者**
- **スポンサー**: 三井物産株式会社
- **プラットフォーム**: Kaggle
- **技術支援**: アルパカテック株式会社
- **賞金総額**: $100,000 USD

---

## 🚀 クイックスタート（Docker版）

### **30秒で環境構築完了！**

```bash
# 1. リポジトリをクローン（このプロジェクトを使用）
cd mitsui-commodity-prediction

# 2. 環境変数を設定
cp .env.example .env
# .envファイルを編集してKaggle認証情報を記入
# KAGGLE_USERNAME=your_kaggle_username
# KAGGLE_KEY=your_kaggle_api_key

# 3. Docker環境を起動
chmod +x start.sh
./start.sh

# 4. ブラウザでJupyterLabを開く
open http://localhost:8888
```

🎉 **これだけで開発開始！**

---

## 📅 重要な日程

| 日付 | イベント | 残り時間 | 状態 |
|------|---------|----------|------|
| **2025年7月24日** | 🚀 コンペティション開始 | - | ✅ 開始済み |
| **2025年9月29日** | 📝 参加登録締切 | あと47日 | ⏳ 受付中 |
| **2025年9月29日** | 👥 チーム合併締切 | あと47日 | ⏳ 受付中 |
| **2025年10月6日** | 🏁 最終提出締切 | あと54日 | ⚠️ 注意 |
| **2026年1月16日** | 🎊 最終結果発表 | 約5ヶ月後 | 📊 評価期間 |

⏰ **すべての締切はUTC 23:59**

---

## 🐳 環境構築

### **方法1: Docker環境（推奨）** 🌟

#### 必要なもの
- Docker Desktop（Windows/Mac）またはDocker Engine（Linux）
- 8GB以上のRAM
- 10GB以上の空きストレージ

#### セットアップ手順

1. **プロジェクトディレクトリに移動**
```bash
# プロジェクトディレクトリに移動
cd mitsui-commodity-prediction

# ファイルが存在することを確認
ls -la
# Dockerfile, docker-compose.yml, start.sh などが表示されることを確認
```

2. **環境変数を設定**
```bash
# .envファイルを作成
cat > .env << EOF
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key
EOF
```

3. **起動**
```bash
chmod +x start.sh
./start.sh
```

### **方法2: 従来の環境構築**

```bash
# Python環境の準備
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 必要なライブラリをインストール
pip install -r requirements.txt

# Jupyter Labを起動
jupyter lab
```

---

## 📂 プロジェクト構造

```
mitsui-commodity-prediction/
│
├── 🐳 Docker環境
│   ├── Dockerfile              # Docker環境定義 ✅
│   ├── docker-compose.yml      # コンテナ構成 ✅
│   ├── .env                    # 環境変数（Git管理外）※.env.exampleをコピー
│   └── start.sh               # 起動スクリプト ✅
│
├── 📊 データ
│   ├── data/
│   │   ├── raw/              # 元データ（変更禁止）
│   │   ├── processed/        # 前処理済み
│   │   └── features/         # 特徴量
│   └── external/             # 外部データ
│
├── 📓 ノートブック
│   └── notebooks/
│       ├── 01_EDA.ipynb     # データ探索 ✅
│       ├── 02_baseline.ipynb # ベースライン（作成予定）
│       └── 03_advanced.ipynb # 高度なモデル（作成予定）
│
├── 🐍 ソースコード
│   └── src/
│       ├── baseline.py      # ベースラインスクリプト ✅
│       ├── data/            # データ処理（作成予定）
│       ├── features/        # 特徴量生成（作成予定）
│       ├── models/          # モデル定義（作成予定）
│       └── utils/           # ユーティリティ（作成予定）
│
├── 🤖 モデル
│   └── models/              # 学習済みモデル
│
├── 📝 ドキュメント
│   ├── README.md            # このファイル ✅
│   ├── requirements.txt     # Python依存関係 ✅
│   └── docs/               # 追加ドキュメント
│
└── 🔧 設定
    ├── .env.example        # 環境変数テンプレート ✅
    ├── .gitignore          # Git除外設定 ✅
    ├── .dockerignore       # Docker除外設定 ✅
    └── config.yaml         # プロジェクト設定 ✅
```

---

## 📊 データについて

### **提供データセット**

| データソース | 内容 | ファイル形式 | サイズ |
|------------|------|------------|--------|
| **LME** | ロンドン金属取引所 | CSV | ~500MB |
| **JPX** | 日本取引所グループ | CSV | ~300MB |
| **US Stock** | 米国株式市場 | CSV | ~1GB |
| **Forex** | 外国為替市場 | CSV | ~200MB |

### **データ取得方法**

```python
# Kaggle APIを使用
!kaggle competitions download -c mitsui-commodity-prediction-challenge

# Dockerコンテナ内で実行
docker exec kaggle-commodity-prediction \
  kaggle competitions download -c mitsui-commodity-prediction-challenge
```

### **データ使用ルール**
- ✅ コンペティションデータの使用
- ✅ 公開されている外部データ（無料アクセス可能）
- ✅ オープンソースツール・ライブラリ
- ❌ 有料・制限付きデータ
- ❌ テストデータの手動ラベリング

---

## 📈 評価方法

### **評価指標: カスタムシャープ比**

```python
def competition_metric(y_true, y_pred):
    """
    評価指標の計算
    高いスコア = より良い予測
    """
    correlation = spearmanr(y_true, y_pred)[0]
    return correlation / np.std(correlation)
```

### **リーダーボード**
| タイプ | 説明 | 用途 |
|--------|------|------|
| **Public** | テストデータの30% | 開発中の確認 |
| **Private** | テストデータの70% | 最終順位決定 |

---

## 📤 提出方法

### **提出制限**
- **1日あたり**: 最大5回
- **最終選択**: 最大2つ

### **提出コード例**

```python
# 予測を生成
import pandas as pd
from src.models import MyAwesomeModel

# モデルをロード
model = MyAwesomeModel.load('models/best_model.pkl')

# テストデータで予測
test_data = pd.read_csv('data/test.csv')
predictions = model.predict(test_data)

# 提出ファイルを作成
submission = pd.DataFrame({
    'id': test_data['id'],
    'target': predictions
})

# CSVとして保存
submission.to_csv('submission.csv', index=False)
print("✅ 提出ファイルを作成しました！")

# Kaggle APIで提出
!kaggle competitions submit \
  -c mitsui-commodity-prediction-challenge \
  -f submission.csv \
  -m "My awesome model v1.0"
```

---

## 📚 初心者向けステップバイステップガイド

### **Week 1: 環境構築と理解** 🌱

```markdown
Day 1-2: 環境セットアップ
□ Dockerをインストール
□ プロジェクトをセットアップ
□ JupyterLabが動くことを確認

Day 3-4: データの理解
□ データをダウンロード
□ 各ファイルの中身を確認
□ 基本統計を計算

Day 5-7: 初めての提出
□ サンプルコードを実行
□ 最初の提出を行う
□ スコアを確認
```

### **Week 2-3: 探索的データ分析（EDA）** 🔍

```python
# EDAの基本コード
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# データ読み込み
train = pd.read_csv('data/train.csv')

# 基本情報
print("データの形状:", train.shape)
print("\n基本統計:")
print(train.describe())

# 欠損値の確認
print("\n欠損値:")
print(train.isnull().sum())

# 可視化
plt.figure(figsize=(15, 8))

# 価格の推移
plt.subplot(2, 2, 1)
plt.plot(train['date'], train['price'])
plt.title('価格の推移')
plt.xticks(rotation=45)

# 分布
plt.subplot(2, 2, 2)
plt.hist(train['price'], bins=50)
plt.title('価格の分布')

# 相関行列
plt.subplot(2, 2, 3)
sns.heatmap(train.corr(), annot=True, fmt='.2f')
plt.title('相関行列')

plt.tight_layout()
plt.show()
```

### **Week 4-6: モデル開発** 🤖

```python
# ベースラインモデル
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
import lightgbm as lgb

# 特徴量エンジニアリング
def create_features(df):
    df['ma_7'] = df['price'].rolling(7).mean()
    df['ma_30'] = df['price'].rolling(30).mean()
    df['std_7'] = df['price'].rolling(7).std()
    df['price_change'] = df['price'].pct_change()
    return df

# データ準備
train = create_features(train)
train = train.dropna()

# 特徴量と目的変数
features = ['ma_7', 'ma_30', 'std_7', 'price_change']
X = train[features]
y = train['target']

# 時系列クロスバリデーション
tscv = TimeSeriesSplit(n_splits=5)
scores = []

for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
    
    # モデル訓練
    model = lgb.LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.01,
        num_leaves=31,
        random_state=42
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        early_stopping_rounds=100,
        verbose=False
    )
    
    # 評価
    pred = model.predict(X_val)
    score = mean_squared_error(y_val, pred, squared=False)
    scores.append(score)
    print(f"Fold {fold+1}: RMSE = {score:.4f}")

print(f"\n平均RMSE: {np.mean(scores):.4f} (+/- {np.std(scores):.4f})")
```

### **Week 7-8: 改善と最適化** 🚀

- ハイパーパラメータチューニング（Optuna）
- アンサンブル手法
- 特徴量の追加
- 後処理の最適化

---

## 🐳 Docker環境の使い方

### **基本コマンド**

```bash
# 環境起動
./start.sh

# コンテナに入る
docker exec -it kaggle-commodity-prediction bash

# Pythonスクリプト実行
docker exec kaggle-commodity-prediction python train.py

# ノートブック実行
docker exec kaggle-commodity-prediction jupyter nbconvert --execute notebooks/01_EDA.ipynb

# ログ確認
docker-compose logs -f

# 環境停止
docker-compose down

# 環境削除（完全リセット）
docker-compose down -v
```

### **GPU使用（NVIDIA GPUがある場合）**

```yaml
# docker-compose.ymlに追加
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### **便利な設定**

```bash
# エイリアスを設定（.bashrcに追加）
alias kaggle-exec='docker exec -it kaggle-commodity-prediction'
alias kaggle-jupyter='open http://localhost:8888'
alias kaggle-logs='docker-compose logs -f'
```

---

## ❓ よくある質問

### **環境構築編**

<details>
<summary><b>Q: Dockerって何？必要？</b></summary>

Dockerは「仮想的なパソコン」を作るツールです。
- **メリット**: 環境構築が簡単、チームで同じ環境を共有
- **デメリット**: 最初のセットアップが必要
- **結論**: 使わなくても参加できますが、使った方が楽です！
</details>

<details>
<summary><b>Q: GPUは必要？</b></summary>

必須ではありませんが、あると便利です。
- **CPU only**: LightGBM, XGBoostなら十分
- **GPU推奨**: Deep Learning系のモデル
- **代替案**: Kaggle Notebooks（無料GPU付き）、Google Colab
</details>

### **コンペティション編**

<details>
<summary><b>Q: 初心者でも参加できる？</b></summary>

もちろん！むしろ初心者にこそおすすめです。
1. まずはサンプルコードを動かす
2. 少しずつ改善
3. フォーラムで質問
4. 他の人のコードから学ぶ
</details>

<details>
<summary><b>Q: チームを組むべき？</b></summary>

状況による：
- **初心者**: 学習のためにチーム推奨
- **中級者**: ソロで力試し or チームで上位狙い
- **締切**: 9月29日までなら合併可能
</details>

<details>
<summary><b>Q: 外部データは使える？</b></summary>

条件付きで使用可能：
- ✅ 無料で誰でもアクセス可能
- ✅ ライセンスが適切
- ❌ 有料データ
- ❌ 将来の情報（リーク）
</details>

### **技術編**

<details>
<summary><b>Q: どのモデルを使うべき？</b></summary>

段階的アプローチがおすすめ：
1. **最初**: LightGBM（速い、精度良い）
2. **次**: XGBoost, CatBoost
3. **発展**: Neural Networks, Transformer
4. **最終**: アンサンブル（複数モデルの組み合わせ）
</details>

---

## 🔧 トラブルシューティング

### **Docker関連**

| 問題 | 解決方法 |
|------|---------|
| Docker起動しない | `sudo service docker start` または Docker Desktopを再起動 |
| メモリ不足 | Docker設定でメモリ割り当てを増やす（8GB以上推奨） |
| ポート使用中 | `lsof -i :8888` で確認し、使用中のプロセスを終了 |
| 権限エラー | `sudo`を付けるか、dockerグループにユーザーを追加 |

### **Kaggle API関連**

```bash
# 認証エラーの解決
mkdir ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# ダウンロードエラー
kaggle competitions download -c mitsui-commodity-prediction-challenge --force
```

### **Python関連**

```python
# よくあるエラーと対処法

# 1. ImportError
# → pip install [パッケージ名]

# 2. MemoryError
# → データを分割して処理
# → dtypeを最適化（float64 → float32）

# 3. ValueError: Input contains NaN
# → df.fillna() or df.dropna()
```

---

## 🎯 成功のためのヒント

### **🥉 Bronze Medal（初心者）**
- ✅ 完走することが最重要
- ✅ Public LBに過学習しない
- ✅ シンプルなモデルから始める
- ✅ 再現性を確保

### **🥈 Silver Medal（中級者）**
- ✅ 丁寧なEDA
- ✅ 意味のある特徴量エンジニアリング
- ✅ 適切なバリデーション戦略
- ✅ 複数モデルのアンサンブル

### **🥇 Gold Medal（上級者）**
- ✅ ドメイン知識の活用
- ✅ 創造的な特徴量
- ✅ 高度なアンサンブル技術
- ✅ Post-processingの最適化

---

## 📚 リソース

### **公式リンク**
- 🏆 [コンペティションページ](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge)
- 📊 [データセット](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/data)
- 💬 [ディスカッション](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/discussion)
- 📓 [公開ノートブック](https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge/code)

### **学習リソース**
- 📚 [Kaggle Learn](https://www.kaggle.com/learn)
- 🎥 [YouTube: Kaggle入門](https://www.youtube.com/results?search_query=kaggle+beginner)
- 📖 [時系列予測の基礎](https://otexts.com/fppjp/)
- 🔬 [商品市場の基礎知識](https://www.jpx.co.jp/learning/)

### **便利なツール**
- 🔍 [Optuna](https://optuna.org/) - ハイパーパラメータ最適化
- 📊 [MLflow](https://mlflow.org/) - 実験管理
- 🎨 [Weights & Biases](https://wandb.ai/) - 実験追跡
- 🚀 [Ray](https://ray.io/) - 分散処理

---

## 🏁 最後に

### **今すぐやること**

```bash
# 1. 環境構築（5分）
git clone [このリポジトリ]
cd mitsui-commodity-prediction
./start.sh

# 2. データ取得（10分）
kaggle competitions download -c mitsui-commodity-prediction-challenge

# 3. 最初の提出（15分）
docker exec kaggle-commodity-prediction python src/baseline.py
# または、JupyterLabでnotebooks/01_EDA.ipynbを実行

# 合計30分で参加完了！🎉
```

### **モチベーション維持のコツ**
- 📈 毎日少しでも進める
- 🎯 小さな目標を設定
- 💬 フォーラムで交流
- 📚 学んだことを記録
- 🎉 小さな成功を祝う

---

**頑張ってください！質問があればフォーラムでお会いしましょう！** 🚀

---

*最終更新: 2025年8月13日*
*Version: 2.0 (Docker対応版)*