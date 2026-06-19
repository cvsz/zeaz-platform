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
	echo $lang['Your+total+profit+before+deleting+gameplays+data+was'].': <span style="color:green">';
	$profit = getMyProfit('bet','0','0','admin',true); 
	echo cash_format_cws($profit).$_SESSION['currency'];
	echo '</span><br />';
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_bingo_results`")){echo 'Table <span style="color:red">`cws_bingo_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_bingo_results` AUTO_INCREMENT =1;");
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_bingo_tickets_v2`")){echo 'Table <span style="color:red">`cws_bingo_tickets_v2`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_bingo_tickets_v2` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_roulette_am_results`")){echo'Table <span style="color:red">`cws_roulette_am_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_roulette_am_results` AUTO_INCREMENT =1");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_roulette_am_bets`")){echo 'Table <span style="color:red">`cws_roulette_am_bets`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_roulette_am_bets` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_roulette_eu_results`")){echo'Table <span style="color:red">`cws_roulette_eu_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_roulette_eu_results` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_roulette_eu_bets`")){echo 'Table <span style="color:red">`cws_roulette_eu_bets`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_roulette_eu_bets` AUTO_INCREMENT =1;");
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_roulette_logs`")){echo 'Table <span style="color:red">`cws_roulette_logs`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_roulette_logs` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_gameplays`")){echo 'Table <span style="color:red">`cws_gameplays`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_gameplays` AUTO_INCREMENT =1;");
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_gameplays_logs`")){echo 'Table <span style="color:red">`cws_gameplays_logs`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_gameplays_logs` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_vdog_odds`")){echo 'Table <span style="color:red">`cws_vdog_odds`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_vdog_odds` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_vdog_results`")){echo 'Table <span style="color:red">`cws_vdog_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_vdog_results` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_vdog_tickets_v2`")){echo 'Table <span style="color:red">`cws_vdog_tickets_v2`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_vdog_tickets_v2` AUTO_INCREMENT =1;");
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_race_tickets`")){echo 'Table <span style="color:red">`cws_race_tickets`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_race_results`")){echo 'Table <span style="color:red">`cws_race_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_race_odds`")){echo 'Table <span style="color:red">`cws_race_odds`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_race_logs`")){echo 'Table <span style="color:red">`cws_race_logs`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_sicbo_bets`")){echo 'Table <span style="color:red">`cws_race_tickets`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_sicbo_results`")){echo 'Table <span style="color:red">`cws_race_results`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_race_tickets` AUTO_INCREMENT =1;");
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_race_results` AUTO_INCREMENT =1;");
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_race_odds` AUTO_INCREMENT =1;");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_multiplayer_settings SET drawid='1'");
	
	echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
	echo $lang['All+gameplays+and+results+have+been+cleared'];
	echo '</p></div>';
	
}else{
	?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst(isset($lang[str_replace(' ','+',$page_name)])?($lang[str_replace(' ','+',$page_name)]):$page_name).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br />  
	<?=$lang['This+will+delete+all+tickets']?>, <?=$lang['all+bets+and+all+gameplays+data']?> !<br />
    <?=$lang['Doing+this+will+cause+you+to+lose+all+statistics+related+to+games']?>, <?=$lang['including+profit+value+and+agent+revenues']?>!
    <br /><br />    
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Clear+all+gameplay+records']?> !" href="#" onclick="clear_gm()"><span><?=$lang['Clear+all+gameplay+records']?> !</span></a>
<?php }?>
<script type="text/javascript">
function clear_gm() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to']?> <?=$lang['delete']?> <?=$lang['all+bets+and+all+gameplays+data']?> ?")) {
				showparam('gm_games_reset','live=1');
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