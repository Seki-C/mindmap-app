"""
基底エージェントクラス
"""

from abc import ABC, abstractmethod
import time
from typing import Dict, Any, List
import numpy as np

class BaseAgent(ABC):
    """全エージェントの基底クラス"""
    
    def __init__(self, config: dict, youth_config: dict):
        self.config = config
        self.youth_config = youth_config
        self.max_step_time = youth_config['performance']['max_step_time']
        self.dimension = youth_config['agent']['dimension']
        
        # パフォーマンス計測用
        self.step_times = []
        self.total_steps = 0
        
    @abstractmethod
    def step(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        観測を受け取り、行動を返す
        
        Args:
            observation: 環境からの観測データ
            
        Returns:
            action: 各機体の行動辞書
        """
        pass
    
    def reset(self):
        """エピソード開始時のリセット"""
        self.step_times = []
        self.total_steps = 0
    
    def _check_time_limit(self, start_time: float) -> bool:
        """
        時間制限をチェック
        
        Args:
            start_time: ステップ開始時刻
            
        Returns:
            制限内ならTrue
        """
        elapsed = time.time() - start_time
        return elapsed < self.max_step_time
    
    def _safe_action(self) -> Dict[str, Any]:
        """タイムアウト時の安全な行動を返す"""
        return {
            'fighters': [{'action': 'stay'} for _ in range(4)],
            'escort': {'action': 'stay'}
        }
    
    def get_performance_stats(self) -> Dict[str, float]:
        """パフォーマンス統計を取得"""
        if not self.step_times:
            return {}
        
        return {
            'avg_step_time': np.mean(self.step_times),
            'max_step_time': np.max(self.step_times),
            'min_step_time': np.min(self.step_times),
            'total_steps': self.total_steps
        }