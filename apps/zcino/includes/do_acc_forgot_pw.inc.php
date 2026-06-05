<?php
require_once('config.inc.php');
$username = antisqli($_POST['username']);
$email = antisqli($_POST['email']);
if (strlen($username)>0 && strlen($email)>0){
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE login='$username' AND email='$email'");
	if (mysqli_num_rows($q)>0){
		$q = mysqli_query($GLOBALS['con'],"SELECT `cws_users`.`id` AS id FROM cws_users INNER JOIN `cws_users_info` ON `cws_users`.`id`=`cws_users_info`.`id` WHERE `login`='$username' AND `email`='$email'");
		$userid = mysqli_result($q,0);
		
		$q = mysqli_query($GLOBALS['con'],"SELECT pass FROM cws_users_info WHERE id='$userid'");
		$pass = pass_decode(mysqli_result($q,0));
		
		$body = $lang['Hello'].', '.$username.'<br />'.$lang['You+have+requested+your+password+at'].' '.$sitename.'.<br />'.$lang['Your+password+is'].' : <b>'.$pass.'</b>';
		send_mail($adminemail,$email,$lang['Your+password+at'].' '.$sitename,$body);
		echo $lang['Please+check+your+email'].'!';
	}else{
		echo $lang['Invalid+details'];	
	}
}else{
	echo $lang['Invalid+details'];	
}
?>