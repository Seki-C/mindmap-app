#!/usr/bin/env python3
"""
インフラ監視スクリプト - 初心者向け
Dockerコンテナとサービスの状態を監視する
"""

import subprocess
import json
import time
from datetime import datetime
import sys
import os

# 色付き出力のためのクラス
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_status(message, status="INFO"):
    """ステータスメッセージを色付きで表示"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if status == "OK":
        color = Colors.GREEN
        symbol = "✓"
    elif status == "WARNING":
        color = Colors.YELLOW
        symbol = "⚠"
    elif status == "ERROR":
        color = Colors.RED
        symbol = "✗"
    else:
        color = Colors.BLUE
        symbol = "ℹ"
    
    print(f"{color}[{timestamp}] {symbol} {message}{Colors.END}")

def check_docker_running():
    """Dockerデーモンが動作しているか確認"""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print_status("Docker is running", "OK")
            return True
        else:
            print_status("Docker is not running", "ERROR")
            return False
    except subprocess.TimeoutExpired:
        print_status("Docker check timeout", "ERROR")
        return False
    except FileNotFoundError:
        print_status("Docker not installed", "ERROR")
        return False

def get_container_status():
    """実行中のコンテナ情報を取得"""
    try:
        # docker ps をJSON形式で取得
        result = subprocess.run(
            ["docker", "ps", "--format", "json"],
            capture_output=True,
            text=True
        )
        
        containers = []
        for line in result.stdout.strip().split('\n'):
            if line:
                container = json.loads(line)
                containers.append({
                    'name': container.get('Names', 'Unknown'),
                    'image': container.get('Image', 'Unknown'),
                    'status': container.get('Status', 'Unknown'),
                    'ports': container.get('Ports', 'No ports')
                })
        
        return containers
    except Exception as e:
        print_status(f"Error getting container status: {e}", "ERROR")
        return []

def check_port(port):
    """特定のポートが開いているか確認"""
    try:
        # netstatの代わりにssコマンドを使用（より高速）
        result = subprocess.run(
            ["ss", "-tln"],
            capture_output=True,
            text=True
        )
        
        if f":{port}" in result.stdout:
            return True
        return False
    except:
        # ssコマンドが使えない場合はnetcatで確認
        try:
            result = subprocess.run(
                ["nc", "-zv", "localhost", str(port)],
                capture_output=True,
                text=True,
                timeout=2
            )
            return result.returncode == 0
        except:
            return False

def check_disk_usage():
    """ディスク使用量をチェック"""
    try:
        result = subprocess.run(
            ["df", "-h", "/"],
            capture_output=True,
            text=True
        )
        
        lines = result.stdout.strip().split('\n')
        if len(lines) > 1:
            # ヘッダーを除いた最初の行を解析
            parts = lines[1].split()
            if len(parts) >= 5:
                usage_percent = int(parts[4].replace('%', ''))
                
                if usage_percent > 90:
                    print_status(f"Disk usage critical: {usage_percent}%", "ERROR")
                elif usage_percent > 70:
                    print_status(f"Disk usage warning: {usage_percent}%", "WARNING")
                else:
                    print_status(f"Disk usage normal: {usage_percent}%", "OK")
                
                return usage_percent
    except Exception as e:
        print_status(f"Error checking disk usage: {e}", "ERROR")
        return -1

def monitor_loop():
    """メイン監視ループ"""
    print("\n" + "="*50)
    print("  インフラ監視スクリプト - Python学習用")
    print("="*50 + "\n")
    
    # TODO(human): メモリ使用量をチェックする関数を実装
    # /proc/meminfo を読み取って、使用可能メモリと総メモリを取得し、
    # 使用率を計算して適切なステータスメッセージを表示してください
    
    while True:
        print("\n--- Health Check ---")
        
        # Dockerチェック
        if check_docker_running():
            # コンテナ状態を表示
            containers = get_container_status()
            if containers:
                print_status(f"Running containers: {len(containers)}", "INFO")
                for container in containers:
                    print(f"  • {container['name']}: {container['status']}")
            else:
                print_status("No containers running", "WARNING")
        
        # ポートチェック
        important_ports = [8080, 3000, 5432, 6379]
        for port in important_ports:
            if check_port(port):
                print_status(f"Port {port} is open", "OK")
            else:
                print_status(f"Port {port} is closed", "INFO")
        
        # ディスク使用量チェック
        check_disk_usage()
        
        # 10秒待機
        print("\nNext check in 10 seconds... (Ctrl+C to stop)")
        try:
            time.sleep(10)
        except KeyboardInterrupt:
            print("\n")
            print_status("Monitoring stopped by user", "INFO")
            sys.exit(0)

if __name__ == "__main__":
    try:
        monitor_loop()
    except Exception as e:
        print_status(f"Fatal error: {e}", "ERROR")
        sys.exit(1)