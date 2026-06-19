<?php
//this php file lists all the orders that have been made through the POINT SHOP
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


<div style="text-align:left;padding-left:25px;">
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_orders` SET `status`='$status' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['status']==1) {
			echo $lang['Order'].' #'.$id.' '.$lang['Marked+as+completed'];
		} elseif ($_POST['status']==0) {
			echo $lang['Order'].' #'.$id.' '.$lang['Marked+as+pending'];
		}
	}
}
?>
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<div style="text-align:left;padding-left:25px;">
<span style="width:70px;float:left"><?=$lang['Username']?>:</span> <input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['search'])?>" /><br />
<span style="width:70px;float:left;"><?=$lang['Start+date']?>:</span> <input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/><br />
<span style="width:70px;float:left;"><?=$lang['End+date']?>:</span> <input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  /><br />
<input type="submit" class="btn def" id="search" value="<?=$lang['Search']?>"/><br />
<input type="button" class="btn def" id="reset" value="<?=$lang['Reset+filters']?>"  onclick="javascript:show('pt_orders');" /><br />
<br />
<span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('pt_orders','search='+lookfor+'&fromdate='+fromdate+'&todate='+todate);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['List+Orders']?></h3>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['List+Orders']?></h6>
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
<td class="top acenter">ID</td>
<td class="top acenter"><?=$lang['Product']?></td>
<td class="top acenter"><?=$lang['Username']?></td>
<td class="top acenter"><?=$lang['Address']?></td>
<td class="top acenter"><?=$lang['Status']?></td>
<td class="top acenter"><?=$lang['Date']?></td>
<td class="top acenter"><?=$lang['Manage']?></td>
</tr>
</thead>
<tbody>	  	 
<?php
if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
$page = antisqli($_POST['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='id';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
$datefilter ='';
$_POST['fromdate'] = antisqli($_POST['fromdate']);
$_POST['todate'] = antisqli($_POST['todate']);
if (strlen($_POST['fromdate'])>0){
						$fromdate = "AND cws_shop_orders.date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND cws_shop_orders.date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND cws_shop_orders.date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = '';
					}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type="AND `name` LIKE '".str_replace('*','%',$_POST['search'])."'";}
$pquery = "SELECT * FROM `cws_shop_orders` WHERE 1=1 $fromdate $todate $type";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="7">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><?=@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT name FROM cws_shop_products WHERE id='{$row['productid']}'"),0)?><br />Product ID=<?=$row['productid']?></strong></td>
					<td class="acenter"><strong><?=@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='{$row['buyerid']}'"),0)?></strong></td>
                    <td class="acenter"><strong><?=$row['address']?></strong></td>
                    <td class="acenter"><strong><?=($row['status']==1)?'<span style="color:green">Completed</span>':'<span style="color:red">Pending</span>'?></strong></td>
                    <td class="acenter time"><strong><?=$row['date']?></strong></td>
                    <td class="acenter">
                    <?php if ($row['status']==0) { echo '<a onclick="javascript:showparam(\'pt_orders\',\'status=1&id='.$row['id'].'\');" href="#show">'.$lang['Mark+as+completed'].'</a>';}else{ echo '<a onclick="javascript:showparam(\'pt_orders\',\'status=0&id='.$row['id'].'\');" href="#show">'.$lang['Mark+as+pending'].'</a>';}?>  
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