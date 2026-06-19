<?php
//this php file lists all the prepaid coupons
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


<form name="form" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
    <div class="formRow">
        <label><?=$lang['Search']?> <?=$lang['code']?>:</label>
        <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" style="width:100px" value="<?=antisqli($_POST['lookfor'])?>" />
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+code+part']?>" href="#" id="search"><span><?=$lang['Search+code+part']?></span></a></div>
        <div class="clear"></div>
    </div>
    <div class="formRow">
        <label><?=$lang['Amount']?>:</label>
        <div class="formRight"><input type="text" class="text small" style="width:100px" name="smallfield" id="lookfor1"/>
        <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+amount']?>" href="#" id="search1"><span><?=$lang['Search+amount']?></span></a></div>
        <div class="clear"></div>
    </div>
<span style="font-size:8px;color:red;padding-left:10px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
<div class="formRow">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Add+new+code']?>" href="#" onclick="show('fn_prepaid_a')"><span><?=$lang['Add+new+code']?></span></a>
</div>
</div>
</fieldset>
</form>


<script type="text/javascript">
    $("#search1").click(function() {
                    var lookfor = $("#lookfor1").val();
                    showparam('fn_prepaid_list','search1='+lookfor);
                                 });
    </script>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('fn_prepaid_list','search='+lookfor);
							 });
</script>
<br />
<h3 style="margin-left:10px;"><?=$lang['Prepaid']?> 1-<?=$lang['time']?> <?=$lang['Bonus+Codes']?> <span style="color:red">

<?php
if (isset($_POST['used'])) { 
	$used = antisqli($_POST['used']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_prepaid` SET `used`='$used' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['used']==1) {
			echo $lang['Coupon'].' #'.$id.' '.$lang['Marked+as+used'];
		} elseif ($_POST['used']==0) {
			echo $lang['Coupon'].' #'.$id.' '.$lang['Marked+as+unused'];
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin') { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_codes_prepaid` WHERE `id`='$id'")) {
		echo $lang['Coupon'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Coupon'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>

<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Prepaid+Coupons']?></h6>
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
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('fn_prepaid_list','id')?></th>
<th class="top acenter"><?=$lang['Code']?><?=show_order_by('fn_prepaid_list','code')?></th>
<th class="top acenter"><?=$lang['Amount']?><?=show_order_by('fn_prepaid_list','amount')?></th>
<th class="top acenter"><?=$lang['Date']?> <?=show_order_by('fn_prepaid_list','date')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('fn_prepaid_list','used')?></th>
<th class="top acenter"><?=$lang['Created+By']?><?=show_order_by('fn_prepaid_list','created_by')?></th>
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

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='used';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `code` LIKE '".antisqli($_POST['search'])."'");}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `amount` LIKE '".antisqli($_POST['search1'])."'");}
$pquery = "SELECT * FROM `cws_codes_prepaid` $type ORDER BY $orderby $ordertype";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="7">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><?=$row['code']?></strong></td>
                    <td class="acenter"><span class="cash"><?=cash_format_cws($row['amount'],2)?> <?=$_SESSION['currency']?></span></td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <?php switch ($row['used']) { 
						case 1:echo '<td class="acenter negative"><span style="color:red">'.$lang['Used'].'<br />('.$row['used_by'].')</span></td>';break;
						case 0:echo '<td class="acenter positive"><span style="color:green">'.$lang['Unused'].'</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">'.$lang['Used'].'<br />('.$row['used_by'].')</span></td>';break;
					}?></td>
                    <td class="acenter cash"><strong><?=$row['created_by']?></strong></td>
                    <td class="acenter">
                    <div class="manageTd" style="min-width:200px">
                    <?php if ($row['used']==0) { 
					echo '<a onclick="javascript:showparam(\'fn_prepaid_list\',\'used=1&id='.$row['id'].'\');" href="#show" class="button greenB" style="height:25px;"><span style="padding:8px 4px">'.$lang['Mark+as+used'].'</span></a>';
					}else{ 
					echo '<a onclick="javascript:showparam(\'fn_prepaid_list\',\'used=0&id='.$row['id'].'\');" href="#show" class="button greyishB" style="height:25px"><span style="padding:8px 4px">'.$lang['Mark+as+unused'].'</span></a>';}?>  <a onclick="javascript:showparam('fn_prepaid_e','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"><span style="padding:8px 4px">&nbsp;</span></a> <a onclick="javascript:showparam('fn_prepaid_list','delete=1&id=<?=$row['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"><span style="padding:8px 4px">&nbsp;</span></a>
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