"""
機械学習エージェント
"""

from typing import Dict, Any
import numpy as np
import torch

from src.agents.base_agent import BaseAgent
from src.models.dqn_model import DQNModel

class MLAgent(BaseAgent):
    """機械学習ベースのエージェント"""
    
    def __init__(self, config: dict, youth_config: dict):
        super().__init__(config, youth_config)
        
        # モデル初期化
        self.model = DQNModel(config, youth_config)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # モデル読み込み（学習済みの場合）
        self.model_path = 'models/best_model.pkl'
        self._load_model()
        
    def step(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        機械学習モデルによる行動決定
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 各機体の行動
        """
        # 観測を特徴ベクトルに変換
        features = self._extract_features(observation)
        
        # モデル推論
        with torch.no_grad():
            actions = self.model.predict(features)
        
        # 行動辞書に変換
        action_dict = self._actions_to_dict(actions)
        
        return action_dict
    
    def _extract_features(self, observation: Dict[str, Any]) -> np.ndarray:
        """
        観測から特徴を抽出
        
        Args:
            observation: 観測データ
            
        Returns:
            features: 特徴ベクトル
        """
        features = []
        
        # 自機位置情報
        own_positions = observation.get('own_positions', [[0, 0]] * 4)
        for pos in own_positions:
            features.extend(pos)
        
        # 護衛機位置
        escort_pos = observation.get('escort_position', [0, 0])
        features.extend(escort_pos)
        
        # 敵機位置情報
        enemy_positions = observation.get('enemy_positions', [[0, 0]] * 4)
        for pos in enemy_positions:
            features.extend(pos)
        
        # 敵護衛機位置
        enemy_escort_pos = observation.get('enemy_escort_position', [0, 0])
        features.extend(enemy_escort_pos)
        
        return np.array(features, dtype=np.float32)
    
    def _actions_to_dict(self, actions: np.ndarray) -> Dict[str, Any]:
        """
        モデル出力を行動辞書に変換
        
        Args:
            actions: モデルの出力
            
        Returns:
            action_dict: 行動辞書
        """
        action_map = {
            0: 'north',
            1: 'south',
            2: 'east',
            3: 'west',
            4: 'northeast',
            5: 'northwest',
            6: 'southeast',
            7: 'southwest',
            8: 'stay'
        }
        
        action_dict = {
            'fighters': [],
            'escort': {}
        }
        
        # 各戦闘機の行動
        for i in range(4):
            action_id = int(actions[i])
            action_dict['fighters'].append({
                'action': 'move',
                'direction': action_map.get(action_id, 'stay')
            })
        
        # 護衛機の行動
        escort_action_id = int(actions[4])
        action_dict['escort'] = {
            'action': 'move',
            'direction': action_map.get(escort_action_id, 'stay')
        }
        
        return action_dict
    
    def _load_model(self):
        """学習済みモデルを読み込む"""
        try:
            import os
            if os.path.exists(self.model_path):
                self.model.load(self.model_path)
                print(f"モデルを読み込みました: {self.model_path}")
        except Exception as e:
            print(f"モデル読み込みエラー: {e}")
            print("新規モデルを使用します")