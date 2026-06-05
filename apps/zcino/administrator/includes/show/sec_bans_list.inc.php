<?php
//this php file lists all the bans
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
<label><?=$lang['Search']?> IP:</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['lookfor'])?>" /></div>
<div class="clear"></div>
</div>

<div class="formRow">
<span style="font-size:8px;color:red;padding-left:10px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?> IP" href="#" id="search"><span><?=$lang['Search']?> IP</span></a>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
</div>
</div>
</fieldset>
</form>

<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('sec_bans_list','search='+lookfor);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['List+IP+Bans']?> <span style="color:red"><?php
if (isset($_POST['duration_minutes'])) { 
	$duration_minutes = antisqli($_POST['duration_minutes']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_bans_ip` SET `duration_minutes`='$duration_minutes' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['status']==0) {
			echo $lang['Ban'].' #'.$id.' Removed';
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin') { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_bans_ip` WHERE `id`='$id'")) {
		echo $lang['Ban'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Ban'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['List+IP+Bans']?></h6>
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
<td class="top acenter">ID</td>
<td class="top acenter"><?=$lang['Client']?> IP<?=show_order_by('sec_bans_list','client_ip')?></td>
<td class="top acenter"><?=$lang['Duration']?>(<?=$lang['minutes']?>)<?=show_order_by('min_bet','duration_minutes')?></td>
<td class="top acenter"><?=$lang['Ban+started+at']?><?=show_order_by('sec_bans_list','ban_date')?></td>
<td class="top acenter"><?=$lang['Ban+ends+at']?><br /></td>
<td class="top acenter"><?=$lang['Type']?><?=show_order_by('sec_bans_list','type')?></td>
<td class="top acenter"><?=$lang['Management']?><br /></td>
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
if (isset($_POST['type'])) { $type = "WHERE `game_type`='".antisqli($_POST['type'])."'";}
// 2 = declined ; 1 = completed ; 0 = pending
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `client_ip` LIKE '".antisqli($_POST['search'])."'");}
$pquery = "SELECT * FROM `cws_bans_ip` $type ORDER BY $orderby $ordertype";
$query = $pquery."  LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report('1_'.mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="7">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
                    <td class="acenter" style="color:#060"><strong><?=$row['client_ip']?></strong></td>
					<td class="acenter"><strong><?=$row['duration_minutes']?></strong></td>
                    <td class="acenter" style="color:red"><strong><?=$row['ban_date']?></strong></td>
                    <td class="acenter time"><strong>
					<?php
					$date = $row['ban_date'];
					$currentDate = strtotime($date);
					$futureDate = $currentDate+(60*$row['duration_minutes']);
					$expiryDate = date("Y-m-d H:i:s", $futureDate);
					echo $expiryDate;
					?></strong><?php if (strtotime($expiryDate)<=strtotime(date("Y-m-d H:i:s"))) {echo '<br /><span style="color:green;font-size:8px">EXPIRED</span>';}?></td>
                    <td class="acenter"><strong><?=$row['type']?></strong></td>                    
                    <td class="acenter">
                    <div class="manageTd" style="vertical-align:middle">
                    <?php if (strtotime($expiryDate)>strtotime(date("Y-m-d H:i:s"))) {  // if expiry date is smaller than current time, it means the ban is still there
					echo '<a onclick="javascript:showparam(\'sec_bans_list\',\'duration_minutes=0&id='.$row['id'].'\');" href="#show" class="button violetB" style="height:25px"><span>'.$lang['Remove+ban'].'</span></a>';
					}else{ ?>
                    <a href="#show" class="button greyishB" style="height:25px"><span><?=$lang['Ban+Expired']?></span></a>
					<?php }?>
                    <a onclick="javascript:showparam('sec_bans_edit','edit=1&id=<?=$row['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"><span>&nbsp;</span></a> 
                    <a onclick="javascript:showparam('sec_bans_list','delete=1&id=<?=$row['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"><span>&nbsp;</span></a>
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