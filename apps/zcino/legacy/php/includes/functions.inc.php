<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/common_fc.inc.php');
function nrformat($number,$decimals){
	$tmp = explode('.',$number);
	$nr = $tmp[0].'.'.$tmp[1][0].$tmp[1][1];
	return number_format($nr,2,'.','');
}

function get_protocol(){
	if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) {
	    return 'https://';
	}
	return 'http://';
}
function error_report($error){
	$fp = @fopen('_error_log','a+');
	@fwrite($fp,'Date : '.date('Y-m-d H:i:s').';<br /> Error '.$error."\n\r");
	@fclose($fp);
	echo '<pre>An error has occured - '.date('Y-m-d H:i:s').' - '.$error.'</pre>';
}

function log_timer($text){
	$fp = fopen('/home/casinode/public_html/_timer_log.html','a+');
	fwrite($fp,$text."\n\r");
	fclose($fp);
}

function chk_login_notify($userid){ //check if USER ip has changed
	global $adminemail;
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/security.inc.php');
	$q1 = mysqli_query($GLOBALS['con'],"SELECT COALESCE(ip_notify,0) FROM cws_users_info INNER JOIN cws_users ON cws_users.id=cws_users_info.id WHERE cws_users.id='{$userid}' AND status='1'") or die(mysqli_error($GLOBALS['con']));
	$ip_notify = mysqli_result($q1,0);
	$ip_last = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT ip_last FROM cws_users_info WHERE id='{$userid}'"),0);
	//if login IP change notification is enabled and user last login IP has changed
	if ($_SERVER['REMOTE_ADDR']==$ip_last){
		return 0;
	}
	if ($ip_notify==1){
		//check if he has valid email
		$email = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT email FROM cws_users_info WHERE id='{$userid}'"),0);
		if (checkEmail($email)){
			//if he has valid email, send an email to him with login token
			$to = $email;
			$subject = 'Your IP has changed';
			
			$t = '&userid='.$userid.'&newip='.$_SERVER['REMOTE_ADDR'].'&date='.date('Y-m-d H:i:s');
			$t = mencrypt($t,'sdjka828');
			
			$link = 'http://'.$_SERVER['SERVER_NAME'].'/pages/update_data.php?s='.urlencode($t);
			$body = 'Hello, <strong>'.$_SESSION['username'].'</strong>,<br />
			We have noticed suspicios activity on your account.<br />
			Someone has logged into your account from a different IP: <b>'.$_SERVER['REMOTE_ADDR'].'</b>.<br />
			If this was you, please open the following link in same browser where you are logged in:<br />
			<a href="'.$link.'" target="_blank">'.$link.'</a><br /><br />
			<span style="color:red">If you encounter any problems or require assistance, please contact our support team immediately!</span><br /><br /><br />';
			$from = $adminemail;
			send_mail($from,$to,$subject,$body);
			if (mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='5' WHERE `id`='$userid' AND `status`='1'")){;
				return 'LOGIN IP CHANGED: Your account #'.$userid.' has been locked! Please check your email address for instructions on how to regain access to your account.';
			}else{
				return mysqli_error($GLOBALS['con']);
			}
		}
	}
}

?>