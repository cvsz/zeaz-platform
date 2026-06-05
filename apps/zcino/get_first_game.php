<?php
$_SERVER['DOCUMENT_ROOT'] = '/mnt/hgfs/zeaz-local/zeazdev/zcino';
require("includes/config.inc.php");
$res = mysqli_query($GLOBALS['con'], "SELECT id FROM cws_games LIMIT 1");
$row = mysqli_fetch_assoc($res);
echo "FIRST GAME ID: " . $row['id'] . "\n";
