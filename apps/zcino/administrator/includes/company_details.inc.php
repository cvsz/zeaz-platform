<?php
$company = array(
	'name'=>$_SERVER['SERVER_NAME'],
	'street'=>'St. Street Str 123456',
	'country'=>'COUNTRY',
	'email'=>'contact@'.trim($_SERVER['SERVER_NAME'],'www.'),
	'phone'=>mysqli_result(mysqli_query($GLOBALS['con'],"SELECT phone_number FROM cws_settings"),0)
	);
?>