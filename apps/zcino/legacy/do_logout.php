<?php
@session_start();
@require_once('includes/settings.inc.php');
if (FB_LOGIN=='1'){
	include(BASE_PATH.'/includes/fb-sdk/fb-logout.php');
}else{
	require_once(BASE_PATH.'/includes/connection.inc.php');
	require_once(BASE_PATH.'/includes/functions.inc.php');
	mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `logged_in`='0' WHERE `id`='{$_SESSION['userid']}'") or die(mysqli_error($GLOBALS['con']));
	unset($_SESSION['lastIP']); 
	unset($_SESSION['regIP']);
	unset($_SESSION['username']);  
	unset($_SESSION['userid']);  
	unset($_SESSION['affiliateid']);
	$t = $_SESSION['desktop'];
	@session_destroy(); 
	@session_start();
	$_SESSION['desktop'] = $t;
	$_SESSION['showed_popup'] = 1;
	$justout = TRUE;
	$_SESSION['logged_out'] = 1;
	if ($_GET['logout']==1){
		echo $lang['Your+gaming+session+has+been+terminated+due+to+long+inactivity'];
	}else{
		require_once(BASE_PATH.'/do_login.php');
	}
	echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
}
?>