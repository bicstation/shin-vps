<?php
/**
 * SHIN-VPS Reverse Proxy & Subdirectory Optimization
 */

// 1. プロキシ（Traefik）からのホスト情報を信頼して上書き
if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}

// 2. サイトURLの定義 (ポート番号等を含めた現在のホスト名に /blog を付与)
// これにより、管理画面でのリダイレクト先が常に /blog/wp-admin になります
$current_host = $_SERVER['HTTP_HOST'];
define('WP_HOME', 'http://' . $current_host . '/blog');
define('WP_SITEURL', 'http://' . $current_host . '/blog');

// 3. ログイン・管理画面のパス補正 (URLから /blog が脱落するのを防止)
if (strpos($_SERVER['REQUEST_URI'], 'wp-login.php') !== false || strpos($_SERVER['REQUEST_URI'], 'wp-admin') !== false) {
    if (strpos($_SERVER['REQUEST_URI'], '/blog') === false) {
        $_SERVER['REQUEST_URI'] = '/blog' . $_SERVER['REQUEST_URI'];
    }
}

// 4. プロキシ経由の HTTPS 判定 (将来の SSL化への備え)
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
    $_SERVER['HTTPS'] = 'on';
}

/**
 * The base configuration for WordPress
 */

// Docker用環境変数取得ヘルパー
if (!function_exists('getenv_docker')) {
    function getenv_docker($env, $default) {
        if ($fileEnv = getenv($env . '_FILE')) {
            return rtrim(file_get_contents($fileEnv), "\r\n");
        } else if (($val = getenv($env)) !== false) {
            return $val;
        } else {
            return $default;
        }
    }
}

// ** Database settings ** //
define( 'DB_NAME',     getenv_docker('WORDPRESS_DB_NAME', 'wordpress') );
define( 'DB_USER',     getenv_docker('WORDPRESS_DB_USER', 'example username') );
define( 'DB_PASSWORD', getenv_docker('WORDPRESS_DB_PASSWORD', 'example password') );
define( 'DB_HOST',     getenv_docker('WORDPRESS_DB_HOST', 'mysql') );
define( 'DB_CHARSET',  getenv_docker('WORDPRESS_DB_CHARSET', 'utf8mb4') );
define( 'DB_COLLATE',  getenv_docker('WORDPRESS_DB_COLLATE', '') );

/** Authentication unique keys and salts. */
define( 'AUTH_KEY',         getenv_docker('WORDPRESS_AUTH_KEY',         'a875b57f97980efb2060d83c7cba12962239e876') );
define( 'SECURE_AUTH_KEY',  getenv_docker('WORDPRESS_SECURE_AUTH_KEY',  '25803b5e79e16a6b7c7e617d6ababaebdf58753c') );
define( 'LOGGED_IN_KEY',    getenv_docker('WORDPRESS_LOGGED_IN_KEY',    '31603fcf625dc309941c5b967fc5034cab0c20b5') );
define( 'NONCE_KEY',        getenv_docker('WORDPRESS_NONCE_KEY',        '0782b194a0773da59c1e183333aef0734e121f84') );
define( 'AUTH_SALT',        getenv_docker('WORDPRESS_AUTH_SALT',        '6636b3f0b26cf6e8a1383d5637d94cd31933c2e9') );
define( 'SECURE_AUTH_SALT', getenv_docker('WORDPRESS_SECURE_AUTH_SALT', '418b48984c252ac1423e230d500d87ffce28991a') );
define( 'LOGGED_IN_SALT',   getenv_docker('WORDPRESS_LOGGED_IN_SALT',   '66c542970677fdb0a45099d68dce47f5bd097c20') );
define( 'NONCE_SALT',       getenv_docker('WORDPRESS_NONCE_SALT',       'b6592a48108a92b6a5f0fe3509cd4c61a56376d5') );

$table_prefix = getenv_docker('WORDPRESS_TABLE_PREFIX', 'wp_');
define( 'WP_DEBUG', !!getenv_docker('WORDPRESS_DEBUG', '') );

/* --- 自由編集エリア開始 --- */

if ($configExtra = getenv_docker('WORDPRESS_CONFIG_EXTRA', '')) {
    eval($configExtra);
}

/* --- 自由編集エリア終了 --- */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';