<?php
@session_start();
define('BASE_PATH',$_SERVER['DOCUMENT_ROOT']);
require_once(BASE_PATH.'/includes/fb-sdk/facebook.php');
require_once(BASE_PATH.'/includes/functions.inc.php');
require_once(BASE_PATH.'/includes/fb-sdk/fb-data.php');

// Get User ID
$user = $facebook->getUser();

// We may or may not have this data based on whether the user is logged in.
//
// If we have a $user id here, it means we know the user is logged into
// Facebook, but we don't know if the access token is valid. An access
// token is invalid if the user logged out of Facebook.

if ($user) {
  try {
    // Proceed knowing you have a logged in user who's authenticated.
    $user_profile = $facebook->api('/me');
  } catch (FacebookApiException $e) {
    error_log($e);
    $user = null;
  }
}

// Login or logout url will be needed depending on current user state.
if ($user) {
  $logoutUrl = $facebook->getLogoutUrl();
} else {
  $loginUrl = $facebook->getLoginUrl();
}

// This call will always work since we are fetching public data.
$naitik = $facebook->api('/naitik');

if ($user) {
	if (isset($_SESSION['username']) && !empty($_SESSION['username'])){
		//do nothing
	}else{
		require_once(BASE_PATH.'/includes/connection.inc.php');
		//if user id exists in database, then automatically log in the user
		$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users_info INNER JOIN cws_users ON cws_users.id=cws_users_info.id WHERE `fb_login`='{$user_profile['id']}'") or die('1_'.mysqli_error($GLOBALS['con']));
		
		if (mysqli_num_rows($q)>0){
			if (mysqli_result($q,0,'status')!=='1'){
				echo '<script type="text/javascript">alert(\'Account banned\')</script>';	
			}else{
				$_SESSION['username'] = mysqli_result($q,0,'login');	
				$_SESSION['userid'] = mysqli_result($q,0,'id');
				$msg = chk_login_notify($_SESSION['userid']);
				if (strlen($msg)>1){
					$_SESSION['alertip'] = $msg;
				}
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
				
				$fbuid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users_info WHERE `fb_login`='{$user_profile['id']}'"),0);
				@mysqli_query($GLOBALS['con'],"UPDATE cws_users SET logged_in='1',last_activity=NOW() WHERE `id`='{$fbuid}'") or die(mysqli_error('2_'.$GLOBALS['con']));		
				echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
			}
		}else{//if user id is NOT in our database, then register and log in
			if (strlen($user_profile['username'])<2){ // if player does not have an username get it from his email
				$uem = explode('@',$user_profile['email']);
				$user_profile['username'] = $uem[0];
			}
			$user_profile['username'] = str_replace('.','',$user_profile['username']);
			if (strlen($user_profile['email'])==0){
				$user_profile['email'] = $user_profile['username'].'@facebook.com';	
			}
			$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE `login`='{$user_profile['username']}'") or die('3_'.mysqli_error($GLOBALS['con']));
			if (@mysqli_num_rows($q)>0){ // if someone already took this username, then add a _fb at the end of it
				$user_profile['username'] .= '_fb';
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='{$user_profile['username']}'"))>0){
				echo '<script type="text/javascript">alert(\'Username "'.$user_profile['username'].'" already taken\')</script>';
				echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
				require_once(BASE_PATH.'/includes/fb-sdk/fb-logout.php');
				exit;
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users_info WHERE email='{$user_profile['email']}'"))>0 || strlen($user_profile['email'])==0){
				echo '<script type="text/javascript">alert(\'Email "'.$user_profile['email'].'" is already used with another account\')</script>';
				echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
				require_once(BASE_PATH.'/includes/fb-sdk/fb-logout.php');
				exit;
			}
			if (!isset($_SESSION['reff'])){
					 $_SESSION['reff'] = 'admin';
			 }
			 if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE id='{$_SESSION['reff']}'"))==0){ // if referrer doesnt exist
				$_SESSION['reff'] = 'admin';
			 }
			 $aff_id = '';
			 if (AFFILIATES==1 && !has_duplicate_ip($_SERVER['REMOTE_ADDR'])){
					 //check affiliate id
					 include(BASE_PATH.'/includes/affiliate_chk.inc.php');
					 //end check affiliate id
			 }
			$gender = ucfirst($user_profile['gender']);
			$rbonus = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `reg_bonus` FROM `cws_settings`"),0);
			if ($rbonus==""){$rbonus = 0;}			
			
			
			
			$sql = mysqli_query($GLOBALS['con'],"INSERT INTO cws_users (login,cash,status,owner) VALUES ('{$user_profile['username']}','0','1','{$_SESSION['reff']}')") or die('4_'.mysqli_error($GLOBALS['con']));
			$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$user_profile['username']}'"),0);
			$msg = chk_login_notify($userid);
			if (strlen($msg)>1){
				$_SESSION['alertip'] = $msg;
			}
			
			$sql = mysqli_query($GLOBALS['con'],"INSERT INTO `cws_users_info` (id,pass,email,name,gender,dob,fb_login,aff_id) VALUES ('{$userid}','".md5($user_profile['id'])."','{$user_profile['email']}','{$user_profile['first_name']} {$user_profile['last_name']}','".$gender[0]."','{$user_profile['birthday']}','{$user_profile['id']}','{$aff_id}')") or die(mysqli_error($GLOBALS['con']));
			credit_just_bonus('reg_bonus',$userid,'0',$rbonus,'10');
			
			mysqli_query($GLOBALS['con'],"UPDATE cws_users SET logged_in='1',last_activity=NOW() WHERE `id`='{$userid}'") or die('5_'.mysqli_error($GLOBALS['con']));	
			$_SESSION['username'] = mysqli_result($q,0,'login');
			$_SESSION['userid'] = mysqli_result($q,0,'id');
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
				}
			}
						
			echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
		}
	}
}else{
	//echo 'FB login not detected';
}

//what happens if user logged out and wants to log in
?>