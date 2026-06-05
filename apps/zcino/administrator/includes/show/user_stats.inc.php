<div style="width:300px; background-color:#EBEBEB;" class="wrap kubrick">
<script type="text/javascript">
function u_stats_off() {
	document.getElementById('user_stats').style.visibility = 'hidden';
}
</script>
<?php
require_once('../config.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE ".$_SESSION['adminlvl']."='1' AND status='1' AND shortname='$filename'");
	if (mysqli_num_rows($q)==0){
		die('<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>');	
	}else{
		$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
		$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
		$page_menu = mysqli_result($q,0,'menu');
		$page_sname = mysqli_result($q,0,'shortname');
	}
}else{
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
	$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
	$page_menu = mysqli_result($q,0,'menu');
	$page_sname = mysqli_result($q,0,'shortname');
}
$uname = antisqli($_POST['uname']);
$sql = mysqli_query($GLOBALS['con'],"SELECT SUM(won) AS won,SUM(bet) AS played,SUM(bet) AS bet FROM `cws_gameplays` WHERE `user`='$uname'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
?>
<table>
<tr><td colspan="2" class="acenter"><a href="#close" onclick="u_stats_off()"><?=$lang['Close']?></a></td></tr>
<tr><td><?=$lang['Played']?>:</td><td><?php if ($row['played']==""){echo $lang['No+game+played'];}else {echo '<span style="color:green">'.$row['played'].' '.$_SESSION['currency'];}?></td></tr>
<tr><td><?=$lang['Won']?>:</td><td><?php if ($row['won']==""){echo $lang['No+game+played'];}else {echo '<span style="color:green">'.$row['won'].' '.$_SESSION['currency'];}?></td></tr>
<tr><td><?=$lang['Lost']?>:</td><td><?php if ($row['bet']==""){echo $lang['No+game+played'];}else {echo '<span style="color:green">'.$row['bet'].' '.$_SESSION['currency'];}?></td></tr>
<tr>
<td><?=$lang['Most+Played+Game']?>:</td>
<td>
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT COUNT( `gamename` ) AS mostplayed , `gamename`
FROM `cws_gameplays`
WHERE `user`='$uname'
GROUP BY `gamename` 
ORDER BY mostplayed DESC
LIMIT 1"));
$gameid = $gameidt['gamename']; 
$sql = mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='$gameid'");
if (mysqli_num_rows($sql)==0) { echo $lang['No+game+played'];} else { 
	echo mysqli_result($sql,0);
}
?>
</td>
</tr>
<tr>
<td><?=$lang['Most+money+invested+in']?>:</td>
<td>
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `gamename`,SUM(bet) AS played
FROM `cws_gameplays`
WHERE `user`='$uname'
GROUP BY `gamename` 
ORDER BY played DESC
LIMIT 1"));
$gameid = $gameidt['gamename']; 
$sql = mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='$gameid'");
if (mysqli_num_rows($sql)==0) { echo $lang['No+game+played'];} else { 
	echo mysqli_result($sql,0).'<span style="color:green">('.$gameidt['played'].' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>
<tr>
<td><?=$lang['Most+profit+from+game']?>:</td>
<td>
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT`gamename`,SUM(won) AS won
FROM `cws_gameplays`
WHERE `user`='$uname'
GROUP BY `gamename` 
ORDER BY won DESC
LIMIT 1"));
$gameid = $gameidt['gamename']; 
$sql = mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='$gameid'");
if (mysqli_num_rows($sql)==0) { echo $lang['No+game+played'];} else { 
	echo mysqli_result($sql,0).'<span style="color:green">('.$gameidt['won'].' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>
<tr>
<td><?=$lang['Lost+most+money+on+game']?>:</td>
<td>
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `gamename`,SUM(bet) AS bet
FROM `cws_gameplays`
WHERE `user`='$uname'
GROUP BY `gamename` 
ORDER BY bet DESC
LIMIT 1"));
$gameid = $gameidt['gamename'];
$sql = mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='$gameid'");
if (mysqli_num_rows($sql)==0) { echo $lang['No+game+played'];} else { 
	echo mysqli_result($sql,0).'<span style="color:green">('.$gameidt['bet'].' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>
<tr><td colspan="2" class="acenter"><a href="#close" onclick="u_stats_off('<?=$id?>')"><?=$lang['Close']?></a></td></tr>
</table>
</div>