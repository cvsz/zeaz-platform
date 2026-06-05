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
	else {
	
		}
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
$pass = antisqli($_POST['pass']);
$secans = antisqli($_POST['secans']);
$time = (int)antisqli($_POST['time']);
$reason = antisqli($_POST['reason']);
$mindayscloselimit = 5; /*when player chooses to close his account,he can't choose fewer days than this value*/
$maxdayscloselimit = 200;/*when player chooses to close his account,he can't choose more days than this value*/
if ($pass !== $row['pass']) { $errormsg = $lang['Invalid+password']; }
elseif ($secans !== $row['secans']) { $errormsg = $lang['Invalid+answer']; }
elseif (!is_int($time)) { $errormsg = $lang['Invalid+time']; }
elseif ($time > $maxdayscloselimit) { $errormsg = $lang['Too+long+time']; }
elseif ($time < $mindayscloselimit) { $errormsg = $lang['Too+short+time']; }
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').load("includes/acc_close.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
if (empty($errormsg)) {
	$date = date('Y-m-d');
	$expire = addDate($date,$time);
	$sql = "UPDATE `cws_users` SET `status`='4' WHERE `id`='{$_SESSION['userid']}' ";
	$sql = "UPDATE `cws_users_info` SET `ban_expire`='$expire' WHERE `id`='{$_SESSION['userid']}' ";
	if (mysqli_query($GLOBALS['con'],$sql)) {
		echo '
	<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated">'.$lang['Account+status+updated+successfully'].'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/account.inc.php").fadeIn(\'slow\');
				});
	</script>';
	} else {
		error_report(mysqli_error($GLOBALS['con']));
		}
}
?>