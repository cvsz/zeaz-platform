<?php
$_SERVER['DOCUMENT_ROOT'] = '/home/zeazdev/zeaz-platform/apps/zcino';
require("includes/config.inc.php");
$res = mysqli_query($GLOBALS['con'], "SELECT id, name, location FROM cws_games WHERE location NOT LIKE '%flash%' LIMIT 10");
while($row = mysqli_fetch_assoc($res)){
    echo "ID: " . $row['id'] . " Name: " . $row['name'] . " Location: " . $row['location'] . "\n";
}
