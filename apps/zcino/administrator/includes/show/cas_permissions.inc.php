<?php
//this php file lets you set the access privileges for each admin page/file
//powered by zcino
require_once('../config.inc.php');
if ($_SESSION['adminlvl']!=='admin' ||($demoMode==1 && isset($_POST['update']))){
	die($lang['Restricted+access'].' - '.$lang['Insufficient+privileges']);
}
?>
<div id="linkheader">Casino Settings<span style="color:#000">&gt;&gt;&gt;</span> <?php echo '<a href="#" onclick="showparam(\'cas_permissions\')">'.$lang['Administrator+Panel+Permissions'].'</a>';?></div><br /><br /><br /><br /><br /> 
<h3 style="margin-left:10px;"><?=$lang['Permissions']?> <span style="color:red">
<?php
if (!isset($_POST['perpage'])){$_POST['perpage'] = 100;}
if (isset($_POST['update'])){
	$rows = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT max(id) FROM cws_permissions"),0);
	for ($i=1;$i<=$rows;$i++){
		${'agent'.$i} = antisqli($_POST['agent'.$i]);
		${'operator'.$i} = antisqli($_POST['operator'.$i]);
		if (${'agent'.$i}!=='1'){
			${'agent'.$i} = 0;
		}
		
		if (${'operator'.$i}!=='1'){
			${'operator'.$i} = 0;
		}
		mysqli_query($GLOBALS['con'],"UPDATE cws_permissions SET agent='".${'agent'.$i}."',operator='".${'operator'.$i}."' WHERE id=".$i."") or error_report(mysqli_error($GLOBALS['con']));
	}
	echo $lang['Updated+successfully'];
	
}
?></span></h3>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Administrator+Panel+Permissions']?></h6>
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
<form name="ff1" onsubmit="return false">                     
<table cellpadding="0" cellspacing="0" border="0" class="display dTable">
<thead>
<tr>
<th width="3%" class="top acenter">ID<?=show_order_by('cas_permissions','id')?></th>
<th width="6%" class="top acenter"><?=$lang['Category']?> <?=show_order_by('cas_permissions','category')?></th>
<th width="6%" class="top acenter"><?=$lang['Page']?> <?=$lang['name']?><?=show_order_by('cas_permissions','name')?></th>
<th width="6%" class="top acenter"><?=$lang['File']?> <?=$lang['name']?><?=show_order_by('cas_permissions','shortname')?></th>
<th width="8%" class="top acenter"><?=$lang['Agent']?><?=show_order_by('cas_permissions','agent')?></th>
<th width="11%" class="top acenter"><?=$lang['Operator']?><?=show_order_by('cas_permissions','operator')?></th>
</tr>	  
</thead>
<tbody>	  	 
<?php
if (!is_numeric($_POST['page']) ||$_POST['page']<0 ||!isset($_POST['page']) ||empty($_POST['page'])){$_POST['page'] = 1;}
$page = antisqli($_POST['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

$pquery = "SELECT * FROM cws_permissions ORDER BY category,name";
$query = $pquery;

$sql = mysqli_query($GLOBALS['con'],$query) or die('Error: '.mysqli_error($GLOBALS['con']).' --- Query :'.$query);
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="8">'.$lang['No+results+found'].'</td></tr>';}else{
	$vars = '';
	$cond = '';
$o=1;	
while ($row = mysqli_fetch_array($sql)) {
	$o++;
	$cond.= "
	var checked = $('input[id=agent".$row['id']."]').is(':checked');
	if(checked == true) { var agent".$row['id']."  = 'agent".$row['id']."=1';}else {agent".$row['id']." = 'agent".$row['id']."=0';}
	var checked = $('input[id=operator".$row['id']."]').is(':checked');
	if(checked == true) { var operator".$row['id']."  = 'operator".$row['id']."=1';}else {operator".$row['id']." = 'operator".$row['id']."=0';}";
	$vars.= "+'&'+agent".$row['id']."+'&'+operator".$row['id'];
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
    <td class="acenter"><?=$row['id']?></td>
    <td class="acenter"><?=str_replace('+',' ',$row['category'])?></td>
    <td class="acenter"><?=$row['name']?></td>
    <td class="acenter"><?=$row['shortname']?></td>
    <td class="acenter"><input type="checkbox" name="agent" <?php if ($row['agent']=='1') {echo 'checked';}?> id="agent<?=$row['id']?>" value="1" /></td>
    <td class="acenter"><input type="checkbox" name="operator" <?php if ($row['operator']=='1') {echo 'checked';}?> id="operator<?=$row['id']?>" value="1" /></td>
</tr>
<?php
	}
}
?>
<tr><td>

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" onclick="update_perm()"><span><?=$lang['Update']?></span></a>
</tbody>
</table>
</form>
<?php
include('_inc_pages.inc.php');
?>
</div>
<script type="text/javascript">
function update_perm(){
	<?=$cond?>
	showparam('cas_permissions','update=1'<?=$vars?>);	
}
</script><br />
                               
		  
                                <!-- content end -->