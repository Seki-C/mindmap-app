#!/usr/bin/env python3
"""
空戦AIチャレンジ ユース部門 メインエントリーポイント
"""

import os
import sys
import time
import argparse
import logging
from pathlib import Path

import yaml
import numpy as np

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.agents.hybrid_agent import YouthHybridAgent
from src.utils.logger import setup_logger

def load_config(config_path: str) -> dict:
    """設定ファイルを読み込む"""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def main(args):
    """メイン実行関数"""
    # 設定読み込み
    config = load_config(args.config)
    youth_config = load_config(args.youth_config)
    
    # ロガー設定
    logger = setup_logger(config['logging']['level'])
    logger.info("空戦AIチャレンジ ユース部門 エージェント起動")
    
    # シード設定
    np.random.seed(config['environment']['seed'])
    
    # エージェント初期化
    agent = YouthHybridAgent(config, youth_config)
    logger.info(f"エージェントタイプ: {youth_config['agent']['type']}")
    
    if args.mode == 'battle':
        logger.info("対戦モード開始")
        # ここにシミュレータとの接続コードを実装
        # agent.run_battle()
        pass
    elif args.mode == 'test':
        logger.info("テストモード開始")
        # agent.test()
        pass
    else:
        logger.error(f"不明なモード: {args.mode}")
        sys.exit(1)
    
    logger.info("実行完了")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="空戦AIチャレンジ ユース部門")
    parser.add_argument('--mode', type=str, default='battle',
                       choices=['battle', 'test'],
                       help='実行モード')
    parser.add_argument('--config', type=str, 
                       default='config/config.yaml',
                       help='基本設定ファイルパス')
    parser.add_argument('--youth-config', type=str,
                       default='config/youth_config.yaml',
                       help='ユース部門設定ファイルパス')
    parser.add_argument('--agent', type=str, default='hybrid',
                       choices=['rule_based', 'ml_agent', 'hybrid'],
                       help='使用するエージェントタイプ')
    
    args = parser.parse_args()
    main(args)