<?php
//this php file lists all the products of the POINT SHOP
//powered by zcino
require_once('../config.inc.php');
?>
<script type="text/javascript">
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

<div style="text-align:left;padding-left:25px;">
<span style="width:70px;float:left"><?=$lang['Name']?>:</span> <input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['search'])?>"/><br />
<span style="width:70px;float:left;"><?=$lang['Start+date']?>:</span> <input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/><br />
<span style="width:70px;float:left;"><?=$lang['End+date']?>:</span> <input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  /><br />
<input type="submit" class="btn def" id="search" value="<?=$lang['Search']?>"/><br />
<input type="button" class="btn def" id="reset" value="<?=$lang['Reset+filters']?>"  onclick="javascript:show('pt_list');" /><br />
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('pt_list','search='+lookfor+'&fromdate='+fromdate+'&todate='+todate);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['Point']?> <?=$lang['based']?> <?=$lang['system']?><br /><br /><?=$lang['List+Products']?>
<span style="color:red">
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `status`='$status' WHERE `id`='$id'")) 
		{
		if ($_POST['status']==1) {
			echo $lang['Product'].' #'.$id.' '.$lang['Activated'];
		} elseif ($_POST['status']==0) {
			echo $lang['Product'].' #'.$id.' '.$lang['Suspended'];
		}
	}
} elseif (isset($_POST['delete'])) { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_shop_products` WHERE `id`='$id'")) {
		echo $lang['Product'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Product'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>
<div id="user_stats" style="display:none"><?=$lang['Loading']?>...
</div>
<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Point']?> <?=$lang['based']?> <?=$lang['system']?><br /><br /><?=$lang['List+Products']?></h6>
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
<tr>
<td>
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
						$fromdate = "AND date_added>='".antisqli($_POST['fromdate'])."'";
						$fromdateC = "AND date_added>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND date_added>='2000-01-01'";
						$fromdateC = "AND date_added>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND date_added<='".$tdate."'";
						$todateC = "AND date_added<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND date_added<='".date('Y-m-d H:i:s',time()+186400)."'";
						$todateC = "AND date_added<='".date('Y-m-d H:i:s',time()+186400)."'";
					}
if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='name';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if ($_SESSION['adminlvl']=='admin') {
	if (isset($_POST['search'])&&strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `name` LIKE '".antisqli($_POST['search'])."'");}
	$pquery = "SELECT * FROM `cws_shop_products` WHERE 1=1 $type $fromdateC $todateC ORDER BY $orderby $ordertype";
	$query = $pquery." LIMIT $l1,$perpage";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
}else {
	if (isset($_POST['search'])&&strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `name` LIKE '".antisqli($_POST['search'])."'");}
	$pquery = "SELECT * FROM `cws_shop_products` WHERE 1=1 $thefilter $fromdateC  $type $todateC ORDER BY $orderby $ordertype";
	$query = $pquery." LIMIT $l1,$perpage";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
}
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="10">'.$lang['No+results+found'].'</td></tr>';}else{

while($detail = mysqli_fetch_array($sql)) // fetch all SQL data and display the games
{
$i++;
echo '
<div class="gamelist">
<div class="gameName">'.$detail['name'].'</div>
<div style="background-image:url(\''.str_replace('preview.gif','game.gif',$detail['preview_pic']).'\');background-repeat:no-repeat"  onmouseover="ShowContent(\'descimage'.$detail['id'].'\')" onmouseout="HideContent(\'descimage'.$detail['id'].'\')" >
<img src="'.$detail['image_url'].'" style="border:0px solid #666;" id="image'.$detail['id'].'" width="184" height="156" alt="'.$detail['name'].'" />
<div style="color:white;font-size:12px;height:10px;padding-top:5px;">'.substr($detail['description'],0,55).' ... </div>
</div>
<div style="display:none;" class="hidd" id="descimage'.$detail['id'].'">'.$detail['description'].'</div>
<br /><br />
<div style=\"margin-top:-8px\">
<div style=\"text-align:center;\">
<div class="manageTd">
';
if ($detail['status']==1) { 
						echo '<a onclick="javascript:showparam(\'pt_list\',\'status=0&id='.$detail['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;
					}else{ 
						echo '<a onclick="javascript:showparam(\'pt_list\',\'status=1&id='.$detail['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';
						}
						?> 
                        <a onclick="javascript:showparam('pt_edit','edit=1&id=<?=$detail['id']?>');" href="#show" class="button manage blueB tipS" original-title="<?=$lang['Edit']?>"><img class="icon2" alt="<?=$lang['Edit']?>" title="<?=$lang['Edit']?>"  src="images/icons/light/pencil.png" style="vertical-align:middle"></a>
                        <a onclick="javascript:showparam('pt_list','delete=1&id=<?=$detail['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a>
<?php                        
echo '
</div>
</div>
</div></div>';

if ($i == 4) {$i=0;echo '<br />';}
} 
}
?>
<br />
                               
</td>
</tr>
</table>
<?php
include('_inc_pages.inc.php');
?>
</div>