#!/bin/bash

# 🎮 初心者向け：サーバー確認コマンド

echo "======================================"
echo "🏢 サーバーの状態を確認します"
echo "======================================"
echo ""

echo "📋 働いている店員さん（プロセス）:"
echo "-----------------------------------"
# ps -ef = すべてのプロセスを詳しく表示
# grep python = pythonを含む行だけ表示
# grep -v grep = grepコマンド自体は除外
ps -ef | grep "python.*http" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    port=$(echo $line | grep -oE "8[0-9]{3}")
    if [ ! -z "$port" ]; then
        echo "  👤 社員番号: $pid → $port号室で働いています"
    fi
done

echo ""
echo "🚪 使われている部屋（ポート）:"
echo "-----------------------------------"
# ss -tln = TCP接続でLISTEN状態の数値表示
# grep 800 = 8000番台のポートだけ表示
ss -tln | grep "800[0-9]" | while read line; do
    port=$(echo $line | awk '{print $4}' | cut -d: -f2)
    echo "  🏠 部屋 $port 号室: 使用中"
done

echo ""
echo "💡 ヒント:"
echo "  ブラウザで http://localhost:8001 などにアクセスできます"
echo ""