<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
$dob = antisqli($_POST['dobm']).'/'.antisqli($_POST['dobd']).'/'.antisqli($_POST['doby']);
$email = antisqli($_POST['email']);
if (!checkEmail($email)) {
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+email'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
}else{
	//get old email
	$oldemail = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT email FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0);
	if (checkEmail($oldemail) && $oldemail!==$email){
		//if the old email is valid send email requesting approval for the change	
		require_once('security.inc.php');
		//generate token
		$token = '';
		//send email with details and token
		$_SESSION['mkey'] = substr(md5(uniqid()),0,8);
		$to = $oldemail;
		$domain = $_SERVER['SERVER_NAME'];
		$subject = 'Your email was changed';
		
		$t = '&uem=1'.'&userid='.$_SESSION['userid'].'&oemail='.$oldemail.'&nemail='.$email.'&date='.date('Y-m-d H:i:s');;
		$t = mencrypt($t,$_SESSION['mkey']);

		$link = 'http://'.$_SERVER['SERVER_NAME'].'/pages/update_data.php?t='.urlencode($t);
		$body = $lang['Hello'].' <strong>'.$_SESSION['username'].'</strong>,<br />
		'.$lang['You+have+requested+to+change+your+email+address+into'].' <strong>'.$email.'</strong><br /><br />
		'.$lang['To+allow+this+change'].', '.$lang['please+open+the+following+link+in+same+browser+where+you+are+logged+in'].':<br />
		<a href="'.$link.'" target="_blank">'.$link.'</a><br /><br />
		<span style="color:red">'.$lang['If+you+did+not+request+your+email+to+be+changed'].', '.$lang['please+contact+our+support+team+immediately'].'!</span><br /><br /><br />
		*'.$lang['This+link+will+expire+in+maximum+30+minutes+since+the+moment+you+received+this+email'].'!';

		$from = $adminemail;
		send_mail($from,$to,$subject,$body);
		$emailChanged = '<br />'.$lang['EMAIL+CHANGED'].': '.$lang['Please+verify+your+previous+email+address+within+maximum+30+minutes'].' <br /><span style="color:red">('.$oldemail.')</span><br /> '.$lang['to+approve+the+new+changes'].'!';
	}else{
		//if previous email was invalid, update it with new email
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `email`='$email' WHERE `id`='{$_SESSION['userid']}'");	
	}
	
}
$street = antisqli($_POST['street']);
$zip = antisqli($_POST['zip']);
$ip_notify = antisqli($_POST['ip_notify']);
if ($ip_notify<0 || $ip_notify>1){
	$ip_notify = 0;
}
$city = antisqli($_POST['ort']);
$country = antisqli($_POST['country']);

if (strlen($_POST['dobm'])>0 || strlen($_POST['doby'])>0 || strlen($_POST['dobd'])>0){
	if (!is_numeric($_POST['dobm']) || !is_numeric($_POST['doby']) || !is_numeric($_POST['dobd'])){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+date+of+birth'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}

if (strlen($zip)>1){
	if (!checkName($zip) || strlen($zip>50)){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+zip'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}

if (strlen($street)>1){
	if (!checkName($street) || strlen($street>50)){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+street'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}

if (strlen($country)>1){
	if (!checkName($country) || strlen($country>50)){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+country'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}

if (strlen($city)>1){
	if (!checkName($city) || strlen($city>50)){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+city'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}
$mobiletel = antisqli($_POST['mobiletel']);
if (strlen($mobiletel)>1){
	if (!checkName($mobiletel) || strlen($mobiletel>50)){
		echo '<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Invalid+mobile+phone'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
				});
	</script>';
		exit;
	}
}
$sql = "UPDATE `cws_users_info` INNER JOIN `cws_users` ON `cws_users`.`id`=`cws_users_info`.`id` SET `ip_notify`='$ip_notify',`dob`='$dob',`street`='$street',`zip`='$zip',`ort`='$city',`country`='$country',`mobiletel`='$mobiletel' WHERE `cws_users`.`id`='{$_SESSION['userid']}' AND status='1'";
if (mysqli_query($GLOBALS['con'],$sql)) {
	echo '
<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated" style="text-align:center;font-size:15px">'.$lang['Account+updated+successfully'].'<br />'.$emailChanged.'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(6000, function() {
				$(\'#loginDiv\').load("includes/acc_change_details.inc.php").fadeIn(\'slow\');
			});
</script>';
} else {
	error_report(mysqli_error($GLOBALS['con']));
}
?>