import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from typing import Dict, Any

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    各種評価指標を計算
    
    Parameters:
    -----------
    y_true : np.ndarray
        真の値
    y_pred : np.ndarray
        予測値
    
    Returns:
    --------
    Dict[str, float]
        評価指標の辞書
    """
    metrics = {
        'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
        'mae': mean_absolute_error(y_true, y_pred),
        'r2': r2_score(y_true, y_pred),
        'mape': np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100
    }
    
    return metrics

def print_metrics(metrics: Dict[str, float], model_name: str = "Model") -> None:
    """
    評価指標を整形して出力
    """
    print(f"\n{model_name} Performance:")
    print("-" * 30)
    for metric_name, value in metrics.items():
        print(f"{metric_name.upper()}: {value:.4f}")
    print("-" * 30)