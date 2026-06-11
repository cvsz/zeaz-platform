<?php
// config.php – central DB connection for legacy PHP app
// Load environment variables (requires vlucas/phpdotenv, already installed in composer.json if present)
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$user = getenv('DB_USER') ?: 'zcino';
$pass = getenv('DB_PASS') ?: '';
$db   = getenv('DB_NAME') ?: 'zcino';

$con = new mysqli($host, $user, $pass, $db);
if ($con->connect_error) {
    die('Database connection failed: ' . $con->connect_error);
}
$con->set_charset('utf8mb4');
?>
