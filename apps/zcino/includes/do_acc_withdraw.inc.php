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

$sql = "SELECT * FROM `cws_users` INNER JOIN cws_settings WHERE `login`='{$_SESSION['username']}'";
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],$sql));
if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
}	
if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT secques FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0)!==antisqli($_POST['secans'])) {
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Invalid secret question</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
}	
//available for withdrawal:
//1. ALL MONEY if no active bonuses , ELSE
//2. TOTAL DEPOSITS after last deposit that had bonus + TOTAL TRANSFERS after last deposit that has bonus - TOTAL WITHDRAWAL AMOUNT after last bonus
//3. If user deposits 100$ then 100$+BONUS, he cannot withdraw his initial deposit of 100$
//mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(deposit+bonus),0) FROM cws_bonuses_instant WHERE status='1' AND userid='{$_SESSION['userid']}'")
$has_bonuses = has_active_bonuses($_SESSION['userid']);
if ($has_bonuses){
	//get date of last deposit with bonus
	$last_dwb = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT date FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1' AND bonus>0 AND rollover>0 ORDER BY date DESC"),0);
	//TOTAL DEPOSITS after last deposit that had bonus
	$total_dep = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE status='1' AND user='{$_SESSION['username']}' AND date>='$last_dwb'"),0);
	//TOTAL TRANSFERS after last deposit that has bonus
	$total_tr = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_transfers WHERE status='1' AND receiver_id='{$_SESSION['userid']}' AND receiver_type='user' AND date>='$last_dwb'"),0);
	//TOTAL WITHDRAWAL AMOUNT after last bonus
	$total_with = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_withdrawals WHERE (status='1' || status='0') AND user='{$_SESSION['username']}' AND date>='$last_dwb'"),0);
	
	$av4withd = $total_dep + $total_tr - $total_with;
}else{
	$av4withd = $row['cash'];
}
$method = antisqli($_POST['method']);
if (!checkName($method) || strlen($method)>20) { 
	$errormsg = $lang['Invalid+withdraw+method'];//error
}	
$email = antisqli($_POST['email']);
$amount = antisqli($_POST['amount']);

if ($has_bonuses && ($av4withd<0 || $amount>$av4withd)){
	if ($amount>$av4withd){
		echo $lang['You+cannot+withdraw+more+than'].' <span class="cash">'.($av4withd).$_SESSION['currency'].'</span>! '.$lang['Make+sure+you+have+completed+the+rollover+limit+of+your+account+to+withdraw+all+funds'].'!<br /><br />';
	}else{
		echo $lang['You+cannot+ask+for+a+withdrawal+until+you+complete+the+rollover+limit+of+your+bonus'].'!<br /><br />';
	}
	?>
    <button id="goback"><?php echo $lang['Go+Back']?></button><br />
	<script type="text/javascript">
	$("#goback").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_withdraw.inc.php").fadeIn('slow');
			});
		});
	</script>
    <?php
	exit;	
}		
$min = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `minimumwithdrawal` FROM `cws_settings`"),0);
$max = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `maximumwithdrawal` FROM `cws_settings`"),0);


$userbalance = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM cws_users WHERE `login`='{$_SESSION['username']}'"),0);
if ($userbalance<$amount) {
	$errormsg = $lang['You+dont+have+enough+money'];
	}
if (!is_numeric($amount)) { 
				$errormsg = $lang['Invalid+amount'];//error
				}
if ($amount > $max || $amount < $min ) {
	$errormsg = $lang['Invalid+amount'];//error
}
if (!checkEmail($email) && $method!=='BitCoin' && $method!=='Web3 Wallet (ETH)' && $method!=='Web3 Wallet (zCoin)') { 
	$errormsg = $lang['Invalid+email'];
}
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').load("includes/acc_withdraw.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
if (empty($errormsg)) {
$sql = "UPDATE `cws_users` SET cash=cash-$amount WHERE `login`='{$_SESSION['username']}'";
//send email
$domain = $_SERVER['SERVER_NAME'];
$from = $adminemail;
$to = $email;
$subject = $lang['Withdrawal+requested'];
$body = $lang['Hello'].' <strong>'.$username.'</strong>,<br />
		'.$lang['You+have+requested+a+withdrawal+of'].' <strong>'.$amount.' '.$_SESSION['currency'].'</strong><br />
		'.$lang['We+will+process+it+in+short+time'].'.<br />
		'.$lang["If+you+have+any+questions+or+comments+please+feel+free+to+contact+us+at+"].' '.$from.'.';
$body2 = '<strong>'.$username.'</strong>,<br />
		'.$lang["Has+requested+a+withdrawal+of"].' <strong>'.$amount.' '.$_SESSION['currency'].'</strong><br />
		'.$lang["You+can+login+at"].' <a href="'.$domain.'/administrator/login.php">'.$lang["admin+menu"].'</a> '.$lang["and+process+it"];
send_mail($from,$to,$subject,$body);
send_mail($email,$adminemail,$subject,$body2);
//update withdrawal tab in admin menu

if (mysqli_query($GLOBALS['con'],$sql)) {
	$date = date('Y-m-j H:i:s');
	$ip = antisqli($_SERVER['REMOTE_ADDR']);
	$sql = "INSERT INTO `cws_withdrawals` (user,amount,date,type,status,notes,email,ip) VALUES ('{$_SESSION['username']}','$amount','$date','$method','0','withdraw','$email','$ip')";
	mysqli_query($GLOBALS['con'],$sql) or die(mysqli_error($GLOBALS['con']));
echo '
<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p class="updated">'.$lang["Your+withdrawal+request+has+been+sent+to+us"].'</p><p>'.$lang['Pleas+wait+5+seconds+to+return+to+your+account+details+window'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
} else {
	error_report(mysqli_error($GLOBALS['con']));
	}
}
?>