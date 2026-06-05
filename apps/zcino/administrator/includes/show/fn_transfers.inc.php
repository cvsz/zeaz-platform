<?php
//this php file lists all the transfers ( from player to player, staff to player , player to staff, staff to staff )
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
$adminid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
$subAgents = "'".$_SESSION['admin']."',";
getSubAgents($_SESSION['admin']);
$subAgents = trim($subAgents,',');
//receiver_id must have same id as admin : 
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>



<form name="ff1" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
<div class="formRow"><label><?=$lang['Transaction']?> ID:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="transid" value="<?=antisqli($_POST['transid'])?>" /></div>
    <div class="clear"></div>
</div>
<div class="formRow"><label><?=$lang['Start+date']?>:</label> 
    <div class="formRight"><input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/></div>
    <div class="clear"></div>
</div>

<div class="formRow"><label><?=$lang['End+date']?>:</label> 
<div class="formRight"><input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  /></div>
<div class="clear"></div>
</div>

<div class="formRow">
	<label><?=$lang['Credit+received+by']?> <b><?=$_SESSION['admin']?></b>(<span style="color:#093;font-weight:bold">CASH IN</span>):</label> 
	<div class="formRight"><input type="checkbox" id="cash_in" <?php if ($_POST['cash_in']==1){echo 'checked';}?> /></div>
	<div class="clear"></div>
</div>

<div class="formRow">
	<label><?=$lang['Credit+sent+by']?> <b><?=$_SESSION['admin']?></b>(<span style="color:#093;font-weight:bold">CASH OUT</span>):</label> 
	<div class="formRight"><input type="checkbox" id="cash_out" <?php if ($_POST['cash_out']==1 && $_POST['cash_in']!==1){echo 'checked';}?> /></div>
	<div class="clear"></div>
</div>
<script type="text/javascript">
$("#cash_out").click(function() {
	$("#cash_in").attr("checked", false);	
	$.uniform.update();
});
$("#cash_in").click(function() {
	$("#cash_out").attr("checked", false);	
	$.uniform.update();
});	
</script>

<div class="formRow"><label><?=$lang['Player']?> <?=$lang['Username']?>: </label>
<div class="formRight">
<select id="player_search">
	<option value="">-</option>
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents) ORDER BY login");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['id'].'"';
		if ($_POST['player_search']==$row['id']){
			echo 'selected="selected"';
		}
		echo '>'.$row['login'].'</option>';
	}
	
	?>
    </select>
</div>
<div class="clear"></div>
</div>

<div class="formRow"><label><?=$lang['Agent']?> <?=$lang['Username']?>: </label>
<div class="formRight">
<select id="agent_search">
	<option value="">-</option>
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE owner IN ($subAgents) ORDER BY login");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['id'].'"';
		if ($_POST['agent_search']==$row['id']){
			echo 'selected="selected"';
		}
		echo '>'.$row['login'].'</option>';
	}
	
	?>
    </select>
</div>
<div class="clear"></div>
</div>


<?php if (AFFILIATES==1){?>
<div class="formRow"><?=$lang['Payments+towards+affiliates']?>: <input type="checkbox" name="is_affiliate" id="is_affiliate" <?php if ($_POST['is_affiliate']==1){echo 'checked';}?> /></div>
<?php }?>

<div class="formRow" style="padding-left:50px">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>

<br />
<span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
</div>
</fieldset>
</form>

<script type="text/javascript">
$("#search").click(function() {
				var player_search = escape($("#player_search option:selected").val());
				if (player_search=='-'){player_search='';}
				var transid = escape($("#transid").val());
				
				var agent_search = escape($("#agent_search option:selected").val());
				if (agent_search=='-'){agent_search='';}
				
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				var cash_in = $("#cash_in").val();
				var cash_out = $("#cash_out").val();
				if(document.ff1.cash_in.checked == true) { var csi = '&cash_in=1';}else {var csi = '&cash_in=0';}
				if(document.ff1.cash_out.checked == true) { var cso = '&cash_out=1';}else {var cso = '&cash_out=0';}
				if(document.ff1.is_affiliate.checked == true) { var is_affiliate = '&is_affiliate=1';}else {is_affiliate = '&is_affiliate=0';}
				showparam('fn_transfers','player_search='+player_search+'&agent_search='+agent_search+'&fromdate='+fromdate+'&todate='+todate+'&transid='+transid+csi+cso+is_affiliate);
							 });
function open_invoice(id){
	mywindow = window.open("includes/show/pdf_invoice_tr.php?id="+id, "PDF Invoice", "location=1,status=1,scrollbars=1,  width=500,height=500");
}							 
</script>
<h3 style="margin-left:10px;"><?=$_SESSION['currency']?> <?=$lang['Transfers']?> <span style="color:red">
<?php
if (isset($_POST['status']) && $_SESSION['adminlvl']=='admin') {
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	$prev_status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_transfers WHERE `id`='$id'"),0);// get previous status before it was updated
	
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_transfers` SET `status`='$status' WHERE `id`='$id'")){
		echo '<br />';
		if ($status==1 && $prev_status==0) { // if the transaction was pending and now it got completed, give money to user
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_transfers WHERE `id`='$id' AND receiver_type='user'"))>0){
				$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT receiver_id FROM cws_transfers WHERE `id`='$id'"),0);
				$amount = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT amount FROM cws_transfers WHERE `id`='$id'"),0);
				mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`=cash+'$amount' WHERE `id`='$userid'");
			}
			echo $lang['Transfer'].' #'.$id.' '.$lang['Completed'];
		}elseif($status==2){
			echo $lang['Transfer'].' #'.$id.' '.$lang['Completed'];
		}
	}
}
?></span></h3>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$_SESSION['currency']?> <?=$lang['Transfers']?></h6>
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
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('fn_transfers','id')?></th>
<th class="top acenter"><?=$lang['Sender']?><?=show_order_by('fn_transfers','user')?></th>
<th class="top acenter"><?=$lang['Receiver']?><?=show_order_by('fn_transfers','details')?></th>
<th class="top acenter"><?=$lang['Amount']?><br /><span style="font-size:9px">(<?=$lang['From+staff+perspective']?>)</span><br /><?=show_order_by('fn_transfers','amount')?></th>
<th class="top acenter"><?=$lang['Date']?> <?=show_order_by('fn_transfers','date')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('fn_transfers','status')?></th>
<th class="top acenter"><?=$lang['Manage']?></th>
</tr>
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
						$fromdate = "AND t.date>='".$_POST['fromdate']."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND t.date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND t.date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND t.date<'".date('Y-m-d H:i:s',time()+186400)."'";
					}					
if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='id';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='DESC';}
if (isset($_POST['transid'])&& strlen($_POST['transid'])>0){$transid="AND id='".antisqli($_POST['transid'])."'";}
// 2 = declined ; 1 = completed ; 0 = pending
$psquery = '';
$agquery = '';
if (isset($_POST['player_search']) && strlen($_POST['player_search'])>0){
	$ps = antisqli($_POST['player_search']);
	$psquery = " AND ((receiver_id='$ps' AND receiver_type='user') OR (sender_id='$ps' AND sender_type='user'))";
}
if (isset($_POST['agent_search']) && strlen($_POST['agent_search'])>0){
	$ag = antisqli($_POST['agent_search']);
	$agquery = " AND ((receiver_id='$ag' AND receiver_type='admin') OR (sender_id='$ag' AND sender_type='admin'))";
}

if ($_POST['is_affiliate']==1){
	$is_affiliate = "AND notes='aff'";
}

if ($_POST['cash_in']==1){
	$cash_in_cond = "AND receiver_type='admin' AND receiver_id='$adminid'";
}
if ($_POST['cash_out']==1){
	$cash_out_cond = "AND sender_type='admin' AND sender_id='$adminid'";
}
if ($_SESSION['adminlvl']!=='admin'){
	 //get owner of each sender/receiver
	 $cond1 = ",IF (t.sender_type='admin',(SELECT owner FROM cws_staffs WHERE id=t.sender_id),(SELECT owner FROM cws_users WHERE id=t.sender_id)) AS c1owner";
	 $cond2 = ",IF (t.receiver_id='admin',(SELECT owner FROM cws_staffs WHERE id=t.receiver_id),(SELECT owner FROM cws_users WHERE id=t.receiver_id)) AS c2owner";
	 $subAgentsCond = "HAVING (c1owner IN ($subAgents) OR c2owner IN ($subAgents))";
}

$pquery = "SELECT *".$cond1.$cond2."
FROM `cws_transfers` t 
WHERE 1=1 
$psquery $agquery $cash_out_cond $cash_in_cond $type $transid $fromdate $todate $is_affiliate
$subAgentsCond
ORDER BY t.$orderby $ordertype";


$query = $pquery." LIMIT $l1,$perpage";
//echo $query;
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
$agent_id = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="7">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><span style="color:#006;font-weight:bold">
					<?php
                    if (!is_numeric($row['sender_id'])) {
						echo $row['sender_id'];
					}else{
						if ($row['sender_type']=='admin'){// admin sends to user
							$data = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='{$row['sender_id']}'"),0);
							if ($data==""){
								$data = '<span style="color:red">'.$lang['STAFF+DELETED'].'</span>';
							}
							echo $data;
						}else{
							$data = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='{$row['sender_id']}'"),0);
							if ($data==""){
								$data = '<span style="color:red">'.$lang['USER+DELETED'].'</span>';
							}
							echo $data;
						}
					}
					echo '<br /><span style="font-size:8px;color:orange">('.$row['sender_type'].')</span>';
					?>
                    </span></td>
     				<td class="acenter"><span style="color:#033;font-weight:bold">
					<?php
                    if (!is_numeric($row['receiver_id'])) {
						echo $row['receiver_id'];
					}else{
						if ($row['receiver_type']=='admin'){// admin sends to user
							$data = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='{$row['receiver_id']}'"),0);
							if ($data==""){
								$data = '<span style="color:red">'.$lang['STAFF+DELETED'].'</span>';
							}
							echo $data;
						}else{
							$data = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='{$row['receiver_id']}'"),0);
							if ($data==""){
								$data = '<span style="color:red">'.$lang['USER+DELETED'].'</span>';
							}
							echo $data;
						}
					}
					echo '<br /><span style="font-size:8px;color:orange">('.$row['receiver_type'].')</span>';
					?>
                    </span></td>
					<td class="acenter cash">
                    <?php 
					if ($agent_id==$row['sender_id'] && $row['sender_type']=='admin'){
					?>
                    <span class="cash" style="color:red">-<?=cash_format_cws($row['amount'],2)?> <?=$_SESSION['currency']?></span>
                    <?php }else{?>
                    <span class="cash">
					<?=cash_format_cws($row['amount'],2)?> <?=$_SESSION['currency']?>
                    </span>
                    <?php }?>
                    </td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter neutral"><span style="color:red">'.$lang['Pending'].'</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">'.$lang['Completed'].'</span></td>';break;
						case 2:echo '<td class="acenter negative"><span style="color:red">'.$lang['Declined'].'</span></td>';break;
						default:echo '<td class="acenter neutral"><span style="color:red">'.$lang['Pending'].'</span></td>';break;
					}?>
                    <td class="acenter">
                    <div class="manageTd" style="min-width:50px;width:50px">
                    <a onclick="javascript:open_invoice('<?=$row['id']?>')"  href="#show" class="button manage blueB tipS"  original-title="Invoice"><span style="padding-left:3px">PDF</span></a>
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
<script type="text/javascript">
$(function(){
	$("select, input:checkbox").uniform();
	$(".formRow .formRight").css('width','50%');
});
</script>
</div>