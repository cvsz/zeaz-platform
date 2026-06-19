<?php
//this php file lists all the user related statistics
//powered by zcino
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
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<h3 style="margin-left:10px;"><?=$lang['User+Gameplays+Statistics']?></h3>
<style type="text/css">
.ttype { font-weight:bold;font-size:13px;}
.ttext { font-weight:italic;font-size:11px;}
</style>
<?php
if ($_SESSION['adminlvl']!=='admin'){
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND owner IN ($subAgents)";
}
?>
<div id="tables">
<table class="editTable" cellspacing="0" cellpadding="5" width="100%" border=0>
<tbody>

<tr>
<td width="30%"></td>
<td width="26%" align="right" class="ttype">
<?=$lang['User+that+bet+most+money+in+casino']?>
</td>
<td width="44%" class="ttext">
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `user`,COALESCE(SUM(bet),0) AS played
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY played DESC
LIMIT 0,1"));

if ($gameidt['played']==""){echo 'No PLAY FOR REAL gameplays found';}else{
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:green">('.cash_format_cws($gameidt['played'],2).' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>

<tr>
<td></td>
<td  class="ttype" align="right">
<?=$lang['User+that+won+most+money+in+casino']?>
</td>
<td width="44%"  class="ttext">
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `user`,COALESCE(SUM(won),0) AS won
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY won DESC
LIMIT 0,1"));

if ($gameidt['won']==""){echo 'No PLAY FOR REAL gameplays found';}else {
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:green">('.cash_format_cws($gameidt['won'],2).' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>

<tr>
<td></td>
<td  class="ttype" align="right">
<?=$lang['User+that+lost+most+money+to+casino']?>
</td>
<td width="44%"  class="ttext">
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `user`,COALESCE(SUM(won-bet),0) AS profit
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY profit DESC
LIMIT 0,1"));
if ($gameidt['profit']<0){$color='red';}else{$color='green';}
if ($gameidt['profit']==""){echo 'No PLAY FOR REAL gameplays found';}else{
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:'.$color.'">('.cash_format_cws(abs($gameidt['profit']),2).' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>

<tr>
<td></td>
<td  class="ttype" align="right">
<?=$lang['User+that+made+biggest+profit+from+casino']?>
</td>
<td width="44%"  class="ttext">
<?php 
$query = mysqli_query($GLOBALS['con'],"SELECT `user`,COALESCE(MAX(won-bet),0) AS profit
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY profit DESC
LIMIT 0,1") or error_report(mysqli_error($GLOBALS['con']));
$gameidt = mysqli_fetch_array($query);
if ($gameidt['profit']<0){$color='red';}else{$color='green';}
if ($gameidt['profit']==""){echo 'No PLAY FOR REAL gameplays found';}else{
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:'.$color.'">('.cash_format_cws($gameidt['profit'],2).' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>

<tr>
<td></td>
<td  class="ttype" align="right">
<?=$lang['User+that+had+biggest+balance+in+casino']?>
</td>
<td width="44%"  class="ttext">
<?php 

$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `user`,`balance`
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY balance DESC
LIMIT 0,1"));

if ($gameidt['balance']==""){echo 'No PLAY FOR REAL gameplays found';}else{
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:green">('.cash_format_cws($gameidt['balance'],2).' '.$_SESSION['currency'].')</span>';
}
?>
</td>
</tr>

<tr>
<td></td>
<td  class="ttype" align="right">
<?=$lang['User+that+played+most+games+in+casino']?></td>
<td width="44%"  class="ttext">
<?php 
$gameidt = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT `user`,COUNT(DISTINCT(`gamename`)) AS nrgames
FROM `cws_gameplays`
INNER JOIN `cws_users` ON cws_gameplays.user=cws_users.login
WHERE `user`<>'guestlogin' $thefilter AND mode='real'
GROUP BY `user` 
ORDER BY nrgames DESC
LIMIT 0,1"));

if ($gameidt['nrgames']==""){echo 'No PLAY FOR REAL gameplays found';}else{
echo '<a onclick="javascript:showparam(\'st_player\',\'login='.$gameidt['user'].'\');" href="#show">'.$gameidt['user'].'</a> <span style="color:blue">('.$gameidt['nrgames'].')</span>';
}
?>
</td>
</tr>

</tbody></table>
</div>