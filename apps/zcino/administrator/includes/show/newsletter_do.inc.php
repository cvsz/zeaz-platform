<?php
//this php file sends the newsletter
//powered by zcino
require_once('../config.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE ".$_SESSION['adminlvl']."='1' AND status='1' AND shortname='$filename'");
	if (mysqli_num_rows($q)==0){
		die('<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>');	
	}else{
		$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
		$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
		$page_menu = mysqli_result($q,0,'menu');
		$page_sname = mysqli_result($q,0,'shortname');
	}
}else{
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
	$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
	$page_menu = mysqli_result($q,0,'menu');
	$page_sname = mysqli_result($q,0,'shortname');
}
include('PHPMailer2/class.phpmailer.php');

// Get users info
$getUser_Sql = 'SELECT email FROM cws_users_info';
$getUser = mysqli_query($GLOBALS['con'],$getUser_Sql);

// Post Variables
$emailSubject = $_POST['emailSubject'];
$emailBody = $_POST['emailBody'];

while ($row = mysqli_fetch_array($getUser)) {
	// Get the current user's email
	$emailUser = $row['email'];
	// Define mail object and mail parameters
	$mail = new PHPMailer();
	$mail->From = 'admin@'.$_SERVER['SERVER_NAME'];
	$mail->FromName = $sitename;
	$mail->AddAddress($emailUser);
	$mail->Subject = $emailSubject;
	$mail->Body = $emailBody;
	// Send and verify
	if(!$mail->Send()) {
		echo $lang['Your+message+was+not+sent+to'].' '. $emailUser;
		echo $lang['Error+is'].': '. $mail->ErrorInfo;
	} else {
		
	}
}

?>