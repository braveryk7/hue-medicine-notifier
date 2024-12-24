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
    libssl-dev \
    && apt-get clean

WORKDIR /app

ARG DATABASE_URL BRIDGE_IP ACCESS_TOKEN

RUN echo "DATABASE_URL=${DATABASE_URL}" >> /etc/environment && \
    echo "BRIDGE_IP=${BRIDGE_IP}" >> /etc/environment && \
    echo "ACCESS_TOKEN=${ACCESS_TOKEN}" >> /etc/environment

COPY --from=builder /app/target/release/hue_medicine_notifier /app/hue_medicine_notifier
COPY --from=builder /app/target/release/scheduler /app/scheduler

RUN mkdir -p /var/log/cron && \
    echo "* * * * * . /etc/environment && /app/hue_medicine_notifier >> /var/log/cron/hue_medicine_notifier.log 2>&1" > /etc/cron.d/app_cron && \
    echo "* * * * * . /etc/environment && /app/scheduler >> /var/log/cron/scheduler.log 2>&1" >> /etc/cron.d/app_cron && \
    chmod 0644 /etc/cron.d/app_cron && \
    crontab /etc/cron.d/app_cron

CMD ["cron", "-f"]
