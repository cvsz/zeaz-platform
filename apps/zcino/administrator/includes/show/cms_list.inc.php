<?php
//this php file lists all the website pages that you have created using the CMS, and a small preview of each of them
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
    <label><?=$lang['Search']?> <?=$lang['page']?> <?=$lang['name']?>:</label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['lookfor'])?>" /></div>
    <div class="clear"></div>
    </div>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+page']?>" href="#" id="search"><span><?=$lang['Search+page']?></span></a>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
<span style="font-size:8px;color:red;padding-left:10px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span></div>
</fieldset>
</form>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('cms_list','search='+lookfor);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['Edit']?> <span style="color:red"><?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_pages` SET `status`='$status' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['status']==1) {
			echo $lang['Page'].' #'.$id.' '.$lang['Enabled'];
		} elseif ($_POST['status']==0) {
			echo $lang['Page'].' #'.$id.' '.$lang['Disabled'];
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin') { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_pages` WHERE `id`='$id'")) {
		echo $lang['Page'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Page'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>

<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6>CMS <?=$lang['List']?> <?=$lang['Pages']?></h6>
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
<th class="top acenter">ID</td>
<th class="top acenter"><?=$lang['Name']?><?=show_order_by('cms_list','name')?></th>
<th class="top acenter"><?=$lang['Short+name']?><?=show_order_by('min_bet','pagecode')?></th>
<th class="top acenter"><?=$lang['Content']?><?=show_order_by('cms_list','content')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('cms_list','status')?></th>
<th class="top acenter"><?=$lang['Date']?><?=show_order_by('cms_list','jackpot')?></th>
<th class="top acenter"><?=$lang['Page']?> <?=$lang['Management']?> </th>
</tr>
</thead>
<tbody>	  	  
<?php
$page = antisqli($_POST['page']);
if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='name';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if (isset($_POST['type'])) { $type = "WHERE `game_type`='".antisqli($_POST['type'])."'";}
// 2 = declined ; 1 = completed ; 0 = pending
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `name` LIKE '".antisqli($_POST['search'])."'");}
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_pages` $type ORDER BY $orderby $ordertype") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="7">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
                    <td class="acenter"><strong><?=$row['name']?></strong></td>
                    <td class="acenter"><strong><?=$row['pagecode']?></strong></td>
                    <td class="acenter"><textarea style="width:500px;height:100px" rows="4" cols="10"><?=htmlspecialchars($row['content'])?></textarea></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Enabled</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
					}?></td>
                 	<td class="acenter time"><strong><?=$row['date']?></strong></td>
                    <td class="acenter">
                    <div class="manageTd">
                    <?php if ($row['status']==0) { echo '<a onclick="javascript:showparam(\'cms_list\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';}else{ echo '<a onclick="javascript:showparam(\'cms_list\',\'status=0&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;}?> <a onclick="javascript:showparam('cms_edit','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a> <a onclick="javascript:showparam('cms_list','delete=1&id=<?=$row['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a>
                    </div></td>
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
