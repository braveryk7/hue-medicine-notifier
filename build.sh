#!/bin/bash

set -e

# Step 0: .envファイルチェック / db ディレクトリの存在確認または作成
if [ ! -f ./.env ]; then
  echo "Error: .env file not found in project root!"
  echo "Please create a .env file before building."
  exit 1
fi

if [ ! -d ./db ]; then
  echo "db directory does not exist. Creating it..."
  mkdir -p ./db
  echo "db directory created."
else
  echo "db directory already exists."
fi

# Step 1: web/cert/hue-bridge-cert.pem の存在確認
if [ ! -f ./web/cert/hue-bridge-cert.pem ]; then
  echo "Error: web/cert/hue-bridge-cert.pem file not found!"
  echo "Please ensure the file exists before building."
  exit 1
fi

# Step 1: web サービスのビルド
echo "Building web service..."
docker-compose build web --no-cache

# Step 2: web サービスの起動
echo "Starting web service..."
docker-compose up -d --force-recreate web

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
docker-compose up -d --force-recreate processor

echo "All services have been successfully started."
