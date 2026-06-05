<?php
//this php file lists all the statistics of the current games
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br />

<div style="text-align:left;padding-left:25px;">
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>

<form name="form" class="form"  onsubmit="return false">
<fieldset>
<div class="widget">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>

<div class="formRow">
    <label><?=$lang['Game+Name']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli(urldecode($_POST['search']))?>"/></div>
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
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
    <br />
    <span><?=$lang['The+search+will+show+the+earnings+between+the+dates+you+will+choose']?>. <?=$lang['If+no+data+is+selected+for+dates']?>, <?=$lang['then+all+earnings+will+be+showed']?></span> <br />
    <span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
</div>
</fieldset>
</form>

<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('st_games','search='+lookfor+'&fromdate='+fromdate+'&todate='+todate);
							 });
</script>

<div class="widget">
  <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6>Games Statistics</h6>
    </div>
  <table cellpadding="0" cellspacing="0" border="0" class="display dTable" id="myTable">
                          <thead>
                          <tr >
                            <td width="50%" class="top"><div align="center"><?=$lang['Game+Name']?> <?=show_order_by('st_games','name')?></div></td>
                            <td width="6%" class="top"><div align="center"><?=$lang['Total+Real+Gameplays']?> </div></td>
                            <td width="8%" class="top"><div align="center"><?=$lang['Average+BET']?> </div></td>
                            <td width="8%" class="top"><div align="center"><?=$lang['Total']?> <?=$lang['Bet']?> <?=$lang['Amount']?></div></td>
                            <td width="8%" class="top"><div align="center"><?=$lang['Total+Win+Amount']?></div></td>
                            <td width="8%" class="top"><div align="center"><?=$lang['NET+PROFIT']?></div></td>
                            <?php if ($_SESSION['adminlvl']=='admin'){?>
                            <td width="8%" class="top"><div align="center"><?=$lang['Reserved+as']?> <?=$lang['Casino+Profit']?><span style="font-size:8px">BET*(100%-Payout%)</span></div></td>
                            <?php }?>
                            <td width="12%" class="top"><div align="center"><?=$lang['How+often+players+win']?></div></td>
                            </tr>
                            </thead>
                            <tbody>
<?php
if ($_SESSION['adminlvl']!=='admin'){
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND (SELECT owner FROM cws_users WHERE x.user=login) IN ($subAgents)";
}
?>                           
<?php	
$datefilter ='';
if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='name';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
$_POST['fromdate'] = antisqli($_POST['fromdate']);
$_POST['todate'] = antisqli($_POST['todate']);
if (strlen($_POST['fromdate'])>0){
						$fromdate = "AND x.date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND x.date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND x.date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND x.date<='".date('Y-m-d H:i:s',time()+186400)."'";
					}		  	
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `name` LIKE '".antisqli(urldecode($_POST['search']))."'");}
$resultu = mysqli_query($GLOBALS['con'],"SELECT `name`,cws_games.id as gameid FROM `cws_games` WHERE 1=1 $type ORDER BY $orderby $ordertype")or error_report(mysqli_error($GLOBALS['con']));

$o=1;
$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;	
$payout = 'payout';
while($lstusr=mysqli_fetch_array($resultu)){
	$o++;
	$gamename = $lstusr['name'];
	$gameid = $lstusr['gameid'];
	
	$tq = mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays x WHERE 1=1 $thefilter $fromdate $todate AND mode='real'") or die('1_'.mysqli_error($GLOBALS['con']));
	$total_gameplays_real=mysqli_result($tq,0);
	

	$tq = mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays x WHERE 1=1 $thefilter $fromdate $todate AND mode='fun'") or die('2_'.mysqli_error($GLOBALS['con']));
	$total_gameplays_fun=mysqli_result($tq,0);
	
	$tq = mysqli_query($GLOBALS['con'],"SELECT AVG(bet) FROM cws_gameplays x WHERE 1=1 $thefilter AND gamename='$gameid' AND mode='real' $fromdate $todate AND user <>'guestlogin'") or die('3_'.mysqli_error($GLOBALS['con']));
	$average_bet =mysqli_result($tq,0);
	
	$tq = mysqli_query($GLOBALS['con'],"SELECT SUM(bet) FROM cws_gameplays x WHERE 1=1 $thefilter AND gamename='$gameid' AND mode='real' $fromdate $todate AND user <>'guestlogin'") or die('4_'.mysqli_error($GLOBALS['con']));
	$total_bet =mysqli_result($tq,0);
	
	$tq = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM cws_gameplays x WHERE 1=1 $thefilter AND gamename='$gameid' AND mode='real' $fromdate $todate AND user <>'guestlogin'") or die('5_'.mysqli_error($GLOBALS['con']));
	$total_profit =mysqli_result($tq,0);
	
	if ($average_bet==""){$average_bet = 0;}
	$total_winnings = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT SUM(won) FROM cws_gameplays x WHERE 1=1 $thefilter AND gamename='$gameid' AND mode='real' $fromdate $todate AND user <>'guestlogin'"),0); 
	if ($total_winnings==""){$total_winnings = 0;}
	$total_losses = $total_bet - $total_winnings; 
	
	$count_total = $total_gameplays_real; 
	$count_wins = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays x WHERE 1=1 $thefilter AND gamename='$gameid' AND mode='real' $fromdate $todate AND user <>'guestlogin' AND won>0 "),0); 
	if ($count_total>0){
		$win_perc = round((100*$count_wins)/($count_total));
	}else{
		$win_perc = 0;
	}
	
	if ($total_losses==""){$total_losses = 0;}
	
$class = ($o%2)?'gradeA odd':'gradeA even';
$NETProfit = $total_bet - $total_winnings;
if ($NETProfit<0){$stylePR = 'style="color:red"';}else{$stylePR = '';}
?>
<tr class='<?=$class?>'>
<td class='acenter name' valign='top'><div align=center><?=$gamename?></div></td>
<td class='acenter tabledata' valign='top'><div align=center><?=$total_gameplays_real?></div></td>
<td class='acenter cash' valign='top'><?=cash_format_cws($average_bet,2)?> <?=$_SESSION['currency']?></td>
<td class='acenter cash' valign='top'><?=cash_format_cws($total_bet,2)?> <?=$_SESSION['currency']?></td>
<td class='acenter cash' valign='top'><?=cash_format_cws($total_winnings,2)?> <?=$_SESSION['currency']?></td>
<td class='acenter cash' valign='top' <?=$stylePR?>><?=cash_format_cws($NETProfit,2)?> <?=$_SESSION['currency']?></td>
<?php if ($_SESSION['adminlvl']=='admin'){?>
<td class='acenter cash' valign='top'><?=cash_format_cws($total_profit,2)?> <?=$_SESSION['currency']?></td>
<?php }?>
<td class='acenter' style='color:blue' valign='top'><?php if($win_perc==0){echo '<span style="color:red">'.$win_perc.' %</span>';}else{echo $win_perc.' %';}?> </td>
</tr>
<?php 
}
?>
</tbody>
<tfoot>
<tr>
<td colspan="7">
</td>
</tr>
</tfoot>
</table>
</div>