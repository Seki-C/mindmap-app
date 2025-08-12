# SIGNATE Competition Project

データサイエンスコンペティション用プロジェクト

## プロジェクト構造

```
signate-competition/
├── data/               # データセット
│   ├── raw/           # 元データ
│   └── processed/     # 前処理済みデータ
├── notebooks/         # Jupyter Notebook（分析・実験）
├── src/              # ソースコード
│   ├── features/     # 特徴量作成
│   ├── models/       # モデル実装
│   └── utils/        # ユーティリティ関数
├── models/           # 学習済みモデル
├── submissions/      # 提出ファイル
└── requirements.txt  # 依存パッケージ
```

## セットアップ

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# パッケージのインストール
pip install -r requirements.txt
```

## 使用方法

1. `data/raw/`にコンペのデータを配置
2. `notebooks/`で探索的データ分析（EDA）を実施
3. `src/`にモデルや特徴量作成コードを実装
4. 学習済みモデルは`models/`に保存
5. 提出ファイルは`submissions/`に生成

## コンペ情報

- コンペ名: [ここにコンペ名を記載]
- URL: [ここにコンペURLを記載]
- 期間: [開始日 - 終了日]
- 評価指標: [評価指標を記載]