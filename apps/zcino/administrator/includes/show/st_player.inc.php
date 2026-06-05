<?php
//this php file lists all the users of the current logged in staff
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

<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?>

<a href="#" style="font-weight:bold;font-size:12px;padding:8px" onclick="javascript:showparam('st_player','login=<?=antisqli($_POST['login'])?>');"><span style="font-style:italic;color:blue"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?><img class="titleIcon" alt="" src="images/icons/dark/refresh3.png" style="vertical-align:middle"></span></a>

</div><br /><br /><br /><br /><br /> 


<form name="form" class="form"  onsubmit="return false" style="text-align:left">
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

<div class="formRow" style="padding-left:50px">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
<br />
</div>
<script type="text/javascript">
function delete_person(id){
	var answer = confirm("NOTE: Deleting an user will delete all tickets,deposits,bets,transfers and gameplays. However this can influence the agent/operator earnings and affect your casino ! It is better to just LOCK an user !");
	if (answer){
		showparam('um_list_u','delete=1&id='+id);
	}
}
$("#search").click(function() {
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('st_player','&fromdate='+fromdate+'&todate='+todate+'&login=<?=antisqli($_POST['login'])?>');
							 });
</script>
</div>
</div>
</fieldset>
</form>
<br />
<div style="text-align:left">
<h3 style="margin-left:10px;">Player statistics - <span style="color:#09C"><?=antisqli($_POST['login'])?></span></h3>
</div>

<span style="color:red">
<?php
if ($_SESSION['adminlvl']!=='admin') {
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND owner IN ($subAgents)";
}
?>
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if($_SESSION['adminlvl']!=='admin'){
		$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='$id'"),0);
		if ($status=='3'){
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			exit;	
		}
		$squery = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE id='$id'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			$errormsg = $lang['Invalid+user'];
			echo $errormsg;
			exit;
		}
		$chkdList[] = $_SESSION['admin'];
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE '$owner' IN ($subAgents)"))==0 && $login!==$_SESSION['admin']){
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			exit;
		}
	}
	$status = antisqli($_POST['status']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='$status' WHERE `id`='$id'")) 
		{
		if ($_POST['status']==1) {
			echo $lang['User'].' #'.$id.' '.$lang['Activated'];
		} elseif ($_POST['status']==0) {
			echo $lang['User'].' #'.$id.' '.$lang['Suspended'];
		} elseif ($_POST['status']==2) {
			echo $lang['User'].' #'.$id.' '.$lang['Suspended'];
		}
	}
	if ($_SESSION['adminlvl']!=='admin') {
		$subAgents = "'".$_SESSION['admin']."',";
		getSubAgents($_SESSION['admin']);
		$subAgents = trim($subAgents,',');
		$thefilter = " AND owner IN ($subAgents)";
	}
} elseif (isset($_POST['delete']) && $_SESSION['adminlvl']=='admin') { 
		if($_SESSION['adminlvl']!=='admin'){
			die($lang['Invalid+action']);
		}
		if ($demoMode==1){
			die('You are not allowed to do this in demo mode');
		}
		$id = antisqli($_POST['id']);
		$login = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='$id'"),0);
		if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_users` WHERE `id`='$id'")) {
			mysqli_query($GLOBALS['con'],"DELETE FROM `cws_users_info` WHERE `id`='$id'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_gameplays WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_bonuses WHERE user='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_vdog_tickets_v2 WHERE owner='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_am_bets WHERE user='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_eu_bets WHERE user='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_race_tickets WHERE owner='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_sicbo_bets WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_deposits WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE receiver_id='$id' AND receiver_type='user'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE sender_id='$id' AND sender_type='user'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_shop_orders WHERE buyerid='$id'");
			echo $lang['User'].' #'.$id.' '.$lang['Deleted'];
		} else {
			echo $lang['User'].' #'.$id.' '.$lang['NOT+Deleted'];
		}
} elseif (isset($_POST['logout'])){
	if($_SESSION['adminlvl']!=='admin'){
			die($lang['Invalid+action']);
		}
		$id = antisqli($_POST['logout']);
		if (mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET logged_in='0' WHERE `id`='$id'")) {
			echo $lang['User'].' #'.$id.' '.$lang['LOGGED+OUT+successfully'];
		} else {
			echo $lang['User'].' #'.$id.' '.$lang['was+not+LOGGED+OUT'];
		}
}
?></span>
<div style="width:1500px">
<!-- table 1 start -->
	<div style="width:370px;float:left">
    <table width="350" style="border:0px solid #333;padding-right:30px">
    <thead>
    <tr><td colspan="2" class="top acenter"><h2><?=$lang['Personal']?></h2></td></tr>
    </thead>
    <tbody>  	 
    <?php
    if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
	$page = antisqli($_POST['page']);
	if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
	$perpage = antisqli($_POST['perpage']);
	$l1 = ($page-1) * $perpage;
	
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
                            $todate = "AND date<='".$tdate."'";
                            $datefilter .= '&todate='.$_POST['todate'];
                        }else {
                            $todate = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
                        }
    if (isset($_POST['login'])){
		$_POST['search'] = antisqli($_POST['login']);
	}
    if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='login';}
    if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
    if ($_SESSION['adminlvl']=='admin' && !isset($_POST['owner'])) {
        if (isset($_POST['search'])&&strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `login` LIKE '".antisqli($_POST['search'])."'");}
        $pquery = "SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE 1=1 $type ORDER BY $orderby $ordertype";
        $query = $pquery." LIMIT $l1,$perpage";
        $sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
    }else {
        if (isset($_POST['search'])&&strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `login` LIKE '".antisqli($_POST['search'])."'");}
        $pquery = "SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE 1=1 $thefilter $type ORDER BY $orderby $ordertype";
        $query = $pquery." LIMIT $l1,$perpage";
        $sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
    }
    if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="10">'.$lang['No+results+found'].'</td></tr>';exit;}
    $row = mysqli_fetch_array($sql);
    ?>
    <tr class="odd">
        <td class="top acenter">ID</td>
        <td class="top acenter"><?=$row['id']?></td>
    </tr>
    <tr>
        <td class="top acenter"><?=$lang['Username']?></td>
        <td class="top acenter"><strong><?=$row['login']?></strong></td>
    </tr>
    <tr class="odd">
        <td class="top acenter"><?=$lang['Password']?></td>
        <td class="top acenter"><?php echo pass_decode($row['pass']);?></td>
    </tr>
    <tr>
        <td  class="top acenter"><?=$lang['Email']?></td>
        <td class="top acenter"><strong><?=$row['email']?></strong></td>
    </tr>
    <tr class="odd">
        <td  class="top acenter"><?=$lang['Name']?></td>
        <td class="top acenter"><?=$row['name']?></td>
    <tr>
        <td class="top acenter"><?=$lang['Register+date']?></td>
        <td class="top acenter" style="color:blue"><strong><?=$row['date']?></strong></td>
    </tr>
    <tr class="odd">
        <td class="top acenter"><?=$lang['Created+By']?></td>
        <td class="top acenter"><strong><?php if (strlen($row['owner'])>0){echo $row['owner'];}else{ echo '<span style="color:red">N/A</span>';}?></strong></td>
    </tr>
    <tr>
    <td  class="top acenter"><?=$lang['Status']?></td>
    <?php switch ($row['status']) { 
        case 0:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
        case 1:echo '<td class="acenter positive"><span style="color:green">'.$lang['Enabled'].'</span></td>';break;
        case 2:echo '<td class="acenter negative"><span style="color:red">'.$lang['Suspended'].'</span></td>';break;
        case 3:echo '<td class="acenter negative"><span style="color:red">'.$lang['Locked'].'</span></td>';break;
        case 4:echo '<td class="acenter negative"><span style="color:red">'.$lang['Closed'].'</span></td>';break;
        default:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
    }?>
    </tr>
    <tr class="odd">
        <td class="top acenter"><?=$lang['Security+answer']?></td>
        <td class="top acenter"><a href="#" onclick="showPopup2('<?=strlen($row['secans'])>0?$row['secans']:''?>')" style="font-weight:bold;color:#09F">(<?=$lang['click+for+details']?>)</a></td>
    </tr>
    <?php if (AFFILIATES==1){?>
    <tr class="odd">
        <td class="top acenter"><?=$lang['Affiliated+by']?></td>
        <td class="top acenter"><strong><?php if (strlen($row['aff_id'])>0){echo $row['aff_id'];}else{ echo '<span style="color:red">N/A</span>';}?></strong></td>
    </tr>
    <?php }?>
    <tr class="odd">
        <td  class="top acenter">*<?=$lang['Logged+in']?> </td>
        <td class="top acenter"><strong>
        <?php
        $loggedin = checkloggedin($row['login']);
        if ($loggedin=='yes'){
            echo '<span style="color:red">'.$lang['Yes'].'</span><br /><span style="font-size:9px">'.$row['ip_last'].'</span><br />'; 
        }else { 
            echo '<span style="color:black">'.$lang['No'].'</span>';
        }
        ?>
        </strong></td>
    </tr>
    </tbody>
    </table>
    </div>

<!-- table 2 start -->
<div style="width:370px;float:left">
    <table width="350" style="border:0px solid #333;padding-right:30px">
    <thead>
        <tr>
            <td colspan="2" class="top acenter"><h2><?=$lang['Financial']?></h2></td>
        </tr>
    </thead>
    <tbody>        
    <tr class="odd">            
        <td class="top acenter"><?=$lang['Cash']?></td>
        <td class="top acenter cash"><?php if(($row['cash'])<0){echo '<span style="color:red">';}else{echo '<span>';}echo (cash_format_cws($row['cash'])).' '.$_SESSION['currency'].'</span>';?></td>
    </tr>
    
    <tr>   
    <td class="top acenter"><?=$lang['Total+Amount+Deposited']?></td> 
    <td class="top acenter cash">
    	<?=cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE user='{$row['login']}' AND status='1'"),0),2)?> <?=$_SESSION['currency']?>
    </td>
    </tr>
    
     <tr>   
    <td class="top acenter"><?=$lang['Total+Amount+Withdrawn']?></td> 
    <td class="top acenter cash">
    	<?=cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_withdrawals WHERE user='{$row['login']}' AND status='1'"),0),2)?> <?=$_SESSION['currency']?>
    </td>
    </tr>
    
    <tr>   
    <td class="top acenter"><?=$lang['Total']?> <?=$lang['Bet']?></td> 
    <td class="top acenter cash">
    <?php 
    $query = "(SELECT COALESCE(SUM(bet),0) AS bet FROM cws_gameplays WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
    if ($rouletteAm==1){
        $query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_roulette_am_bets WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
    }
    if ($rouletteEu==1){
        $query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_roulette_eu_bets WHERE user='{$row['login']}' AND mode='real' $todate $fromdate)";
    }
	if ($RacesOn==1){
        $query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_race_tickets WHERE owner='{$row['login']}' $todate $fromdate)";
    }
	if ($SicBo==1){
        $query .= "UNION(SELECT COALESCE(SUM(bet),0)  AS bet FROM cws_sicbo_bets WHERE user='{$row['login']}' $todate $fromdate)";
    }
    $sqlx = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
    $bet = 0;
    while($total_bet = mysqli_fetch_array($sqlx)){
        $bet += $total_bet[0];
        //echo '&bet='.$total_bet[0];
    }
	
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
	
	
	
    if($bet<0){echo '<span style="color:red">';}else{echo '<span>';}echo  cash_format_cws($bet,2).' '.$_SESSION['currency'].'</span>';?>
    </td>
    </tr>
    
    
    
    <tr class="odd">
    <td class="top acenter"><?=$lang['Total']?> <?=$lang['Won']?></td>
    <td class="top acenter cash">
    <?php 
    $query = "(SELECT COALESCE(SUM(won),0) AS bet FROM cws_gameplays WHERE user='{$row['login']}' $todate $fromdate)";
    if ($rouletteAm==1){
        $query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_roulette_am_bets WHERE user='{$row['login']}' $todate $fromdate)";
    }
    if ($rouletteEu==1){
        $query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_roulette_eu_bets WHERE user='{$row['login']}' $todate $fromdate)";
    }
	if ($RacesOn==1){
        $query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_race_tickets WHERE owner='{$row['login']}' $todate $fromdate)";
    }
	if ($SicBo==1){
        $query .= "UNION(SELECT COALESCE(SUM(sum_won),0)  AS bet FROM cws_sicbo_bets WHERE user='{$row['login']}' $todate $fromdate)";
    }
    
    $sqlx = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
    $won = 0;
    while($total_win = mysqli_fetch_array($sqlx)){
        $won += $total_win[0];
    }
    if($won<0){echo '<span style="color:red">';}else{echo '<span>';}echo  cash_format_cws($won,2).' '.$_SESSION['currency'].'</span>';?>
    </td>
    </tr>
    
    
    
    <tr>
    <td class="top acenter"><?=$lang['Total']?> <?=$lang['Player']?> <?=$lang['Profit']?></td>
    <td class="top acenter cash">
    <?php 
    $profit = $won-$bet;
    if($profit<0){echo '<span style="color:red">';}else{echo '<span>';}echo  cash_format_cws($profit,2).' '.$_SESSION['currency'].'</span>';?>
    </td>
    </tr>
    <?php if ($_SESSION['adminlvl']=='admin'){?>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Reserved+for']?> <br /><?=$lang['CASINO+PROFIT']?><br /><span style="font-size:8px">BET*(100%-Payout%)</span></td>
    <td class="top acenter cash">
    <?php 
    if($profit<0){echo '<span style="color:red">';}else{echo '<span>';}echo  cash_format_cws($profit,2).' '.$_SESSION['currency'].'</span>';?>
    </td>
    </tr>
    <?php }?>
    
    <tr>
    <td class="top acenter"> VIP Points</td>
    <td class="top acenter cash"><?=$bet/100?> <br /><span style="font-size:8px"> 100 <?=$_SESSION['currency']?> bet = 1 VIP Points</span></td>
    </tr>
</tbody>
</table>
</div>
<div style="width:270px;float:left">
<!-- table 3 start -->
<?php if (AFFILIATES==1){

//consider aff revenue percentage - OK
//consider AFF NET_REVENUE - OK
//consider NCO and calculate per month - OK
$aff_settings = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_affiliate_settings"));
$aff_rev = get_aff_revenue($row['id']);
$aff_last = get_aff_revenue_perm($row['id'],date('Y-m-d',strtotime("-1 month")));
$aff_this = get_aff_revenue_perm($row['id'],date('Y-m-d'));
$caplayers = count_active_players($row['id'],$row['mrp_months'],$row['mrp_dep']);
$total_aff_paid = total_aff_paid($row['id']);
?>
<table width="250" style="border:0px solid #333;padding-right:30px">
    <thead>
        <tr>
            <td colspan="2" class="top acenter"><h2><?=$lang['Affiliate+center']?></h2></td>
        </tr>
    </thead>
    <tbody> 
    <tr>
    <td width="186" class="top acenter"><?=$lang['Number+of+players+affiliated']?></td>
    <td width="52" class="top acenter cash"><?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_users_info WHERE aff_id='{$row['id']}'"),0)?></span></td>
    </tr>
    
    <tr>
    <td class="top acenter"><?=$lang['Number+of+active+players+affiliated']?></td>
    <td class="top acenter cash"><?=$caplayers?>/<?=$aff_settings['mrp_players']?></span></td>
    </tr>
    
    <tr class="odd">
    <td class="top acenter"><?=$lang['Revenue+last+month+from+affiliated+players']?>:</td>
    <td class="top acenter cash" <?php if ($aff_rev<0){echo 'style="color:red"';}?>>
	<span style="font-weight:bold;<?php if ($aff_last<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_last,2);?><?=$_SESSION['currency']?>
    </td>
    </tr>
    
    <tr class="odd">
    <td class="top acenter"><?=$lang['Revenue+this+month+from+affiliated+players']?>:</td>
    <td class="top acenter cash">
	<span style="font-weight:bold;<?php if ($aff_this<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_this,2);?><?=$_SESSION['currency']?></span>
    </td>
    </tr>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Total+revenue+from+affiliated+players']?>:</td>
    <td class="top acenter cash">
    <span style="font-weight:bold;<?php if ($aff_this<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_this,2);?><?=$_SESSION['currency']?></span>
    </td>
    </tr>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Total+revenue+payments+received']?>:</td>
    <td class="top acenter cash">
	<span style="font-weight:bold;color:#0C3"><?php echo cash_format_cws($total_aff_paid,2);?><?=$_SESSION['currency']?></span> <span style="font-size:12px;font-weight:bold"><a href="#details" onclick="javascript:showparam('fn_transfers','player_search=<?=$row['id']?>&cash_out=1')">(<?=$lang['details']?>)</a></span>
    </td>
    </tr>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Last+payment+amount+received']?>:</td>
    <td class="top acenter cash">
	 <span style="font-weight:bold;color:#0C3"><?php echo cash_format_cws(last_payment_val($row['id']),2);?><?=$_SESSION['currency']?></span>
    </td>
    </tr>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Last+payment+date']?>:</td>
    <td class="top acenter cash">
	 <span style="font-weight:bold;color:#0C3"><span style="font-weight:bold;color:#930"><?php echo last_payment_date($row['id']);?></span></span>
    </td>
    </tr>
    <tr class="odd">
    <td class="top acenter"><?=$lang['Payment+status']?>:</td>
    <td class="top acenter cash">
	<?php if ($caplayers>=$aff_settings['mrp_players'] && $aff_rev>=0){ 
		echo '<span style="color:green">'.$lang['Eligible+for+payment'].': ';
		$to_pay = $aff_rev - $total_aff_paid;
		echo cash_format_cws($to_pay,2).$_SESSION['currency'].'</span>';
	?>
    <?php if ($to_pay>0){?>
    <br />
    <button onclick="javascript:showparam('transfer_funds_u','affpay=1&cash=<?=$to_pay?>&login=<?=$row['login']?>')"><?=$lang['SEND+CREDIT+PAYMENT']?></button>
    <?php }?>
    <?php
	}else{
		echo '<span style="color:red">Ineligible for payment</span>';
	}?>
    </td>
    </tr>
    </tbody>
    </table>
    <br /><br />
<?php }?>    
    <table width="250" style="border:0px solid #333;padding-right:30px">
    <thead>
    <tr><td colspan="2" class="top acenter"><h2><?=$lang['Management']?></h2></td></tr>
    </thead>
    <tbody>        
    <tr class="odd">  
    <td class="top acenter" colspan="2">
    <div class="manageTd">
                        <?php if ($row['status']=='1') { 
                            echo '<a onclick="javascript:showparam(\'st_player\',\'status=2&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;
                        }elseif($row['status']!=='3' ||$_SESSION['adminlvl']=='admin'){ 
                            echo '<a onclick="javascript:showparam(\'st_player\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';
                            }
                            ?> 
	</div>                            
    </td>
    </tr>
    <tr>  
    <td class="top acenter" colspan="2"> 
    <a onclick="javascript:showparam('um_edit_u','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a>
    </tr>
    <tr>  
    <td class="top acenter" colspan="2"> <?php if ($_SESSION['adminlvl']=='admin'){?><a onclick="javascript:delete_person('<?=$row['id']?>')"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a><?php } ?>
    </td>
    </tr>
    <tr>
    <td class="top acenter" colspan="2"><strong>
    *<?=$lang['Logged+in']?>: 
    <?php
    $loggedin = checkloggedin($row['login']);
    if ($loggedin=='yes'){
        echo '<span style="color:red">'.$lang['Yes'].'</span><br /><span style="font-size:9px">'.$row['ip_last'].'</span><br />
              <a onclick="javascript:showparam(\'st_player\',\'logout='.$row['id'].'&login='.$row['login'].'\');" href="#show">Log Out</a>'; 
    }else {
        echo '<span style="color:black">'.$lang['No'].'</span>';
    }
    ?>
    <span style="font-size:8px"><br /><br />*<?=$lang['NOTE']?> : <?=$lang['If+user+closes+browser']?>, <?=$lang['he+will+still+remain+logged+in+for+the+next+30+minutes']?></span>
    </strong></td>
    </tr>
    </tbody>
    </table>
</div>

<!-- table 4 start -->
<div style="width:270px;float:left">
<td valign="top" style="width:370px">
    <table width="250" style="border:0px solid #333;padding-right:30px">
    <thead>
    <tr><td colspan="2" class="top acenter"><h2><?=$lang['Games+Statistics']?></h2></td></tr>
    </thead>
    <tbody>        
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Biggest+bet']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT id , bet as result FROM cws_gameplays WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT CONCAT('R_AM',id) AS id ,bet AS result FROM cws_roulette_am_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,bet AS result FROM cws_roulette_eu_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT CONCAT('CAR',id) AS id ,bet AS result FROM cws_race_tickets WHERE owner='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT CONCAT('SICBO',id) AS id ,bet AS result FROM cws_sicbo_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$result = 0;
		while ($qqq = mysqli_fetch_array($querytxt)){
			if ($qqq['result']>$result){
				$result = $qqq['result'];
				$resultid = $qqq['id'];
			}
		}
		if($result<0){echo '<span style="color:red">';}else{echo '<span style="color:green">';}echo  cash_format_cws($result,2).' '.$_SESSION['currency'].'</span> <br /> <span style="color:black">Gameplay #'.$resultid.'</span>';
		?>
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Biggest+win']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT id , won as result FROM cws_gameplays WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT CONCAT('R_AM',id) AS id ,sum_won AS result FROM cws_roulette_am_bets WHERE user='{$row['login']}'  ORDER BY result DESC LIMIT 0,1)";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,sum_won AS result FROM cws_roulette_eu_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT CONCAT('CAR',id) AS id ,sum_won AS result FROM cws_race_tickets WHERE owner='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT CONCAT('SICBO',id) AS id ,sum_won AS result FROM cws_sicbo_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$result = 0;
		while ($qqq = mysqli_fetch_array($querytxt)){
			if ($qqq['result']>$result){
				$result = $qqq['result'];
				$resultid = $qqq['id'];
			}
		}
		if($result<0){echo '<span style="color:red">';}else{echo '<span style="color:green">';}echo  cash_format_cws($result,2).' '.$_SESSION['currency'].'</span> <br /> <span style="color:black">Gameplay #'.$resultid.'</span>';
		?>
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Biggest+loss']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT id , bet-won as result FROM cws_gameplays WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT CONCAT('R_AM',id) AS id ,bet-sum_won AS result FROM cws_roulette_am_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,bet-sum_won AS result FROM cws_roulette_eu_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT CONCAT('CAR',id) AS id ,bet-sum_won AS result FROM cws_race_tickets WHERE owner='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,bet-sum_won AS result FROM cws_sicbo_bets WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$result = 0;
		while ($qqq = mysqli_fetch_array($querytxt)){
			if (abs($qqq['result'])>$result){
				$result = abs($qqq['result']);
				$resultid = $qqq['id'];
			}
		}
		if($result<0){echo '<span style="color:red">';}else{echo '<span style="color:green">';}echo cash_format_cws($result,2).' '.$_SESSION['currency'].'</span> <br /> <span style="color:black">Gameplay #'.$resultid.'</span>';
		?>
        </td>
    </tr>
    <tr>  
    	<td class="top acenter"><?=$lang['Most+played+game']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT (SELECT name FROM cws_games WHERE id=gamename) AS name,COUNT(gamename) as result FROM cws_gameplays WHERE user='{$row['login']}' GROUP BY gamename)";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT 'Multiplayer American Roulette' AS name,COUNT(*) AS result FROM cws_roulette_am_bets WHERE user='{$row['login']}')";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT 'Multiplayer European Roulette' AS name,COUNT(*) AS result FROM cws_roulette_eu_bets WHERE user='{$row['login']}')";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT 'Multiplayer Races' AS name,COUNT(*) AS result FROM cws_race_tickets WHERE owner='{$row['login']}')";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT 'Multiplayer SicBo' AS name,COUNT(*) AS result FROM cws_sicbo_bets WHERE user='{$row['login']}')";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$result = 0;
		while ($qqq = mysqli_fetch_array($querytxt)){
			if (abs($qqq['result'])>$result){
				$result = abs($qqq['result']);
				$resultid = $qqq['name'];
			}
		}
		echo '<span style="color:#09C">'.$resultid.'</span><br /><span style="font-size:9px">('.$result.' hands played)</span>';
		?>
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Total+number+of+games+played']?></td>
        <td class="top acenter">
        <?php 
		$total_games = 0;
		$total_games += mysqli_result(mysqli_query($GLOBALS['con'],"(SELECT COUNT(DISTINCT(gamename)) AS games FROM cws_gameplays WHERE user='{$row['login']}')"),0);
		if ($rouletteAm==1){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"(SELECT * FROM cws_roulette_am_bets WHERE user='{$row['login']}')"))>0){
				$total_games += 1;
			}
		}
		if ($rouletteEu==1){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"(SELECT * FROM cws_roulette_eu_bets WHERE user='{$row['login']}')"))>0){
				$total_games += 1;
			}
		}
		if ($RacesOn==1){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"(SELECT * FROM cws_race_tickets WHERE owner='{$row['login']}')"))>0){
				$total_games += 1;
			}
		}
		if ($SicBo==1){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"(SELECT * FROM cws_sicbo_bets WHERE user='{$row['login']}')"))>0){
				$total_games += 1;
			}
		}
		echo '<span style="color:#09C">'.$total_games.'</span>';
		?>        
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Total+hands+played']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT COUNT(*) AS counter FROM cws_gameplays WHERE user='{$row['login']}')";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT COUNT(*) AS counter FROM cws_roulette_am_bets WHERE user='{$row['login']}')";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT COUNT(*) AS counter FROM cws_roulette_eu_bets WHERE user='{$row['login']}')";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT COUNT(*) AS counter FROM cws_race_tickets WHERE owner='{$row['login']}')";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT COUNT(*) AS counter FROM cws_sicbo_bets WHERE user='{$row['login']}')";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$total_hands = 0;
		while ($qqq = mysqli_fetch_array($querytxt)){
			$total_hands += $qqq['counter'];
		}
		echo '<span style="color:#09C">'.$total_hands.'</span>';
		?>
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Biggest+profit+from+singe+gameplay']?></td>
        <td class="top acenter">
        <?php 
		$querytxt = "(SELECT id , won-bet as result FROM cws_gameplays WHERE user='{$row['login']}' ORDER BY result DESC LIMIT 0,1)";
		if ($rouletteAm==1){
			$querytxt .= " UNION (SELECT CONCAT('R_AM',id) AS id ,sum_won-bet AS result FROM cws_roulette_am_bets WHERE user='{$row['login']}'  ORDER BY result DESC LIMIT 0,1) ";
		}
		if ($rouletteEu==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,sum_won-bet AS result FROM cws_roulette_eu_bets WHERE user='{$row['login']}'  ORDER BY result DESC LIMIT 0,1)";
		}
		if ($RacesOn==1){
			$querytxt .= " UNION (SELECT CONCAT('CAR',id) AS id ,sum_won-bet AS result FROM cws_race_tickets WHERE owner='{$row['login']}'  ORDER BY result DESC LIMIT 0,1)";
		}
		if ($SicBo==1){
			$querytxt .= " UNION (SELECT CONCAT('R_EU',id) AS id ,sum_won-bet AS result FROM cws_sicbo_bets WHERE user='{$row['login']}'  ORDER BY result DESC LIMIT 0,1)";
		}
		$querytxt = mysqli_query($GLOBALS['con'],$querytxt) or error_report(mysqli_error($GLOBALS['con']));
		$result = -9999999;
		if (mysqli_num_rows($querytxt)==0){
			$result = 0;
		}
		while ($qqq = mysqli_fetch_array($querytxt)){
			if ($qqq['result']>$result){
				$result = $qqq['result'];
				$resultid = $qqq['id'];
			}
		}
		if($result<0){echo '<span style="color:red">';}else{echo '<span style="color:green">';}echo  cash_format_cws($result,2).' '.$_SESSION['currency'].'</span> <br /> <span style="color:black">Gameplay #'.$resultid.'</span>';
		?>
        </td>
    </tr>
    <tr class="odd">  
    	<td class="top acenter"><?=$lang['Current+profit']?></td>
        <td class="top acenter">
		<?php 
		if($profit<0){echo '<span style="color:red">';}else{echo '<span>';}echo  cash_format_cws($profit,2).' '.$_SESSION['currency'].'</span>';
		?>
        </td>
    </tr>
    </tbody>
    </table>
</div>
<!-- table 5 start -->
<div style="width:670px;clear:both;padding-top:40px">
    <table>
        <tr>
            <td>
            <!--deposits start -->
            <table width="450" style="border:0px solid #333;padding-right:100px">
            <thead>
            <tr>
           	<td colspan="2" class="top acenter"><h2><?=$lang['Deposits']?></h2></td>
            </tr>
            </thead>
            <tbody>         
            <?php
			$q1 = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE user='{$row['login']}' AND status='1'");
			if (mysqli_num_rows($q1)>0){
				while ($detail = mysqli_fetch_array($q1)){
				?>
				<tr class="odd">
				<td>
                <span style="font-weight:bold;text-decoration:underline;color:black">#<?=$detail['id']?> </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?=$detail['date']?>
				</td>
				<td class="acenter cash">
				 + <?=cash_format_cws($detail['amount'],2)?> <?=$_SESSION['currency']?>
				</td>
				</tr>
				<?php
				}
			}else{
				echo '<tr><td colspan="2">'.$lang['No+results+found'].'</td></tr>';
			}
			?>
            </tbody>
            </table> 
            <!--deposits end -->
            </td>
            <td>
            <!--withdrawals start -->
            <table width="450" style="border:0px solid #333;padding-right:100px">
            <thead>
            <tr><td colspan="2" class="top acenter"><h2><?=$lang['Withdrawals']?></h2></td></tr>
            </tr>
            </thead>
            <tbody>        
            <?php
			$q1 = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_withdrawals WHERE user='{$row['login']}' AND status='1'");
			if (mysqli_num_rows($q1)>0){
				while ($detail = mysqli_fetch_array($q1)){
				?>
				<tr class="odd">
				<td>
                <span style="font-weight:bold;text-decoration:underline;color:black">#<?=$detail['id']?> </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?=$detail['date']?>
				</td>
				<td class="acenter cash">
				<span style="color:red"> - <?=cash_format_cws($detail['amount'],2)?> <?=$_SESSION['currency']?></span>
				</td>
				</tr>
				<?php
				}
			}else{
				echo '<tr><td colspan="2">'.$lang['No+results+found'].'</td></tr>';
			}
			?>
            </tbody>
            </table> 
            
            <!--withdrawals end -->
            </td>
            
            <td>
            <!--transfers start -->
            <table width="450" style="border:0px solid #333;padding-right:100px">
            <thead>
            <tr><td colspan="2" class="top acenter"><h2><?=$lang['Transfers']?></h2></td></tr>
            </tr>
            </thead>
            <tbody>        
            <?php
			$q1 = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_transfers WHERE (sender_id='{$row['id']}' AND sender_type='user') OR (receiver_id='{$row['id']}' AND receiver_type='user')");
			if (mysqli_num_rows($q1)>0){
				while ($detail = mysqli_fetch_array($q1)){
				?>
				<tr class="odd">
				<td>
                <span style="font-weight:bold;text-decoration:underline;color:black">#<?=$detail['id']?> </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<?=$detail['date']?>
				</td>
				<td class="acenter cash">
				<?php
				$color = 'green';
				$sign = ' + ';
				if ($detail['sender_id']==$row['id'] && $detail['sender_type']=='user'){$color = 'red';$sign = ' - ';}
                echo '<span style="color:'.$color.'">'.$sign.cash_format_cws($detail['amount'],2)?> <?=$_SESSION['currency'].'</span>'?>
				</td>
				</tr>
				<?php
				}
			}else{
				echo '<tr><td colspan="2">'.$lang['No+results+found'].'</td></tr>';
			}
			?>
            </tbody>
            </table> 
            <!--transfers end -->
            </td>
        </tr>
    </table>      
</div>

                                <!-- content end -->