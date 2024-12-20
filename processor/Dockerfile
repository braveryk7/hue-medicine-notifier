# ステージ1: ビルドプロセス
FROM rust:1.83-slim AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && apt-get clean

WORKDIR /app

RUN cargo install sqlx-cli --no-default-features --features sqlite

COPY ../db/app.db /data/app.db
ENV DATABASE_URL=sqlite:/data/app.db

COPY ./processor .

RUN cargo build --release --jobs $(nproc)

# ステージ2: 実行プロセス
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    cron \
    tzdata \
    libssl-dev \
    && apt-get clean

ENV TZ=Asia/Tokyo
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && dpkg-reconfigure -f noninteractive tzdata

WORKDIR /app

COPY --from=builder /app/target/release/hue_medicine_notifier /app/hue_medicine_notifier
COPY --from=builder /app/target/release/scheduler /app/scheduler

COPY .env /app/.env

RUN grep -v '^DATABASE_URL=' /app/.env >> /etc/environment && \
    echo "DATABASE_URL=sqlite:/data/app.db" >> /etc/environment

# cron 設定を一括で登録
RUN mkdir -p /var/log/cron && \
    echo "* * * * * /app/hue_medicine_notifier >> /var/log/cron/hue_medicine_notifier.log 2>&1" > /etc/cron.d/app_cron && \
    echo "0 0 * * * /app/scheduler >> /var/log/cron/scheduler.log 2>&1" >> /etc/cron.d/app_cron && \
    chmod 0644 /etc/cron.d/app_cron && \
    crontab /etc/cron.d/app_cron


CMD ["cron", "-f"]
