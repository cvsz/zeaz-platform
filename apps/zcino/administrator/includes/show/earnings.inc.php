<?php
//this php file calculates and shows all the earnings of the current logged in staff . It shows TODAY's earnings and ALL TIME earnings
//powered by zcino
require_once('../config.inc.php');
if ($_SESSION['adminlvl']=='admin'){
	require_once('earnings_owner.inc.php');
	exit;
}
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = 'earnings.inc.php'; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
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
	$filename = 'earnings.inc.php'; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
	$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
	$page_menu = mysqli_result($q,0,'menu');
	$page_sname = mysqli_result($q,0,'shortname');
}
?> 
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\'earnings\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
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
<label><?=$lang['Start+date']?>:</label>
<div class="formRight"><input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['End+date']?>:</label>
<div class="formRight"><input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  /></div>
<div class="clear"></div>
</div>

<div class="clear"></div>
</div>

<div class="formRow">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('earnings');"><span><?=$lang['Reset+filters']?></span></a>
<br />
<span style="font-size:8px;color:red;padding-left:8px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
</div>
<div>
</fieldset></form>
<div class="clear"></div>
</div>
<div class="clear"></div>
</div>
<div class="clear"></div>
</div>
<div class="clear"></div>
</div>
<script type="text/javascript">
$("#search").click(function() {
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('earnings','fromdate='+fromdate+'&todate='+todate);
							 });
</script>		
</div>
<div>
   <div id="tables">
            <?php
			if ($_SESSION['adminlvl']!=='admin') {
					$subAgents = "'".$_SESSION['admin']."',";
					getSubAgents($_SESSION['admin']);
					$subAgents = trim($subAgents,',');
					$thefilter = " AND login IN ($subAgents)";
				}
				$staff = $_SESSION['admin']; // current logged in agent or requested agent
				$stafftype = $_SESSION['adminlvl'];
				$query = "SELECT *,percent/100 as percent FROM `cws_staffs` WHERE login='$staff'";
				$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
				$row = mysqli_fetch_array($sql);
			?>
            <h3><?=$lang['Available']?> <?=$lang['Balance']?> : <span style="color:green"><?=cash_format_cws($row['cash'])?> <?=$_SESSION['currency']?></span></h3>
            <h2>Admin level : <?=$staff?></h2>
            <h2><?php
			if ((isset($_POST['todate']) || isset($_POST['fromdate'])) && (strlen($_POST['todate'])>1 || strlen($_POST['fromdate'])>1)){
				$fdate = date('Y-m-d').' 00:00:00';
				$tdate = date('Y-m-d').' 23:59:59';
				if (isset($_POST['fromdate']) && strlen($_POST['fromdate'])>1){$fdate = date('Y-m-d H:i:s',strtotime($_POST['fromdate']));}
				if (isset($_POST['todate']) && strlen($_POST['todate'])>1){$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));}
				echo '<span style="color:blue">'.$fdate.' - '.$tdate.'</span>';
			}else{
				echo $lang['Today'].' '.$lang['earnings'].' '.date('Y-m-d H:i:s',time());
			}
			?></h2>
            <table>
            <tr>
            <td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=$lang['Bet']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=$lang['Won']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=strtoupper($lang['NET+PROFIT'])?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="6%" class="top acenter"style="font-size:10px"><?=$lang['Revenue']?> <?=$lang['from']?> <?=strtolower($lang["Player"])?>s of <?=$stafftype?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span> </td>
<td width="6%" class="top acenter"><?=$lang['Revenue']?> <?=$lang['from+subagents']?> of  <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span> </td>
<td width="8%" class="top acenter"><?=$lang['Total']?> <?=$lang['Revenue']?> of  <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
</tr>
<tr>
<td class="acenter cash">
					<?php 
					//TODAY EARNINGS
					$style = '';
					$datefilter ='';
					$fdate = date('Y-m-d').' 00:00:00';
					$tdate = date('Y-m-d').' 23:59:59';
					if (isset($_POST['fromdate']) && strlen($_POST['fromdate'])>1){$fdate = date('Y-m-d H:i:s',strtotime($_POST['fromdate']));}
					if (isset($_POST['todate']) && strlen($_POST['todate'])>1){$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));}
					$bets = getMyPlayers('bet',$fdate,$tdate,$staff);
					if ($bets<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($bets,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>      
                    <!-- total won by agent's players and wins from bets made by agent from ADMIN Panel--> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$wins = getMyPlayers('won',$fdate,$tdate,$staff);
					if ($wins<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($wins,2).' '.$_SESSION['currency'].'</span>';
					?>


                    </td> 
                    
                    <!-- NET PROFIT -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$NETprofit = $bets - $wins;
					if ($NETprofit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($NETprofit,2).' '.$_SESSION['currency'].'</span>';
					?>


                    </td>  
                    <!-- revenue from direct players (bets - wins * rake = profit from players) -->
                     <td class="acenter cash">
					<?php 
					$style = '';
					/*
					if (NET_REVENUE=='1'){
						$playersRev = ($bets-$wins)*$row['percent'];
					}else{
						$playersRev = ($bets)*$row['percent'];
					}
					*/
					$playersRev = ($bets-$wins)*$row['percent'];
					if ($playersRev<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($playersRev,2).' '.$_SESSION['currency'].'</span>';
					?>
					 <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>     
 					 <!-- revenue from subagents --> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$counter =0;
					$checked = array();
					$fromSubAgents = calculate_all_share($_SESSION['admin'],$row['percent'],0,$fdate,$tdate,1);
					if ($fromSubAgents<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($fromSubAgents,2).' '.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                     </td>   
                    <!-- total revenue profit*rake -->     
                    <td class="acenter cash">
					<?php 
					$style = '';
					$totalRevenue = $playersRev+$fromSubAgents;
					if ($totalRevenue<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($totalRevenue,2).' '.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>
                    </tr></table>
                    <br />
                        <h2><?=$lang['All+time']?> <?=$lang['earnings']?></h2>
            <table>
            <tr>
            <td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=$lang['Bet']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=$lang['Won']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="9%" class="top acenter" style="font-size:10px"><?=$_SESSION['currency']?> <?=strtoupper($lang['NET+PROFIT'])?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>
<td width="6%" class="top acenter"style="font-size:10px"><?=$lang['Revenue']?> <?=$lang['from']?> <?=strtolower($lang["Player"])?>s of <?=$stafftype?> <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span> </td>
<td width="6%" class="top acenter"><?=$lang['Revenue']?> <?=$lang['from+subagents']?> of  <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span> </td>
<td width="8%" class="top acenter"><?=$lang['Total']?> <?=$lang['Revenue']?> of  <span style="font-weight:bold">(<?=$_SESSION['admin']?>)</span></td>

</tr>
<tr>
<td class="acenter cash">
					<?php 
					//ALL TIME EARNINGS
					$style = '';
					$datefilter ='';
					$bets = getMyPlayers('bet','0','0',$staff);
					if ($bets<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($bets,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>      
                    <!-- total won by agent's players and wins from bets made by agent from ADMIN Panel--> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$wins = getMyPlayers('won','0','0',$staff);
					if ($wins<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($wins,2).' '.$_SESSION['currency'].'</span>';
					?>


                    </td> 
                    <!-- NET PROFIT -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$NETprofit = $bets - $wins;
					if ($NETprofit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($NETprofit,2).' '.$_SESSION['currency'].'</span>';
					?> 
                    <!-- revenue from direct players (cashin-cashout-cash * rake = profit from players) -->
                     <td class="acenter cash">
					<?php 
					$style = '';
					/*
					if (NET_REVENUE=='1'){
						$playersRev = ($bets-$wins)*$row['percent'];
					}else{
						$playersRev = ($bets)*$row['percent'];
					}
					*/
					$playersRev = ($bets-$wins)*$row['percent'];
					if ($playersRev<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($playersRev,2).' '.$_SESSION['currency'].'</span>';
					?>
					 <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>     
 					 <!-- revenue from subagents --> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$counter =0;
					$checked = array();
					$fromSubAgents = calculate_all_share($_SESSION['admin'],$row['percent'],0,'2000-01-01',date('Y-m-d H:i:s',time()+186400),1);
					if ($fromSubAgents<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($fromSubAgents,2).' '.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                     </td>   
                    <!-- total revenue profit*rake -->     
                    <td class="acenter cash">
					<?php 
					$style = '';
					$totalRevenue = $playersRev+$fromSubAgents;
					if ($totalRevenue<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($totalRevenue,2).' '.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>
                    </tr></table>
<?=$lang['The+statistics+above+are+calculated+based+on+the+bets+and+wins+of+each+player']?>.<br /><br /><br />                    
<?php if ($_SESSION['adminlvl']=='admin'){?>
<strong>CASHIN - CASHOUT</strong> = 
<?php 
$style = '';
$cashin = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits AND status='1'"),0);
$cashin += @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_transfers WHERE sender_type='admin' AND receiver_type='user'"),0);
$cashout = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_withdrawals AND status='1'"),0);
$cashout += @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_transfers WHERE sender_type='user' AND receiver_type='admin'"),0);
$cashDiff = $cashin - $cashout;
if ($cashDiff<0) {$style = 'color:red';}else{ $style = 'color:green';}
echo '<span style="'.$style.'">'.cash_format_cws($cashDiff,2).' '.$_SESSION['currency'].'</span>';
?> <br />
<br />
<span style="font-size:10px">
<strong>CASHIN</strong> - <?=$lang['sum+of+all+amounts+that+were+deposited+by+each+player']?> ( <?=$lang['it+also+includes+money+sent+from+admin+panel+using']?> "<?=$lang['TRANSFER+FUNDS+TO+USER']?>" <?=$lang['function']?> )<br />
<strong>CASHOUT</strong> - <?=$lang['sum+of+all+amounts+that+were+withdrawn+by+each+player']?> ( <?=$lang['it+also+includes+money+sent+from+admin+panel+using']?> "<?=$lang['TRANSFER+FUNDS+TO+USER']?>" <?=$lang['function']?> )</span>           
<?php } ?>
            </div>