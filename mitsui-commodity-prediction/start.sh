#!/bin/bash

echo "🚀 三井物産商品価格予測チャレンジ - Docker環境起動中..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .envファイルが見つかりません"
    echo "📝 .env.exampleをコピーして.envを作成してください："
    echo "   cp .env.example .env"
    echo "   その後、Kaggleの認証情報を記入してください"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Dockerが起動していません"
    echo "💡 Docker Desktopを起動してから再度実行してください"
    exit 1
fi

# Build and start containers
echo "🔨 Dockerイメージをビルド中..."
docker-compose build

echo "🏃 コンテナを起動中..."
docker-compose up -d

# Wait for container to be ready
echo "⏳ サービスの起動を待っています..."
sleep 5

# Check if container is running
if docker ps | grep -q kaggle-commodity-prediction; then
    echo "✅ 環境が正常に起動しました！"
    echo ""
    echo "📊 JupyterLabにアクセス: http://localhost:8888"
    echo ""
    echo "🛠️ その他のコマンド:"
    echo "  コンテナに入る: docker exec -it kaggle-commodity-prediction bash"
    echo "  ログを見る: docker-compose logs -f"
    echo "  環境を停止: docker-compose down"
    echo ""
    echo "Happy Kaggling! 🎉"
else
    echo "❌ コンテナの起動に失敗しました"
    echo "ログを確認してください: docker-compose logs"
    exit 1
fi