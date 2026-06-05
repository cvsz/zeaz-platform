<?php
//this php file lists all the games
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
$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;
$global_mode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0);
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 


<form name="form" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
    <div class="formRow"><label><?=$lang['Game']?> <?=$lang['name']?></label>
        <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli(urldecode($_POST['lookfor']))?>" />
        <div class="clear"></div>
    </div>
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+game']?>" href="#" id="search"><span><?=$lang['Search+game']?></span></a>
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a><br />
    <span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('gm_list','search='+lookfor);
							 });
</script>
</div>
</fieldset>
</form>
<h3 style="margin-left:10px;"><?=$lang['Games']?> <span style="color:red"><?php
if (isset($_POST['status'])) { 
	if ($demoMode==1){
		echo 'Editing games is disabled in DEMO';	
	}else{
		$status = antisqli($_POST['status']);
		$id = antisqli($_POST['id']);
		if (mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `status`='$status' WHERE `id`='$id'")) 
			{
			echo '<br />';
			if ($_POST['status']==1) {
				echo $lang['Game'].' #'.$id.' '.$lang['Enabled'];
			} elseif ($_POST['status']==0) {
				echo $lang['Game'].' #'.$id.' '.$lang['Disabled'];
			}
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin' &&$demoMode!==1) { 
	if ($demoMode==1){
		echo 'Editing games is disabled in DEMO';	
	}else{
		$id = antisqli($_POST['id']);
		if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_games` WHERE `id`='$id'")) {
			echo $lang['Game'].' #'.$id.' '.$lang['Deleted'];
		} else {
			echo $lang['Game'].' #'.$id.' '.$lang['NOT+Deleted'];
		}
	}
}
?></span></h3>
<a onclick="javascript:show('gm_list');" class="button dblueB" href="#real"><span><?=$lang['All']?> <?=$lang['Games']?></span></a> 
<a onclick="javascript:showparam('gm_list','type=card');" class="button dblueB" href="#fun"><span>Card <?=$lang['Games']?></span></a> 
<a onclick="javascript:showparam('gm_list','type=slot');" class="button dblueB" href="#fun"><span>Slot <?=$lang['Games']?></span></a> 
<a onclick="javascript:showparam('gm_list','type=arcade');" class="button dblueB" href="#fun"><span>Arcade <?=$lang['Games']?></span></a> 
<a onclick="javascript:showparam('gm_list','type=other');" class="button dblueB" href="#fun"><span><?=$lang['Other']?> <?=$lang['Games']?></span></a> 
<script type="text/javascript">
$(document).ready(function() {
	$('#myTable').dataTable( {
		"sScrollY": "500px",
		"bPaginate": false,
		"aaSorting": []
	} );
} );
</script>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Games']?> <?=$lang['List']?></h6>
    </div>
  <table cellpadding="0" cellspacing="0" border="0" class="display dTable" id="myTable">
  <thead>
<tr>
<th class="top acenter">ID</th>
<th class="top acenter"><?=$lang['Game+Name']?><br /><?=show_order_by('gm_list','name')?></th>
<th class="top acenter"><?=$lang['Game+Status']?><br /><?=show_order_by('gm_list','status')?></th>
<?php if (2==1){?>
<th class="top acenter"><?=$lang['Min+Bet']?><br /><?=show_order_by('gm_list','min_bet')?></th>
<th class="top acenter"><?=$lang['Max+Bet']?><br /><?=show_order_by('gm_list','max_bet')?></th>
<th class="top acenter"><?=$lang['Max+Win+Allowed']?><br /><?=show_order_by('gm_list','max_win')?></th>
<?php }?>
<th class="top acenter"><?=$lang['Game']?> <?=$lang['type']?><br /><?=show_order_by('gm_list','game_type')?></th>
<th class="top acenter"><?=$lang['Bet+sizes']?><br /><?=show_order_by('gm_list','bet_sizes')?></th>
<th class="top acenter">AutoFullscreen<br /><?=show_order_by('gm_list','autofullscreen')?></th>
<?php if($global_mode=='0'){?>
<th class="top acenter">Hit Frequency<br /><?=show_order_by('gm_list','coef')?></th>
<th class="top acenter"><?=$lang['Game']?><br /><?=$lang['Bank']?><br /><?=show_order_by('gm_list','bank')?></th>
<th class="top acenter">BONUS<br />Bank<br /><?=show_order_by('gm_list','bonus_bank')?></th>
<th class="top acenter">MEGAWIN<br />Bank<br /><?=show_order_by('gm_list','megawin_bank')?></th>
<th class="top acenter">ULTRAWIN<br />Bank<br /><?=show_order_by('gm_list','ultrawin_bank')?></th>
<th class="top acenter">FREESPINS<br />Bank<br /><?=show_order_by('gm_list','freespins_bank')?></th>
<th class="top acenter">BANK<br />TOTAL<br /></th>
<th class="top acenter"><?=$lang['Profit']?><br /><?=show_order_by('gm_list','currentprofit')?></th>
<?php } ?>
<th class="top acenter"><?=$lang['Jackpot']?><br /><?=show_order_by('gm_list','jackpot')?></th>
<th class="top acenter"><?=$lang['Game+Management']?> </th>
</tr>	  
</thead>
<tbody>	 
<?php
$page = antisqli($_POST['page']);
if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='name';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if (isset($_POST['type'])) { $type = "WHERE `game_type` LIKE '%".antisqli($_POST['type'])."%'";}
// 2 = declined ; 1 = completed ; 0 = pending
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `name` LIKE '".antisqli(urldecode($_POST['search']))."'");}
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_games` $type ORDER BY $orderby $ordertype") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="9">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><a onclick="javascript:showparam('gm_list_e','edit=1&id=<?=$row['id']?>');" href="#show"><?=$row['name']?></a></strong></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Enabled</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
					}?></td>
                    <?php if (2==1){?>
                    <td class="acenter">
                    <span class="cash"><?=$row['min_bet']?><?=$_SESSION['currency']?></span>
                    </td>
                    <td class="acenter">
                    <span class="cash"><?=$row['max_bet']?><?=$_SESSION['currency']?></span>
                    </td>
                   
                    <td class="acenter">
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span class="cash"><?=$row['max_win']?><?=$_SESSION['currency']?></span>
                    <?php }?>
                    </td>
                    <?php }?>
                    <td class="acenter">
                    <span style="color:blue"><?=$row['game_type']?> </span>
                    </td>
                    <td class="acenter">
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span class="cash">
					<?php 
					if (strlen($row['bet_sizes'])<1 ||$row['bet_sizes']==0){
						echo '-';
				    }else{
						if (stristr($row['game_type'],'table')){
							$mc = explode(',',$row['bet_sizes']);
							$minChip = $mc[0];
							$maxChip = $mc[1]; 
							if ($minChip<=0 || !is_numeric($minChip) || $minChip==""){
								$minChip = 1;
							}
							if ($maxChip==0 || !is_numeric($maxChip) || $minChip==""){
								$maxChip = 100;
							}
							echo '<span style="color:#003399">MinChip=</span><b>'.$minChip.'</b> ; <span style="color:#003399">MaxChip=</span><b>'.$maxChip.'</b> <a style="color:red;font-size:8px" onclick="javascript:showparam(\'gm_list_e\',\'edit=1&id='.$row['id'].'\');" href="#show">[Click edit for more]</a>';
						}else{
							echo substr($row['bet_sizes'],0,20).' <a style="color:red;font-size:8px" onclick="javascript:showparam(\'gm_list_e\',\'edit=1&id='.$row['id'].'\');" href="#show">[Click edit for more]</a>';
						}
				    }
					?></span>
                    <?php 
					}
					?>
                    </td>
                    <td class="acenter">
					<?php if ($row['autofullscreen']=='2'){echo '-';}elseif($row['autofullscreen']=='1'){echo 'On';}else{echo 'Off';}?>
                    </td>
                    <?php if ($global_mode=='0'){?>
                    <td class="acenter">
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span style="color:#09C;font-weight:bold;text-decoration:underline"><?=$row['coef']?>%</span>
                    <?php }?>
                    </td>
                    <td class="acenter">
                    <!-- BANK -->
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span class="cash" <?php if ($row['bank']<0){echo 'style="color:red"';}?>><?=$row['bank']?><?=$_SESSION['currency']?></span>
                    <?php }?>
                    </td>
                    <td class="acenter">
                    <!-- BONUS BANK -->
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span class="cash" style="color:#09C"><?php if (($row['bonus']!=='0' || $row['bonus2']!=='0') && stristr($row['game_type'],'slot') && !stristr($row['game_type'],'multispin')){echo cash_format_cws($row['bonus_bank'],4, '.', '').''.$_SESSION['currency'];}else{echo '-';}?></span>
                    <?php }?>
                    </td>
                    <td class="acenter">
                    <!-- MEGAWIN BANK only SLOTS that are not multispin -->
                    <span class="cash"><?php if (stristr($row['game_type'],'slot') && !stristr($row['game_type'],'multispin')){echo cash_format_cws($row['megawin_bank'],4, '.', '').''.$_SESSION['currency'];}else{echo '-';}?></span>
                    
                    </td>
                    <td class="acenter">
                    <!-- ULTRAWIN BANK only SLOTS that are not multispin -->
                    <span class="cash"><?php if (stristr($row['game_type'],'slot') && !stristr($row['game_type'],'multispin')){echo cash_format_cws($row['ultrawin_bank'],4, '.', '').''.$_SESSION['currency'];}else{echo '-';}?></span>
                    
                    </td>
                    <td class="acenter">
                    <!-- FREE SPINS only SLOTS that are not 3rs or multispin -->
                    <?php if (stristr($row['game_type'],'other')){?>-<?php }else{?>
                    <span style="color:#F90"><?php if ((stristr($row['game_type'],'slot5rs')||stristr($row['game_type'],'slot7rs')||stristr($row['game_type'],'slot9rs')) && !stristr($row['game_type'],'multispin') && !stristr($row['game_type'],'slot3rs')){echo cash_format_cws($row['freespins_bank'],4, '.', '').''.$_SESSION['currency'];}else{echo '-';}?></span>
                    <?php }?>
                    </td>
                    <td class="acenter">
                    <?php
					
					?>
                    <?php 
					$multi = array('1018','1016','1017','1014','998','1000','1006','1005');
					if (in_array($row['id'],$multi)){
						echo '-';
					}else{
						$total_bank = $row['bank'] + $row['megawin_bank'] + $row['bonus_bank'] + $row['ultrawin_bank'] + $row['freespins_bank'];
						if ($total_bank<0){echo '<span style="color:red;border:2px solid red;">';}else{echo '<span style="color:green">';}
						echo cash_format_cws($total_bank,4, '.', '').''.$_SESSION['currency'];
						echo '</span>';
					}
					?>
                    
                    </td>
                    <td class="acenter">
                    <?php
					$payout = 'payout';
					switch ($row['id']){
						case '1006':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_roulette_am_bets` r WHERE mode='real'");$bets = mysqli_result($bets,0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_am_bets` r WHERE mode='real'");$profit = mysqli_result($profit,0);break; // roulette am
						
						case '1005':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_roulette_eu_bets` r WHERE mode='real'") ;$bets = mysqli_result($bets,0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_eu_bets` r WHERE mode='real'");$profit = mysqli_result($profit,0);break; // roulette eu
						
						case '1014':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_sicbo_bets` t") ;$bets = mysqli_result($bets,0); // sicbo
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_sicbo_bets` t");$profit = mysqli_result($profit,0);break; // sicbo
						
						case '1001':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_bingo_tickets_v2` t") ;$bets = mysqli_result($bets,0); // bingo
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_bingo_tickets_v2` t");$profit = mysqli_result($profit,0);break; // bingo
						
						case '998':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='car'") ;$bets = mysqli_result($bets,0); // speed racers
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='car'");$profit = mysqli_result($profit,0);break; // car
						
						case '1016':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='hr'") ;$bets = mysqli_result($bets,0); //hr
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='hr'");$profit = mysqli_result($profit,0);break; // hr
						
						case '1017':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='mk'") ;$bets = mysqli_result($bets,0); //monkey
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='mk'");$profit = mysqli_result($profit,0);break; // monkey
						
						case '1018':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='dog'") ;$bets = mysqli_result($bets,0); //dog
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='dog'");$profit = mysqli_result($profit,0);break; // dog
						
						case '1019':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='vd'") ;$bets = mysqli_result($bets,0); //vdogs
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='vd'");$profit = mysqli_result($profit,0);break; // vdogs
						
						default: 
						$bets = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'");$profit = mysqli_result($profit,0);break;
						
					}
					
					echo '<span class="cash">+'.cash_format_cws($profit).$_SESSION['currency'].'</span>';
					?>
                    </td>
                    <?php } ?>
                    <td class="acenter">
                    <!-- JACKPOT -->
                    <?php if (stristr($row['game_type'],'other')){/*game is multiplayer*/?>
                    <?php
						switch ($row['id']){
							case '1016':echo '<span class="cash">'.cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot FROM cws_multiplayer_settings WHERE game_type='hr'"),0),4, '.', '').''.$_SESSION['currency'].'</span>';break;
							case '1018':echo '<span class="cash">'.cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot FROM cws_multiplayer_settings WHERE game_type='dog'"),0),4, '.', '').''.$_SESSION['currency'].'</span>';break;
							case '1017':echo '<span class="cash">'.cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot FROM cws_multiplayer_settings WHERE game_type='mk'"),0),4, '.', '').''.$_SESSION['currency'].'</span>';break;
							case '998':echo '<span class="cash">'.cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot FROM cws_multiplayer_settings WHERE game_type='car'"),0),4, '.', '').''.$_SESSION['currency'].'</span>';break;
							default: echo '-';break;
						}
					?>
					<?php }else{?>
                    <span class="cash"><?php if ($row['jp_enabled']=='1'){if ($row['jackpot']<0){echo '<span style="color:red">';}else{echo '<span>';}echo cash_format_cws($row['jackpot'],4, '.', '').''.$_SESSION['currency'];}else{echo '-';}echo '</span>';?></span>
                    <?php }?>
                    </td>
                    <td class="acenter">
                    <div class="manageTd" style="min-width:130px">
                    <?php if ($row['status']==0) { echo '<a onclick="javascript:showparam(\'gm_list\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';}else{ echo '<a onclick="javascript:showparam(\'gm_list\',\'status=0&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;}?> <a onclick="javascript:showparam('gm_list_e','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a> <a onclick="javascript:showparam('gm_list','delete=1&id=<?=$row['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a>
                    </div></td>
               				  </tr>
<?php
}
}
?>
</tbody>
<?php if($global_mode=='0'){?>
<tfoot>
<tr>
<td colspan="7" align="right" style="font-weight:bold;text-align:right;color:#000"><?=$lang['Total']?> : </td>
<td class="cash">
<?php 
$tr = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT SUM(bank) as bank, SUM(freespins_bank) as freespins_bank, SUM(bonus_bank) as bonus_bank,SUM(megawin_bank) as megawin_bank,SUM(ultrawin_bank) as ultrawin_bank, SUM(jackpot) as jackpotSum FROM cws_games WHERE status='1'"));?><?=cash_format_cws($tr['bank'],4)?><?=$_SESSION['currency']?><br />(BANK)

</td>
<td style="color:#09C"><?=cash_format_cws($tr['bonus_bank'],2)?><?=$_SESSION['currency']?><br />(BONUS BANK)</td>
<td style="color:#0C3"><?=cash_format_cws($tr['megawin_bank'],2)?><?=$_SESSION['currency']?><br />(MEGAWIN BANK)</td>
<td style="color:#0C3"><?=cash_format_cws($tr['ultrawin_bank'],2)?><?=$_SESSION['currency']?><br />(ULTRAWIN BANK)</td>
<td style="color:#F90"><?=cash_format_cws($tr['freespins_bank'],2)?><?=$_SESSION['currency']?><br />(FREESPINS BANK)</td>
<td style="color:black;font-weight:bold"><?=cash_format_cws($tr['bank']+$tr['freespins_bank']+$tr['bonus_bank']+$tr['ultrawin_bank']+$tr['megawin_bank'],2)?><?=$_SESSION['currency']?><br />(TOTAL BANK)</td>
<td class="cash"><?=cash_format_cws(getMyProfit('bet','0','0','admin',true),2)?><?=$_SESSION['currency']?><br />(<?=strtoupper($lang['PROFIT'])?>)</td>
<td style="color:#F90"><?=cash_format_cws($tr['jackpotSum'],4)?><?=$_SESSION['currency']?><br />(JACKPOT)</td>
<td colspan="2"></td>
</tr>
</tfoot>
<?php }?>
</table>
</div>