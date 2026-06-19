<?php
@session_start();
if (isset($_GET['desktop'])){
	$_SESSION['desktop']=1;
}	
require_once('includes/connection.inc.php');
	
$allowguest = '1';
if ($allowguest!=='1' && !isset($_SESSION['username']) ){
	include('login_page/login_splash.php');
	exit;
}
$t ='';
	
$q = mysqli_query($GLOBALS['con'],"SELECT id FROM cws_templates WHERE selected='1'") or die(mysqli_error($GLOBALS['con']));

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
?>