<?php
define('DB_HOST','localhost');
define('DB_USER','casino_user');
define('DB_PASS','password');
define('DB_NAME','casino_db');

$GLOBALS['con'] = mysqli_connect(DB_HOST,DB_USER,DB_PASS,DB_NAME); // connect to the database
if (!$GLOBALS['con']){
 		 die('Website in maintenance. Please come back later!');
}

//make sure PHP and MYSQL have same server time
$G_M_T = '00';
@date_default_timezone_set('UTC'); //for other timezones, check file "timezone.inc.php"
@mysqli_query($GLOBALS['con'],"SET time_zone = '+07:00';");

function mysqli_result($res, $row, $field=0) { // resource, row number, 
	if (!$res){
		echo 'ERR';
	}else{
		$res->data_seek($row); 
		$datarow = $res->fetch_array(); 
		return $datarow[$field]; 
	}
}
//If IP was banned terminate access
$remote_ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
if(mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bans_ip WHERE client_ip LIKE '{$remote_ip}' AND DATE_ADD(ban_date,INTERVAL (SELECT duration_minutes FROM cws_bans_ip WHERE client_ip LIKE '{$remote_ip}' ORDER BY ban_date DESC LIMIT 0,1) MINUTE)>='".date('Y-m-d H:i:s',time())."' AND type='frontend' ORDER BY ban_date DESC"))>0){	die('Access restricted');}


?>