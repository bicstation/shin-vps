# php-fpmの公式イメージ (Alpine Linuxベースで軽量) を使用
FROM php:8.1-fpm-alpine

# 1. 依存関係とPostgreSQL PHP拡張機能のインストール
RUN apk update && apk add --no-cache \
    postgresql-dev \
    # unzip, curl, gitなどの一般的なユーティリティ
    unzip \
    curl \
    git \
    # PHP拡張のインストール
    && docker-php-ext-install pdo pdo_pgsql \
    # ビルド後のクリーンアップ
    && rm -rf /var/cache/apk/*

# 2. WordPressのダウンロードと配置
# 公式リポジトリから最新版のWordPressをダウンロードし、/var/www/html/ に展開
RUN curl -o /tmp/wordpress.tar.gz -fSL https://wordpress.org/latest.tar.gz \
    && tar -xzf /tmp/wordpress.tar.gz -C /var/www/ \
    && mv /var/www/wordpress/* /var/www/html/ \
    && rm -rf /var/www/wordpress /tmp/wordpress.tar.gz

# 3. WordPress PostgreSQLアダプタープラグインのインストール
# WP-PostgreSQLプラグイン（または同様のソリューション）をインストール
# ※ 最新版のURLはGitHub等で確認してください。以下は一例です。
RUN curl -o /tmp/wp-postgres.zip -fSL https://github.com/kevinoid/wp-postgresql/archive/refs/heads/master.zip \
    && unzip /tmp/wp-postgres.zip -d /tmp \
    && mkdir -p /var/www/html/wp-content/plugins/wp-postgresql \
    && cp -r /tmp/wp-postgresql-master/* /var/www/html/wp-content/plugins/wp-postgresql/ \
    && rm -rf /tmp/wp-postgres.zip /tmp/wp-postgresql-master

# 4. 適切な権限の設定
# Webサーバーユーザーにファイルの所有権を付与
RUN chown -R www-data:www-data /var/www/html

# 5. 作業ディレクトリの指定
WORKDIR /var/www/html

# 6. WordPress設定ファイル（wp-config.php）の準備
# 環境変数から設定を読み込むために、wp-config-sample.phpをコピーして使用
RUN cp wp-config-sample.php wp-config.php

# 7. WordPressの設定を環境変数から読み込むためのエントリーポイント設定
# ここでは、公式のWordPressイメージと同様に、エントリポイントスクリプトは使用せず、
# docker-compose.yml で環境変数を直接渡し、PHP-FPMを起動します。
EXPOSE 9000
CMD ["php-fpm"]