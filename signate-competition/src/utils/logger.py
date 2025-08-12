"""
ロギングユーティリティ
"""

import logging
import sys
from pathlib import Path
from datetime import datetime

def setup_logger(level: str = 'INFO', log_dir: str = 'logs') -> logging.Logger:
    """
    ロガーをセットアップ
    
    Args:
        level: ログレベル
        log_dir: ログディレクトリ
        
    Returns:
        logger: 設定済みロガー
    """
    # ロガー取得
    logger = logging.getLogger('AirCombatYouth')
    logger.setLevel(getattr(logging, level))
    
    # 既存のハンドラをクリア
    logger.handlers.clear()
    
    # コンソールハンドラ
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level))
    
    # ファイルハンドラ
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_handler = logging.FileHandler(
        log_path / f'air_combat_{timestamp}.log'
    )
    file_handler.setLevel(logging.DEBUG)
    
    # フォーマッタ
    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    # ハンドラ追加
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger