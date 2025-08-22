#!/bin/bash

# インフラ学習プロジェクト管理スクリプト
# 作成日: $(date +%Y-%m-%d)
# 目的: Docker環境の操作を簡単にする

set -e  # エラーが発生したら即座に終了

# 色付き出力のための変数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# プロジェクトのルートディレクトリ
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ヘルプメッセージ
show_help() {
    cat << EOF
インフラ学習プロジェクト管理ツール

使い方:
    ./infra.sh [コマンド] [オプション]

コマンド:
    up          - すべてのコンテナを起動
    down        - すべてのコンテナを停止
    restart     - 特定のサービスを再起動
    logs        - ログを表示
    status      - コンテナの状態を確認
    clean       - コンテナとボリュームを削除
    shell       - コンテナ内にシェルで入る
    ports       - 使用中のポートを確認
    help        - このヘルプを表示

例:
    ./infra.sh up
    ./infra.sh logs web
    ./infra.sh shell web
EOF
}

# ログ出力関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Docker Composeコマンドのラッパー
docker_compose() {
    cd "$PROJECT_DIR"
    # 新しいdocker composeコマンドを優先、なければ旧形式を使用
    if command -v docker &> /dev/null && docker compose version &> /dev/null; then
        docker compose "$@"
    elif command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        log_error "DockerまたはDocker Composeがインストールされていません"
        echo "インストール方法: https://docs.docker.com/desktop/wsl/"
        exit 1
    fi
}

# コンテナ起動
start_containers() {
    log_info "コンテナを起動しています..."
    docker_compose up -d
    log_info "起動完了！"
    show_status
}

# コンテナ停止
stop_containers() {
    log_info "コンテナを停止しています..."
    docker_compose down
    log_info "停止完了！"
}

# サービス再起動
restart_service() {
    local service="$1"
    if [ -z "$service" ]; then
        log_error "サービス名を指定してください"
        echo "例: ./infra.sh restart web"
        exit 1
    fi
    log_info "${service}を再起動しています..."
    docker_compose restart "$service"
    log_info "再起動完了！"
}

# ログ表示
show_logs() {
    local service="$1"
    if [ -z "$service" ]; then
        docker_compose logs -f --tail=50
    else
        docker_compose logs -f --tail=50 "$service"
    fi
}

# ステータス確認
show_status() {
    log_info "コンテナ状態:"
    docker_compose ps
}

# クリーンアップ
cleanup() {
    log_warning "すべてのコンテナとボリュームを削除します"
    read -p "本当に実行しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker_compose down -v
        log_info "クリーンアップ完了！"
    else
        log_info "キャンセルしました"
    fi
}

# コンテナ内でシェル実行
exec_shell() {
    local service="$1"
    if [ -z "$service" ]; then
        log_error "サービス名を指定してください"
        echo "例: ./infra.sh shell web"
        exit 1
    fi
    
    log_info "${service}コンテナに接続しています..."
    
    # bashを試す
    docker_compose exec -it "$service" bash 2>/dev/null || \
    # shを試す
    docker_compose exec -it "$service" sh 2>/dev/null || \
    # ashを試す（Alpine Linux用）
    docker_compose exec -it "$service" ash 2>/dev/null || \
    # すべて失敗した場合
    (log_error "コンテナ内にシェルが見つかりません" && exit 1)
}

# ポート使用状況確認
check_ports() {
    log_info "使用中のポート:"
    sudo lsof -i -P -n | grep LISTEN | grep -E ':(8080|3000|5432|6379)'
}

# メイン処理
main() {
    case "${1:-}" in
        up|start)
            start_containers
            ;;
        down|stop)
            stop_containers
            ;;
        restart)
            restart_service "$2"
            ;;
        logs|log)
            show_logs "$2"
            ;;
        status|ps)
            show_status
            ;;
        clean|cleanup)
            cleanup
            ;;
        shell|exec)
            exec_shell "$2"
            ;;
        ports|port)
            check_ports
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "不明なコマンド: ${1:-}"
            show_help
            exit 1
            ;;
    esac
}

# スクリプト実行
main "$@"