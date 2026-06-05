<?php
session_start();
require_once('../includes/config.inc.php');
$id = antisqli($_REQUEST['video']);
if ($_SESSION['adminlvl']=='admin') {
	$sql = mysqli_query($GLOBALS['con'],"SELECT filename FROM cws_vdog_videos WHERE id='$id'") or die(mysqli_error($GLOBALS['con']));
	$video = 'http://'.$_SERVER['SERVER_NAME'].'/resources/multiplayer/vdogs/videos1142/'.mysqli_result($sql,0);
}
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Video</title>
</head>
<body>
    <div id="player">
		<object width="600" height="338" id="f4Player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"> 
		<param name="movie" value="player.swf" /> 
		<param name="quality" value="high" /> 
		<param name="menu" value="false" /> 
		<param name="allowFullScreen" value="true" /> 
		<param name="scale" value="noscale" /> 
		<param name="allowScriptAccess" value="always" />
		<param name="swLiveConnect" value="true" />
		<param name="flashVars" value="
			skin=skins%2Fclassic.swf
			&thumbnail=dog-racing.jpg
			&video=<?=$video?>
			&autoplay=1
			"/>
		<!--[if !IE]> <--> 
		<object width="600" height="338" data="player.swf" type="application/x-shockwave-flash" id="f4Player">
		<param name="quality" value="high" /> 
		<param name="menu" value="false" /> 
		<param name="allowFullScreen" value="true" /> 
		<param name="scale" value="noscale" />
		<param name="allowScriptAccess" value="always" />
		<param name="swLiveConnect" value="true" />
		<param name="flashVars" value="
			skin=skins%2Fclassic.swf
			&thumbnail=dog-racing.jpg
			&video=<?=$video?>
			&autoplay=1
			"/>
		</object> 
		 <![endif]--> 
		</object>
	</div>
</body>
</html>