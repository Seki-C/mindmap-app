#!/bin/bash

# インフラ管理の基礎 - サービス監視スクリプト

echo "=== サーバー管理ツール ==="
echo ""

case "$1" in
    status)
        echo "📊 動作中のWebサーバー:"
        echo "------------------------"
        # TODO(human): ここに実装してください
        # 1. ps auxコマンドでpython3のhttpサーバープロセスを探す
        # 2. grepで絞り込む（http.serverを含む行）
        # 3. 見つかったプロセスの情報を表示
        # ヒント: ps aux | grep "python3.*http.server" | grep -v grep
        ;;
        
    ports)
        echo "🚪 使用中のポート:"
        echo "------------------"
        ss -tlnp | grep -E "800[0-9]" 2>/dev/null || netstat -tln | grep -E "800[0-9]"
        ;;
        
    *)
        echo "使い方: $0 {status|ports}"
        echo "  status - 動作中のサーバーを表示"
        echo "  ports  - 使用中のポートを表示"
        exit 1
        ;;
esac