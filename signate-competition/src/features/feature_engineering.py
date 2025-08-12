import pandas as pd
import numpy as np
from typing import List, Tuple

def create_basic_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    基本的な特徴量を作成
    """
    df_features = df.copy()
    
    # 数値特徴量の基本統計量ベースの特徴
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    # 欠損値の数をカウント
    df_features['missing_count'] = df.isnull().sum(axis=1)
    
    return df_features

def create_interaction_features(df: pd.DataFrame, cols: List[str]) -> pd.DataFrame:
    """
    交互作用特徴量を作成
    """
    df_features = df.copy()
    
    for i, col1 in enumerate(cols):
        for col2 in cols[i+1:]:
            # 積
            df_features[f'{col1}_times_{col2}'] = df[col1] * df[col2]
            # 商
            df_features[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-8)
    
    return df_features

def create_aggregate_features(df: pd.DataFrame, group_col: str, agg_cols: List[str]) -> pd.DataFrame:
    """
    集約特徴量を作成
    """
    df_features = df.copy()
    
    for col in agg_cols:
        # グループごとの統計量
        agg_funcs = ['mean', 'std', 'min', 'max']
        for func in agg_funcs:
            feature_name = f'{group_col}_{col}_{func}'
            df_features[feature_name] = df.groupby(group_col)[col].transform(func)
    
    return df_features