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
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users_info` INNER JOIN cws_users ON cws_users.id=cws_users_info.id WHERE cws_users.id='{$_SESSION['userid']}'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}
$oldpw = antisqli($_POST['oldpw']);
$newpw1 = antisqli($_POST['newpw1']);
$newpw2 = antisqli($_POST['newpw2']);
$secans = antisqli($_POST['secans']);
if ($oldpw !== pass_decode($row['pass'])) { $errormsg = $lang['Incorrect+password']; }
elseif ($newpw1 !== $newpw2) { $errormsg = $lang['Passwords+do+not+match']; }
elseif (strlen($newpw1) <8) { $errormsg = $lang['Password+is+too+short']; }
elseif (strlen($newpw1) >14) { $errormsg = $lang['Password+is+too+long']; }
elseif ($oldpw == $newpw1) { $errormsg = $lang['Try+using+a+different+password+from+the+old+one'];; }
elseif (!check_pw($newpw1)) { $errormsg = $lang['Invalid+characters']; }
elseif ($secans !== $row['secans']) { $errormsg = $lang['Invalid+answer']; }
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').load("includes/acc_change_pw.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
if (empty($errormsg)) {
	$sql = "UPDATE `cws_users_info` SET `pass`='".pass_encode($newpw1)."' WHERE `id`='{$_SESSION['userid']}' AND status='1'";
	if (mysqli_query($GLOBALS['con'],$sql)) {
		echo '
	<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated">'.$lang['Password+updated+successfully'].'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').load("includes/account.inc.php").fadeIn(\'slow\');
				});
	</script>';
	} else {
		error_report(mysqli_error($GLOBALS['con']));
	}
}
?>