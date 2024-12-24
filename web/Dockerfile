# ステージ1: ビルドプロセス
FROM node:18-slim AS builder

# 必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    && apt-get clean

WORKDIR /app

# パッケージ情報をコピーして依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# Prismaスキーマ生成
COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# データベースの初期化
RUN mkdir /tmp-db && \
    DATABASE_URL="file:/tmp-db/app.db" npx prisma migrate deploy --schema=prisma/schema.prisma && \
    cp /tmp-db/app.db /app/init_app.db && \
    rm -r /tmp-db

# ステージ2: 実行プロセス
FROM node:18-slim

# 必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    && apt-get clean

WORKDIR /app

# 必要なファイルのみコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/init_app.db ./init_app.db
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/cert ./cert

# 修正版 entrypoint.sh を追加
RUN echo '#!/bin/sh\n\
if [ ! -f /data/app.db ]; then\n\
  echo "Initializing database...";\n\
  cp /app/init_app.db /data/app.db;\n\
  rm -f ./init_app.db;\n\
fi\n\
rm -f /app/entrypoint.sh;\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["npx", "next", "start", "-p", "52000"]
