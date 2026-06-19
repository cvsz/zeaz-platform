<?php
require_once('includes/config.inc.php');
$showform = FALSE;
$currtime = date('H:i:s');

$form = '<div id="formlogin_container">
    <form name="login" action="" onsubmit="return false" method="post" id="form_direct" style="margin-top:10px">

            <ul class="ulusuario">
                <li id="user">
                    <label for="modlgn-username" style="opacity: 1;"></label>
                    <input type="text" value="'.$cookieuser.'" maxlength="52" size="18" class="inputbox active" name="username" id="modlgn-username">
                </li>
                <li id="pass">
                    <label for="modlgn-passwd" style="opacity: 1;"></label>
                    <input type="password" maxlength="52" size="18" class="inputbox" name="password" id="modlgn-passwd">
                </li>
                <li id="ok">
					<input type="submit" value="'.$lang['Log+In'].'" id="loginbutton" name="Submit" onclick="logMein();">
				</li>
            </ul>
<br /><br />
<div style="vertical-align:top;margin-top:20px;text-align:left">
<a class="popup linkbutton button" rel="cws_popup" style="color:grey" href="show_reg.php"><img src="images/register.png" style="float:left;vertical-align:middle;padding-right:30px;padding-top:1px" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<div id="fb_login_id"></div>';
if (FB_LOGIN=='1'){ $form .= '
<script type="text/javascript">
	$.post("./includes/fb-sdk/fb-login.php", { load: 1 }, function(welcome) { $("#fb_login_id").html(welcome); } );
</script>
<br />
<div style="width:420px;margin-top:20px"><a class="popup linkbutton button" rel="cws_popup" style="color:grey" href="show_forgot_pw.php">Forgot your password?</a></div>
';

}
$form .= '</div>
    </form>
</div>
';
if (strtotime($currtime)<strtotime($_SESSION['banexpire'])) {
		$xmins = round((strtotime($_SESSION['banexpire'])-strtotime($currtime))/60);
	echo ' <form name="login" action="" onsubmit="return false" method="post">
							';
	echo '<span class="errorinput">'.$lang['Account+banned'].' - '.$lang['Available+in'].' '.$xmins.'min</span><br />';
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
								';
		echo '<span class="errorinput">'.$lang['You+are+already+logged+in'].'</span><br />';
		echo $form;
		exit;
	}elseif (empty($_POST['username']) && empty($_POST['password']) && $loggedin=='yes') {
		include('includes/account.inc.php');	
	}  	
elseif (!empty($_POST['username']) && !empty($_POST['password'])) {
			$user = antisqli($_POST['username']);
			$pass = antisqli($_POST['password']);
			$ok = true;
			$sql = "SELECT * FROM `cws_users` INNER JOIN `cws_users_info` ON `cws_users`.id=`cws_users_info`.id WHERE (login='$user') AND (pass='".pass_encode($pass)."')";
			if (!mysqli_query($GLOBALS['con'],$sql)){
						  	$ok = false;
							$errormsg = '<span class="errorinput"> '.$lang['Invalid+Details'].'_1</span><br />';
							$showform = TRUE;
						  }else{
							    $check = mysqli_num_rows(mysqli_query($GLOBALS['con'],$sql));
								if ($check == 0){
									$ok = false;
									$errormsg = '<span class="errorinput"> '.$lang['Invalid+Details'].'_2</span><br />';
									$showform = TRUE;
								}
			}
			$qqq = mysqli_query($GLOBALS['con'],$sql) or die(mysqli_error($GLOBALS['con']));
			if ($ok!==false){
				if (mysqli_result($qqq,0,'status')!=='1'){
					$ok = false;
				}
			}
			if ($ok!== false && !isset($errormsg)) {
						if (mysqli_result($qqq,0,'status')!=='1'){
							$errormsg = '<span class="errorinput">'.$lang['Account+inactive'].'</span><br />';
							$ok = false;
							$showform = TRUE;
						}
			}
			if($ok!==false) { 
						$_SESSION['username'] = $user;
						$userid = mysqli_result($qqq,0,'id');
						$msg = chk_login_notify($userid);
						if (strlen($msg)>1){
							$_SESSION['alertip'] = $msg;
						}
						$_SESSION['userid'] = $userid;
						$sql = mysqli_query($GLOBALS['con'],"SELECT `ip_reg` FROM `cws_users_info` WHERE (id='{$_SESSION['userid']}')") or die(mysqli_error($GLOBALS['con']));
						
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
						
						$_SESSION['regIP'] = mysqli_result($sql,0);
						$lastIP = $_SERVER['REMOTE_ADDR'];
						$_SESSION['lastIP'] = $lastIP;
						mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `ip_last`='$lastIP' WHERE `id`='{$_SESSION['userid']}'");
						mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `logged_in`='1',last_activity=NOW() WHERE `id`='{$_SESSION['userid']}'");
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