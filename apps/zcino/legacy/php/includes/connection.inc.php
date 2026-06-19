<?php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'casino_user');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'casino_db');

$GLOBALS['con'] = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (!$GLOBALS['con']) {
    die('Website in maintenance. Please come back later!');
}

//make sure PHP and MYSQL have same server time
$G_M_T = '00';
@date_default_timezone_set('UTC');
@mysqli_query($GLOBALS['con'], "SET time_zone = '+07:00';");

function mysqli_result($res, $row, $field=0) {
    if (!$res) {
        return 'ERR';
    }
    $res->data_seek($row);
    $datarow = $res->fetch_array();
    return $datarow[$field];
}

// If IP was banned terminate access — using prepared statement
$remote_ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
$ban_stmt = mysqli_prepare($GLOBALS['con'],
    "SELECT COUNT(*) FROM cws_bans_ip
     WHERE client_ip = ?
       AND DATE_ADD(ban_date, INTERVAL (
           SELECT duration_minutes FROM cws_bans_ip
           WHERE client_ip = ?
           ORDER BY ban_date DESC LIMIT 1
       ) MINUTE) >= NOW()
       AND type = 'frontend'
     ORDER BY ban_date DESC"
);
if ($ban_stmt) {
    mysqli_stmt_bind_param($ban_stmt, 'ss', $remote_ip, $remote_ip);
    mysqli_stmt_execute($ban_stmt);
    mysqli_stmt_bind_result($ban_stmt, $ban_count);
    mysqli_stmt_fetch($ban_stmt);
    if ($ban_count > 0) {
        die('Access restricted');
    }
    mysqli_stmt_close($ban_stmt);
}


?>