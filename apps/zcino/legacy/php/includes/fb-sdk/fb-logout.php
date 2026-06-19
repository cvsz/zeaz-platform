<?php
@session_start();
if (!defined('BASE_PATH')){
	define('BASE_PATH',$_SERVER['DOCUMENT_ROOT']);
}
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

//remove application permissions if logged player clicked Log-out
if ($user) {
	$facebook->api('/me/permissions', 'DELETE');
}
require_once(BASE_PATH.'/includes/connection.inc.php');
mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `logged_in`='0' WHERE `id`='{$_SESSION['userid']}'") or die(mysqli_error($GLOBALS['con']));
unset($_SESSION['lastIP']); 
unset($_SESSION['regIP']);
unset($_SESSION['username']);
unset($_SESSION['userid']);    
unset($_SESSION['affiliateid']);
foreach($_SESSION as $key=>$var){
	unset($_SESSION[$key]);
}
$t = $_SESSION['desktop'];
$_SESSION['desktop'] = $t;
$_SESSION['showed_popup'] = 1;
$justout = TRUE;
$_SESSION['logged_out'] = 1;
$auto_reg = 0;
if ($air==1){}else{
	if ($_GET['logout']==1){
			echo $lang['Your+session+has+been+terminated+due+to+long+inactivity'];
		}else{
			require_once(BASE_PATH.'/do_login.php');
		}
	echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
}
?>