<?php
//this php file displays all the statistics related to money , from the casino 
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
<h3 style="margin-left:10px;"><?=$lang['Transaction']?> <?=$lang['Statistics']?></h3>
<?php
if ($_SESSION['adminlvl']!=='admin'){
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND (SELECT owner FROM cws_users WHERE user=login) IN ($subAgents)";
	$thefilterNormal = " AND owner IN ($subAgents)";
}
?> 
<?php
$total_gameplays_real = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays WHERE mode='real' $thefilter"),0);
$total_gameplays_won = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays WHERE won>0 AND mode='real' $thefilter"),0);
$total_gameplays_lost = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays WHERE won=0 AND mode='real' $thefilter"),0);
$query = "SELECT SUM(won) FROM cws_gameplays WHERE mode='real'"; 
$result = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_winnings=$row['SUM(won)'];
if ($total_winnings=="")
{
$total_winnings="0.00";
}
$query = "SELECT SUM(bet) FROM cws_gameplays WHERE mode='real' $thefilter"; 
	 
$result = mysqli_query($GLOBALS['con'],$query) or error_report('3_'.mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_losses=$row['SUM(bet)'];
if ($total_losses=="")
{
$total_losses="0.00";
}
$total_profit = - ($total_winnings - $total_losses);
$total_deposits=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE status='1' $thefilter"));
$total_withdrawals=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_withdrawals WHERE status='1' $thefilter"));
$query = "SELECT SUM(amount) FROM cws_deposits WHERE status='1' $thefilter"; 
	 
$result = mysqli_query($GLOBALS['con'],$query) or error_report('4_'.mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_deposit_amount=$row['SUM(amount)'];
if ($total_deposit_amount=="")
{
$total_deposit_amount="0.00";
}
$query = "SELECT SUM(amount) FROM cws_withdrawals WHERE 1=1 $thefilter"; 

$result = mysqli_query($GLOBALS['con'],$query) or error_report('5_'.mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_withdrawal_amount=$row['SUM(amount)'];
if ($total_withdrawal_amount=="")
{
$total_withdrawal_amount="0.00";
}
$total_members=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login <>'guestlogin' $thefilterNormal"));
$total_members_active=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE status ='1' AND login <>'guestlogin' $thefilterNormal"));
$total_members_inactive=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE status ='0' $thefilterNormal"));
$total_members_suspended=mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE (status ='2' OR status ='3') $thefilterNormal"));
$query = "SELECT SUM(cash) FROM cws_users WHERE login <>'guestlogin' $thefilterNormal"; 
	 
$result = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_account_balances=$row['SUM(cash)'];
if ($total_account_balances=="")
{
$total_account_balances="0.00";
}
$query = "SELECT SUM(cash) FROM cws_users WHERE (status<>0) $thefilterNormal"; 
$result = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
// Print out result
$row = mysqli_fetch_array($result);
$total_account_balances_hold=$row['SUM(cash)'];
if ($total_account_balances_hold=="")
{
	$total_account_balances_hold="0.00";
}
$total_members_zero = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_users WHERE cash ='0' $thefilterNormal"),0);
$total_members_positive = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_users WHERE cash >'0' AND login <>'guestlogin' $thefilterNormal"),0);
?>
<div id="tables">
<table class="editTable" cellspacing="0" cellpadding="5" width="100%" border=0>
<tbody>
<tr>
<td class="top" colspan="4"><?=$lang['CASINO+ACTIVITY']?> </td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL+GAMEPLAYS']?>: <strong><?php  echo $total_gameplays_real; ?></strong> </div></td>
<td class="tabledata" colspan="3"><div align="center"><?=$lang['TOTAL+GAMES+WON']?> : <strong><?php  echo $total_gameplays_won; ?></strong> </div></td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL+GAMES+LOST']?> :<strong><?php  echo $total_gameplays_lost; ?></strong></div></td>
<td colspan="3" class="tabledata"><div align="center"><?=$lang['TOTAL+PROFIT']?>: <span class="cash"><?=cash_format_cws(getMyProfit('bet','0','0','admin',true),2).''.$_SESSION['currency']?> </span> </div></td>
</tr>
<tr>
<td colspan="4">
</td>
<tr>
<td class="top" colspan="4"><?=$lang['DEPOSITS']?>&amp;<?=$lang['WITHDRAWALS']?> </td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['DEPOSITS']?>: <strong><?php  echo $total_deposits; ?></strong> </div></td>
<td class="tabledata" colspan="3"><div align="center"><?=$lang['TOTAL']?> <?=$lang['WITHDRAWALS']?> :<strong><?php  echo $total_withdrawals; ?></strong></div></td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['DEPOSIT']?> <?=$lang['AMOUNT']?>  : <span class="cash"><strong><?php  echo cash_format_cws($total_deposit_amount,2); ?> <?=$_SESSION['currency']?></strong></span></div></td>
<td colspan="3" class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['WITHDRAWAL']?> <?=$lang['AMOUNT']?> : <span class="cash"><?php  echo cash_format_cws($total_withdrawal_amount,2); ?><?=$_SESSION['currency']?></span> </div></td>
</tr>
<tr>
<td class="top" colspan="4"><?=$lang['MEMBER']?> <?=$lang['STATISTICS']?> </td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['MEMBERS']?>:  <strong><?php  echo $total_members; ?></strong> </div></td>
<td class="tabledata" colspan="3"><div align="center"><?=$lang['ACTIVE']?> <?=$lang['MEMBERS']?>:  <strong><?php  echo $total_members_active; ?></strong> </div></td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['SUSPENDED']?> <?=$lang['MEMBERS']?>: <span class="style3"><?php  echo $total_members_suspended; ?></span></div></td>
<td colspan="3" class="tabledata"><div align="center"><?=$lang['INACTIVE']?> <?=$lang['MEMBERS']?>: <span class="style3"><?php  echo $total_members_inactive; ?> </span></div></td>
</tr>
<tr>
<td class="top" colspan="4"><?=$lang['USER+ACCOUNT+BALANCES']?></td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['MONEY+IN+USER+ACCOUNTS']?>: <span class="cash"><?php  echo cash_format_cws($total_account_balances,2); ?> <?=$_SESSION['currency']?></span> </div></td>
<td class="tabledata" colspan="3"><div align="center"><?=$lang['MEMBERS+WITH+ZERO+ACCOUNT+BALANCE']?>: <strong><?php  echo $total_members_zero; ?> </strong></div></td>
</tr>
<tr>
<td class="tabledata"><div align="center"><?=$lang['MEMBERS+WITH+POSITIVE+ACCOUNT+BALANCE']?>: <span class="listheader"><?php  echo $total_members_positive; ?></span></div></td>
<td colspan="3" class="tabledata"><div align="center"><?=$lang['TOTAL']?> <?=$lang['FUNDS+ON+HOLD']?>: <span class="cash"><?php  echo cash_format_cws($total_account_balances_hold,2); ?> <?=$_SESSION['currency']?> </span></div></td>
</tr>
</tbody></table>
</div>
