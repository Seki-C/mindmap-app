"""
ルールベースエージェント
"""

from typing import Dict, Any, List
import numpy as np

from src.agents.base_agent import BaseAgent
from src.tactics.formation import FormationManager
from src.tactics.offensive import OffensiveTactics
from src.tactics.defensive import DefensiveTactics

class RuleBasedAgent(BaseAgent):
    """ルールベースの戦術エージェント"""
    
    def __init__(self, config: dict, youth_config: dict):
        super().__init__(config, youth_config)
        
        # 戦術モジュール
        self.formation_manager = FormationManager(youth_config)
        self.offensive_tactics = OffensiveTactics(youth_config)
        self.defensive_tactics = DefensiveTactics(youth_config)
        
        # 戦術選択閾値
        self.switch_threshold = youth_config['tactics']['switch_threshold']
        
    def step(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        ルールベースの行動決定
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 各機体の行動
        """
        # 状況評価
        threat_level = self._evaluate_threat(observation)
        
        # 戦術選択
        if threat_level > 0.7:
            # 高脅威時は防御優先
            action = self.defensive_tactics.execute(observation)
        elif threat_level < 0.3:
            # 低脅威時は攻撃優先
            action = self.offensive_tactics.execute(observation)
        else:
            # 中間時は編隊維持
            action = self.formation_manager.maintain_formation(observation)
        
        return action
    
    def emergency_action(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        緊急時の行動（高速処理）
        
        Args:
            observation: 観測データ
            
        Returns:
            action: 緊急回避行動
        """
        actions = {'fighters': [], 'escort': {}}
        
        # 各戦闘機の緊急回避
        for i in range(4):
            actions['fighters'].append({
                'action': 'evade',
                'direction': self._get_safe_direction(observation, i)
            })
        
        # 護衛機は中心へ
        actions['escort'] = {
            'action': 'move_to_center'
        }
        
        return actions
    
    def _evaluate_threat(self, observation: Dict[str, Any]) -> float:
        """
        脅威レベルを評価
        
        Args:
            observation: 観測データ
            
        Returns:
            threat_level: 0.0〜1.0の脅威レベル
        """
        # 簡易的な脅威評価
        enemy_positions = observation.get('enemy_positions', [])
        own_positions = observation.get('own_positions', [])
        escort_position = observation.get('escort_position', [0, 0])
        
        if not enemy_positions:
            return 0.0
        
        # 護衛機への最近接敵距離
        min_dist_to_escort = float('inf')
        for enemy_pos in enemy_positions:
            dist = np.linalg.norm(
                np.array(enemy_pos) - np.array(escort_position)
            )
            min_dist_to_escort = min(min_dist_to_escort, dist)
        
        # 距離を脅威レベルに変換（近いほど高い）
        max_range = 1000  # 仮の最大距離
        threat_level = 1.0 - (min_dist_to_escort / max_range)
        
        return np.clip(threat_level, 0.0, 1.0)
    
    def _get_safe_direction(self, observation: Dict[str, Any], 
                           fighter_id: int) -> str:
        """
        安全な方向を取得
        
        Args:
            observation: 観測データ
            fighter_id: 戦闘機ID
            
        Returns:
            direction: 安全な方向
        """
        # 簡易実装：敵から離れる方向
        return 'north'  # 仮実装