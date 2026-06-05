<?php
@session_start();
require_once('connection.inc.php');
require_once('functions.inc.php');
require_once('settings.inc.php');
$gameid = $_POST['gameid'];
$gameMode = $_SESSION['gameMode'][$gameid];
$checkLoggedin = (isset($_SESSION['username']))?checkloggedin($_SESSION['username']):'no';//check if the user is logged in
if ($checkLoggedin=='yes'){
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `last_activity`=NOW() WHERE `login`='{$_SESSION['username']}'");
}else{
	if ((isset($_SESSION['username']) && !empty($_SESSION['username'])) || $gameMode=='real'){
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET logged_in='0' WHERE id='{$_SESSION['userid']}'");
		$_SESSION['username'] = '';
		$_SESSION['logged_out'] = 1;
		unset($_SESSION['username']);
		unset($_SESSION['userid']);
		session_destroy();
		@session_start();
		$_SESSION['logged_out'] = 1;
		$_SESSION['showed_popup'] = 1;
		echo '
		<script type="text/javascript" src="jscript/jquery.js"></script>
		<script type="text/javascript">$.get("'.get_protocol().$_SERVER['SERVER_NAME'].'/do_logout.php",{logout:1}, function() {});</script>'; 
		if ($gameMode=='real'){
			echo '&exit=2';
			die();	
		}
	}
	$l = 'guestlogin';
}

if (strlen($gameid)>5 || !is_numeric($gameid)){
	die('&exit=1');	
}
$_SESSION['last_activity'][$gameid] = date('Y-m-d H:i:s');
//

if (!isset($gameMode) || $gameMode=="" || empty($gameMode) || !isset($_SESSION['username'])){
	$gameMode = 'fun';
}
if ($gameMode!=='real'){
	$gameMode = 'fun';	
}
//
$tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings"));
$allowrealplay = $tmp['allowrealplay'];
$allowFunMode = $tmp['allowfunplay'];
//
if ($gameMode=='real' && $allowrealplay!=='1'){
	die('&exit=1');
}
if ($gameMode=='fun' && $allowFunMode!=='1'){
	die('&exit=1');
}

if (REDIRECT_NO_CREDIT=='1' && $gameMode=='real'){
	if (isset($_SESSION['username'])){
		$credit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(cash,0) FROM `cws_users` WHERE `login`='{$_SESSION['username']}' AND status='1'"),0);	
		if ($credit<0.01){
		//if player has no credit
			if (!isset($_SESSION['count_noCredit'])){//if we did not initiate the counter, which counts for how long the player had no credit
				$_SESSION['count_noCredit'] = 0;
			}
			$_SESSION['count_noCredit']++;//increase the counter, which counts for how long the player had no credit
			if ($_SESSION['count_noCredit']>=10){ // if the player has no credit for 2 minutes
				die('&exit=2'); // if the player has 0 credit, redirect him to main page	
			}
		}else{
			$_SESSION['count_noCredit'] = 0;
		}
	}
}

echo '&ok='.$_POST['gameid'];
echo '&mode='.$gameMode;
?>