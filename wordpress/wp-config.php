<?php
// =================================================================================
// データベース設定 (環境変数から取得)
// =================================================================================
define( 'DB_NAME', 'tiper_db' ); 
define( 'DB_USER', 'tiper_user' ); 
define( 'DB_PASSWORD', '1492nabe' );

// ホスト名 'db' は docker-compose.yml のサービス名
define( 'DB_HOST', 'db' );

define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );


// =================================================================================
// 認証ユニークキーの設定 (SECRET_KEYは固定値で構いません)
// =================================================================================
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

// テーブルプレフィックス（PostgreSQLは通常小文字を好むため）
$table_prefix = 'wp_';

// デバッグ設定 (エラーを詳細に出力)
// define( 'WP_DEBUG', true );
// =================================================================================
// 強制デバッグ設定 (このエラーをログに出力させる)
// =================================================================================
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true ); // wp-content/debug.log に出力
define( 'WP_DEBUG_DISPLAY', false ); // 画面には表示しない
@ini_set( 'display_errors', 0 );

/* 以下の行でWordPressが設定ファイルを読み込みます。 */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}
require_once ABSPATH . 'wp-settings.php';

