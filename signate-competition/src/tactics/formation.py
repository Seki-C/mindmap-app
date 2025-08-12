"""
編隊戦術モジュール
"""

from typing import Dict, Any, List, Tuple
import numpy as np

class FormationManager:
    """編隊管理クラス"""
    
    def __init__(self, youth_config: dict):
        self.config = youth_config
        self.formations = {
            'diamond': self._diamond_formation,
            'line': self._line_formation,
            'wedge': self._wedge_formation,
            'circle': self._circle_formation
        }
        self.current_formation = 'diamond'
        
    def maintain_formation(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        編隊を維持する行動を生成
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 編隊維持行動
        """
        escort_pos = observation.get('escort_position', [0, 0])
        own_positions = observation.get('own_positions', [])
        
        # 目標位置を計算
        target_positions = self.formations[self.current_formation](escort_pos)
        
        # 各機体の移動方向を決定
        actions = {'fighters': [], 'escort': {'action': 'stay'}}
        
        for i, (current_pos, target_pos) in enumerate(zip(own_positions, target_positions)):
            direction = self._calculate_direction(current_pos, target_pos)
            actions['fighters'].append({
                'action': 'move',
                'direction': direction
            })
        
        return actions
    
    def _diamond_formation(self, center: List[float]) -> List[Tuple[float, float]]:
        """ダイヤモンド編隊の位置"""
        offset = 50
        return [
            (center[0], center[1] + offset),      # 前
            (center[0] - offset, center[1]),      # 左
            (center[0] + offset, center[1]),      # 右
            (center[0], center[1] - offset)       # 後
        ]
    
    def _line_formation(self, center: List[float]) -> List[Tuple[float, float]]:
        """横一列編隊の位置"""
        spacing = 40
        return [
            (center[0] - spacing * 1.5, center[1]),
            (center[0] - spacing * 0.5, center[1]),
            (center[0] + spacing * 0.5, center[1]),
            (center[0] + spacing * 1.5, center[1])
        ]
    
    def _wedge_formation(self, center: List[float]) -> List[Tuple[float, float]]:
        """楔形編隊の位置"""
        offset = 45
        return [
            (center[0], center[1] + offset),
            (center[0] - offset, center[1] - offset * 0.5),
            (center[0] + offset, center[1] - offset * 0.5),
            (center[0], center[1] - offset)
        ]
    
    def _circle_formation(self, center: List[float]) -> List[Tuple[float, float]]:
        """円形編隊の位置"""
        radius = 60
        angles = [0, 90, 180, 270]
        positions = []
        
        for angle in angles:
            rad = np.radians(angle)
            x = center[0] + radius * np.cos(rad)
            y = center[1] + radius * np.sin(rad)
            positions.append((x, y))
        
        return positions
    
    def _calculate_direction(self, current: List[float], 
                           target: List[float]) -> str:
        """
        現在位置から目標位置への方向を計算
        
        Args:
            current: 現在位置
            target: 目標位置
            
        Returns:
            direction: 移動方向
        """
        dx = target[0] - current[0]
        dy = target[1] - current[1]
        
        # 8方向に離散化
        angle = np.arctan2(dy, dx)
        angle_deg = np.degrees(angle)
        
        if -22.5 <= angle_deg < 22.5:
            return 'east'
        elif 22.5 <= angle_deg < 67.5:
            return 'northeast'
        elif 67.5 <= angle_deg < 112.5:
            return 'north'
        elif 112.5 <= angle_deg < 157.5:
            return 'northwest'
        elif angle_deg >= 157.5 or angle_deg < -157.5:
            return 'west'
        elif -157.5 <= angle_deg < -112.5:
            return 'southwest'
        elif -112.5 <= angle_deg < -67.5:
            return 'south'
        else:  # -67.5 <= angle_deg < -22.5
            return 'southeast'