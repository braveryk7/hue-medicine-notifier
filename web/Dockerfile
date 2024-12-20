FROM node:18-slim

RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    && apt-get clean

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# 一時ディレクトリでデータベースを初期化
RUN mkdir /tmp-db && \
    DATABASE_URL="file:/tmp-db/app.db" npx prisma migrate deploy --schema=prisma/schema.prisma && \
    cp /tmp-db/app.db /app/init_app.db && \
    rm -r /tmp-db

# エントリーポイントスクリプトを作成
# SQLiteファイルの存在確認を行い、存在しない場合は初期化用のファイルをコピーする
RUN echo '#!/bin/sh\n\
if [ ! -f /data/app.db ]; then\n\
  echo "Initializing database...";\n\
  cp /app/init_app.db /data/app.db;\n\
fi\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

RUN npm run build

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["npm", "start"]
