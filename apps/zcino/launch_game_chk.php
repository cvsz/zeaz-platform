<?php
include ("includes/config.inc.php");
if ($_GET['mode']!=='real'){$_GET['mode'] = 'fun';}
if (!isset($_GET['game']) && !isset($_GET['id'])){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['Invalid+game'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}else{
	if (isset($_GET['id'])){
		$_SESSION['game'] = antisqli($_GET['id']);
	}else{
		$_SESSION['game'] = antisqli($_GET['game']);
	}
}
$gameid = antisqli($_SESSION['game']);
$gameid = str_replace('game-', '', $gameid);
$_SESSION['game'] = $gameid; // Update session with numeric ID
if (strlen($gameid)>5 || !is_numeric($gameid)){
	die('Error');	
}
//if ($gameid<=863 && $gameid>=856){
//	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white;font-size:20px">Game currently unavailable. Please check later</span></div>');
//}
$_SESSION['mode'] = antisqli($_GET['mode']);
$gameMode = $_SESSION['mode'];
if (!isset($gameMode)){$gameMode = 'fun';}
$query = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE id='$gameid'") or die(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($query)==0){
	// Fallback to game 11019 for Next.js mock data
	$gameid = 11019;
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE id='$gameid'") or die(mysqli_error($GLOBALS['con']));
}
$_SESSION['count_noCredit'] = 0;
$gamedet = mysqli_fetch_array($query); 
$tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings"));
$skill_games = $tmp['allowent'];
$allowrealplay = $tmp['allowrealplay'];
$allowFunMode = $tmp['allowfunplay'];
if (!isset($_SESSION['username']) || empty($_SESSION['username'])) {//if the player did not log in
	if ($allowFunMode!=='1'){
		die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white"><span style="color:white">'.$lang['This+game+can+only+be+played+in+REAL+CREDITS+mode'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');		
	}else{
		$gameMode = 'fun';
	}
}
if($gamedet['game_type']=='skill' && $skill_games!=='1'){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white"><span style="color:white">'.$lang['Skill+games+disabled'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');		
}
$allowFunMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowfunplay FROM cws_settings"),0);
if ($gameMode=='fun' && $allowFunMode=='0' && !isset($_SESSION['username'])){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['This+game+can+only+be+played+in+REAL+CREDITS+mode'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}
if ($gameMode=='real' && $allowrealplay!=='1'){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['Real+play+disabled'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}
if ($allowFunMode!=='1' && $allowrealplay!=='1'){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['No+play+mode+available'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}
if ($gameMode=='fun' && $allowFunMode=='0' && $allowrealplay=='1'){
	$gameMode = 'real';
}

$real_mode_only = array('998','1001','1016','1017');//MULTIPLAYER BINGO (1001) and MULTIPLAYER CAR RACE(998) can be played only in REAL MODE
if (in_array($game,$real_mode_only) && $gameMode=='fun'){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['This+game+can+only+be+played+in+REAL+CREDITS+mode'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}
$game_status=$gamedet["status"];
$gameid=$gamedet["id"];
$game_name=$gamedet["name"];
$tmp = explode('/',$gamedet['location']);
$game_location='http://'.$_SERVER['SERVER_NAME'].'/'.$gamedet["location"];
$game_basedir='http://'.$_SERVER['SERVER_NAME'].'/'.$tmp[0].'/'.$tmp[1].'/'.$tmp[2].'/';
if ($game_status!=='1'){
	die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">'.$lang['Game+not+Available'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span></div>');
}

$mg = 0; // enable/disable MULTI-TAB gaming ... if this is 1, then the player cannot open multiple games at the same time
if (stristr($_SERVER['REQUEST_URI'],'launch_game') && $mg==1){
	$firstTime=strtotime($_SESSION['last_activity'][$gameid]);
	$lastTime=strtotime(date('Y-m-d H:i:s'));
	
	// perform subtraction to get the difference (in seconds) between times
	$activity_diff=$lastTime-$firstTime;

	if ($activity_diff<16){ //if last activity was 15 seconds ago or less , then it means the player has another game open
		die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">Error #232 - '.$lang['You+are+not+allowed+to+open+multiple+games+at+the+same+time'].'. '.$lang['Please+close+the+other+game+you+have+opened+and+wait'].' <b>'.(15-$activity_diff).'</b> '.$lang['seconds+and+then+refresh+this+page'].'</span></div>');	
	}
}

//make sure that the user cannot open same game multiple times in same tab
if (stristr($_SERVER['REQUEST_URI'],'launch_game') || stristr($_SERVER['REQUEST_URI'],'launch_game')){
	$firstTime=strtotime($_SESSION['last_activity'][$gameid]); // last activity
	$lastTime=strtotime(date('Y-m-d H:i:s'));//current time
	$activity_diff = $lastTime-$firstTime;
	if ($activity_diff<16){ //if last activity was 15 seconds ago or less , then it means the player has another game open
		die('<div style="background-color:#000;padding:50px;text-align:center"><span style="color:white">Error #233 - '.$lang['You+already+opened+this+game+in+other+page'].'. '.$lang['Please+close+it+and+then+wait'].' <b>'.(15-$activity_diff).'</b> '.$lang['seconds+and+then+refresh+this+page'].'</span></div>');	
	}
}
$_SESSION['gameMode'][$gameid] = $_SESSION['mode'];//for each game that the user opened, store if the game is opened for REAL or for FUN; !!!ar trebui, for each TOKEN that the user opened, iar fiecare joc deschis sa aiba tokenul lui
?>