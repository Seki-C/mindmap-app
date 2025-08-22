#!/bin/bash

# 学習記録用スクリプト
# Dockerコマンドの実行履歴を記録して学習に活用

LOG_DIR="./logs/learning"
LOG_FILE="$LOG_DIR/docker-commands-$(date +%Y%m%d).log"

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# ログ記録関数
log_command() {
    local cmd="$1"
    local description="$2"
    
    echo "========================================" >> "$LOG_FILE"
    echo "実行日時: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
    echo "説明: $description" >> "$LOG_FILE"
    echo "コマンド: $cmd" >> "$LOG_FILE"
    echo "----------------------------------------" >> "$LOG_FILE"
    
    # コマンド実行と結果記録
    echo "実行結果:" >> "$LOG_FILE"
    eval "$cmd" 2>&1 | tee -a "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    echo "✅ 記録完了: $LOG_FILE"
}

# 学習用コマンド集
learning_commands() {
    cat << EOF
📚 Docker学習コマンド集

1. イメージ操作
   docker images          # イメージ一覧
   docker pull nginx      # イメージ取得
   docker rmi IMAGE_ID    # イメージ削除

2. コンテナ操作
   docker ps              # 実行中のコンテナ
   docker ps -a           # すべてのコンテナ
   docker logs CONTAINER  # ログ確認
   docker exec -it CONTAINER sh  # シェル接続

3. ネットワーク
   docker network ls      # ネットワーク一覧
   docker network inspect NETWORK  # 詳細確認

4. ボリューム
   docker volume ls       # ボリューム一覧
   docker volume inspect VOLUME  # 詳細確認

記録したいコマンドを実行:
例: ./learning-log.sh exec "docker ps" "コンテナ一覧を確認"
EOF
}

# メイン処理
case "${1:-}" in
    exec)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "使用方法: ./learning-log.sh exec \"コマンド\" \"説明\""
            exit 1
        fi
        log_command "$2" "$3"
        ;;
    show)
        if [ -f "$LOG_FILE" ]; then
            cat "$LOG_FILE"
        else
            echo "本日のログはまだありません"
        fi
        ;;
    help|*)
        learning_commands
        ;;
esac