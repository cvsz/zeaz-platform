
<span style="color:red"><?=$lang['NOTE']?>: Deleting an user will delete all tickets,withdrawals,deposits,bets,transfers and gameplays. However this can influence the agent/operator earnings and affect your casino! It is better to just LOCK an user!</span>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" />
    <h6><?=$lang['List+Users']?></h6>
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
<?php
$vipMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT vipmode FROM cws_settings"),0); // check if VIP mode is enabled
?>                            
<table cellpadding="0" cellspacing="0" border="0" class="display dTable">
<thead>
<tr>
<th width="5%" class="top acenter"><div style="min-width:50px">ID<br /><?=show_order_by('um_list_u','u.id')?></div></th>
<th width="20%" class="top acenter"><?=$lang['Username']?><?=show_order_by('um_list_u','login')?><br /><span style="font-size:9px">(<?=$lang['click+username+for+more+details']?>)</span></th>
<th width="10%" class="top acenter"><?=$lang['Password']?><br /><?=show_order_by('um_list_u','pass')?></th>
<th width="5%" class="top acenter"><?=$lang['Name']?>/<?=$lang['Email']?><br /><?=show_order_by('um_list_u','name')?></th>
<th width="5%" class="top acenter"> <?=$lang['Register+date']?><br /><?=show_order_by('um_list_u','date')?></th>
<th width="5%" class="top acenter"><?=$lang['Owner']?><br /><?=show_order_by('um_list_u','owner')?></th>
<?php if (AFFILIATES==1){?>
<th width="50" class="top acenter"><?=$lang['Affiliated+by']?><br /><?=show_order_by('um_list_u','aff_id')?><br /><span style="font-size:9px">(<?=$lang['click+username+for+affiliate+details']?>)</span></th>
<?php }?>
<th width="5%" class="top acenter"><?=$lang['Status']?><br /><?=show_order_by('um_list_u','status')?></th>
<th width="10%" class="top acenter">*<?=$lang['Is+logged+in']?> ?</th>
<th width="10%" class="top acenter"><?=$lang['Last']?> <?=$lang['log+in']?> IP/<?=$lang['Date']?></th>
<th width="5%" class="top acenter"><?=$lang['Balance']?><br /><?=show_order_by('um_list_u','cash')?></th>
<?php if ($vipMode=='1'){?>
<th width="10%" class="top acenter">VIP Points<br /><?=show_order_by('um_list_u','vipPoints')?><br /><span style="font-size:9px;color:green">100 VPP=1$</span></th>
<?php }?>
<th width="5%" class="top acenter"><div style="min-width:70px"><?=$lang['Total']?> <?=$lang['Bet']?></div></th>
<th width="5%" class="top acenter"><div style="min-width:70px"><?=$lang['Total']?> <?=$lang['Won']?></div></th>
<th width="20%" class="top acenter"><div style="min-width:80px"><?=$lang['Player']?> NET <?=$lang['Profit']?></div></th>
<?php if ($stafftype=='admin'){?>
<th width="20%" class="top acenter"><div style="min-width:80px"><?=$lang['Reserved+for']?> <br /><?=$lang['CASINO+PROFIT']?><br /><span style="font-size:8px">BET*(100%-Payout%)</span></div></th>
<?php }?>
<th width="20%" class="top acenter"><?=$lang['Management']?> </th>
</tr>	
</thead>
<tbody>  	 
<?php
$page = antisqli($_POST['page']);
if (!isset($page) ||empty($page)){$page = 1;}
$datefilter ='';
if (strlen($_POST['fromdate'])>0){
						$_POST['fromdate'] = date('Y-m-d H:i:s',strtotime(antisqli($_POST['fromdate']))); 
						$fromdate = "AND date>='".antisqli($_POST['fromdate'])."'";
						$fromdateC = "AND date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND date>='2000-01-01'";
						$fromdateC = "AND date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate'])+86400);
						$todate = "AND date<='".$tdate."'";
						$todateC = "AND date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
						$todateC = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
					}
if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
$page = antisqli($_POST['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='date';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='DESC';}
if ($_POST['dup_reg']==1){
	$dup_reg = 'AND ip_reg IN (SELECT ip_reg FROM cws_users_info WHERE LENGTH(ip_reg)>7 GROUP BY ip_reg HAVING COUNT(*)>1)';
	$orderby='ip_reg';
}
if ($_POST['dup_login']==1){
	$dup_login = 'AND ip_last IN (SELECT ip_last FROM cws_users_info WHERE LENGTH(ip_reg)>7  GROUP BY ip_last HAVING COUNT(*)>1)';
	$orderby='ip_last';
}
if (AFFILIATES==1){
	if (isset($_POST['aff_id']) && strlen($_POST['aff_id'])>0 && is_numeric($_POST['aff_id'])){
		$affsearch = " AND `aff_id`='".antisqli($_POST['aff_id'])."' ";
	}
	if ($_POST['is_affiliate']==1){
		$is_aff = " HAVING nrAffs>0 ";	
	}
}

if (isset($_POST['searchemail'])&&strlen($_POST['searchemail'])>0){$searchemail= str_replace('*','%',"AND `email` LIKE '".antisqli($_POST['searchemail'])."'");}

if ($_SESSION['adminlvl']=='admin' && !isset($_POST['owner'])) {
	if (isset($_POST['search'])&&strlen($_POST['search'])>0){$typeL= str_replace('*','%',"AND `login` LIKE '".antisqli($_POST['search'])."'");}
	$pquery = "SELECT *,(SELECT COUNT(*) FROM `cws_users_info` WHERE `aff_id`=u.`id`) AS nrAffs FROM `cws_users` u INNER JOIN `cws_users_info` ON `u`.`id`=`cws_users_info`.`id` WHERE 1=1  $affsearch $searchemail $typeL $dup_login $dup_reg $is_aff ORDER BY $orderby $ordertype";
	$query = $pquery." LIMIT $l1,$perpage";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
}else {
	if (isset($_POST['search'])&&strlen($_POST['search'])>0){$typeL= str_replace('*','%',"AND `login` LIKE '".antisqli($_POST['search'])."'");}
	$pquery = "SELECT *,(SELECT COUNT(*) FROM `cws_users_info` WHERE `aff_id`=u.`id`) AS nrAffs FROM `cws_users` u INNER JOIN cws_users_info ON u.id=cws_users_info.id WHERE 1=1 $thefilter $affsearch $searchemail $typeL $dup_login $dup_reg $is_aff ORDER BY $orderby $ordertype";
	$query = $pquery." LIMIT $l1,$perpage";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
}
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="10">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;	
while ($row = mysqli_fetch_array($sql)) {
	$o++;
	if (strlen($row['country'])<2){
		$row['country'] = 'unknown';
	}
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><a onclick="javascript:showparam('st_player','login=<?=$row['login']?>');" href="#show"><?=$row['login']?></a><br /><img src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/images/flags/<?=$row['country']?>.png" alt="Country <?=$row['country']?>" title="Country <?=$row['country']?>"/></strong></td>
                    <td class="acenter"><a href="#showPw" onclick="showPopup('<?php if ($row['fb_login']=='no'){echo pass_decode($row['pass']);}else{ echo 'N/A';}?>')" class="button">**********<br />(<?=$lang['click+to+show']?>)</a></td>
                    <td class="acenter"><?=$row['name']?><br /> <strong><?=$row['email']?></strong></td>
                    <?php if ($_POST['dup_reg']==1){
						if (!isset($ci)){
							$ci = 0;
						}
						if ($row['ip_reg']!==$prev_ip){
							$prev_ip = $row['ip_reg'];
							$ci++;
						}
						if ($ci%2==0){
							$col = '#FF0000';
						}else{
							$col = '#FF99FF';
						}
					}
					?>
                    <td class="acenter time" <?php if ($_POST['dup_reg']==1){echo 'style="border:2px solid '.$col.'"';}?>>
                        <strong><?=$row['date']?></strong>
                        <br />
                        <span style="color:orange;font-size:9px;font-weight:bold">
                        <?php if (strlen($row['ip_reg'])>0){echo $row['ip_reg'];}else{echo 'IP N/A';}?>
                        </span>
                    </td>
                    <td class="acenter"><span style="font-weight:bold">
					<?php if ($row['owner']!=='admin'){?>
                    <a onclick="javascript:showparam('um_list_u','owner=<?=$row['owner']?><?php if (strlen($_POST['todate'])>0){echo '&'.$_POST['todate'];}?><?php if (strlen($_POST['fromdate'])>0){echo '&'.$_POST['fromdate'];}?>');" style="font-size:12px;font-style:italic" href="#show"><?=$row['owner']?></a>
                    <?php }else{ echo $row['owner'];}?></span></td>
                    
                    <?php if (AFFILIATES==1){?>
                    <td class="acenter"><span style="font-weight:bold">
					<?php if (strlen($row['aff_id'])>0){?>
                    <a onclick="javascript:showparam('um_list_u','search=<?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='{$row['aff_id']}'"),0)?>');" style="font-size:12px;font-style:italic" href="#show">User #<?=$row['aff_id']?></a>
                    <?php }else{ echo 'N/A';}?></span>
                    </td>
                    <?php }?>
                    
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">'.$lang['Enabled'].'</span></td>';break;
						case 2:echo '<td class="acenter negative"><span style="color:red">'.$lang['Suspended'].'</span></td>';break;
						case 3:echo '<td class="acenter negative"><span style="color:red">'.$lang['Locked'].'</span></td>';break;
						case 4:echo '<td class="acenter negative"><span style="color:red">'.$lang['Closed'].'</span></td>';break;
						default:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
					}?>
                    <td class="acenter"><strong>
					<?php
                    $loggedin = checkloggedin($row['login']);
					if ($loggedin=='yes'){
						echo '<span style="color:red">'.$lang['Yes'].'</span><br /><span style="font-size:9px">'.$row['ip_last'].'</span><br />
							  <a onclick="javascript:showparam(\'um_list_u\',\'logout='.$row['id'].'\');" href="#show">Log Out</a>'; 
					}else {
						echo '<span style="color:black">'.$lang['No'].'</span>';
					}
					?>
                    </strong></td>
                    <?php if ($_POST['dup_login']==1){
						if (!isset($ci)){
							$ci = 0;
						}
						if ($row['ip_last']!==$prev_ip){
							$prev_ip = $row['ip_last'];
							$ci++;
						}
						if ($ci%2==0){
							$col = '#FF0000';
						}else{
							$col = '#FF99FF';
						}
					}
					?>
                    <td class="acenter" <?php if ($_POST['dup_login']==1){echo 'style="border:2px solid '.$col.'"';}?>>
                    <strong><span style="color:orange;font-size:12px;"> <?php if (strlen($row['ip_last'])>0){echo $row['ip_last'];}else{echo 'IP N/A';}?></span><br /><span style="color:#09C;font-size:9px;"><?=$row['last_activity']?></span></strong>
                    </td>
                    <td class="acenter cash"><?php if(($row['cash'])<0){echo '<span style="color:red">';}else{echo '<span>';}echo (cash_format_cws($row['cash'],2)).''.$_SESSION['currency'].'</span>';?></td>
                    <?php if ($vipMode=='1'){?>
                    <td class="acenter cash"><?php echo (cash_format_cws($row['vipPoints'],2)).' VPP';?></td>
                    <?php }?>
                    <td class="acenter cash">
					<?php 
					$query = "(SELECT COALESCE(SUM(bet),0) AS bet FROM cws_gameplays WHERE user='{$row['login']}' AND mode='real' $todateC $fromdateC)";
					if ($rouletteAm==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_roulette_am_bets WHERE user='{$row['login']}' AND mode='real' $todateC $fromdateC)";
					}
					if ($rouletteEu==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_roulette_eu_bets WHERE user='{$row['login']}' AND mode='real' $todateC $fromdateC)";
					}
					if ($RacesOn==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_race_tickets WHERE owner='{$row['login']}' $todateC $fromdateC)";
					}
					if ($SicBo==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_sicbo_bets WHERE user='{$row['login']}' $todateC $fromdateC)";
					}
					$sqlx = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
					$bet = 0;
					while($total_bet = mysqli_fetch_array($sqlx)){
						$bet += $total_bet[0];
						//echo '&bet='.$total_bet[0];
					}
					if($bet<0){echo '<span style="color:red">';}else{echo '<span>';}echo cash_format_cws($bet,2).''.$_SESSION['currency'].'</span>';?>
                    </td>
                    <td class="acenter cash">
					<?php 
					$query = "(SELECT COALESCE(SUM(won),0) AS bet FROM cws_gameplays WHERE user='{$row['login']}' $todateC $fromdateC)";
					if ($rouletteAm==1){
						$query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_roulette_am_bets WHERE user='{$row['login']}' $todateC $fromdateC)";
					}
					if ($rouletteEu==1){
						$query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_roulette_eu_bets WHERE user='{$row['login']}' $todateC $fromdateC)";
					}
					if ($RacesOn==1){
						$query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_race_tickets WHERE owner='{$row['login']}' $todateC $fromdateC)";
					}
					if ($SicBo==1){
						$query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_sicbo_bets WHERE user='{$row['login']}' $todateC $fromdateC)";
					}
					
					$sqlx = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
					$won = 0;
					while($total_win = mysqli_fetch_array($sqlx)){
						$won += $total_win[0];
					}
					if($won<0){echo '<span style="color:red">';}else{echo '<span>';}echo cash_format_cws($won,2).''.$_SESSION['currency'].'</span>';?>
                    </td>
                    <!-- player profit -->
                    <td class="acenter cash">
					<?php 
					$pprofit = $won - $bet;
					if($pprofit<0){echo '<span style="color:red">';}else{echo '<span>';}echo cash_format_cws($pprofit,2).''.$_SESSION['currency'].'</span>';?>
                    </td>
                    <!-- company profit -->
                    <?php if ($stafftype=='admin'){?>
                    <td class="acenter cash">
					<?php 
					//calculate profit of company
					$payout = 'payout';
					$query = "(SELECT COALESCE(SUM(bet*(100-$payout)/100),0) AS bet FROM cws_gameplays WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
					if ($rouletteAm==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet*(100-$payout)/100),0)  AS bet FROM cws_roulette_am_bets WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
					}
					if ($rouletteEu==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet*(100-$payout)/100),0)  AS bet FROM cws_roulette_eu_bets WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
					}
					if ($RacesOn==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet*(100-$payout)/100),0)  AS bet FROM cws_race_tickets WHERE owner='{$row['login']}' $todate $fromdate)";
					}
					if ($SicBo==1){
						$query .= "UNION(SELECT COALESCE(SUM(bet*(100-$payout)/100),0)  AS bet FROM cws_sicbo_bets WHERE user='{$row['login']}' $todate $fromdate)";
					}
					$sqlx = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
					$profit = 0;
					while($total_pr = mysqli_fetch_array($sqlx)){
						$profit += $total_pr[0];
						//echo '&bet='.$total_bet[0];
					}
					//end of calculate profit of player
					if($profit<0){echo '<span style="color:red">';}else{echo '<span>';}echo cash_format_cws($profit,2).''.$_SESSION['currency'].'</span>';?>
                    </td>
                    <?php }?>
                    <td class="acenter">
                    <div class="manageTd">
                    <?php if ($row['status']=='1') { 
						echo '<a onclick="javascript:showparam(\'um_list_u\',\'status=2&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';
					}elseif($row['status']!=='3' ||$_SESSION['adminlvl']=='admin'){ 
						echo '<a onclick="javascript:showparam(\'um_list_u\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';
						}
						?> 
                        <a onclick="javascript:showparam('um_edit_u','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a>
                        <?php if ($_SESSION['adminlvl']=='admin'){?><a onclick="javascript:delete_person('<?=$row['id']?>')" href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a><?php } ?>
</div>
</td>
               				  </tr>
	<?php
    }
}
?>
<tr><td colspan="15"><span style="font-size:10px">*<?=$lang['NOTE']?> : <?=$lang['If+user+closes+browser']?>, <?=$lang['he+will+still+remain+logged+in+for+the+next+30+minutes']?></span></td></tr>
</tbody>
</table>
<?php
include('_inc_pages.inc.php');
?>
</div>