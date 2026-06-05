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
	if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0)=='0'){
		@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET `megawin_bank`='0',`ultrawin_bank`='0',`freespins_bank`='0',`bonus_bank`='0',`bank`='0'")or die(mysqli_error($GLOBALS['con']));
		@mysqli_query($GLOBALS['con'],"UPDATE cws_multiplayer_settings SET bank='0'");
		echo 'The banks of all games have been set to 0.00<br />';	
	}else{
		echo 'Global bank set to 0.00<br />';	
	}	
}else{
	?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst(isset($lang[str_replace(' ','+',$page_name)])?($lang[str_replace(' ','+',$page_name)]):$page_name).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br />  
	<?=$lang['This+will+set+all+banks+to']?> 0.00 !<br />
    <br /><br />    
    <a style="margin: 5px;" class="button dblueB" title="Set all banks to 0.00 !" href="#" onclick="clear_gm()"><span><?=ucfirst($lang['Set+all+banks+to'])?> 0.00 !</span></a>
<?php }?>
<script type="text/javascript">
function clear_gm() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to']?> <?=strtolower($lang['Set+all+banks+to'])?> 0.00 ?")) {
				showparam('gm_empty_banks','live=1');
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