<?php
#developed by www.zcino
@session_start();
set_time_limit(30); 
ini_set('session.bug_compat_42','off');
ini_set('session.bug_compat_warn','off');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/connection.inc.php'); // load the file that manages the MySQL Database Connection
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.inc.php'); // load the functions
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/settings.inc.php'); // load the settings
@require_once($_SERVER['DOCUMENT_ROOT'].'/includes/bonusfc.inc.php'); // load the bonus functions
if (MAINTENANCE=='1'){die('Website is undergoing some changes');}
//security check to see where from the requests are coming
$safe_senders = array($_SERVER['HTTP_HOST']);
if (!defined("CJ")){
	if (isset($_SERVER['HTTP_REFERER'])) { // if we have REFERER data and server name is not zcino
		$ref = str_replace('http://','',$_SERVER['HTTP_REFERER']);
		$ref = str_replace('https://','',$ref);
		$referer = explode('/',$ref);
		if (!in_array($referer[0],$safe_senders)) { // if the referer web domain is not in the safe senders list
			die ('errormsg=Game inactive');
		}
	}else{
			die ('errormsg=Game inactive');
	}
}



//check if user is logged in
$nrsh = 1; //number of shuffles
$checkLoggedin = (isset($_SESSION['username']))?checkloggedin($_SESSION['username']):'no';//check if the user is logged in
if ($checkLoggedin=='yes'){
	//get number of shuffles requested by the player
	if (!isset($_SESSION['client_seed'])){
		$_SESSION['client_seed'] = mt_rand(0,999999999);
	}
	if (mysqli_query($GLOBALS['con'],"SELECT `nrsh` FROM `cws_users_info` WHERE id='{$_SESSION['userid']}'")){
		$nrsh = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `nrsh` FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0); //number of shuffles
	}else{
		$nrsh = 1; //number of shuffles	
	}
	if (!isset($nrsh) || $nrsh=="" || !is_numeric($nrsh) || $nrsh<1){$nrsh = 1;}
	//update user last activity
	mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `last_activity`=NOW() WHERE `login`='{$_SESSION['username']}'");
}else {
	if (isset($_SESSION['username'])){
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET logged_in='0' WHERE id='{$_SESSION['userid']}'");
		$_SESSION['username'] = '';
		$_SESSION['logged_out'] = 1;
		unset($_SESSION['username']);
		unset($_SESSION['userid']);
		session_destroy();
		@session_start();
	}
	$l = 'guestlogin';
}

$tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT allowent,allowrealplay,allowfunplay,global_mode,vipmode FROM cws_settings"));
$skill_games = $tmp['allowent'];
$allowrealplay = $tmp['allowrealplay'];
$allowFunMode = $tmp['allowfunplay'];
$global_mode = $tmp['global_mode'];
$vipMode = $tmp['vipmode'];
if (LOGIN_PAGE==1 && !isset($_SESSION['username'])){
	$allowFunMode = 0;
	$allowrealplay = 0;
}
//get gameid
if (!defined("CJ")){
		if (!isset($_SERVER['DOCUMENT_URI'])){
			$gamePath = antisqli($_SERVER['REQUEST_URI']);
		}else{
			$gamePath = antisqli($_SERVER['DOCUMENT_URI']);
		}
		$req = explode('?',$gamePath);
		$gamePath = str_replace('?'.$req[1],'',$gamePath);
		$gPath = str_replace('game_init.php','',str_replace('game3.php','',str_replace('false','',str_replace('printTicket.php','',str_replace('getTickets.php','',str_replace('getResults.php','',str_replace('getlasted.php','',str_replace('game2.php','',str_replace('update.php','',str_replace('getData.php','',str_replace('game.php','',str_replace('game_multi.php','',ltrim(str_replace('?test=1','',$gamePath),'/'))))))))))))); 
		$checkPath = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_games WHERE '".antisqli($gPath)."' LIKE `base_directory`"),0);//see if we have a game in DB with this location
		if ($checkPath!==""){
			$check = mysqli_query($GLOBALS['con'],"SELECT `status` FROM `cws_games` WHERE `id`='".antisqli($checkPath)."' AND status='1'");
			if (mysqli_num_rows($check)>0){
				$gameid = antisqli($checkPath);	
				//echo 'gid='.$checkPath.'&';
			}elseif(!isset($gameid)){
				die('&credit=0&errormsg=Game unavailable');
			}	
		}else{
			$gameid = $_SESSION['game'];
		}
	$gameMode = $_SESSION['gameMode'][$gameid];		
	if (!isset($gameid)){
		error_log("ALERT: Unknown game id:".$gamePath, 0);
		}
	
	//end get gameid
	//initialise game mode
	if (!isset($gameMode) || $gameMode=="" || empty($gameMode) || !isset($_SESSION['username'])){
		$gameMode = 'fun';
	}
	if ($gameMode!=='real'){
		$gameMode = 'fun';	
	}
	//
	if ($gameMode=='real' && $allowrealplay!=='1'){
		die('&credit=0&exitUrl=http://'.urlencode($_SERVER['SERVER_NAME']).'&errormsg=Real play disabled');
	}
	if ($gameMode=='fun' && $allowFunMode!=='1'){
		die('&credit=0&exitUrl=http://'.urlencode($_SERVER['SERVER_NAME']).'&errormsg=Fun play disabled');
	}
	if(!isset($_SESSION['credit'])){
		if ($allowFunMode!=='1'){
			$_SESSION['credit'] = 0;
		}else{
			$_SESSION['credit'] = 5000;
		}
	}
	//if username is not set, we have fun mode
	//if we have fun mode and game id is not 998/1016/1017
	if((!isset($_SESSION['username']) || $gameMode=='fun') && !($gameid=='998' || $gameid=='1016' || $gameid=='1017')){ //998/1016 = MULTIPLAYER
		$l='guestlogin';
		if ($allowFunMode!=='1'){
			$_SESSION['credit'] = 0;
		}
		if ($gameid=='998' || $gameid=='1016' || $gameid=='1017'){
			$credit = 0;
		}else{
			$credit = $_SESSION['credit'];
		}
	}elseif(isset($_SESSION['username'])) {
		$credit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(cash,0) FROM `cws_users` WHERE `login`='{$_SESSION['username']}' AND status='1'"),0);
	}else{
		$credit = 0;
	}
	if ($credit < 0){
		$credit=0;
		}
	if ($gameMode=='fun' && $allowFunMode=='0'){
		$gameMode = 'real';
	}	
	$win = 0;
	// Get jackpot from DB
	if (mysqli_query($GLOBALS['con'],"SELECT `jackpot` FROM `cws_games` WHERE `id`='{$gameid}'")){
		$jq = mysqli_query($GLOBALS['con'],"SELECT `jackpot` FROM `cws_games` WHERE `id`='{$gameid}'");
		$jackpot = @mysqli_result($jq,0); // store jackpot
	}
	if ($jackpot==""){
		$jackpot = 0;
	}
	$jackpot = nrformat($jackpot,2); // show jackpot in number format with 2 decimals
}


//
foreach ($_GET as $key => $value) {
    $_GET[$key] = antisqli(validateInput($value)); // validate all data that can be sent by users input
	//$$key = addslashes(trim($value));
  }
foreach ($_POST as $key => $value) {
	$_POST[$key] = antisqli(validateInput(trim($value))); // validate all data that can be sent by users input
	$reserved_kw = array('GLOBALS','_SERVER','_GET','_POST','_FILES','_REQUEST','_SESSION','_ENV','_COOKIE','php_errormsg','HTTP_RAW_POST_DATA','http_response_header','argc','argv','jackpot','gameMode','credit','allowFunMode','allowrealplay','safe_senders','auto_reg','win','gameid','userid','G_M_T','l','jq','global_mode','vipMode');
	if ($key[0]!=='_' && preg_match('/^[\w|\-]+$/', $key)=='1' && !in_array($key,$reserved_kw)) {
  		$$key = $_POST[$key];
	}// if variable name is not longer than 15 chars and if variable name doesnt start with _
  }
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/gamesfc.inc.php');
?>