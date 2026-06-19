<?php
@session_start();

require_once('includes/connection.inc.php'); // load the file that manages the MySQL Database Connection
require_once('includes/functions.inc.php'); // load the file that manages the MySQL Database Connection
include('includes/settings.inc.php');
if (LOGIN_PAGE=='1' && !isset($_SESSION['username'])){
	include('login_page/login_splash.php');
	exit;
}else{
	include('main.php');
}
$allowFunMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowfunplay FROM cws_settings"),0);
if (isset($_GET['desktop']) || $_SESSION['desktop']==1){
	$_SESSION['desktop']=1;
	if ($allowFunMode==1 || $allowFunMode=='1'){
		include('main.php');
	}else{
		include('login_page/login_splash.php');
	}
}else{
	require_once('includes/connection.inc.php');
	$t ='';
	$q = @mysqli_query($GLOBALS['con'],"SELECT id FROM cws_templates WHERE selected='1'") or die(mysqli_error($GLOBALS['con']));
	if ($q){
		if (mysqli_num_rows($q)>0){
			$t = @mysqli_result($q,0);

		}else{
			$t='1';
		}
	}else{
		$t='1';
	}
	include('template_files'.$t.'/template'.$t.'.php');
	exit;
}
?>