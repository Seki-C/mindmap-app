#!/bin/bash

# 🎮 サーバー起動・停止スクリプト

case "$1" in
    start)
        PORT=$2
        if [ -z "$PORT" ]; then
            echo "❌ ポート番号を指定してください"
            echo "使い方: $0 start 8003"
            exit 1
        fi
        
        # すでに使われているか確認
        if ss -tln | grep -q ":$PORT "; then
            echo "⚠️  ポート $PORT はすでに使用中です"
            exit 1
        fi
        
        # サーバー起動
        echo "🚀 ポート $PORT でサーバーを起動します..."
        
        # TODO(human): 以下の行を完成させてください
        # python3 -m http.server ??? をバックグラウンドで起動
        # ヒント: 
        # 1. ???の部分にポート番号を入れる
        # 2. 最後に & を付けるとバックグラウンドで動く
        # 3. nohup を使うと、ターミナルを閉じても動き続ける
        
        echo "✅ 起動しました！"
        ;;
        
    stop)
        PORT=$2
        if [ -z "$PORT" ]; then
            echo "❌ ポート番号を指定してください"
            exit 1
        fi
        
        echo "⚠️  ポート $PORT のサーバーを停止します..."
        
        # PIDを探して停止
        ps -ef | grep "python3 -m http.server $PORT" | grep -v grep | awk '{print $2}' | while read pid; do
            echo "  → PID $pid を停止"
            kill $pid
        done
        
        echo "✅ 停止しました！"
        ;;
        
    status)
        echo "📊 サーバーの状態:"
        echo "─────────────────"
        ss -tln | grep "800[0-9]" | while read line; do
            port=$(echo $line | awk '{print $4}' | cut -d: -f2)
            echo "  ✅ ポート $port → 稼働中"
        done
        ;;
        
    *)
        echo "使い方: $0 {start|stop|status} [ポート番号]"
        echo ""
        echo "例:"
        echo "  $0 start 8003  # 8003番でサーバー起動"
        echo "  $0 stop 8003   # 8003番のサーバー停止"
        echo "  $0 status      # すべての状態を表示"
        ;;
esac