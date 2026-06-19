<?php
//this php file calculates and shows all the earnings of the current logged in staff . It shows TODAY's earnings and ALL TIME earnings
//powered by zcino
require_once('../config.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	exit;
}else{
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = 'earnings_owner.inc.php'; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = 'Finances';
	$page_name = 'My Earnings';
	$page_menu = '1';
	$page_sname = 'earnings_owner.inc.php';
}
?> 
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\'earnings_owner\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
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
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('earnings_owner');"><span><?=$lang['Reset+filters']?></span></a>
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
				showparam('earnings_owner','fromdate='+fromdate+'&todate='+todate);
							 });
</script>							 
   <div id="tables">
            <?php
				$staff = $_SESSION['admin']; // current logged in agent or requested agent
				$stafftype = $_SESSION['adminlvl'];
				$query = "SELECT *,percent/100 as percent FROM `cws_staffs` WHERE login='$staff'";
				$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
				$row = mysqli_fetch_array($sql);
			?>
            <h3><?=$lang['Available']?> <?=$lang['Balance']?> : <span style="color:green"><?=cash_format_cws($row['cash'])?> <?=$_SESSION['currency']?></span></h3>
            <h2>Casino Owner - admin</h2>
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
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['Total+Amount+Bet+by+Players']?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['Total+Amount+Won+by+Players']?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=strtoupper($lang['NET+PROFIT'])?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['RESERVED+AS+PROFIT']?><br>
<?=$lang['from+each+bet']?></h5>              
            <span style="font-size:8px">BET*(100%-Payout%)</span></td>
            <td width="6%" class="top acenter"style="font-size:10px"><h5><?=$lang['Total+Agents+revenue']?></h5><span style="font-size:8px"><?php if (NET_REVENUE=='1'){echo '(bets-wins)*share';}else{echo '(bets*share)';}?></span></td>
            <td width="6%" class="top acenter"><h5><?=$lang['Remaining+Profit']?></h5></td>
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
					$bets = getMyPlayers('bet',$fdate,$tdate,'admin',true);
					if ($bets<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($bets,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$datefilter ='';
					$won = getMyPlayers('won',$fdate,$tdate,'admin',true);
					if ($won<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($won,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td> 
                    <!-- NET PROFIT -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$datefilter ='';
					$NETprofit = $bets - $won;
					if ($NETprofit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($NETprofit,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>      
                    <!-- total won by agent's players and wins from bets made by agent from ADMIN Panel--> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$profit = getMyProfit('bet',$fdate,$tdate,'admin',true);
					if ($profit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($profit,2).' '.$_SESSION['currency'].'</span>';
					?>
             		</td>     
 					<!-- subagents total share --> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$counter =0;
					$checked = array();
					$subagentsShare = admin_pay($fdate,$tdate);
					if ($subagentsShare<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($subagentsShare,2).' '.$_SESSION['currency'].'</span>';
					?>
              </td>   
                    <!-- remaining profit -->     
                    <td class="acenter cash">
					<?php 
					$style = '';
					if ($subagentsShare<0){$subagentsShare = 0;}
					$totalRevenue = $profit - $subagentsShare;
					if ($totalRevenue<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($totalRevenue,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>
                    </tr></table>
                    <br />
                        <h2><?=$lang['All+time']?> <?=$lang['earnings']?></h2>
            <table>
            <tr>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['Total+Amount+Bet+by+Players']?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['Total+Amount+Won+by+Players']?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=strtoupper($lang['NET+PROFIT'])?></h5></td>
            <td width="9%" class="top acenter" style="font-size:10px"><h5><?=$lang['RESERVED+AS+PROFIT']?><br>
<?=$lang['from+each+bet']?></h5>              <span style="font-size:8px">BET*(100%-Payout%)</span></td>
            <td width="6%" class="top acenter"style="font-size:10px"><h5><?=$lang['Total+Agents+revenue']?></h5></td>
            <td width="6%" class="top acenter"><h5><?=$lang['Remaining+Profit']?></h5></td>

</tr>
<tr>
					<td class="acenter cash">
					<?php 
					//ALL TIME EARNINGS
					$style = '';
					$datefilter ='';
					$all = true;
					$bets = getMyPlayers('bet','0','0','admin',true);
					if ($bets<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($bets,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>   
                    <td class="acenter cash">
					<?php 
					$style = '';
					$datefilter ='';
					$all = true;
					$won = getMyPlayers('won','0','0','admin',true);
					if ($won<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($won,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>  
                    <!-- NET PROFIT -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$datefilter ='';
					$NETprofit = $bets - $won;
					if ($NETprofit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($NETprofit,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>       
                    <!-- total won by agent's players and wins from bets made by agent from ADMIN Panel--> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$profit = getMyProfit('bet','0','0','admin',true);
					if ($profit<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($profit,2).' '.$_SESSION['currency'].'</span>';
					?>
                  </td>  
                  <!-- revenue from subagents --> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$counter =0;
					$checked = array();
					$subagentsShare = admin_pay('2000-01-01',date('Y-m-d H:i:s',time()+186400));
					if ($subagentsShare<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($subagentsShare,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>   
                    <!-- total revenue profit*rake -->     
                    <td class="acenter cash">
					<?php 
					$style = '';
					if ($subagentsShare<0){$subagentsShare = 0;}
					$totalRevenue = $profit - $subagentsShare;
					if ($totalRevenue<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($totalRevenue,2).' '.$_SESSION['currency'].'</span>';
					?>
                    </td>
                    </tr></table>
   </div>