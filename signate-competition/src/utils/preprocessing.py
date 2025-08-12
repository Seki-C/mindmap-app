import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from typing import Tuple, List, Optional

def handle_missing_values(df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
    """
    欠損値を処理
    
    Parameters:
    -----------
    df : pd.DataFrame
        処理対象のデータフレーム
    strategy : str
        'mean', 'median', 'mode', 'drop', 'forward_fill'
    """
    df_processed = df.copy()
    
    if strategy == 'drop':
        df_processed = df_processed.dropna()
    elif strategy == 'forward_fill':
        df_processed = df_processed.fillna(method='ffill')
    else:
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        categorical_cols = df_processed.select_dtypes(include=['object']).columns
        
        for col in numeric_cols:
            if strategy == 'mean':
                df_processed[col].fillna(df_processed[col].mean(), inplace=True)
            elif strategy == 'median':
                df_processed[col].fillna(df_processed[col].median(), inplace=True)
        
        for col in categorical_cols:
            df_processed[col].fillna(df_processed[col].mode()[0] if not df_processed[col].mode().empty else 'Unknown', inplace=True)
    
    return df_processed

def encode_categorical(df: pd.DataFrame, categorical_cols: List[str], encoding_type: str = 'label') -> pd.DataFrame:
    """
    カテゴリカル変数をエンコード
    
    Parameters:
    -----------
    df : pd.DataFrame
        処理対象のデータフレーム
    categorical_cols : List[str]
        カテゴリカル変数のカラム名リスト
    encoding_type : str
        'label' or 'onehot'
    """
    df_encoded = df.copy()
    
    if encoding_type == 'label':
        for col in categorical_cols:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
    elif encoding_type == 'onehot':
        df_encoded = pd.get_dummies(df_encoded, columns=categorical_cols)
    
    return df_encoded

def scale_features(X_train: pd.DataFrame, X_test: Optional[pd.DataFrame] = None, 
                  scaler_type: str = 'standard') -> Tuple:
    """
    特徴量をスケーリング
    
    Parameters:
    -----------
    X_train : pd.DataFrame
        訓練データ
    X_test : pd.DataFrame
        テストデータ
    scaler_type : str
        'standard' or 'minmax'
    """
    if scaler_type == 'standard':
        scaler = StandardScaler()
    elif scaler_type == 'minmax':
        scaler = MinMaxScaler()
    else:
        raise ValueError(f"Unknown scaler type: {scaler_type}")
    
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=X_train.columns,
        index=X_train.index
    )
    
    if X_test is not None:
        X_test_scaled = pd.DataFrame(
            scaler.transform(X_test),
            columns=X_test.columns,
            index=X_test.index
        )
        return X_train_scaled, X_test_scaled, scaler
    
    return X_train_scaled, scaler

def remove_outliers(df: pd.DataFrame, columns: List[str], method: str = 'iqr', threshold: float = 1.5) -> pd.DataFrame:
    """
    外れ値を除去
    
    Parameters:
    -----------
    df : pd.DataFrame
        処理対象のデータフレーム
    columns : List[str]
        外れ値を検出するカラム
    method : str
        'iqr' or 'zscore'
    threshold : float
        IQRの場合は倍率、zscoreの場合は標準偏差の倍率
    """
    df_cleaned = df.copy()
    
    if method == 'iqr':
        for col in columns:
            Q1 = df_cleaned[col].quantile(0.25)
            Q3 = df_cleaned[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            df_cleaned = df_cleaned[(df_cleaned[col] >= lower_bound) & (df_cleaned[col] <= upper_bound)]
    
    elif method == 'zscore':
        from scipy import stats
        for col in columns:
            z_scores = np.abs(stats.zscore(df_cleaned[col]))
            df_cleaned = df_cleaned[z_scores < threshold]
    
    return df_cleaned