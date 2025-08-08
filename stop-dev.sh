#!/bin/bash

# tmuxセッション名
SESSION_NAME="mindmap-dev"

# セッションを終了
tmux kill-session -t $SESSION_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "開発環境を停止しました"
else
    echo "開発環境は起動していません"
fi