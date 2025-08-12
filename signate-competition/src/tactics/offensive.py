"""
攻撃戦術モジュール
"""

from typing import Dict, Any, List
import numpy as np

class OffensiveTactics:
    """攻撃戦術クラス"""
    
    def __init__(self, youth_config: dict):
        self.config = youth_config
        
    def execute(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        攻撃戦術を実行
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 攻撃行動
        """
        enemy_positions = observation.get('enemy_positions', [])
        enemy_escort_pos = observation.get('enemy_escort_position', [0, 0])
        own_positions = observation.get('own_positions', [])
        
        actions = {'fighters': [], 'escort': {'action': 'stay'}}
        
        # 優先目標：敵護衛機
        primary_target = enemy_escort_pos
        
        # 各戦闘機に攻撃目標を割り当て
        for i, own_pos in enumerate(own_positions):
            if i < 2:
                # 最初の2機は敵護衛機を狙う
                target = primary_target
            else:
                # 残りは最近接の敵戦闘機を狙う
                target = self._find_nearest_enemy(own_pos, enemy_positions)
            
            direction = self._calculate_intercept_direction(own_pos, target)
            actions['fighters'].append({
                'action': 'attack',
                'direction': direction,
                'target': target
            })
        
        return actions
    
    def _find_nearest_enemy(self, position: List[float], 
                           enemies: List[List[float]]) -> List[float]:
        """最近接の敵を見つける"""
        if not enemies:
            return [0, 0]
        
        min_dist = float('inf')
        nearest = enemies[0]
        
        for enemy in enemies:
            dist = np.linalg.norm(
                np.array(position) - np.array(enemy)
            )
            if dist < min_dist:
                min_dist = dist
                nearest = enemy
        
        return nearest
    
    def _calculate_intercept_direction(self, own_pos: List[float],
                                      target_pos: List[float]) -> str:
        """迎撃方向を計算"""
        dx = target_pos[0] - own_pos[0]
        dy = target_pos[1] - own_pos[1]
        
        angle = np.arctan2(dy, dx)
        angle_deg = np.degrees(angle)
        
        # 8方向に離散化
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
        else:
            return 'southeast'