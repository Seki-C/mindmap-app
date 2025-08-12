"""
ハイブリッドエージェント（ルールベース + 機械学習）
"""

import time
from typing import Dict, Any
import numpy as np

from src.agents.base_agent import BaseAgent
from src.agents.rule_based import RuleBasedAgent
from src.agents.ml_agent import MLAgent
from src.utils.observation import SituationAnalyzer

class YouthHybridAgent(BaseAgent):
    """ユース部門向けハイブリッドエージェント"""
    
    def __init__(self, config: dict, youth_config: dict):
        super().__init__(config, youth_config)
        
        # サブエージェント初期化
        self.rule_based = RuleBasedAgent(config, youth_config)
        self.ml_agent = MLAgent(config, youth_config)
        
        # 重み設定
        self.ml_weight = youth_config['agent']['ml_weight']
        self.rule_weight = youth_config['agent']['rule_weight']
        
        # 状況分析器
        self.situation_analyzer = SituationAnalyzer(youth_config)
        
    def step(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        ハイブリッド戦略による行動決定
        
        Args:
            observation: 完全観測データ
            
        Returns:
            action: 各機体の行動
        """
        start_time = time.time()
        
        # タイムアウトチェック
        if not self._check_time_limit(start_time):
            return self._safe_action()
        
        # 2D完全観測を活用した状況分析
        situation = self.situation_analyzer.analyze_2d(observation)
        
        # 状況に応じた戦術選択
        if situation['is_critical']:
            # 緊急時はルールベース
            action = self.rule_based.emergency_action(observation)
        elif situation['confidence'] > 0.8:
            # 高信頼度時は機械学習
            action = self.ml_agent.step(observation)
        else:
            # 通常時はハイブリッド
            action = self._hybrid_decision(observation, situation)
        
        # パフォーマンス記録
        elapsed = time.time() - start_time
        self.step_times.append(elapsed)
        self.total_steps += 1
        
        return action
    
    def _hybrid_decision(self, observation: Dict[str, Any], 
                        situation: Dict[str, Any]) -> Dict[str, Any]:
        """
        ルールベースと機械学習を組み合わせた決定
        
        Args:
            observation: 観測データ
            situation: 状況分析結果
            
        Returns:
            action: ハイブリッド行動
        """
        # 両方のエージェントから行動を取得
        rule_action = self.rule_based.step(observation)
        ml_action = self.ml_agent.step(observation)
        
        # 重み付き組み合わせ
        # ここでは簡単のため、確率的に選択
        if np.random.random() < self.ml_weight:
            return ml_action
        else:
            return rule_action
    
    def reset(self):
        """エピソードリセット"""
        super().reset()
        self.rule_based.reset()
        self.ml_agent.reset()