<?php
#developed by www.zcino
@session_start();
//mt_rand(); - enable this to generate a random number with each server action. This way the RNG will generate useless and usefull numbers, making RNG prevention impossible
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors','Off');
ini_set('session.bug_compat_42','off');
ini_set('session.bug_compat_warn','off');
if (!isset($_SESSION['language'])){$_SESSION['language'] = 'en';} // set english as default language
require_once('lang/'.$_SESSION['language'].'.php'); // load the language file
require_once('connection.inc.php'); // load the file that manages the MySQL Database Connection
require_once('functions.inc.php'); // load the functions
require_once('settings.inc.php'); // load the settings
require_once('bonusfc.inc.php'); // load the bonus functions
if (AFFILIATES==1){
	@require_once('affiliate_fc.inc.php'); //affiliate marketing system
	@require_once('affiliate_get.inc.php'); //affiliate marketing system
}
if (isset($_GET['reff']) && strlen($_GET['reff'])>0){
	$_SESSION['reff'] = antisqli($_GET['reff']);
}
if (MAINTENANCE=='1'){die('Website is undergoing some changes');}
//if domain name is zcino, then this is a demo, and all users will be automatically logged in and given 10000 credit;

$sitename = 'zCino';
$domain = str_replace('http://','',str_replace('www.','',$_SERVER['SERVER_NAME'])); // get domain name
$adminemail = 'admin@'.$domain;


if (FB_LOGIN=='1'){
	if (isset($_REQUEST['signed_request'])){
		$_SESSION['signed_request'] = 1;
	}
	require_once(BASE_PATH.'/includes/fb-sdk/fb-auto-auth.php');
}
if (@file_exists($_SERVER['DOCUMENT_ROOT'].'/includes/j-auto-login.inc.php')){
	include('j-auto-login.inc.php');
}

$checkLoggedin = (isset($_SESSION['username']))?checkloggedin($_SESSION['username']):'no';//check if the user is logged in
//check login status and sync user session with database
if ($checkLoggedin=='yes'){
	if (!stristr($_SERVER['REQUEST_URI'],'launch_game') && !stristr($_SERVER['REQUEST_URI'],'choose_type')){
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `last_activity`=NOW() WHERE `id`='{$_SESSION['userid']}'");
	}
}else{
	if (isset($_SESSION['username']) && !empty($_SESSION['username'])){
		$last_ip = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT ip_last FROM cws_users_info WHERE id={$_SESSION['userid']}"),0);
		if ($_SERVER['REMOTE_ADDR']==$last_ip){ // if the last ip is equal to this IP, then the user can stay
			mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `last_activity`=NOW() WHERE `id`='{$_SESSION['userid']}'");
		}else{
			echo '<script type="text/javascript">alert(\''.$_SESSION['username'].', '.$lang['your+session+has+been+terminated+due+to+long+inactivity'].'!\')</script>';
			mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET logged_in='0' WHERE id='{$_SESSION['userid']}'");
			$_SESSION['username'] = '';
			$_SESSION['logged_out'] = 1;
			$_SESSION['showed_popup'] = 1;
			unset($_SESSION['username']);
			unset($_SESSION['userid']);
			session_destroy();
			@session_start();
			echo '
			<script type="text/javascript" src="jscript/jquery.js"></script>
			<script type="text/javascript">$.get("'.get_protocol().$_SERVER['SERVER_NAME'].'/do_logout.php",{logout:1}, function() {window.location="'.get_protocol().$_SERVER['SERVER_NAME'].'"});</script>'; 
			die();
		}
	}
	$l = 'guestlogin';
}

$allowFunMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowfunplay FROM cws_settings"),0); // check if FUN mode is enabled
$vipMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT vipmode FROM cws_settings"),0); // check if VIP mode is enabled
$_SESSION['currency'] = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `symbol` FROM `cws_currencies` WHERE `current`='1'"),0); // retrieve symbol
if ($_SESSION['currency']==""){$_SESSION['currency']='&euro';} // store the currency the whole visiting session

if ($allowFunMode=='1' && $_SESSION['credit']==0){$_SESSION['credit'] = 5000;}

foreach ($_POST as $key => $value) {
    $_POST[$key] = antisqli(validateInput(trim($value))); // validate all data that can be sent by users input
	//$$key = addslashes(trim($value));
  }
foreach ($_GET as $key => $value) {
    $_GET[$key] = antisqli(validateInput($value)); // validate all data that can be sent by users input
	//$$key = addslashes(trim($value));
  }
?>