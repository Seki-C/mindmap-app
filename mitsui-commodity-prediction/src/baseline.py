#!/usr/bin/env python3
"""
ベースラインモデル - 三井物産商品価格予測チャレンジ
"""

import pandas as pd
import numpy as np
import yaml
import os
import warnings
from pathlib import Path
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
from scipy.stats import spearmanr
import lightgbm as lgb
import argparse
from tqdm import tqdm

warnings.filterwarnings('ignore')

def load_config(config_path='config.yaml'):
    """設定ファイルを読み込む"""
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    return config

def load_data(config):
    """データを読み込む"""
    data_path = Path(config['paths']['raw_data'])
    
    train = pd.read_csv(data_path / config['data']['train_file'])
    test = pd.read_csv(data_path / config['data']['test_file'])
    sample_submission = pd.read_csv(data_path / config['data']['sample_submission'])
    
    print(f"訓練データ: {train.shape}")
    print(f"テストデータ: {test.shape}")
    
    return train, test, sample_submission

def create_features(df, config):
    """特徴量エンジニアリング"""
    df = df.copy()
    
    # 日付型に変換（もし日付カラムがある場合）
    if config['data']['date_column'] in df.columns:
        df[config['data']['date_column']] = pd.to_datetime(df[config['data']['date_column']])
        
        # 時系列特徴量
        df['year'] = df[config['data']['date_column']].dt.year
        df['month'] = df[config['data']['date_column']].dt.month
        df['day'] = df[config['data']['date_column']].dt.day
        df['dayofweek'] = df[config['data']['date_column']].dt.dayofweek
        df['quarter'] = df[config['data']['date_column']].dt.quarter
        df['dayofyear'] = df[config['data']['date_column']].dt.dayofyear
        df['weekofyear'] = df[config['data']['date_column']].dt.isocalendar().week
        
    # 数値型特徴量の処理
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # 移動平均（設定から読み込み）
    for col in numeric_cols:
        if col not in [config['data']['target_column'], config['data']['id_column']]:
            for window in config['features']['ma_windows']:
                df[f'{col}_ma_{window}'] = df[col].rolling(window=window, min_periods=1).mean()
    
    # ローリング統計量
    for col in numeric_cols:
        if col not in [config['data']['target_column'], config['data']['id_column']]:
            for window in config['features']['rolling_windows']:
                df[f'{col}_rolling_std_{window}'] = df[col].rolling(window=window, min_periods=1).std()
                df[f'{col}_rolling_min_{window}'] = df[col].rolling(window=window, min_periods=1).min()
                df[f'{col}_rolling_max_{window}'] = df[col].rolling(window=window, min_periods=1).max()
    
    # ラグ特徴量
    for col in numeric_cols:
        if col not in [config['data']['target_column'], config['data']['id_column']]:
            for lag in config['features']['lag_periods']:
                df[f'{col}_lag_{lag}'] = df[col].shift(lag)
    
    # 欠損値を埋める
    df = df.fillna(method='ffill').fillna(method='bfill').fillna(0)
    
    return df

def custom_metric(y_true, y_pred):
    """カスタム評価指標（シャープ比ベース）"""
    correlation, _ = spearmanr(y_true, y_pred)
    return correlation / np.std(y_pred - y_true)

def train_model(X_train, y_train, X_val, y_val, config):
    """LightGBMモデルを訓練"""
    params = config['model']['lightgbm'].copy()
    
    # データセットの作成
    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
    
    # モデルの訓練
    model = lgb.train(
        params,
        train_data,
        valid_sets=[val_data],
        callbacks=[lgb.early_stopping(params['early_stopping_rounds']),
                   lgb.log_evaluation(0)]
    )
    
    return model

def cross_validate(train, config):
    """時系列クロスバリデーション"""
    # 特徴量とターゲットの準備
    target_col = config['data']['target_column']
    id_col = config['data']['id_column']
    date_col = config['data']['date_column']
    
    # 使用しないカラム
    drop_cols = [target_col, id_col]
    if date_col in train.columns:
        drop_cols.append(date_col)
    
    X = train.drop(columns=drop_cols, errors='ignore')
    y = train[target_col]
    
    # 時系列分割
    tscv = TimeSeriesSplit(n_splits=config['model']['cv_folds'])
    
    scores = []
    models = []
    
    print(f"\n{config['model']['cv_folds']}分割クロスバリデーションを開始...")
    
    for fold, (train_idx, val_idx) in enumerate(tscv.split(X), 1):
        print(f"\nFold {fold}/{config['model']['cv_folds']}")
        
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
        
        # モデル訓練
        model = train_model(X_train, y_train, X_val, y_val, config)
        models.append(model)
        
        # 予測と評価
        y_pred = model.predict(X_val, num_iteration=model.best_iteration)
        
        # RMSE
        rmse = np.sqrt(mean_squared_error(y_val, y_pred))
        
        # カスタム指標
        custom_score = custom_metric(y_val, y_pred)
        
        scores.append({
            'fold': fold,
            'rmse': rmse,
            'custom_metric': custom_score
        })
        
        print(f"  RMSE: {rmse:.4f}")
        print(f"  カスタム指標: {custom_score:.4f}")
    
    # 結果のサマリー
    scores_df = pd.DataFrame(scores)
    print("\n" + "="*50)
    print("クロスバリデーション結果:")
    print("="*50)
    print(scores_df)
    print(f"\n平均RMSE: {scores_df['rmse'].mean():.4f} (+/- {scores_df['rmse'].std():.4f})")
    print(f"平均カスタム指標: {scores_df['custom_metric'].mean():.4f} (+/- {scores_df['custom_metric'].std():.4f})")
    
    return models, scores_df

def make_predictions(test, models, config):
    """テストデータの予測を生成"""
    # 特徴量とターゲットの準備
    id_col = config['data']['id_column']
    date_col = config['data']['date_column']
    
    # 使用しないカラム
    drop_cols = [id_col]
    if date_col in test.columns:
        drop_cols.append(date_col)
    
    X_test = test.drop(columns=drop_cols, errors='ignore')
    
    # 各モデルで予測
    predictions = np.zeros((len(test), len(models)))
    
    for i, model in enumerate(models):
        predictions[:, i] = model.predict(X_test, num_iteration=model.best_iteration)
    
    # 平均を取る
    final_predictions = predictions.mean(axis=1)
    
    # 後処理（設定に基づく）
    if config['post_processing']['clip_predictions']:
        lower = np.percentile(final_predictions, config['post_processing']['clip_percentile'][0])
        upper = np.percentile(final_predictions, config['post_processing']['clip_percentile'][1])
        final_predictions = np.clip(final_predictions, lower, upper)
    
    return final_predictions

def save_submission(test, predictions, config):
    """提出ファイルを保存"""
    submission = pd.DataFrame({
        config['data']['id_column']: test[config['data']['id_column']],
        config['data']['target_column']: predictions
    })
    
    # 保存先ディレクトリを作成
    submission_dir = Path(config['paths']['submissions'])
    submission_dir.mkdir(parents=True, exist_ok=True)
    
    # ファイル名を生成
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = submission_dir / f'submission_baseline_{timestamp}.csv'
    
    # 保存
    submission.to_csv(filename, index=False)
    print(f"\n提出ファイルを保存しました: {filename}")
    
    return submission

def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='ベースラインモデルの訓練と予測')
    parser.add_argument('--config', type=str, default='config.yaml',
                        help='設定ファイルのパス')
    parser.add_argument('--no-cv', action='store_true',
                        help='クロスバリデーションをスキップ')
    args = parser.parse_args()
    
    print("="*80)
    print("三井物産商品価格予測チャレンジ - ベースラインモデル")
    print("="*80)
    
    # 設定読み込み
    config = load_config(args.config)
    
    # データ読み込み
    print("\n1. データを読み込み中...")
    train, test, sample_submission = load_data(config)
    
    # 特徴量エンジニアリング
    print("\n2. 特徴量を生成中...")
    train = create_features(train, config)
    test = create_features(test, config)
    print(f"特徴量生成後 - 訓練: {train.shape}, テスト: {test.shape}")
    
    # クロスバリデーション
    if not args.no_cv:
        print("\n3. クロスバリデーション実行中...")
        models, scores = cross_validate(train, config)
    else:
        print("\n3. 全データで訓練中...")
        # 全データで訓練（CVなし）
        target_col = config['data']['target_column']
        id_col = config['data']['id_column']
        date_col = config['data']['date_column']
        
        drop_cols = [target_col, id_col]
        if date_col in train.columns:
            drop_cols.append(date_col)
        
        X = train.drop(columns=drop_cols, errors='ignore')
        y = train[target_col]
        
        # 簡易的な訓練/検証分割
        split_idx = int(len(X) * 0.8)
        X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_val = y.iloc[:split_idx], y.iloc[split_idx:]
        
        model = train_model(X_train, y_train, X_val, y_val, config)
        models = [model]
    
    # 予測生成
    print("\n4. テストデータの予測を生成中...")
    predictions = make_predictions(test, models, config)
    
    # 提出ファイル保存
    print("\n5. 提出ファイルを保存中...")
    submission = save_submission(test, predictions, config)
    
    print("\n" + "="*80)
    print("✅ 処理が完了しました！")
    print("="*80)
    print("\n次のステップ:")
    print("1. 生成された提出ファイルをKaggleに提出")
    print("2. スコアを確認")
    print("3. 特徴量エンジニアリングの改善")
    print("4. ハイパーパラメータチューニング")
    print("5. アンサンブル手法の追加")
    
    return submission

if __name__ == "__main__":
    submission = main()