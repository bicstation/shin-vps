# php-fpmの公式イメージ (Alpine Linuxベースで軽量) を使用
FROM php:8.1-fpm-alpine

# 1. 依存関係とMariaDB/MySQL PHP拡張機能のインストール
RUN apk update && apk add --no-cache \
    mysql-client \
    mysql-dev \
    unzip \
    curl \
    git \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && docker-php-ext-enable mysqli \
    && rm -rf /var/cache/apk/*

# 2. WordPressのダウンロードと配置
RUN curl -o /tmp/wordpress.tar.gz -fSL https://wordpress.org/latest.tar.gz \
    && tar -xzf /tmp/wordpress.tar.gz -C /var/www/ \
    && mv /var/www/wordpress/* /var/www/html/ \
    && rm -rf /var/www/wordpress /tmp/wordpress.tar.gz

# 4. 適切な権限の設定 (修正点: 権限設定を強化)
# Webサーバーユーザーにファイルの所有権を付与
RUN chown -R www-data:www-data /var/www/html

# ⚠️ [追加] 重要なwp-contentディレクトリのパーミッションを強制的に再帰設定
# これにより、ボリュームマウントによるパーミッションの破損を防ぎます。
RUN chmod -R 775 /var/www/html/wp-content

# 5. 作業ディレクトリの指定
WORKDIR /var/www/html

# 6. WordPress設定ファイル（wp-config.php）の準備
COPY wp-config.php /var/www/html/wp-config.php

# 7. WordPressの設定を環境変数から読み込むためのエントリーポイント設定
EXPOSE 9000
CMD ["php-fpm"]