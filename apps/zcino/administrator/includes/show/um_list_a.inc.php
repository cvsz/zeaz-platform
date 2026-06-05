<?php
//this php file lists all the agents of the current logged in staff
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
$stafftype = 'agent';
if ($stafftype=='agent'){
	$ext = 'a';
	}elseif($stafftype=='operator'){
		$ext = 'o';
		}
?>
<?php 
if (isset($_POST['login'])) { 
	$login = antisqli($_POST['login']);
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_staffs` WHERE `login`='{$login}'");
	if (mysqli_num_rows($query)>0){
		//echo mysqli_result($query,0);
	}else{
		echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.''.$lang['Invalid+username'].'</p></div>';
		exit;
	}
if($_SESSION['adminlvl']!=='admin' && isset($_POST['login'])){
		$subAgentsList = '';
		subAgentsList($_SESSION['admin']);
		$login = antisqli($_POST['login']);
		$squery = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_staffs WHERE login='$login'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+user'].'</p></div>';
			echo $errormsg;
			exit;
		}
		if (!in_array($login,$chkdList) && $login!==$_SESSION['admin']){
			$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+action'].'</p></div>';
			echo $errormsg;
			exit;
		}
	}
}
?>
<script type="text/javascript">
function delete_person(id){
	var answer = confirm("NOTE: Deleting an agent will delete all transfers,tickets and data. However this can influence the agent/operator earnings and affect your casino ! It is better to just LOCK an agent ! Press YES to DELETE and NO to CANCEL !");
	if (answer){
		showparam('um_list_a','delete=1&id='+id);
	}
}
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<table width="1223">
<tr>
<td width="550" style="vertical-align:top">
<form name="form" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>

<div class="formRow">
    <label><?=$lang['Owner']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="owner" value="<?=antisqli($_POST['owner'])?>"/></div>
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
    <br />
    <span><?=$lang['The+search+will+show+the+earnings+between+the+dates+you+will+choose']?>. <?=$lang['If+no+data+is+selected+for+dates']?>, <?=$lang['then+all+earnings+will+be+showed']?></span> <br />
    <span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
</div>
</fieldset>
</form>
</td>
<td width="208" valign="top">
</td>
<td width="449"valign="top">
<?php if (isset($_POST['update'])) { 
			$login = antisqli($_POST['login']);
			$id = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='$login'"),0);
			$cash = antisqli($_POST['cash']);
			if (antisqli($_POST['cashout'])==1){
				$cash = -abs($cash);
			}else{
				$cash = abs($cash);
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE login='$login'"))==0){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';}
			$agentCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='$login'"),0);
			if ($cash<0 && abs($cash)>$agentCash) {$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'</p></div>';}
			$adminCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			if ($adminCash<$cash){$errormsg =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'</p></div>';}
			if (!is_numeric($cash)){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+amount'].'</p></div>';}
			$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);

			if ($_SESSION['admin']==$login){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';}
				
			
			if (!isset($errormsg)) {
			if (@mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash+'$cash'  WHERE `login`='$login'")) 
			{
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash-'$cash'  WHERE `login`='{$_SESSION['admin']}'");
					if ($cash>0){$type2=$lang['to'];}else{$type2=$lang['from'];}
					$errormsg = '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>'.$lang['Transfered'].' <span style="color:green">'.abs($cash).' '.$_SESSION['currency'].'</span> '.$type2.' '.$lang['agent'].' <strong>'.$login.'</strong> '.$lang['successfully'].'</p></div>';
					$amount = $cash;
					$date = date('Y-m-j H:i:s');
					$time = date('H:i:s');
					if ($amount>0) {
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$adminCash','$id','$amount','$date','admin','admin','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}elseif($amount<0){
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$id','$agentCash,'$staffid','$amount','$date','admin','admin','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}else{
						$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
					}
				}else { 
					$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
				}
			}
		}
?>
<script type="text/javascript">
function open_invoice(id){
	mywindow = window.open("includes/show/pdf_invoice_tr.php?id="+id, "PDF Invoice", "location=1,status=1,scrollbars=1,  width=500,height=500");
}
</script>


<div style="width:100%;text-align:center">
<form name="ff1" onsubmit="return false">
<fieldset>
<div class="widget">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png">
        <h6><?=$lang['Transfer+Funds+to+Agent+from+your+Balance+of']?>
        <span style="color:green"><?php echo cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM `cws_staffs` WHERE `login`='{$_SESSION['admin']}'"),0),2);?></span><br /><span style="color:red" id="updated">
        <?php
        if (isset($errormsg)){
			echo $errormsg;
		}?>
        </span>
        <?php if (isset($lastid)){?> <br /><a href="#viewInvoice<?=$lastid?>" onclick="javascript:open_invoice('<?=$lastid?>')">Click to see INVOICE #<?=$lastid?></a><?php } ?>
        </h6>
    </div>
    <div class="formRow" style="text-align:left">
	<label><?=$lang['Agent+Username']?></label>
	<div class="formRight" style="width:60%"><select id="login">
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
	$subAgentsList = "'".$_SESSION['admin']."',";
	subAgentsList($_SESSION['admin']);
		foreach ($chkdList as $agg) {
			$subAgentsList .= "'".$agg."',";
		}
		$subAgentsList = trim($subAgentsList,',');
$subAgentsList = str_replace(",''",'',$subAgentsList);
	if (strlen($subAgentsList)<3){
		$subAgentsList = "'a35a35a35zxc9s'";
	}
	$thefilter = " AND owner IN ($subAgentsList)";
	$query ="SELECT * FROM cws_staffs WHERE 1=1 $thefilter ORDER BY login";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
	}else {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['login'].'">'.$row['login'].'</option>';
	}
	?>
    </select>
    </div>
    <div class="clear"></div>
    </div>
<div class="formRow" style="text-align:left">
	<label><?=$lang['Amount+to+transfer']?></label>
	<div class="formRight" style="width:60%"><input type="text" class="text small" name="smallfield" id="cash" value="<?=$row['cash']?>" style="width:140px;color:green;" onkeyup="check_negative(this.value)"/></div>
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
</div>
<script type="text/javascript">
$("#update").click(function() {
				var login = $("#login option:selected").val();
				var cash = $("#cash").val();
				if(document.ff1.cashin.checked == true) { var cashin = '&cashin=1';}else {cashin = '&cashin=0';}
				if(document.ff1.cashout.checked == true) { var cashout = '&cashout=1';}else {cashout = '&cashout=0';}
				showparam('um_list_a','update=1&'+'login='+login+'&'+'cash='+cash+cashout+cashin);
							 });
function check_negative(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#cash").val('');
	}
}							 
$("#cashout").click(function() {
	$("#cashin").attr("checked", false);	
});
$("#cashin").click(function() {
	$("#cashout").attr("checked", false);	
});							 
</script>
</td>
</tr>
</table>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var searchemail = escape($("#searchemail").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				var owner = $("#owner").val();
				showparam('um_list_<?=$ext?>','search='+lookfor+'&searchemail='+searchemail+'&fromdate='+fromdate+'&todate='+todate+'&owner='+owner);
							 });
</script>
<?php 
if ($_SESSION['adminlvl']==$stafftype){
?>
<a onclick="javascript:showparam('um_list_<?=$ext?>','search=<?=$_SESSION['admin']?>');" href="#"><?=$lang['View+my+stats']?></a>
<?php 
} 
?>
</div>
<h3 style="margin-left:10px;"><?=ucfirst($stafftype).'s'?> <?php if (isset($_POST['owner'])){ echo 'of <span style="color:#09C">'.antisqli($_POST['owner']).'</span>';}?> <span style="color:red">
<?php
require_once('../config.inc.php');
if (isset($_POST['owner']) && strlen($_POST['owner'])>0){
	$owner = antisqli($_POST['owner']);
	$owner = trim($owner);
	$subAgents = "'".$owner."',";
	$chkd = array();
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	if (@mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE '$owner' IN ($subAgents)"))==0){
			//echo "SELECT * FROM cws_staffs WHERE '$owner' IN ($subAgents)";
			$errormsg = 'Invalid action';
			echo $errormsg;
			exit;
	}
	//find the subagents of the owner
	$chkd = array();
	$subAgents = '';
	getSubAgents($owner);
	$subAgents .= "'".$owner."'";
	//echo $subAgents;
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE owner IN ($subAgents) AND staff_type='agent'"))==0){
			$errormsg = '<br />No agents found';
			echo $errormsg;
			exit;
	}
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE owner IN ($subAgents) AND staff_type='agent'"))==0){
		//echo 'XXXXXXXXXX';
		$thefilter = ' AND 0=1 ';
	}else{
		//echo 'YYYYYYYYYYY';
		$thefilter = " AND owner IN ($subAgents)";
	}
}elseif ($_SESSION['adminlvl']!=='admin') {
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
	$thefilter = " AND login IN ($subAgents)";
}
?>
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	$chkdList[] = $_SESSION['admin'];
	if($_SESSION['adminlvl']!=='admin'){
		$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_staffs WHERE id='$id'"),0);
		if ($status=='3'){
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			exit;	
		}
		$id = antisqli($_POST['id']);
		$squery = mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$id'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			$errormsg = $lang['Invalid+subagent'];
			echo $errormsg;
			exit;
		}
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE '$login' IN ($subAgents)"))==0){
			$errormsg = '<br />'.$lang['No+subagents+found'];
			echo $errormsg;
			exit;
		}
	}
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `status`='$status' WHERE `id`='$id' AND `staff_type`='{$stafftype}' $thefilter")) 
		{
		$login = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$id'"),0);
		$subAgents2 = $subAgents;
		$thefilter = $thefilter2;
		$chkd = array();
		getSubAgents($login); // get all the subagents of the agent we want to modify , so that we can modify status of all his subagents
		$subAgentsThis = trim($subAgents,',');
		$subAgents = $subAgents2;
		if ($subAgentsThis==''){
			$subAgentsThis = "'$login'";
		}
		$thefilter = $thefilter2;
		if ($_POST['status']==1) {
			echo ucfirst($stafftype).' #'.$id.' '.$lang['Activated'];
		} elseif ($_POST['status']==0) {
			mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET status='0' WHERE login IN ($subAgentsThis)") or error_report(mysqli_error($GLOBALS['con']));
			mysqli_query($GLOBALS['con'],"UPDATE cws_users u RIGHT JOIN cws_staffs s ON s.login=u.owner SET u.status='0' WHERE s.login IN ($subAgentsThis)") or error_report(mysqli_error($GLOBALS['con']));
			echo ucfirst($stafftype).' #'.$id.' '.$lang['Suspended'];
		} elseif ($_POST['status']==2) {
			mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET status='2' WHERE login IN ($subAgentsThis)") or error_report(mysqli_error($GLOBALS['con']));
			//echo "UPDATE cws_staffs SET status='2' WHERE login IN ($subAgentsThis)";
			mysqli_query($GLOBALS['con'],"UPDATE cws_users u RIGHT JOIN cws_staffs s ON s.login=u.owner SET u.status='2' WHERE s.login IN ($subAgentsThis)") or error_report(mysqli_error($GLOBALS['con']));
			echo ucfirst($stafftype).' #'.$id.' '.$lang['Disabled'];
		}
		if ($_SESSION['adminlvl']!=='admin') {
			$subAgents = "'".$_SESSION['admin']."',";
			$chkd = array();
			getSubAgents($_SESSION['admin']);
			$subAgents = trim($subAgents,',');
			$thefilter = " AND login IN ($subAgents)";
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin') { 
	if ($demoMode==1){
			die('You are not allowed to do this in demo mode');
		}
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_staffs` WHERE `id`='$id' AND `staff_type`='{$stafftype}' $thefilter")) {
		@mysqli_query($GLOBALS['con'],"DELETE FROM cws_vdog_tickets_v2 WHERE owner='$login'");
		mysqli_query($GLOBALS['con'],"DELETE FROM cws_deposits WHERE user='$login'");
		mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE receiver_id='$id' AND receiver_type='admin'");
		mysqli_query($GLOBALS['con'],"DELETE FROM cws_transfers WHERE sender_id='$id' AND sender_type='admin'");
		echo ucfirst($stafftype).' #'.$id.' '.$lang['Deleted'];
	} else {
		echo ucfirst($stafftype).' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>

<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" />
    <h6><?=$lang['List+Agents']?></h6>
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
<th width="5%" class="top acenter"><div style="width:50px">ID<?=show_order_by('um_list_'.$ext,'id')?></div></th>
<th width="9%" class="top acenter"><div style="min-width:120px"><?=$lang['Username']?><?=show_order_by('um_list_'.$ext,'login')?></div></th>
<th width="5%" class="top acenter"><?=$lang['Password']?><br /><?=show_order_by('um_list_'.$ext,'pass')?></th>
<th width="3%" class="top acenter"><?=$lang['Name']?>/<?=$lang['Email']?><br /><?=show_order_by('um_list_'.$ext,'email')?></th>
<th width="5%" class="top acenter"><img class="icon" alt="" src="images/icons/light/clock.png" style="vertical-align:middle" /> <?=$lang['Register+date']?><br /><?=show_order_by('um_list_'.$ext,'date')?></th>
<th width="4%" class="top acenter"><?=$lang['Last']?> <?=$lang['log+in']?> IP/<?=$lang['Date']?></th>
<th width="4%" class="top acenter"><?=$lang['Owner']?><br /><?=show_order_by('um_list_'.$ext,'owner')?></th>
<th width="4%" class="top acenter"><?=$lang['Status']?><br /><?=show_order_by('um_list_'.$ext,'status')?></th>
<th width="6%" class="top acenter"><?=$lang['Purchased+credits']?><br /><span style="font-size:8px">(CASHIN)</span><br /><?=show_order_by('um_list_'.$ext,'total_purchased')?></th>
<th width="6%" class="top acenter"><?=$lang['Available']?> <?=$lang['Credit']?><br /><?=show_order_by('um_list_'.$ext,'cash')?></th>
<th width="9%" class="top acenter" style="font-size:10px"><div style="min-width:90px"><?=$_SESSION['currency']?> <?=$lang['Bet']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?></div></th>
<th width="9%" class="top acenter" style="font-size:10px"><div style="min-width:90px"><?=$_SESSION['currency']?> <?=$lang['Won']?> <?=str_replace('agent',$stafftype,$lang['by+players+of+agent'])?></div></th>
<th class="top acenter"><span style="font-size:10px"><?=$lang["Revenue+percent"]?><?=show_order_by('um_list_'.$ext,'percent')?></span></th>
<th width="6%" class="top acenter"style="font-size:10px"><div style="min-width:90px"><?=$lang['Revenue']?> <?=$lang['from']?> <?=strtolower($lang["Player"])?>s of <?=$stafftype?> <br /><span style="font-size:8px"><?php if (NET_REVENUE=='1'){echo '(bets-wins)*share';}else{echo '(bets*share)';}?></span></div> </th>
<th width="6%" class="top acenter"><?=$lang['Revenue']?> <?=$lang['from+subagents']?> </th>
<th width="8%" class="top acenter"><?=$lang['Total+Agent+Revenue']?></th>
<th width="8%" class="top acenter"><?=$lang['Total+Amount+Paid+to+Agent']?> </th>
<th width="15%" class="top acenter"><?=$lang['Management']?> </th>
</tr>	  	 
</thead>
<tbody>
<?php
$counter =0;
$checked = array();
$datefilter ='';
if (strlen($_POST['fromdate'])>0){
						$_POST['fromdate'] = date('Y-m-d H:i:s',strtotime(antisqli($_POST['fromdate']))); 
						$fromdate = "AND date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
						$fdate = antisqli($_POST['fromdate']);
					} else {
						$fromdate = "AND date>='2000-01-01'";
						$fdate ='2000-01-01';
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate'])+86400);
						$todate = "AND date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$tdate = date('Y-m-d H:i:s',time()+186400);
						$todate = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
					}

if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
$page = antisqli($_POST['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='status';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if (strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `login` LIKE '".antisqli($_POST['search'])."'");}
if (isset($_POST['searchemail'])&&strlen($_POST['searchemail'])>0){$searchemail= str_replace('*','%',"AND `email` LIKE '".antisqli($_POST['searchemail'])."'");}
$pquery = "SELECT * FROM `cws_staffs` WHERE `staff_type`='{$stafftype}' $searchemail $type $thefilter ORDER BY $orderby $ordertype";
$query = $pquery."  LIMIT $l1,$perpage";
//echo "SELECT * FROM `cws_staffs` WHERE  `staff_type`='{$stafftype}' $type $thefilter ORDER BY $orderby $ordertype";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']).$pquery);
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="13">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$checked = array();
	if (strlen($_POST['fromdate'])>0||strlen($_POST['todate'])){
		$subAgentsProfit = calculate_all_share($row['login'],($row['percent']/100),0,$fdate,$tdate,1);
	}else{
		$subAgentsProfit = calculate_all_share($row['login'],($row['percent']/100),0,'2000-01-01',date('Y-m-d H:i:s',time()+186400),1);
	}
	$row['percent']/=100;
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><?=$row['login']?></strong>
                    <br />
                    <a onclick="javascript:showparam('um_list_u','owner=<?=$row['login']?><?php if (strlen($_POST['todate'])>0){echo '&'.$_POST['todate'];}?><?php if (strlen($_POST['fromdate'])>0){echo '&'.$_POST['fromdate'];}?>');" style="font-size:8px" href="#show">(View players)</a><br />
                    <a onclick="javascript:showparam('um_list_a','owner=<?=$row['login']?><?php if (strlen($_POST['todate'])>0){echo '&'.$_POST['todate'];}?><?php if (strlen($_POST['fromdate'])>0){echo '&'.$_POST['fromdate'];}?>');" style="font-size:8px" href="#show">(View agents)</a>
                    </td>
                    <td class="acenter"><a href="#showPw" onclick="showPopup('<?php echo pass_decode($row['pass']);?>')" class="button">**********<br />(<?=$lang['click+to+show']?>)</a></td>
                    <td class="acenter"><?=$row['name']?><br /><strong><?=$row['email']?></strong></td>
                    <td class="acenter time"><strong><?=$row['date']?></strong></td>
                    <td class="acenter"><strong><span style="color:orange;font-size:12px;"><?=$row['ip_last']?></span><br /><span style="color:#09C;font-size:9px;"><?=$row['last_activity']?></span></strong></td>
                    <td class="acenter"><span style="font-weight:bold">
					<?php if ($row['owner']!=='admin'){?>
                    <a onclick="javascript:showparam('um_list_a','owner=<?=$row['owner']?><?php if (strlen($_POST['todate'])>0){echo '&'.$_POST['todate'];}?><?php if (strlen($_POST['fromdate'])>0){echo '&'.$_POST['fromdate'];}?>');" style="font-size:12px;font-style:italic" href="#show"><?=$row['owner']?></a>
                    <?php }else{ echo $row['owner'];}?></span></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">'.$lang['Enabled'].'</span></td>';break;
						case 2:echo '<td class="acenter negative"><span style="color:red">'.$lang['Suspended'].'</span></td>';break;
						case 3:echo '<td class="acenter negative"><span style="color:red">'.$lang['Locked'].'</span></td>';break;
						case 4:echo '<td class="acenter negative"><span style="color:red">'.$lang['Closed'].'</span></td>';break;
						default:echo '<td class="acenter negative"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
					}?>
                    <!-- purchased credits -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$cashin = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_transfers WHERE receiver_id='{$row['id']}' AND receiver_type='admin'"),0);
					if ($cashin<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($cashin,2).''.$_SESSION['currency'].'</span>';
					?>
                    </td> 
                    <!-- current credits -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					$cash = $row['cash'];
					if ($cash<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($cash,2).''.$_SESSION['currency'].'</span>';
					?>
                    </td> 
                    <!-- total played(bets) by agent's players and bets made by agent from ADMIN Panel -->
                    <td class="acenter cash">
					<?php 
					$style = '';
					if (isset($_POST['fromdate'])||isset($_POST['todate'])){
							$bets = getMyPlayers('bet',$fdate,$tdate,$row['login']);
						}else {
							$bets = getMyPlayers('bet','0','0',$row['login']);
						}
					if ($bets<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($bets,2).''.$_SESSION['currency'].'</span>';
					?>
                    </td>      
                    <!-- total won by agent's players and wins from bets made by agent from ADMIN Panel--> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					if (isset($_POST['fromdate'])||isset($_POST['todate'])){
							$wins = getMyPlayers('won',$fdate,$tdate,$row['login']);
						}else {
							$wins = getMyPlayers('won','0','0',$row['login']);
						}
					if ($wins<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($wins,2).''.$_SESSION['currency'].'</span>';
					?>

					<!-- revenue percentage -->
					<td class="acenter cash">
                    <span style="color:#09C"><?=$row['percent']*100?>%</span>
                    </td>
                    </td>  
                    <!-- revenue from direct players (bets - wins * rake = profit from players) -->
                     <td class="acenter cash">
					<?php 
					$style = '';
					if (NET_REVENUE=='1'){
						$playersRev = ($bets-$wins)*$row['percent'];
					}else{
						$playersRev = ($bets)*$row['percent'];
					}
					if ($playersRev<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($playersRev,2).''.$_SESSION['currency'].'</span>';
					?>
					 <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>     
 					 <!-- revenue from subagents --> 
                    <td class="acenter cash">
					<?php 
					$style = '';
					$fromSubAgents = $subAgentsProfit;
					if ($fromSubAgents<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($fromSubAgents,2).''.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                     </td>   
                    <!-- total revenue profit*rake -->     
                    <td class="acenter cash">
					<?php 
					$style = '';
					$totalRevenue = $playersRev+$fromSubAgents;
					if ($totalRevenue<0) {$style = 'color:red';}
					echo '<span style="'.$style.'">'.cash_format_cws($totalRevenue,2).''.$_SESSION['currency'].'</span>';
					?>
                    <br /><span style="color:#09C">(<?=$row['percent']*100?>%)</span>
                    </td>
                    <!-- total paid to agent-->     
                    <td class="acenter cash">
					<?=$row['cash_paid']?><?=$_SESSION['currency']?>
                    </td>
                    

                    <td class="acenter">
                    <div class="manageTd">
                    <?php if ($row['status']=='1') { 
						echo '<a onclick="javascript:showparam(\'um_list_'.$ext.'\',\'status=0&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;
					}elseif($row['status']!=='3' ||$_SESSION['adminlvl']=='admin'){ 
						echo '<a onclick="javascript:showparam(\'um_list_'.$ext.'\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';
						}
						?> 
                        <a onclick="javascript:showparam('um_edit_<?=$ext?>','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a>
                        <?php if ($_SESSION['adminlvl']=='admin'){?><a onclick="javascript:delete_person('<?=$row['id']?>')"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a><?php } ?>
					</div>
                    </td>
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