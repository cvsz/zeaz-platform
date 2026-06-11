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
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}		
$bonusid = antisqli($_POST['bonusid']);
$query = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses WHERE user='{$_SESSION['username']}' AND id='$bonusid' AND redeemed='0'") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($query)>0){
	$bonusdata = mysqli_fetch_array($query);
	$mustplay = $bonusdata['amount']*$bonusdata['unlock_limit'];
	$totalplayed = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='{$_SESSION['username']}' AND `date`>='{$bonusdata['date_started']}'"),0);
	if ($totalplayed*100/$mustplay >= 1) {
		$mysqldate = date('Y-m-d H:i:s',time());
		$phpdate = strtotime($mysqldate);
		if (mysqli_query($GLOBALS['con'],"UPDATE cws_bonuses SET redeemed='1',date_activated='$phpdate' WHERE user='{$_SESSION['username']}' AND id='$bonusid' AND redeemed='0'") &&
		mysqli_query($GLOBALS['con'],"UPDATE cws_users SET cash=cash+'{$bonusdata['amount']}' WHERE login='{$_SESSION['username']}'")) {
			echo '<script type="text/javascript">
			$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Bonus was redeemed</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
			});
			</script>';
		}else {
			echo '<script type="text/javascript">
			$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Bonus was not redeemed.Insufficient plays !</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
			});
			</script>';
		}
	}else {
		echo '<script type="text/javascript">
			$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Bonus was NOT redeemed</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
			});
			</script>';
	}
}else {
	echo '<script type="text/javascript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Invalid bonus</p>\').fadeOut(3000, function() {
			$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
		});
		</script>';
}
?>