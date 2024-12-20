#!/bin/bash

set -e

# Step 0: db ディレクトリの存在確認または作成
if [ ! -d ./db ]; then
  echo "db directory does not exist. Creating it..."
  mkdir -p ./db
  echo "db directory created."
else
  echo "db directory already exists."
fi

# Step 1: web サービスのビルド
echo "Building web service..."
docker-compose build web --no-cache

# Step 2: web サービスの起動
echo "Starting web service..."
docker-compose up -d web

# Step 3: app.db の生成を待機
echo "Waiting for app.db to be generated..."
while [ ! -f ./db/app.db ]; do
  sleep 1
done

echo "app.db detected."

# Step 4: processor サービスのビルド
echo "Building processor service..."
docker-compose build processor

# Step 5: processor サービスの起動
echo "Starting processor service..."
docker-compose up -d processor

echo "All services have been successfully started."
