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
if ($_SESSION['adminlvl']!=='admin'){
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND owner IN ($subAgents)";
}
?>
<?php
//transfer funds to USER
if (isset($_POST['update'])) { 
			$login = antisqli($_POST['uname']);
			$id = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$login'"),0);
			$cash = antisqli($_POST['cash']);
			if (antisqli($_POST['cashout'])==1){
				$cash = -abs($cash);
			}else{
				$cash = abs($cash);
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='$login'"))==0){$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';
			}
			$playerCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='$login'"),0);
			if ($cash<0 && abs($cash)>$playerCash) {$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'_1</p></div>';}
			$agentCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			if ($agentCash<$cash){$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'_2</p></div>';}
			if (!is_numeric($cash)){$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+amount'].'</p></div>';}
			$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			

			if (!isset($errormsg_tr)) {
			if (@mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`=cash+'$cash'  WHERE `login`='$login'")) 
			{
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash-'$cash'  WHERE `login`='{$_SESSION['admin']}'");
					if ($cash>0){$type=$lang['to'];}else{$type=$lang['from'];}
					$errormsg_tr =  '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>'.$lang['Transfered'].' <span style="color:green">'.abs($cash).''.$_SESSION['currency'].'</span> '.$type.' '.$lang['user'].' <strong>'.$login.'</strong> '.$lang['successfully'].'</p></div>';
					$amount = $cash;
					$date = date('Y-m-j H:i:s');
					$time = date('H:i:s');
					if ($amount>0) {
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$agentCash','$id','$amount','$date','admin','user','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}elseif($amount<0){ 
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$id','$playerCash','$staffid','$amount','$date','user','admin','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}else{
						$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
					}
				}else { 
					$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
				}
			}
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE `id`='".antisqli($_POST['id'])."'"));
//request only players of specific admin
if (isset($_POST['login']) && $_SESSION['adminlvl']!=='admin') { 
	$login = antisqli($_POST['login']);
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `login`='{$login}' AND owner IN ($subAgents)") or error_report(mysqli_error($GLOBALS['con']));
	if (mysqli_num_rows($query)>0){
		//echo mysqli_result($query,0);
	}else{
		echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
		echo $lang['Invalid+username'];
		echo '</p></div>';
		exit;
	}
}
//update player credit from transfer funds area
if (isset($_POST['refresh_credit'])){
	$login = antisqli($_POST['login']);
	$refresh_credit = cash_format_cws(@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='$login'"),0),2,'.','');
	$refresh_cashin = cash_format_cws(@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE user='{$login}' AND status='1'"),0),2,'.','');
	?>
	<label>PLAYER CREDIT</label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_credit?></span></div>
   <div class="clear"></div>
   <label>TOTAL DEPOSIT</label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_cashin?></span></div>
   <div class="clear"></div>
    <?php
	exit;
}
//check if player is online ( IN TRANSFER FUNDS AREA )
if (isset($_POST['checkonline'])){
	$login = antisqli($_POST['login']);
	if (checkloggedin($login)=='yes'){
				echo '<span style="color:green">ONLINE</span>';
			}else{
				echo '<span style="color:red">OFFLINE</span>';
			}
	exit;			
}
?>
<script type="text/javascript">
function list_dup_reg(){
	showparam('um_list_u','dup_reg=1');
}

function list_dup_login(){
	showparam('um_list_u','dup_login=1');
}

function delete_person(id){
	var answer = confirm('Are you sure you want to delete the current user?\n NOTE: Deleting an user will delete all tickets,deposits,bets,transfers and gameplays. However this can influence the agent/operator earnings and affect your casino! It is better to just LOCK an user! To lock an user, please do that by editing the user and changing his status to LOCKED!');
	if (answer){
		showparam('um_list_u','delete=1&id='+id);
	}
}
function u_stats_on(id,uname) {
	var x = $("#user"+id).offset().left - 270;
	var y = $("#user"+id).offset().top - 100;
	document.getElementById('user_stats').style.visibility = 'visible';
	$("#user_stats").html('<div style="width:300px; background-color:#EBEBEB;" class="wrap kubrick"><table><tr><td colspan="2" class="acenter">Loading...</td></tr></table></div>');
	$("#user_stats").css('display','block');
	$("#user_stats").css('position','absolute');
	$("#user_stats").css('color','black');
	$("#user_stats").css('top',y);
	$("#user_stats").css('left',x);
	$.post('includes/show/user_stats.inc.php',{uname:uname},function(data){$("#user_stats").html(data);});	
}

</script>
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<div>
<table>
<tr>
<td>
<form name="form" class="form"  onsubmit="return false" style="text-align:left;float:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
<div class="formRow">
    <label><?=$lang['Owner']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="owner" value="<?=antisqli($_POST['owner'])?>"/></div>
    <div class="clear"></div>
</div>

<div class="formRow" <?php if (AFFILIATES==1){}else{echo 'style="display:none"';}?>>
    <label style="font-size:11px">Players under Affiliate #</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="aff_id" value="<?=antisqli($_POST['aff_id'])?>"/></div>
    <div class="clear"></div>
</div>

<div class="formRow">
    <label><?=$lang['Username']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['search'])?>"/></div>
    <div class="clear"></div>
</div>

<div class="formRow">
    <label><?=$lang['Email']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="searchemail" value="<?=antisqli($_POST['searchemail'])?>"/></div>
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
    <?php if (AFFILIATES==1){?>
    <div>Is Affiliate: <input type="checkbox" name="is_affiliate" id="is_affiliate" <?php if ($_POST['is_affiliate']==1){echo 'checked';}?> /></div>
    <?php }?>
    <br />
    <span><?=$lang['The+search+will+show+the+earnings+between+the+dates+you+will+choose']?>. <?=$lang['If+no+data+is+selected+for+dates']?>, <?=$lang['then+all+earnings+will+be+showed']?></span> <br />
    <span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
    <button onclick="list_dup_reg()">List duplicate registration IP</button>
	<button onclick="list_dup_login()">List duplicate login IP</button><br />
</div>
</div>
</fieldset>
</form>
<script type="text/javascript">
$(function(){
	$("select, input:checkbox").uniform();
	$(".formRow .formRight").css('width','70%');
});
</script>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var searchemail = escape($("#searchemail").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				var owner = $("#owner").val();
				var aff_id = $("#aff_id").val();
				if(document.form.is_affiliate.checked == true) { var is_affiliate = '&is_affiliate=1';}else {is_affiliate = '&is_affiliate=0';}
				showparam('um_list_u','search='+lookfor+'&searchemail='+searchemail+'&fromdate='+fromdate+'&todate='+todate+'&owner='+owner+'&aff_id='+aff_id+is_affiliate);
							 });
</script>
</td>
<td width="100">
</td>
<td valign="top">
<?php

if (isset($_POST['owner']) && strlen($_POST['owner'])>0){
	$owner = antisqli($_POST['owner']);
	$owner = trim($owner);
	$subAgents = '';
	$chkd = array();
	getSubAgents($owner);
	$chkd[] = $_SESSION['admin'];
	//make sure that the OWNER we search for is under current agent
	if (!in_array($owner,$chkd)){
			$errormsg = '<br /><span style="color:red">No players found</span>';
			echo $errormsg;
			exit;
	}
	$subAgents .= "'".$owner."'";
	//echo $subAgents;
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents)"))==0){
			$errormsg = 'No players found';
			echo $errormsg;
			exit;
	}
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents)"))==0){
		//echo 'XXXXXXXXXX';
		$thefilter = ' AND 0=1 ';
	}else{
		//echo 'YYYYYYYYYYY';
		$thefilter = " AND owner IN ($subAgents)";
	}
	//echo $thefilter;
}
?>
<form name="ff1" onsubmit="return false">
<fieldset>
<div class="widget" style="width:600px;float:right;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png">
        <h6><?=$lang['Transfer+Funds+to+User+from+your+Balance+of']?>
        <span style="color:green"><?php echo cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM `cws_staffs` WHERE `login`='{$_SESSION['admin']}'"),0),2);?> <?=$_SESSION['currency']?></span><br /><span style="color:red" id="updated">
        <?php
        if (isset($errormsg_tr)){
			echo $errormsg_tr;
		}?>
        </span>
        </h6>
    </div>
    <div class="formRow" style="text-align:left">
	<label><?=$lang['Player+Username']?></label>
	<div class="formRight"><select id="login" onchange="refresh_credit()">
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents) ORDER BY login ASC");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users ORDER BY login ASC");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['login'].'"';
		if ($_POST['login']==$row['login']){
			echo 'selected="selected"';
		}
		echo '>'.$row['login'].'</option>';
		if (!isset($refresh_credit)){
			$refresh_credit = cash_format_cws($row['cash'],2,'.','');
		}
		if (!isset($refresh_cashin)){
			$refresh_cashin = cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE user='{$row['login']}' AND status='1'"),0),2,'.','');
		}
		if (!isset($online)){
			if (checkloggedin($login)=='yes'){
				$online = '<span style="color:green">ONLINE</span>';
			}else{
				$online = '<span style="color:red">OFFLINE</span>';
			}
		}
	}
	
	?>
    </select><span id="checkonline" style="font-weight:bold"><?=$online?></span>
    </div>
    <div class="clear"></div>
    </div>
    
<div class="formRow" style="text-align:left" id="refresh_data">
   <label>PLAYER CREDIT</label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_credit?></span></div>
   <div class="clear"></div>
   <label>TOTAL DEPOSIT</label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_cashin?></span></div>
   <div class="clear"></div>
</div>

<div class="formRow" style="text-align:left">
	<label><?=$lang['Amount+to+transfer']?></label>
	<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=$row['cash']?>" style="width:170px;color:green;" onkeyup="check_negative(this.value)"/><?=$_SESSION['currency']?></div>
	<div class="clear"></div>
</div>
<div class="formRow" style="text-align:left">
   <label>CASH <span style="color:red">IN</span></label>
   <div class="formRight"><input type="checkbox" name="cashin" id="cashin" value="1" checked/></div>
   <div class="clear"></div>
</div>
<div class="formRow" style="text-align:left">
   <label>CASH <span style="color:red">OUT</span></label>
   <div class="formRight"><input type="checkbox" name="cashout" id="cashout" value="1"/></div>
   <div class="clear"></div>
</div>

<div class="formRow">
<a href="#updated" class="button dblueB" id="update" style="padding:5px 49px 10px 40px"><span><?=$lang['Transfer']?></span></a>
</div>
</div>
</fieldset>
</form>
</td>
</tr>
</table>
</div>

<br /><br /><br />
<h4 style="margin-left:10px;"><?php if (isset($_POST['owner'])){ echo $lang['Users'].' of <span style="color:#09C">'.antisqli($_POST['owner']).'</span>';}?> <span style="color:red">

<?php
if (isset($_POST['status'])) {  //enable/disable user
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
			mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `ip_notify`='0' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
		} elseif ($_POST['status']==2) {
			mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `ip_notify`='0' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
			echo $lang['User'].' #'.$id.' '.$lang['Disabled'];
		}
	}
	if ($_SESSION['adminlvl']!=='admin') {
		$subAgents = "'".$_SESSION['admin']."',";
		getSubAgents($_SESSION['admin']);
		$subAgents = trim($subAgents,',');
		$thefilter = " AND owner IN ($subAgents)";
	}
} elseif (isset($_POST['delete']) && $_SESSION['adminlvl']=='admin') { //delete user
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
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_sicbo_bets WHERE user='$login'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_roulette_bets WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_deposits WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_withdrawals WHERE user='$login'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE receiver_id='$id' AND receiver_type='user'");
			mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE sender_id='$id' AND sender_type='user'");
			@mysqli_query($GLOBALS['con'],"DELETE FROM cws_shop_orders WHERE buyerid='$id'");
			echo $lang['User'].' #'.$id.' '.$lang['Deleted'];
		} else {
			echo $lang['User'].' #'.$id.' '.$lang['NOT+Deleted'];
		}
} elseif (isset($_POST['logout'])){
		$id = antisqli($_POST['logout']);
		if ($_SESSION['adminlvl']!=='admin'){
			$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `id`='{$id}' AND owner IN ($subAgents)") or error_report(mysqli_error($GLOBALS['con']));
		}else{
			$query = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs");	
		}
		if (mysqli_num_rows($query)>0){
			if (mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET logged_in='0' WHERE `id`='$id'")) {
				echo $lang['User'].' #'.$id.' LOGGED OUT successfully';
			} else {
				echo $lang['User'].' #'.$id.' was not LOGGED OUT';
			}
		}else {
			die('Invalid action');
		}
}


?></span></h4>

<script type="text/javascript">
$("#update").click(function() {
				var login = $("#login option:selected").val();
				var cash = $("#cash").val();
				if(document.ff1.cashin.checked == true) { var cashin = '&cashin=1';}else {cashin = '&cashin=0';}
				if(document.ff1.cashout.checked == true) { var cashout = '&cashout=1';}else {cashout = '&cashout=0';}
				showparam('um_list_u','update=1&'+'uname='+login+'&'+'cash='+cash+cashout+cashin);
							 });
function check_negative(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#cash").val('');
	}
}
function refresh_credit(){
	var login = $("#login option:selected").val();	
	$.post("./includes/show/um_list_u.inc.php", {refresh_credit:1,login: login}, function(welcome) { $("#refresh_data").html(welcome); // send data to the php
	}); 
	$.post("./includes/show/um_list_u.inc.php", {checkonline:1,login: login}, function(welcome) { $("#checkonline").html(welcome); // send data to the php 
	});
}
$("#cashout").click(function() {
	$("#cashin").attr("checked", false);	
});
$("#cashin").click(function() {
	$("#cashout").attr("checked", false);	
});
refresh_credit();
</script>
<div id="user_stats" style="display:none"><?=$lang['Loading']?>...
</div>

<?php //end transfer funds area ?>



<?php
include('um_list_u_table.inc.php');
?>