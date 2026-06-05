<?php
require_once('includes/config.inc.php');
$showform = FALSE;
$currtime = date('H:i:s');

$form = '</h2>
<table>
<tr>
<td class="grey" style="width:150px">'.$lang['Username'].':</td>
<td class="grey" style="width:90px"><input class="field" type="text" name="username" id="username" value="'.$cookieuser.'" style="width:120px" /></td>
</tr>
<tr>
<td class="grey" style="width:150px">'.$lang['Password'].':</td>
<td class="grey" style="width:90px"><input class="field" type="password" name="password" id="password" style="width:120px" /></td>
</tr>
<tr>
<td colspan="2">
<label><input type="checkbox" name="rememberMe" id="rememberMe" checked value="rememberMe" /> &nbsp;'.$lang['Remember+username'].'</label>
</td>
</tr>
<tr>
<td width="40">
        			<div class="clear"></div>
<input type="submit" id="submitLogin" value="'.$lang['Login'].'" onclick="logMein();" class="bt_login"/>
<script type="text/javascript">
$(\'#passwordId\').bind(\'keypress\', function(e) {
        if(e.keyCode==13){
			logMein();
		}
});
</script>
</td>
<td width="60">
<div id="fb_login_id"></div>
</td>
</tr>
</table>
</form>
';
if (strtotime($currtime)<strtotime($_SESSION['banexpire'])) {
		$xmins = round((strtotime($_SESSION['banexpire'])-strtotime($currtime))/60);
	echo ' <form name="login" action="" onsubmit="return false" method="post">
							<h2>'.$lang['Member+Login'].'';
	echo '<span class="errorinput"> - '.$lang['Available+in'].' '.$xmins.'min</span><br />';
	echo $form;
	exit;	
	}
else {
	if ($_SESSION['invlogins']>=5){$_SESSION['invlogins']=0;}
	if (isset($_SESSION['username'])){
		$loggedin = checkloggedin($_SESSION['username']); //check if user is logged in for further use
	}else {
		$loggedin = 'no';
	}
	if (!empty($_POST['username']) && !empty($_POST['password']) && checkloggedin($_POST['username'])=='yes'){
		echo ' <form name="login" action="" onsubmit="return false" method="post">
								<h2>'.$lang['Member+Login'];
		echo '<span class="errorinput"> - '.$lang['You+are+already+logged+in'].'</span><br />';
		echo $form;
		exit;
	}elseif (empty($_POST['username']) && empty($_POST['password']) && $loggedin=='yes') {
		include('includes/account.inc.php');	
	}  	
elseif (!empty($_POST['username']) && !empty($_POST['password'])) {
			$user = antiSQLi($_POST['username']);
			$pw = antiSQLi($_POST['password']);
			$ok = true;
			$sql = "SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE (login='$user') AND (pass='".pass_encode($pw)."')";
			if (!mysqli_query($GLOBALS['con'],$sql))
						  {
						  $ok = false;
						  }
						  else{
							  $check = mysqli_num_rows(mysqli_query($GLOBALS['con'],$sql));
								if ($check == 0) {
									$ok = false;
										}
						  }
			if ($ok == FALSE) {
						$errormsg = '<span class="errorinput"> - '.$lang['Invalid+Details'].'</span><br />';
						$showform = TRUE;
						} else { 
						$_SESSION['username'] = $user;
						$_SESSION['userid'] = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='{$_SESSION['username']}'"),0);
						$msg = chk_login_notify($_SESSION['userid']);
						if (strlen($msg)>1){
							$_SESSION['alertip'] = $msg;
						}
						//give login bonus if value enabled and larger than 0
						$lbonus = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `login_bonus` FROM `cws_settings`"),0);
						if ($lbonus>0){
							//get last login bonus date
							//last login bonus was given at this time:
							$last_login = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT last_lbonus FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0);
							$last_login = strtotime($last_login);
							//current time
							$current_time = strtotime(date('Y-m-d H:i:s'));
							$activity_diff = $current_time - $last_login;
							if ($activity_diff>86400){//if the difference between last bonus for login and current time is greater than 1 DAY, then give bonus
								credit_just_bonus('login_bonus',$_SESSION['userid'],'0',$lbonus,'10');
								mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `last_lbonus`=NOW() WHERE id='{$_SESSION['userid']}'");
								$_SESSION['lbonus_alert'] = 1;
							}
							
						}
						//give bonus from affiliate when the player registers for the first time
			if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT last_activity FROM cws_users WHERE id='{$_SESSION['userid']}'"),0)=='0000-00-00 00:00:00'){
				if (AFFILIATES==1){
					//if player has an affiliate ID
					if(@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT aff_id FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0)!==""){
								$aff_bonus = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT aff_bon FROM cws_affiliate_settings"),0);
								if ($aff_bonus>0){
									$aff_rollover = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT aff_rollover FROM cws_affiliate_settings"),0);
									credit_just_bonus('aff_bonus',$_SESSION['userid'],'0',$aff_bonus,$aff_rollover);
									$_SESSION['aff_alert'] = 1;
								}
							}
						}
						//if registration bonus > 0
						if(@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT reg_bonus FROM cws_settings"),0)>0){
							$_SESSION['rbonus_alert'] = 1;
						}
					}
						
						$sql = "SELECT `ip_reg` FROM `cws_users_info` WHERE (login='$user')";
						$_SESSION['regIP'] = mysqli_result(mysqli_query($GLOBALS['con'],$sql), 0);
						$lastIP = $_SERVER['REMOTE_ADDR'];
						$_SESSION['lastIP'] = $lastIP;
						mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `logged_in`='1',last_activity=NOW() WHERE `id`='{$_SESSION['userid']}'");
						mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `ip_last`='$lastIP' WHERE `id`='{$_SESSION['userid']}'");
						if (isset($_POST['rememberMe'])) {
								setcookie("username", $user, time()+3600*24); 
							} else {
								setcookie("username", '', time()+3600*24);
								} /* expire in 24 hours */
						include('includes/account.inc.php');
						}
		} else {
			if (!empty($_POST['username']) && empty($_POST['password'])) { $errormsg = '<span class="errorinput"> - '.$lang['Invalid+Details'].'</span><br />';}
			if (empty($_POST['username']) && !empty($_POST['password'])) { $errormsg = '<span class="errorinput"> - '.$lang['Invalid+Details'].'</span><br />';}
			$showform = TRUE;
		}

if ($showform == TRUE)	{	
			echo ' <form name="login" action="" onsubmit="return false" method="post">
							<h2>'.$lang['Member+Login'];
			if ($justout!==TRUE) {
				if (!empty($errormsg)) { 
					echo $errormsg;
					if (!isset($_SESSION['invlogins'])) {$_SESSION['invlogins']=0;}
					$_SESSION['invlogins']++; 
					if ($_SESSION['invlogins']==5) {
						$event_time = date('H:i:s');
						$event_length = 15;
						$timestamp = strtotime("$event_time");
						$etime = strtotime("+$event_length minutes", $timestamp);
						$banexpire = date('H:i:s', $etime);
						$_SESSION['banexpire'] = $banexpire;
					}
					}		
				}
			$justout = FALSE;
			echo $form;
			 }
}
?>