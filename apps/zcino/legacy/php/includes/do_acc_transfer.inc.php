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
	}else {
	
		}
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
$secans = antisqli($_POST['secans']);
$receiver = antisqli($_POST['receiver']);
$amount = antisqli($_POST['amount']);
$answer = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `secans` FROM `cws_users_info` WHERE id='{$_SESSION['userid']}'"),0);
$uexists = usernameExists($receiver);
$uid = antisqli($_POST['uid']);
if ($_SESSION['token_transfer']!==$uid){
	$errormsg = 'Invalid attempt ->'.$_SESSION['token_transfer'].'<>'.$uid;	
}
$userbalance = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM cws_users WHERE `login`='{$_SESSION['username']}'"),0);
if ($uexists==TRUE) {
		$receiverstatus = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `status` FROM `cws_users` WHERE login='$receiver'"),0);
	} else {
		$receiverstatus = 0;
		}
if ($userbalance<$amount) {
	$errormsg = $lang['You+dont+have+enough+money'];
	}
if ($receiverstatus!=='1') { 
	$errormsg = $lang['Receiver+is+not+active']; 
}
if (!is_numeric($amount) || $amount<0) { 
				$errormsg = $lang['Invalid+amount'];//error
				}
if ($uexists==FALSE) { 
		$errormsg = $lang['Invalid+username'];
		}
if ($secans!==$answer) {
		$errormsg = $lang['Invalid+answer'];
}
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').load("includes/transfer.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
if (empty($errormsg)) {
	$sql = mysqli_query($GLOBALS['con'],"SELECT `transfer_fee` FROM cws_settings") or error_report(mysqli_error($GLOBALS['con']));	
	$fee = mysqli_result($sql,0);
	$newcash = $amount*(100-$fee)/100; // receiving player will receive an amount equal to AMOUNT - FEE
	$date = date('Y-m-j H:i:s');
	$time = date('H:i:s');
	$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$_SESSION['username']}'"),0);
	$receiverid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$receiver}'"),0);
	mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET cash=cash-$amount WHERE `login`='{$_SESSION['username']}'");
	mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET cash=cash+$newcash WHERE `login`='$receiver'");
	mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,receiver_id,amount,date,time,sender_type,receiver_type,status) VALUES ('$userid','$receiverid','$amount','$date','$time','user','user','1')");
	echo '
	<script type="text/JavaScript">
		$(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated">'.$lang["Money+sent+to"].' '.$receiver.'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(3000, function() {
					$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/account.inc.php").fadeIn(\'slow\');
				});
	</script>';
}
?>