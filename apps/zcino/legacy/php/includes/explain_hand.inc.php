<html>
<head>
<style type="text/css">
body{
	color:#000;
}
.zClass{
	color:red;
	font-size:11px;
}
.pClass{
	color:#093;
	font-size:14px;
}
</style>
</head>
<body>
<div style="color:#000;min-width:400px">
<?php
require_once('config.inc.php');
$gid = antisqli($_GET['gid']);
$usr = $_SESSION['username'];
if (!isset($_SESSION['username'])){
	echo $lang['You+must+be+logged+in+to+access+this+page'];
	exit;
}
	
if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_gameplays WHERE user='$usr'"))>0){

}else{
	echo $lang['Invalid+gameplay'];
	exit;
}
$hand = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_gameplays` INNER JOIN `cws_gameplays_logs` ON `cws_gameplays`.`id`=`cws_gameplays_logs`.`id` WHERE `cws_gameplays`.`id`='$gid'"));
function show_card($nr){
	return '<img src="http://'.$_SERVER['SERVER_NAME'].'/images/cards/'.$nr.'.gif" style="padding:5px;width:70px;height:95px" />';
}
function get_var($var){
	global $h;
	//get position of the value of current var and copy everything after in another var
	if (strpos($h,$var)){
		$p1 = strpos($h,$var)+strlen($var)+1;
		$var_p1 = substr($h,$p1);
		//substract this in another string
		$tmp = explode('&',$var_p1);
		return $tmp[0];
	}else{
		return 'N/A';
	}
}
$h = $hand['player_hand'];
if ($hand['gamename']=='1015'){// casino wars
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1015.php');
	
}elseif($hand['gamename']=='1012'){ // baccarat
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1012.php');	
	
}elseif($hand['gamename']=='1011'){ // caribbean poker
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1011.php');	
	
}elseif($hand['gamename']=='1010'){ // texas
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1010.php');	
		
}elseif($hand['gamename']=='1009'){ // blackjack
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1009.php');		
	
}elseif($hand['gamename']=='1008'){ // 5card
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/card/1008.php');		
	
}elseif($hand['gamename']=='758'){ // AM 3D TV
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/roulette/ram.php');	
		
}elseif($hand['gamename']=='757'){ // AM 3D
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/roulette/ram.php');	
		
}elseif($hand['gamename']=='756'){ // EU 3D TV
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/roulette/reu.php');	
		
}elseif($hand['gamename']=='755'){ // EU 3D
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/roulette/reu.php');	
		
}elseif($hand['gamename']=='707'){ // MINI R
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/roulette/rmini.php');	
		
}else{
	$game_type = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT game_type FROM cws_games WHERE id='{$hand['gamename']}'"),0);
	if (stristr($game_type,'slot')){
		require_once($_SERVER['DOCUMENT_ROOT'].'/includes/explain_hand/slots/slot.php');
		
	}else{
		echo $lang['No+data+available'];
	}
}
?>
</div>
</body>
</html>