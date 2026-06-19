<?php
//this php file manages the GO LIVE feature. When this is activated , all user,staff,gameplays,deposits,withdrawals,transfers,tickets records are deleted from the database, and the jackpots are set to 0 - comment out line 24 to remove the modifications of jackpots
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
if ($demoMode!==1){
?>
<?php
if ($_POST['live']=='1'){
	mysqli_query($GLOBALS['con'],"UPDATE cws_games SET jackpot='0'");
	mysqli_query($GLOBALS['con'],"UPDATE cws_multiplayer_settings SET jackpot='0'");
	mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET `jackpot_global`='0'");
	echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
	echo $lang['All+jackpots+have+been+set+to'].' 0.00';
	echo '</p></div>';
}else{
	?>
<div id="linkheader"><?=$lang['Games+Management']?><span style="color:#000">&gt;&gt;&gt;</span> <a href="#" onclick="showparam('gm_jackpot_reset')"><?=$lang['Reset+all+jackpots']?></a></div><br />   
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Set+all+jackpots+to']?> 0.00 !" href="#" onclick="clearJp()"><span><?=$lang['Set+all+jackpots+to']?> 0.00 !</span></a>
<?php }?>
<script type="text/javascript">
function clearJp() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to']?> <?=strtolower($lang['Set+all+jackpots+to'])?> 0.00 ?")) {
				showparam('gm_jackpot_reset','live=1');
	}
};
</script>
<?php
}else{
	echo '<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>';	
}
?>