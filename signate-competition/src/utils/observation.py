"""
観測処理ユーティリティ
"""

from typing import Dict, Any, List, Tuple
import numpy as np

class SituationAnalyzer:
    """状況分析クラス"""
    
    def __init__(self, youth_config: dict):
        self.config = youth_config
        self.dimension = youth_config['agent']['dimension']
        
    def analyze_2d(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        2D完全観測データを分析
        
        Args:
            observation: 観測データ
            
        Returns:
            situation: 状況分析結果
        """
        situation = {
            'is_critical': False,
            'confidence': 0.0,
            'threat_level': 0.0,
            'formation_quality': 0.0,
            'tactical_advantage': 0.0
        }
        
        # 脅威レベル計算
        situation['threat_level'] = self._calculate_threat_level(observation)
        
        # 編隊品質評価
        situation['formation_quality'] = self._evaluate_formation(observation)
        
        # 戦術的優位性
        situation['tactical_advantage'] = self._calculate_advantage(observation)
        
        # 緊急状況判定
        situation['is_critical'] = (
            situation['threat_level'] > 0.8 or
            situation['formation_quality'] < 0.3
        )
        
        # 信頼度計算
        situation['confidence'] = self._calculate_confidence(situation)
        
        return situation
    
    def _calculate_threat_level(self, observation: Dict[str, Any]) -> float:
        """脅威レベルを計算"""
        enemy_positions = observation.get('enemy_positions', [])
        escort_position = observation.get('escort_position', [0, 0])
        
        if not enemy_positions:
            return 0.0
        
        # 護衛機への最小距離
        distances = [
            np.linalg.norm(np.array(pos) - np.array(escort_position))
            for pos in enemy_positions
        ]
        
        min_distance = min(distances)
        
        # 距離を脅威レベルに変換
        max_safe_distance = 500
        threat = max(0, 1 - (min_distance / max_safe_distance))
        
        return min(1.0, threat)
    
    def _evaluate_formation(self, observation: Dict[str, Any]) -> float:
        """編隊の品質を評価"""
        own_positions = observation.get('own_positions', [])
        
        if len(own_positions) < 2:
            return 0.0
        
        # 機体間の距離の分散を計算
        distances = []
        for i in range(len(own_positions)):
            for j in range(i + 1, len(own_positions)):
                dist = np.linalg.norm(
                    np.array(own_positions[i]) - np.array(own_positions[j])
                )
                distances.append(dist)
        
        if not distances:
            return 0.0
        
        # 理想的な距離からの偏差
        ideal_distance = 100  # 仮の理想距離
        deviations = [abs(d - ideal_distance) for d in distances]
        avg_deviation = np.mean(deviations)
        
        # 品質スコア（偏差が小さいほど高い）
        quality = max(0, 1 - (avg_deviation / ideal_distance))
        
        return quality
    
    def _calculate_advantage(self, observation: Dict[str, Any]) -> float:
        """戦術的優位性を計算"""
        own_count = len(observation.get('own_positions', []))
        enemy_count = len(observation.get('enemy_positions', []))
        
        if enemy_count == 0:
            return 1.0
        
        # 数的優位
        numerical_advantage = own_count / (own_count + enemy_count)
        
        # 位置的優位（高度など、2Dでは簡略化）
        positional_advantage = 0.5  # 仮の値
        
        # 総合優位性
        advantage = 0.7 * numerical_advantage + 0.3 * positional_advantage
        
        return advantage
    
    def _calculate_confidence(self, situation: Dict[str, Any]) -> float:
        """状況判断の信頼度を計算"""
        # 各要素の重み付き平均
        weights = {
            'threat_level': 0.4,
            'formation_quality': 0.3,
            'tactical_advantage': 0.3
        }
        
        confidence = (
            (1 - situation['threat_level']) * weights['threat_level'] +
            situation['formation_quality'] * weights['formation_quality'] +
            situation['tactical_advantage'] * weights['tactical_advantage']
        )
        
        return confidence