<?php
@session_start();
define("PERMISSIONS",'1');
ini_set('display_errors','On');
error_reporting(E_ERROR | E_WARNING | E_PARSE);
$stafftype = $_SESSION['adminlvl'];
//error_reporting('E_COMPILE_ERROR');
//security check to see where from the requests are coming
if (isset($_SERVER['HTTP_REFERER'])) { // if we have REFERER data and server name is not zcino
	$ref = str_replace('http://','',$_SERVER['HTTP_REFERER']);
	$referer = explode('/',$ref);
	if ($referer[0] !== $_SERVER['HTTP_HOST']) { 
		header('Location: http://'.$_SERVER['SERVER_NAME']);
		echo '<script type="text/javascript">window.location = \'http://'.$_SERVER['SERVER_NAME'].'/administrator/index.php\'</script>';
	}
}
if (isset($_SERVER['REDIRECT_URL'])) {
	header('Location: http://'.$_SERVER['SERVER_NAME']);
	echo '<script type="text/javascript">window.location = \'http://'.$_SERVER['SERVER_NAME'].'/administrator/index.php\'</script>';
	exit;
}
$demoMode = 0;
$casinoOn=1;
$SicBoOn=0;
$rouletteAm=0;
$rouletteEu=0;
$texasOn=0; // change this only if you own TEXAS HOLD'EM software from zcino
$bingoOn=0; // change this only if you own BINGO software from zcino
$dogRacesOn=0; // change this only if you own REAL DOG RACES software from zcino
$RacesOn=0; // change this only if you own 3D RACE software from zcino
	
if (stristr($_SERVER['DOCUMENT_ROOT'],'xampp')) {
	$webroot = $_SERVER['DOCUMENT_ROOT'].'/casino work/_casinov3ultimate/';
	}
else {
	$webroot = $_SERVER['DOCUMENT_ROOT'];
}
if ($_SESSION['adminlvl']=='admin'){$admin='master';}else{$admin='operator';}
if (!isset($_SESSION['adminlanguage'])){
	$_SESSION['adminlanguage'] = 'en';
}
require_once($webroot.'/includes/connection.inc.php');
require_once($webroot.'/includes/common_fc.inc.php');
require_once($webroot.'/includes/bonusfc.inc.php');
require_once($webroot.'/includes/settings.inc.php');
if (AFFILIATES==1){
	require_once($webroot.'/includes/affiliate_fc.inc.php');
}
if (!isset($_SESSION['delimiter'])){
	$q = mysqli_query($GLOBALS['con'],"SELECT thousand_sep FROM cws_settings") or die(mysqli_error($GLOBALS['con']));
	$_SESSION['delimiter'] = mysqli_result($q,0);
}
if (!isset($_SESSION['currency'])){
	$_SESSION['currency'] = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `symbol` FROM `cws_currencies` WHERE `current`='1'"),0);
} 
require_once('lang/'.$_SESSION['adminlanguage'].'.php');
$chkd = array();
$chkdList = array();
require_once($webroot.'/administrator/includes/functions.inc.php');
if (!isset($_SESSION['admin'])) {
	echo '<script type="text/javascript">window.location = \'http://'.$_SERVER['SERVER_NAME'].'/administrator/index.php\'</script>';
	exit;
}else{
	if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0)!=='1'){
			session_destroy();
			echo '<script type="text/javascript">alert(\'Staff '.$_SESSION['admin'].', your session has been terminated\')</script>';	
			echo '<script type="text/javascript">window.location = \'http://'.$_SERVER['SERVER_NAME'].'/administrator/index.php\'</script>';	
		}
}
if (isset($_POST['search'])){
	$_POST['search'] = antisqli($_POST['search']);
}
?>