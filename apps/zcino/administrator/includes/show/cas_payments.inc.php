<?php
//this php file manages the payment settings listing
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
if ($demoMode!==1){
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<h3 style="margin-left:10px;"><?=$lang['Payment+Methods']?> <span style="color:red">
<?php
if (isset($_POST['status']) && $_SESSION['adminlvl']=='admin') { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	$login = antisqli($_POST['login']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_depositsettings` SET `status`='$status' WHERE `id`='$id'")){
		echo '<br />';
		if ($_POST['status']==0) {
			echo $lang['Payment+Method+Disabled'];
		} elseif ($_POST['status']==1) {
			echo $lang['Payment+Method+Enabled'];
		}
	}
}?>
</span></h3>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Payment+Methods']?></h6>
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
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('cas_payments','id')?></th>
<th class="top acenter"><?=$lang['Name']?><?=show_order_by('cas_payments','name')?></th>
<th class="top acenter"><?=$lang['Email']?><?=show_order_by('cas_payments','email')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('cas_payments','status')?></th>
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

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='status';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}

// 2 = declined ; 1 = completed ; 0 = pending
$pquery = "SELECT * FROM `cws_depositsettings` $type ORDER BY $orderby $ordertype";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter cash"><strong><?=$row['name']?></strong></td>
					<td class="acenter"><strong><?=$row['deposit_email']?></strong></td>
                    <?php switch ($row['status']) { 
						case 1:echo '<td class="acenter positive"><span style="color:green">'.$lang['Enabled'].'</span></td>';break;
						default:echo '<td class="acenter neutral"><span style="color:red">'.$lang['Disabled'].'</span></td>';break;
					}?>
                    <td class="acenter">
					<div class="manageTd">
					<?php if ($row['status']==0) {
						echo '<a onclick="javascript:showparam(\'cas_payments\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';
						}else{
							echo '<a onclick="javascript:showparam(\'cas_payments\',\'status=0&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';
							}?>
                    <a onclick="javascript:showparam('cas_payments_e','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a></div></td>
               				  </tr>
<?php
}
?>
</tbody>
</table>
<?php
include('_inc_pages.inc.php');
?>
</div>
<?php } else{
	echo '<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>';	
}?>
                              <!-- content end -->