"""
環境テスト
"""

import sys
import os
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_imports():
    """必要なライブラリのインポートテスト"""
    print("インポートテスト開始...")
    
    try:
        import numpy as np
        print("✓ NumPy")
    except ImportError as e:
        print(f"✗ NumPy: {e}")
    
    try:
        import torch
        print(f"✓ PyTorch (GPU: {torch.cuda.is_available()})")
    except ImportError as e:
        print(f"✗ PyTorch: {e}")
    
    try:
        import yaml
        print("✓ PyYAML")
    except ImportError as e:
        print(f"✗ PyYAML: {e}")
    
    print()

def test_project_structure():
    """プロジェクト構造のテスト"""
    print("プロジェクト構造テスト...")
    
    required_dirs = [
        'config',
        'src/agents',
        'src/models',
        'src/tactics',
        'src/utils',
        'training',
        'models',
        'logs',
        'tests',
        'docs'
    ]
    
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✓ {dir_path}")
        else:
            print(f"✗ {dir_path} - 存在しません")
    
    print()

def test_config_files():
    """設定ファイルのテスト"""
    print("設定ファイルテスト...")
    
    config_files = [
        'config/config.yaml',
        'config/youth_config.yaml',
        'config/hyperparameters.yaml'
    ]
    
    for config_file in config_files:
        if os.path.exists(config_file):
            print(f"✓ {config_file}")
            try:
                import yaml
                with open(config_file, 'r') as f:
                    yaml.safe_load(f)
                print(f"  → 正常に読み込み可能")
            except Exception as e:
                print(f"  → 読み込みエラー: {e}")
        else:
            print(f"✗ {config_file} - 存在しません")
    
    print()

def test_agent_initialization():
    """エージェント初期化テスト"""
    print("エージェント初期化テスト...")
    
    try:
        from src.agents.hybrid_agent import YouthHybridAgent
        import yaml
        
        with open('config/config.yaml', 'r') as f:
            config = yaml.safe_load(f)
        with open('config/youth_config.yaml', 'r') as f:
            youth_config = yaml.safe_load(f)
        
        agent = YouthHybridAgent(config, youth_config)
        print("✓ ハイブリッドエージェント初期化成功")
        
        # テスト観測データ
        test_observation = {
            'own_positions': [[0, 0], [10, 0], [0, 10], [10, 10]],
            'escort_position': [5, 5],
            'enemy_positions': [[20, 20], [30, 20], [20, 30], [30, 30]],
            'enemy_escort_position': [25, 25]
        }
        
        action = agent.step(test_observation)
        print("✓ step関数実行成功")
        print(f"  → 返却された行動: {type(action)}")
        
    except Exception as e:
        print(f"✗ エージェント初期化エラー: {e}")
    
    print()

if __name__ == "__main__":
    print("=" * 50)
    print("空戦AIチャレンジ 環境テスト")
    print("=" * 50)
    print()
    
    test_imports()
    test_project_structure()
    test_config_files()
    test_agent_initialization()
    
    print("=" * 50)
    print("テスト完了")
    print("=" * 50)