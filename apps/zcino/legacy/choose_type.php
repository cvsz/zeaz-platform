<?php
require_once('includes/config.inc.php');
if(!isset($_SESSION['credit'])){$_SESSION['credit'] = 5000;}
if ($allowFunMode!=='1'){
	$_SESSION['credit'] = 0;
}
if (LOGIN_PAGE==1 && !isset($_SESSION['username'])){
	$allowFunMode = 0;
	$allowrealplay = 0;
}
$_SESSION['game'] = antisqli($_GET['game']);
$query = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE id='{$_SESSION['game']}'") or die(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($query)==0){
	$errormsg = '<span style="color:white">'.$lang['Invalid+game'].' <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span>';		
}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE id='{$_SESSION['game']}'"));
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>
<?php
echo $row['name'];
?></title>
<style type="text/css">
body {
	background-color: #140200;
	background-image: url(images/bg_top.jpg);
	background-repeat: no-repeat;
	background-attachment:fixed;
	background-position:top center;
	font-family:"Book Antiqua",Arial,Helvetica,sans-serif;
	color:white;
}
#page {
	margin:auto;
	border:0px;
}
.style7 {
	font-family: Verdana, Arial, Helvetica, sans-serif;
	font-size: 12px;
}
.style9 {
	font-family: Verdana, Arial, Helvetica, sans-serif;
	font-size: 12px;
	color: #FFFFFF;
	font-weight: bold;
}
.style11 {font-size: 10px}
.style12 {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #FFFFFF; }
.style13 {color: #FAC205}
</style>
<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/jscript/jquery.js"></script>
<script type="text/javascript">
function update_activity(){
		$.get('<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>/includes/update_activity.inc.php');
	}
	update_activity();
	setInterval(update_activity,1000*15);
</script>
</head>
<body>
<table width="100%">
  <tr>
    <td width="100%" align="center">
    <?php 
	if ($_SESSION['game']=='1001' || $_SESSION['game']=='998' || $_SESSION['game']=='1016' || $_SESSION['game']=='1017' || $_SESSION['game']=='1018' || $_SESSION['game']=='1019'){//if we have MULTIPLAYER BINGO or MULTIPLAYER CAR RACE, then disable PLAY FOR FUN
		$allowFunMode = 0;
	}
	if ($_SESSION['game']=='999'){ // if we have car race single-player
		$url = 'resources/games_flash/CWS_RACE_CAR/';	
	}
	if ($_SESSION['game']=='998'){ // if we have car race multiplayer
		$url = 'resources/multiplayer/car_race/';	
	}
	if ($_SESSION['game']=='1016'){ // if we have horse race multiplayer
		$url = 'resources/multiplayer/hrace/';	
	}
	if ($_SESSION['game']=='1017'){ // if we have horse race multiplayer
		$url = 'resources/multiplayer/monkey/';	
	}
	
	if (!isset($_SESSION['game'])){
		$errormsg = '<span style="color:white">'.$lang['Invalid+game'].'. <a href="javascript:history.go(-1)">'.$lang['Go+back'].'</a></span>';
	}else{
		$game_type = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT game_type FROM cws_games WHERE id='{$_SESSION['game']}'"),0);
	}
	
	?>
    <h1 style="color:white"><?php echo $row['name'];?></h1>
    <a href="index.php"><img src="images/go-back.png" /></a><br />
    <?php 
	if (isset($errormsg)){
		echo $errormsg;
	}else{
		$tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings"));
		$skill_games = $tmp['allowent'];
		$allowrealplay = $tmp['allowrealplay'];
		if (@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_games WHERE id='{$_SESSION['game']}'"),0)=='0'){
			echo $lang['Game+not+available'];
		?>
		<?php }elseif (isset($_SESSION['username']) && $allowFunMode=='0' && $allowrealplay=='1' && $game_type!=='skill'){?>
			<img src="images/choose_type_real.png" width="450" height="171" usemap="#Map5" style="border:0px;margin-left:-50px"/>
			<map name="Map5">
			  <area shape="rect" coords="145,4,344,258" href="<?=$url?>launch_game.php?game=<?=$_GET['game']?>&mode=real" target="_self" />
		  </map> 
		  <br />
			<div style="width:150px;margin-left:-7px;color:white;border:1px #C60 solid;background-color:#666">
			<?=number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE id='{$_SESSION['userid']}'"),0),2)?> <?=$_SESSION['currency']?></div>
		<?php }elseif (isset($_SESSION['username']) && $allowFunMode=='1' && $allowrealplay=='1' && $game_type!=='skill'){?>
	<img src="images/choose_type.png" width="450" height="171" usemap="#Map4" style="border:0px;margin-left:-50px"/>
			<map name="Map4">
			  <area shape="rect" coords="27,15,231,212" href="<?=$url?>launch_game.php?game=<?=$_GET['game']?>&mode=real" target="_self" />
			  <area shape="rect" coords="259,10,478,234" href="<?=$url?>launch_game.php?game=<?=$_GET['game']?>&mode=fun" target="_self" />
			</map>    
			<br />
			<div style="width:370px">
			<div style="margin-left:-8px;width:150px;float:left;color:white;border:1px #C60 solid;background-color:#666"><?=number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE id='{$_SESSION['userid']}'"),0),2)?> <?=$_SESSION['currency']?></div>
			<div style="width:150px;float:right;color:white;border:1px #C60 solid;background-color:#666"><?=number_format($_SESSION['credit'],2)?> fun points</div>
			</div>
		<?php } elseif ($allowFunMode=='1' || ($game_type=='skill' && $skill_games=='1')) { ?>
			<img src="images/choose_type_fun.png" width="450" height="171" usemap="#Map5" style="border:0px;margin-left:-50px"/>
			<map name="Map5">
			  <area shape="rect" coords="145,4,344,258" href="launch_game.php?game=<?=$_GET['game']?>&mode=fun" target="_self" />
		  </map> 
		  <br />
		  <div style="width:150px;margin-left:-7px;color:white;border:1px #C60 solid;background-color:#666"><?=number_format($_SESSION['credit'],2)?> fun points</div>
		<?php } elseif($allowrealplay!=='1' && $allowrealplay!=='1'){?>
		<span style="color:white"><?=$lang['No+play+mode+available']?>. <?=$lang['Please+contact+administrator']?>. Go <a href="javascript:history.go(-1)"><?=$lang['Go+back']?></a></span>
		<?php }else{?>
		<span style="color:white"><?=$lang['Please+login+to+your+account+to+play']?>.  <a href="javascript:history.go(-1)"><?=$lang['Go+back']?></a></span>
		<?php } 
	}?>
    </td>
  </tr>
  <tr>
    <td align="center"><p>&nbsp;</p>
      <table width="718" border="1">
      <tr>
        <td width="373" bgcolor="#000">
        <?php
		if (isset($errormsg)){
			echo $errormsg;
		}else{?>
        <div align="left" style="color:#FFF;padding:10px">
<?php if ($row['bonus']=='1' || $row['freespins']=='1' || $row['double']=='1' || $row['jackpot']=='1' || $row['wild']=='1' || $row['multilines']=='1' || $row['3d_slots']=='1' || $row['dynamic_speed']=='1' || $row['paylines']>0 || $row['pays_rtl']>0){?>        
        <span class="redcol bold"><?=strtoupper($lang['FEATURES'])?></span> : <br />
<span class="features">
<?php if ($row['bonus']=='1'){?><?=strtoupper($lang['BONUS'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['freespins']=='1'){?><?=strtoupper($lang['FREE+SPINS'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['double']=='1'){?><?=strtoupper($lang['DOUBLE'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['jackpot']=='1'){?><?=strtoupper($lang['JACKPOT'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['wild']=='1'){?><?=strtoupper($lang['WILD'])?>/<?=strtoupper($lang['JOKER'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['multilines']=='1'){?><?=strtoupper($lang['MULTI+SPIN'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['3d_slots']=='1'){?><?=strtoupper($lang['3D+SLOTS'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['dynamic_speed']=='1'){?><?=strtoupper($lang['ADJUSTABLE+SPIN+SPEED'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['pays_rtl']=='1'){?><?=strtoupper($lang['PAYS+RIGHT+TO+LEFT'])?> <img src="images/checkbox.png" /> <?php } ?>
<?php if ($row['paylines']>0){?><?=strtoupper($lang['PAYLINES'])?> : <span class="redcol"><?=$row['paylines']?></span><?php } ?>
</span>
<?php } ?>
		<h1><?=ucfirst($lang['Game+description'])?></h1>
		<?=urldecode(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT description FROM cws_games WHERE id='{$_SESSION['game']}'"),0))?>
        <h1><?=ucfirst($lang['Rules'])?></h1>
        <?=urldecode(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT rules FROM cws_games WHERE id='{$_SESSION['game']}'"),0))?>
        </div>
        <?php } ?>
        </td>
      </tr>
    </table>
    </td>
  </tr>
</table>

<p>&nbsp;</p>
</body>
</html>