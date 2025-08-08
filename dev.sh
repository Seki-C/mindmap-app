#!/bin/bash

# tmuxセッション名
SESSION_NAME="mindmap-dev"

# 既存のセッションをチェック
tmux has-session -t $SESSION_NAME 2>/dev/null

if [ $? != 0 ]; then
    # セッションが存在しない場合、新規作成
    
    # メインウィンドウ（開発サーバー）
    tmux new-session -d -s $SESSION_NAME -n 'server'
    tmux send-keys -t $SESSION_NAME:server 'npm run dev' C-m
    
    # 開発用ウィンドウ
    tmux new-window -t $SESSION_NAME -n 'editor'
    tmux send-keys -t $SESSION_NAME:editor 'echo "開発用ウィンドウ - コード編集用"' C-m
    
    # ビルド監視ウィンドウ
    tmux new-window -t $SESSION_NAME -n 'build'
    tmux send-keys -t $SESSION_NAME:build 'npm run typecheck -- --watch' C-m
    
    # Git/一般コマンド用ウィンドウ
    tmux new-window -t $SESSION_NAME -n 'terminal'
    tmux send-keys -t $SESSION_NAME:terminal 'git status' C-m
    
    # ログ確認用ウィンドウ（水平分割）
    tmux new-window -t $SESSION_NAME -n 'logs'
    tmux split-window -h -t $SESSION_NAME:logs
    tmux send-keys -t $SESSION_NAME:logs.0 'echo "ブラウザコンソールログはここで確認"' C-m
    tmux send-keys -t $SESSION_NAME:logs.1 'echo "サーバーログはここで確認"' C-m
    
    # デフォルトでeditorウィンドウを選択
    tmux select-window -t $SESSION_NAME:editor
fi

# セッションにアタッチ
tmux attach-session -t $SESSION_NAME