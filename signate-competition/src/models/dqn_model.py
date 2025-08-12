"""
DQN (Deep Q-Network) モデル
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import List, Tuple

class DQNNetwork(nn.Module):
    """DQNネットワーク"""
    
    def __init__(self, input_size: int, output_size: int, hidden_sizes: List[int]):
        super(DQNNetwork, self).__init__()
        
        layers = []
        prev_size = input_size
        
        for hidden_size in hidden_sizes:
            layers.append(nn.Linear(prev_size, hidden_size))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.1))
            prev_size = hidden_size
        
        layers.append(nn.Linear(prev_size, output_size))
        
        self.network = nn.Sequential(*layers)
        
    def forward(self, x):
        return self.network(x)

class DQNModel:
    """DQNモデルクラス"""
    
    def __init__(self, config: dict, youth_config: dict):
        self.config = config
        self.youth_config = youth_config
        
        # ネットワークパラメータ
        self.input_size = 20  # 仮の入力サイズ
        self.output_size = 9 * 5  # 9アクション × 5機体
        self.hidden_sizes = [256, 128, 64]
        
        # ネットワーク初期化
        self.q_network = DQNNetwork(
            self.input_size, 
            self.output_size,
            self.hidden_sizes
        )
        self.target_network = DQNNetwork(
            self.input_size,
            self.output_size,
            self.hidden_sizes
        )
        
        # ターゲットネットワークの重みをコピー
        self.target_network.load_state_dict(self.q_network.state_dict())
        
        # オプティマイザ
        self.optimizer = optim.Adam(
            self.q_network.parameters(),
            lr=0.0003
        )
        
        # デバイス設定
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.q_network.to(self.device)
        self.target_network.to(self.device)
        
    def predict(self, features: np.ndarray) -> np.ndarray:
        """
        行動を予測
        
        Args:
            features: 特徴ベクトル
            
        Returns:
            actions: 各機体の行動
        """
        # テンソルに変換
        state = torch.FloatTensor(features).unsqueeze(0).to(self.device)
        
        # Q値を計算
        with torch.no_grad():
            q_values = self.q_network(state)
        
        # 各機体の最適行動を選択
        q_values = q_values.view(5, 9)  # 5機体 × 9アクション
        actions = torch.argmax(q_values, dim=1)
        
        return actions.cpu().numpy()
    
    def update_target_network(self):
        """ターゲットネットワークを更新"""
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def save(self, path: str):
        """モデルを保存"""
        torch.save({
            'q_network': self.q_network.state_dict(),
            'target_network': self.target_network.state_dict(),
            'optimizer': self.optimizer.state_dict()
        }, path)
    
    def load(self, path: str):
        """モデルを読み込み"""
        checkpoint = torch.load(path, map_location=self.device)
        self.q_network.load_state_dict(checkpoint['q_network'])
        self.target_network.load_state_dict(checkpoint['target_network'])
        self.optimizer.load_state_dict(checkpoint['optimizer'])