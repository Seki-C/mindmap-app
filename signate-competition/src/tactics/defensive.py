"""
防御戦術モジュール
"""

from typing import Dict, Any, List
import numpy as np

class DefensiveTactics:
    """防御戦術クラス"""
    
    def __init__(self, youth_config: dict):
        self.config = youth_config
        
    def execute(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        防御戦術を実行
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 防御行動
        """
        escort_pos = observation.get('escort_position', [0, 0])
        enemy_positions = observation.get('enemy_positions', [])
        own_positions = observation.get('own_positions', [])
        
        actions = {'fighters': [], 'escort': {}}
        
        # 護衛機を守る陣形を形成
        defense_positions = self._calculate_defense_positions(escort_pos, enemy_positions)
        
        # 各戦闘機を防御位置へ移動
        for i, (own_pos, def_pos) in enumerate(zip(own_positions, defense_positions)):
            direction = self._move_to_position(own_pos, def_pos)
            actions['fighters'].append({
                'action': 'defend',
                'direction': direction,
                'position': def_pos
            })
        
        # 護衛機は安全な方向へ移動
        safe_direction = self._find_safe_direction(escort_pos, enemy_positions)
        actions['escort'] = {
            'action': 'evade',
            'direction': safe_direction
        }
        
        return actions
    
    def _calculate_defense_positions(self, escort_pos: List[float],
                                    enemy_positions: List[List[float]]) -> List[List[float]]:
        """防御陣形の位置を計算"""
        if not enemy_positions:
            # 敵がいない場合は護衛機の周囲に配置
            return self._default_defense_formation(escort_pos)
        
        # 脅威方向を計算
        threat_vector = self._calculate_threat_vector(escort_pos, enemy_positions)
        
        # 脅威方向に対して防御陣形を形成
        positions = []
        shield_distance = 80
        spread = 60
        
        # 護衛機と脅威の間に防御線を形成
        for i in range(4):
            offset = (i - 1.5) * spread / 2
            x = escort_pos[0] + threat_vector[0] * shield_distance + offset * threat_vector[1]
            y = escort_pos[1] + threat_vector[1] * shield_distance - offset * threat_vector[0]
            positions.append([x, y])
        
        return positions
    
    def _default_defense_formation(self, escort_pos: List[float]) -> List[List[float]]:
        """デフォルトの防御陣形"""
        radius = 70
        angles = [45, 135, 225, 315]
        positions = []
        
        for angle in angles:
            rad = np.radians(angle)
            x = escort_pos[0] + radius * np.cos(rad)
            y = escort_pos[1] + radius * np.sin(rad)
            positions.append([x, y])
        
        return positions
    
    def _calculate_threat_vector(self, escort_pos: List[float],
                                enemy_positions: List[List[float]]) -> np.ndarray:
        """脅威ベクトルを計算"""
        # 全敵機の重心方向
        enemy_center = np.mean(enemy_positions, axis=0)
        
        # 護衛機から敵重心への方向ベクトル
        direction = enemy_center - np.array(escort_pos)
        
        # 正規化
        norm = np.linalg.norm(direction)
        if norm > 0:
            direction = direction / norm
        else:
            direction = np.array([1, 0])
        
        return direction
    
    def _move_to_position(self, current: List[float], 
                         target: List[float]) -> str:
        """目標位置への移動方向"""
        dx = target[0] - current[0]
        dy = target[1] - current[1]
        
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
    
    def _find_safe_direction(self, escort_pos: List[float],
                            enemy_positions: List[List[float]]) -> str:
        """安全な方向を見つける"""
        if not enemy_positions:
            return 'stay'
        
        # 全敵機から離れる方向
        escape_vector = np.array([0.0, 0.0])
        
        for enemy in enemy_positions:
            diff = np.array(escort_pos) - np.array(enemy)
            dist = np.linalg.norm(diff)
            if dist > 0:
                escape_vector += diff / dist
        
        # 方向を決定
        if np.linalg.norm(escape_vector) > 0:
            angle = np.arctan2(escape_vector[1], escape_vector[0])
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
            else:
                return 'southeast'
        
        return 'stay'