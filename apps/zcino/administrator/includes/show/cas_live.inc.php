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
	echo $lang['Your+total+profit+before+going+live+was'].': <span style="color:green">';
	$profit = getMyProfit('bet','0','0','admin',true); 
	echo cash_format_cws($profit).$_SESSION['currency'];
	echo '</span><br />';
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_users");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_users_info");
	//@mysqli_query($GLOBALS['con'],"DELETE FROM cws_vdog_tickets_v2");
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_deposits");
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_withdrawals");
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers");
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_staffs WHERE login<>'admin'");
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_gameplays");	
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_gameplays_logs");	
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_bingo_results");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_bingo_results");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_race_results");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_race_tickets");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_bonuses_instant");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_race_logs");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_sicbo_bets");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_sicbo_results");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_am_bets");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_eu_bets");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_am_results");
	@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_eu_results");		
	mysqli_query($GLOBALS['con'],"DELETE FROM cws_shop_orders");	
	mysqli_query($GLOBALS['con'],"UPDATE cws_games SET jackpot='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET bank='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET bonus_bank='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET megawin_bank='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET ultrawin_bank='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET freespins_bank='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_games SET currentprofit='0'");
	//mysqli_query($GLOBALS['con'],"UPDATE cws_profitpurse SET currentprofit='0',totalcashedout='0'");
	@mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET bank='0',poker_house='0',currentprofit='0'");	
	@mysqli_query($GLOBALS['con'],"UPDATE cws_multiplayer_settings SET bank='0',profit='0',drawid='1'");	
	
	mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET cash='1000000000' WHERE login='admin'");
	
	echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
	echo $lang['All+casino+records+have+been+cleared'];
	echo '</p></div>';
}else{
	?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br />  
    <?=$lang['Accepting+this+will+delete']?> <?=$lang['all deposits']?>,<?=$lang['withdrawals']?>,<?=$lang['transfers']?>,<?=$lang['orders']?>,<?=$lang['users']?>,<?=$lang['staffs']?>,<?=$lang['gameplays']?> <?=$lang['records']?> ! <?=$lang['Please+be+carefull']?> !<br />
    <?=$lang['Doing+this+will+cause+you+to+lose+all+statistics']?> , <?=$lang['including+profit+value+and+agent+revenues']?>!<br /><br />
     <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+all+casino+data']?> !" href="#" onclick="golive()"><span><?=$lang['Reset+all+casino+data']?> !</span></a>
<?php }?>
<script type="text/javascript">
function golive() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to+reset+all+casino+data']?> ?")) {
				showparam('cas_live','live=1');
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