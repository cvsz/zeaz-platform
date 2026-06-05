<?php

function draw_bar($percent){
	if ($percent<0){$percent = 0;}
	if ($percent>100){$percent = 100;}
	if ($percent==0){
		echo '<span style="height:10px;width:100px;border:2px solid red;display:block"><span style="height:10px;width:'.$percent.'px;background-color:#F33;display:block"> </span></span>';
	}elseif ($percent<100){
		echo '<span style="height:10px;width:100px;border:2px solid orange;display:block"><span style="height:10px;width:'.$percent.'px;background-color:#FC0;display:block"> </span></span>';
	}else{
		echo '<span style="height:10px;width:100px;border:2px solid blue;display:block"><span style="height:10px;width:'.$percent.'px;background-color:#09C;display:block"> </span></span>';
	}
}

function has_duplicate_ip($ip){
	if (strlen($ip)<8){
		return true;
	}
	if (isset($_SESSION['username'])){
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users u INNER JOIN cws_users_info i ON u.id=i.id WHERE login<>'{$_SESSION['username']}' AND ((ip_last='$ip' AND LENGTH(ip_last)>7) OR (ip_reg='$ip' AND LENGTH(ip_last)>7))"))>0){
			return true;
		}
	}else{
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users u INNER JOIN cws_users_info i ON u.id=i.id WHERE  ((ip_last='$ip' AND LENGTH(ip_last)>7) OR (ip_reg='$ip' AND LENGTH(ip_last)>7))"))>0){
			return true;
		}			
	}
	return false;
}

function check_pw($password){
	$banned_chars = array(34,39,60,62,96,36,35,61,45,92,47,37); // " ' < > ` $ # = - \ / %
	$plen = strlen($password);
	$password = str_split($password);
	for ($i=0;$i<$plen;$i++){
		if (ord($password[$i])<33 || ord($password[$i])>126 || in_array(ord($password[$i]),$banned_chars)){
			return false;
		}
	}	
	return true;
}

function pass_encode($pass){
	return base64_encode($pass);
}

function pass_decode($pass){
	return base64_decode($pass);
}

function validateInput($input) {
	htmlspecialchars(
               strip_tags($input),
               ENT_QUOTES,
               "utf-8"
           );
	return $input;
}

function antisqli($input) {
	$valid = mysqli_real_escape_string($GLOBALS['con'],validateInput($input));
	return $valid;
}

function send_mail($from,$to,$subject,$body){
	$headers = '';
	$headers .= "From: $from\n";
	$headers .= "Reply-to: $from\n";
	$headers .= "Return-Path: $from\n";
	$headers .= "Message-ID: <" . md5(uniqid(time())) . "@" . $_SERVER['SERVER_NAME'] . ">\n";
	$headers  .= 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
	$headers .= "Date: " . date('r', time()) . "\n";
	if (mail($to,$subject,$body,$headers)) {return TRUE;} else {return FALSE;}
}

function checkName($name){
	if(!preg_match('/^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/', $name)){ 
        return FALSE; 
    } else {
		return TRUE;
		}
}

function checkEmail($str){ // check if email is valid
	return preg_match("/^[\.A-z0-9_\-\+]+[@][A-z0-9_\-]+([.][A-z0-9_\-]+)+[A-z]{1,4}$/", $str);
}

function usernameExists($str){
	$sql = "SELECT * FROM `cws_users` WHERE `login`='$str'";
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],$sql)) >0) {
				return TRUE;
				}else{
					return FALSE;
					}
}

function checkloggedin($user) {
	global $con;	
	$timeout = floor(ini_get("session.gc_maxlifetime") / 60); //usually it is equal to 30 MINUTES
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `last_activity` > DATE_SUB(NOW(),INTERVAL $timeout MINUTE) AND `login`='$user' AND `logged_in`='1'") or die(mysqli_error($GLOBALS['con']));
	if (mysqli_num_rows($query)>0) {return 'yes';} else {return 'no';}
}

function emailExists($str){
	$sql = "SELECT * FROM `cws_users_info` WHERE `email`='$str'";
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],$sql)) >0) {
				return TRUE;
				}else{
					return FALSE;
					}
}

function addDate($date,$day){ //add days
	$sum = strtotime(date("Y-m-d", strtotime("$date")) . " +$day days");
	$dateTo = date('Y-m-d',$sum);
	return $dateTo;
}