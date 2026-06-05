<?php
//this php file lists all the deposits 
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 


<form name="form" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
<div class="formRow"><label><?=$lang['Transaction']?> ID:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookforid" value="<?=antisqli($_POST['searchid'])?>" /></div>
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

<div class="formRow"><label><?=$lang['Username']?>: </label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['lookfor'])?>" /></div>
<div class="clear"></div>
</div>

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
				var fromdate = $("#fromdate").val();
				var lookforid = escape($("#lookforid").val());
				var todate = $("#todate").val();
				var lookfor = $("#lookfor").val();
				showparam('fn_deposits','fromdate='+fromdate+'&todate='+todate+'&search='+lookfor+'&searchid='+lookforid);
							 });
function open_invoice(id){
	mywindow = window.open("includes/show/pdf_invoice.php?id="+id, "PDF Invoice", "location=1,status=1,scrollbars=1,  width=500,height=500");
}
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['Deposits']?> <span style="color:red">
<?php

if (isset($_POST['search'])) {
	$login = antisqli($_POST['search']);
	$q = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$login'");
	if (mysqli_num_rows($q)==0){

	}else{
		$owner = mysqli_result($q,0);
		$subAgents = '';
		getSubAgents($_SESSION['admin']);
		$subAgents = trim($subAgents,',');
		if (@mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE '$owner' IN ($subAgents)"))==0 && $owner!==$_SESSION['admin'] && $_SESSION['adminlvl']!=='admin'){
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			exit;
		}
	}
}
if (isset($_POST['status'])) { 
	$amount = antisqli($_POST['amount']);
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	$login = antisqli($_POST['login']);
	$q = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$login'");
	if (mysqli_num_rows($q)==0){
		$errormsg = $lang['Invalid+action'].' - User does not exist';
		echo $errormsg;
		exit;	
	}else{
		$owner = mysqli_result($q,0);
		$subAgents = '';
		getSubAgents($_SESSION['admin']);
		$subAgents = trim($subAgents,',');
		if (@mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE '$owner' IN ($subAgents)"))==0 && $owner!==$_SESSION['admin'] && $_SESSION['adminlvl']!=='admin'){
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			exit;
		}
	}
	
	if (mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE id='$id'")){
		echo '<br />';
		if ($_POST['status']==2) { // decline the deposit request
			mysqli_query($GLOBALS['con'],"UPDATE `cws_deposits` SET `status`='2' WHERE `id`='$id'");
			echo $lang['Deposit'].' #'.$id.' '.$lang['Declined'];
		}elseif ($_POST['status']==1) { // approve the deposit request if the user exists
			
			if(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE id='$id' AND status='0'")){
				$q1 = mysqli_query($GLOBALS['con'],"SELECT amount FROM cws_deposits WHERE id='$id' AND status='0'") or error_report('1_'.mysqli_error($GLOBALS['con']));
				$amount = @mysqli_result($q1,0);
				$q1 = mysqli_query($GLOBALS['con'],"SELECT user FROM cws_deposits WHERE id='$id' AND status='0'") or error_report('2_'.mysqli_error($GLOBALS['con']));
				$login = @mysqli_result($q1,0);
				if ($amount=="" || empty($amount)){$amount = 0;}
				mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`=cash+'$amount' WHERE `login`='$login'");
				//give bonus to player
				$tmp = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT details FROM cws_deposits WHERE id='$id' AND status='0'"),0);
				if (stristr($tmp,'BONUSCODE=') && strlen($tmp)>5){
					$bonuscode = antisqli(str_replace('BONUSCODE=','',$tmp));
					if (check_validity($bonuscode,$login)){
						$tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_codes_bonus WHERE code='$bonuscode' AND status='1'"));	
						if ($tmp['type']=='fixed'){
							$bonus_val = $tmp['amount'];
						}else{
							$bonus_val = $amount * $tmp['amount'] / 100;
						}
						$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$login}'"),0);
						credit_just_bonus('depbn-'.$id,$userid,$amount,$bonus_val,$tmp['unlock_limit']);
						echo $lang['Bonus+of'].' '.$bonus_val.' '.$_SESSION['currency'].' '.$lang['credited+to'].' '.$login.'<br />';
					}else{
						echo $lang['Bonus+code'].' "'.$bonuscode.'" invalid.';
					}
				}
				//end give bonus to player
				mysqli_query($GLOBALS['con'],"UPDATE `cws_deposits` SET `status`='1' WHERE `id`='$id'");
				echo $lang['Deposit'].' #'.$id.' '.$lang['Approved'].': '.($amount).' '.$_SESSION['currency'].' added to '.$login; 
			}else{
				echo $lang['Deposit'].' #'.$id.' '.$lang['Declined'].' - error';
			}
		}
	}
}?>
</span></h3>
<a onclick="javascript:show('fn_deposits');" href="#show" class="button dblueB"><span><?=$lang['All+deposits']?></span></a> 

<a onclick="javascript:showparam('fn_deposits','type=2');" class="button dblueB" href="#show"><span><?=$lang['Declined+Deposits']?></span></a> 
<a onclick="javascript:showparam('fn_deposits','type=0');" class="button dblueB" href="#show"><span><?=$lang['Pending+Deposits']?></span></a> 
<a onclick="javascript:showparam('fn_deposits','type=1');" class="button dblueB" href="#show"><span><?=$lang['Approved+Deposits']?></span></a>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Deposits']?></h6>
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
<tr >
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('fn_deposits','id')?></th>
<th class="top acenter"><?=$lang['Username']?><?=show_order_by('fn_deposits','user')?></th>
<th class="top acenter"><?=$lang['Amount']?><?=show_order_by('fn_deposits','amount')?></th>
<th class="top acenter"><?=$lang['Email']?><?=show_order_by('fn_deposits','email')?></th>
<th class="top acenter"><?=$lang['Date']?><?=show_order_by('fn_deposits','date')?></th>
<th class="top acenter"><?=$lang['Type']?><?=show_order_by('fn_deposits','type')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('fn_deposits','status')?></th>
<th class="top acenter"><?=$lang['Other+details']?><?=show_order_by('fn_deposits','details')?></th>
<th class="top acenter"><?=$lang['Notes']?></th>
<th class="top acenter">IP</th>
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

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='status ASC, date';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='DESC';}
$datefilter ='';
$_POST['fromdate'] = antisqli($_POST['fromdate']);
$_POST['todate'] = antisqli($_POST['todate']);
if (strlen($_POST['fromdate'])>0){
						$_POST['fromdate'] = date('Y-m-d H:i:s',strtotime(antisqli($_POST['fromdate']))); 
						$fromdate =  "AND date>='".$_POST['fromdate']."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND date<='".date('Y-m-d H:i:s',time()+186400)."'";
					}
if (isset($_POST['type'])) { $type = "AND `status`='".antisqli($_POST['type'])."'";}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `user` LIKE '".antisqli($_POST['search'])."'");}
if (isset($_POST['searchid'])&& strlen($_POST['searchid'])>0){$typeid="AND id='".antisqli($_POST['searchid'])."'";}
// 2 = declined ; 1 = completed ; 0 = pending

$pquery = "SELECT * FROM `cws_deposits` WHERE 1=1 $type $typeid $fromdate $todate ORDER BY $orderby $ordertype ";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or die(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="8">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><span id="check_deposit_<?=$row['id']?>"><?=$row['id']?></span></td>
					<td class="acenter"><strong><?=$row['user']?></strong></td>
					<td class="acenter"><span class="cash"><?=cash_format_cws($row['amount'],2)?> <?=$_SESSION['currency']?></span></td>
                    <td class="acenter time"><?=$row['email']?></td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <td class="acenter"><?=$row['type']?></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter neutral"><span style="color:red">Pending</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Completed</span></td>';break;
						case 2:echo '<td class="acenter negative"><span style="color:red">Declined</span></td>';break;
						default:echo '<td class="acenter neutral"><span style="color:red">Pending</span></td>';break;
					}?>
                    <td class="acenter"><?=$row['details']?></td>
                    <td class="acenter"><?=$row['notes']?></td>
                    <td class="acenter"><span style="color:blue;font-weight:bold"><?=$row['ip']?></span></td>
                    <td class="acenter">
                    <div class="manageTd">
					<?php if ($row['status']==0) { 
					echo '<a onclick="javascript:showparam(\'fn_deposits\',\'status=1&amount='.$row['amount'].'&id='.$row['id'].'&login='.$row['user'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Approve'].'"><img class="icon2" alt="'.$lang['Approve'].' tipS" original-title="'.$lang['Approve'].'"  src="images/icons/light/check.png" style="vertical-align:middle"><span>&nbsp;</span></a> 
					<a onclick="javascript:showparam(\'fn_deposits\',\'status=2&amount='.$row['amount'].'&id='.$row['id'].'&login='.$row['user'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Decline'].'"><img class="icon2" alt="'.$lang['Decline'].' tipS" original-title="'.$lang['Decline'].'"src="images/icons/light/block.png" style="vertical-align:middle"><span>&nbsp;</span></a> ';}?>
                    
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
</div>