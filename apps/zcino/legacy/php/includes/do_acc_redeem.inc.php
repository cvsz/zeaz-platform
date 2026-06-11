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
$code = antisqli($_POST['code']);
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_codes_prepaid` WHERE `code`='$code'") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)>0) {
	$row = mysqli_fetch_array($sql);
	if ($row['used']=='1'){
		$errormsg = $lang['Coupon+has+been+already+used'];
		}
} else {
	$errormsg = $lang['Invalid+coupon'];//error
}

if (empty($errormsg)) {
	mysqli_query($GLOBALS['con'],"UPDATE cws_users SET cash=cash+'{$row['amount']}' WHERE login='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
	mysqli_query($GLOBALS['con'],"UPDATE cws_codes_prepaid SET used=1,used_by='{$_SESSION['username']}' WHERE code='$code'") or error_report(mysqli_error($GLOBALS['con']));
	echo '
<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated">'.$lang['Your+account+was+credited+with'].' '.$row['amount'].$_SESSION['currency'].'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/account.inc.php").fadeIn(\'slow\');
			});
</script>';
}
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_redeem.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
?>