<?php
//this php file lists all the gameplays
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
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>



<form name="form" class="form"  onsubmit="return false" style="text-align:left;float:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>

<div class="formRow">
<label><?=$lang['Gameplay']?> ID:</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="lookforid" value="<?=antisqli($_POST['searchid'])?>" /></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Username']?>:</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['search'])?>" />
</div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Start+date']?>:</label>
<div class="formRight"><input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['End+date']?>:</label>
<div class="formRight"><input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  /></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Mode']?>:</label>
<div class="formRight">
<select id="mode">
<option value="%" <?php if (!isset($_POST['mode']) ||$_POST['mode']=='%'){echo 'selected';}?>>Real+Fun</option>
<option value="real" <?php if ($_POST['mode']=='real'){echo 'selected';}?>>Real</option>
<option value="fun"<?php if ($_POST['mode']=='fun'){echo 'selected';}?>>Fun</option>
</select>
</div>
<div class="clear"></div>
</div>
            
<div class="formRow">
<label><?=$lang['Game']?> <?=$lang['name']?>:</label>
<div class="formRight">
<select id="gameid">
<option value="0" <?php if (isset($_POST['gameid'])&& strlen($_POST['gameid'])>0 &&$_POST['gameid']>0){}else{echo 'selected';}?>><?=$lang['All+games']?></option>
<?php
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE name NOT LIKE '%ultiplayer%' ORDER BY name");
while ($rowgm = mysqli_fetch_array($sql)){?>
<option value="<?=$rowgm['id']?>" <?php if ($_POST['gameid']==$rowgm['id']){echo 'selected';}?>><?=$rowgm['name']?></option>
<?php } ?>
</select>
</div>
<div class="clear"></div>
</div>

<div class="formRow">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
   <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
	    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Clear+all+gameplay+records']?> !" href="#" onclick="clear_gm()"><span><?=$lang['Clear+all+gameplay+records']?> !</span></a>
<br />
<span style="font-size:8px;color:red;padding-left:8px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var lookforid = escape($("#lookforid").val());
				var fromdate = $("#fromdate").val();
				var mode = $("#mode option:selected").val();
				var gameid = $("#gameid option:selected").val();
				var todate = $("#todate").val();
				showparam('st_gameplays','search='+lookfor+'&mode='+mode+'&fromdate='+fromdate+'&gameid='+gameid+'&todate='+todate+'&searchid='+lookforid);
							 });
function player_hand(hand_id,game_type) {
	var x = $("#player_hand"+hand_id).offset().left - 600;
	var y = $("#player_hand"+hand_id).offset().top - 1;
	document.getElementById('player_hand_show').style.visibility = 'visible';
	$("#player_hand_show").html('<div style="width:300px;z-index:99999;background-color:#EBEBEB;" class="wrap kubrick"><table><tr><td colspan="2" class="acenter">Loading...</td></tr></table></div>');
	$("#player_hand_show").css('display','block');
	$("#player_hand_show").css('position','absolute');
	$("#player_hand_show").css('color','black');
	$("#player_hand_show").css('top',y);
	$("#player_hand_show").css('left',x);
	$.post('includes/show/st_player_hand.inc.php',{hand_id:hand_id,game_type:game_type},function(data){$("#player_hand_show").html(data);});	
}							 
</script>
</div>
<script type="text/javascript">
function clear_gm() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to']?> <?=$lang['delete']?> <?=$lang['all+bets+and+all+gameplays+data']?> ?")) {
				showparam('gm_games_reset','live=1');
	}
};
</script>
<div>
<h3 style="margin-left:10px;"><?=$lang['Gameplays+Statistics']?></h3>
<a onclick="javascript:showparam('st_gameplays','type=real');" class="button blackB"  href="#show"><span><?=$lang['Play+for+REAL']?></span></a> 

<a onclick="javascript:showparam('st_gameplays','type=fun');" class="button blackB"  href="#show"><span><?=$lang['Play+for+FUN+Gameplays']?></span></a>
<?php
if ($_SESSION['adminlvl']!=='admin') {
	$subAgentsList = "'".$_SESSION['admin']."',";
	subAgentsList($_SESSION['admin']);
	$subAgentsList = trim($subAgentsList,',');
	$subAgentsList = str_replace(",''",'',$subAgentsList);
	$subAgentsList = str_replace(",''",'',$subAgentsList);
	$agentfilter = " AND (SELECT owner FROM cws_users u WHERE u.login=user) IN ($subAgentsList)";
	}
?>
<div id="player_hand_show" style="display:none;z-index:99999;width:400px;height:1000px;"><?=$lang['Loading']?>...
</div>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Gameplays+Statistics']?></h6>
    </div>  
<div class="dataTables_wrapper">
    <div class="fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix">
        <div class="dataTables_length">
            <label>
            <span class="itemsPerPage"><?=$lang['Items+per+page']?>:</span> 
            <select id="tableFilter" name="tableFilter" onchange="switch_page('<?=antisqli($_POST['page'])?>')">
            <option value="10" <?php if ($_POST['perpage']=='10'){echo 'selected="selected"';}?>>10</option>
            <option value="25" <?php if ($_POST['perpage']=='25'){echo 'selected="selected"';}?>>25</option>
            <option value="50" <?php if ($_POST['perpage']=='50'){echo 'selected="selected"';}?>>50</option>
            <option value="100" <?php if ($_POST['perpage']=='100'){echo 'selected="selected"';}?>>100</option>
            </select>
            </label>
        </div>
    </div> 
</div>                             
<table cellpadding="0" cellspacing="0" border="0" class="display dTable"> 
<thead>
<tr>
<th class="top acenter">Gameplay ID<br /><?=show_order_by('st_gameplays','id')?></th>
<th class="top acenter"><?=$lang['User']?><br /><?=show_order_by('st_gameplays','user')?></th>
<th class="top acenter"><?=$lang['Game']?></th>
<th class="top acenter"><?=$lang['Date']?><br /><?=show_order_by('st_gameplays','date')?></th>
<th class="top acenter"><?=$lang['Odds']?></th>
<th class="top acenter"><?=$lang['Player']?> <?=$lang['Cash']?> <?=strtoupper($lang['before'])?> Gameplay</th>
<th class="top acenter"><?=$lang['Player']?> <?=$lang['Cash']?> <?=strtoupper($lang['after'])?> Gameplay</th>
<th class="top acenter">IP</th>
<th class="top acenter"><?=$lang['Mode']?><br /><?=show_order_by('st_gameplays','mode')?></th>
<th class="top acenter">Under rollover</th>
<th class="top acenter"><div style="min-width:70px"><?=$lang['Player']?> <?=$lang['Bet']?><br /><span style="font-size:8px">(place mouse over bet<br />for details)</span></div></th>
<th class="top acenter"><div style="min-width:70px"><?=$lang['Player']?> <?=$lang['Won']?></div></th>
<th class="top acenter"><div style="min-width:70px"><?=$lang['Player']?> <?=$lang['Profit']?></div></th>
<th class="top acenter"><div style="min-width:80px">Reserved for <br />CASINO PROFIT<br /><span style="font-size:8px">BET*(100%-Payout%)</span></div></th>
<th class="top acenter">Gameplay <?=$lang['Status']?></th>
<th class="top acenter" width="300"><?=$lang['Gameplay']?> hand log<br /><span style="font-size:8px"><?=$lang['click+for+more+details']?></span></th>
</tr>	  	 
</thead>
<tbody>
<?php
if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
$page = antisqli($_POST['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='id';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='DESC';}
if (isset($_POST['type'])) { 
	if ($_POST['type']=='real') {
		$type = "AND `user`<>'guestlogin'";
		} else {
			$type = "AND `user`='guestlogin'";
		}
}
$datefilter ='';
$_POST['fromdate'] = antisqli($_POST['fromdate']);
$_POST['todate'] = antisqli($_POST['todate']);
if (strlen($_POST['fromdate'])>0){
						$_POST['fromdate'] = date('Y-m-d H:i:s',strtotime(antisqli($_POST['fromdate']))); 
						$fromdate = "AND date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate'])+86400);
						$todate = "AND date<'".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
					}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type="AND `user` LIKE '".str_replace('*','%',$_POST['search'])."'";}
if (isset($_POST['searchid'])&& strlen($_POST['searchid'])>0){$typeid="AND id='".antisqli($_POST['searchid'])."'";}
if (isset($_POST['gameid'])&& strlen($_POST['gameid'])>0 &&$_POST['gameid']>0){$typeid="AND gamename='".antisqli($_POST['gameid'])."'";}
if (isset($_POST['mode'])&& strlen($_POST['mode'])>0){$mode="AND `mode` LIKE '".antisqli($_POST['mode'])."'";}

$payout = 'payout';
$pquery = "SELECT
odds,
mode,
cws_gameplays.id AS id,
gamename,
balance,
ip,
status,
won,
user,
bet,
date,
rollov_status,
won-bet AS profit,
(bet*(100-$payout)/100) AS casino_profit,
(SELECT player_hand FROM cws_gameplays_logs WHERE id=cws_gameplays.id) AS player_hand ,
(SELECT name FROM cws_games WHERE id=cws_gameplays.gamename) AS name ,
(SELECT game_type FROM cws_games WHERE id=cws_gameplays.gamename) AS game_type
FROM `cws_gameplays` WHERE 1=1 $fromdate $todate $type $typeid $gameid $mode $agentfilter ORDER BY $orderby $ordertype";
$query = $pquery." LIMIT $l1,$perpage";
//echo $query;
$sql = mysqli_query($GLOBALS['con'],$query) or die('Error: '.mysqli_error($GLOBALS['con']).' --- Query :'.$query);
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="8">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter" valign="top"><?=$row['id']?></td>
					<td class="acenter" valign="top"><strong><a onclick="javascript:showparam('st_player','login=<?=$row['user']?>');" href="#show"><?=$row['user']?></a></strong></td>
					<td class="acenter" valign="top"><strong><?=$row['name']?></strong></td>
                    <td class="acenter" valign="top"><?=$row['date']?></td>
                                       
                    
                    <td class="acenter" style="color:#F90" valign="top"><?php if ($row['odds']=='9999999.9999'){echo 'N/A';}else{echo $row['odds'];}?> </td>
                    
                    <td class="acenter cash" valign="top"><?=cash_format_cws($row['balance'],2)?><?=$_SESSION['currency']?></td>
                    <td class="acenter cash" valign="top"><?php
					$after = $row['balance'] - $row['bet'] + $row['won'];
					echo cash_format_cws($after,2).$_SESSION['currency'];?></td>
                    <td class="acenter" valign="top" style="color:#09C;font-weight:bold"><?=$row['ip']?></td>
                    <td class="acenter" valign="top" style="color:<?php if ($row['mode']=='real'){echo '#063';}else{echo '#03F';}?>;font-weight:bold"><?=$row['mode']?></td>
                    <td class="acenter" valign="top" style="color:<?php if ($row['rollov_status']=='1'){echo 'red';}else{echo 'blue';}?>;font-weight:bold"><?php if ($row['mode']=='real'){?><?=($row['rollov_status']==1)?'yes':'no'?><?php }else{ echo '-';}?></td>
                    <td class="acenter cash" valign="top">
                    <?php
					$jp_percent = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot_percent FROM bank_tbl"),0);
					$global_mode =  @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0);
					$bet_details = 'PROFIT='.cash_format_cws($row['casino_profit'])."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
					$bet_details .= 'VIPP='.($row['bet']/1000)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
					$remaining = $row['bet'] - $row['casino_profit'] - $row['bet']/1000; //total bet - profit - VIP REVENUE = PAYOUT
					if ($row['jp_enabled']==1){
						$jp_bank =$remaining*$jp_percent/100;
					}else{
						$jp_bank = 0;
					}
					$bet_details .= 'JP='.cash_format_cws($jp_bank)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
					
					if ($global_mode==1){
						$bet_details .= 'BANK='.cash_format_cws($remaining - $jp_bank)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
					}else{
						if (stristr($row['game_type'],'slot5rs') || stristr($row['game_type'],'slot7rs') || stristr($row['game_type'],'slot9rs')){
							$fs = $remaining*10/100;
						}
						if ($row['bonus']!==0 || $row['bonus2']!==0){
							$bonus = $remaining*10/100;
						}else{
							$bonus = 0;
						}
						if (stristr($row['game_type'],'slot') && !stristr($row['game_type'],'multispin')){
							$mega = $remaining*10/100;
							$ultra = $remaining*10/100;
						}else{
							$mega = 0;
							$ultra = 0;
						}
						$bank = $remaining - $fs - $bonus - $mega - $ultra  - $jp_bank;
						$bet_details .= 'BANK='.cash_format_cws($bank)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
						$bet_details .= 'FS='.cash_format_cws($fs)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
						$bet_details .= 'BONUS='.cash_format_cws($bonus)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
						$bet_details .= 'MEGA='.cash_format_cws($mega)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
						$bet_details .= 'ULTRA='.cash_format_cws($ultra)."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n\r";
						
					}
					?>
                    <a class="tipS" style="margin: 5px; color:#090" href="#" original-title="<?=$bet_details?>">
						<span><?=cash_format_cws($row['bet'],2)?><?=$_SESSION['currency']?></span>
                    </a>
					<?php if ($row['bet']=='0.00' && stristr($row['game_type'],'slot') && stristr($row['player_hand'],'freespins=')){?>
                    	<br /><span style="font-size:9px;color:red">FREESPIN</span><?php }elseif(stristr($row['player_hand'],'gamble=1')){?>
                        <br /><span style="font-size:9px;color:red">GAMBLE</span><?php }elseif($row['bet']=='0.00'){?>
                        <br /><span style="font-size:9px;color:red">BONUS</span><?php } ?>
                    </td>
                    
                    <td class="acenter cash" valign="top"><?php if ($row['won']==0){echo '<span style="color:red">'.cash_format_cws($row['won'],2).$_SESSION['currency'].'</span>';}else {echo cash_format_cws($row['won'],2).$_SESSION['currency'];}?>
                    <?php
					if (stristr($row['player_hand'],'&player_action=INSURANCE') ||stristr($row['player_hand'],'&player_action=FOLD') ||stristr($row['player_hand'],'&push=1')){
						?>
                        <br />
                        <span style="font-size:8px;color:red">PLAYER TOOK INSURANCE/FOLD/PUSH</span>
                        <?php 		
					}
                    ?><br />
 <?php
					if (stristr($row['player_hand'],'&winjackpot=1')){
						?>
                        <br />
                        <span style="font-size:8px;color:#3C3">JACKPOT</span>
                        <?php 		
					}
                    ?>
                    </td>
                    <td class="acenter cash" valign="top"><?php if ($row['profit']<0){?><span style="color:red"><?=cash_format_cws($row['profit'],2).$_SESSION['currency']?></span><?php }else{?><?=cash_format_cws($row['profit'],2).$_SESSION['currency']?><?php }?></td>
                    <td class="acenter cash" valign="top">
					<?php if ($row['mode']!=='real'){echo '0.00 '.$_SESSION['currency'].'<br />FUN MODE';}else{?>
					<?=cash_format_cws(($row['bet']*(100-$row['payout'])),2).$_SESSION['currency']?>
                    <?php }?>
                    </td>
                    <td class="acenter" valign="top"><?php if ($row['status']=='nt'){echo '<div style="color:red;width:100px;">player quit game before finishing gameplay</div>';}else {echo $row['status'];}?></td>
                    <td class="acenter cash" valign="top"><div style="width:300px;height:100px;overflow:scroll"><a id="player_hand<?=$row['id']?>"href="#player_hand_show" onclick="player_hand('<?=$row['id']?>','<?=$row['game_type']?>')"><?=$row['player_hand']?></a></div> </td>
               				  </tr>
<?php
}
}
?>
</tbody>
</table>
<?php
include('_inc_pages.inc.php');
?>
</div>