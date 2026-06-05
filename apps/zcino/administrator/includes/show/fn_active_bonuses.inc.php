<?php
//this php file lists all the bonuses that the players activated/triggered/used
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
<input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['lookfor'])?>" />
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+code+part']?>" href="#" id="search"><span><?=$lang['Search+code+part']?></span></a>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('fn_active_bonuses','search='+lookfor);
							 });
</script>
</div>
<div style="text-align:left;padding-left:25px;">
<input type="text" class="text small" name="smallfield" id="lookfor1"/>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search+amount']?>" href="#" id="search1"><span><?=$lang['Search+amount']?></span></a><br />
<span style="font-size:8px;color:red"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Add+new+code']?>" href="#" onclick="show('fn_bonus_a')"><span><?=$lang['Add+new+code']?></span></a>
<script type="text/javascript">
$("#search1").click(function() {
				var lookfor = $("#lookfor1").val();
				showparam('fn_active_bonuses','search1='+lookfor);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['Deposit+Bonus+Codes']?> <span style="color:red">
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_bonuses` SET `status`='$status' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['status']==1) {
			echo $lang['Bonus+code'].' #'.$id.' '.$lang['Enabled'];
		} elseif ($_POST['status']==0) {
			echo $lang['Bonus+code'].' #'.$id.' '.$lang['Disabled'];
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin') { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_bonuses` WHERE `id`='$id'")) {
		echo $lang['Bonus+code'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Bonus+code'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>

<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Active+Bonuses']?></h6>
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
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('fn_active_bonuses','id')?></th>
<th class="top acenter"><?=$lang['User']?><?=show_order_by('fn_active_bonuses','user')?></th>
<th class="top acenter"><?=$lang['Bonus+code']?><?=show_order_by('fn_active_bonuses','code')?></th>
<th class="top acenter"><?=$lang['Amount']?><?=show_order_by('fn_active_bonuses','amount')?></th>
<th class="top acenter"><?=$lang['Date+started']?><?=show_order_by('fn_active_bonuses','date_started')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('fn_active_bonuses','status')?></th>
<th class="top acenter"><?=$lang['Times+to+play+to+unlock']?><?=show_order_by('fn_active_bonuses','unlock_limit')?></th>
<th class="top acenter"><?=$lang['Progress']?><br /><span style="font-size:9px">(<?=$lang['played']?>/<?=$lang['must+play']?>)</span><?=show_order_by('fn_active_bonuses','progress')?></th>
<th class="top acenter"><?=$lang['Redeemed']?><?=show_order_by('fn_active_bonuses','redeemed')?></th>
<th class="top acenter"><?=$lang['Date+redeemed']?><?=show_order_by('fn_active_bonuses','date_activated')?></th>
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
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"AND `code` LIKE '".antisqli($_POST['search'])."'");}
if (isset($_POST['search1'])){$type1= str_replace('*','%',"AND FLOOR(amount) LIKE '".antisqli(floor($_POST['search1']))."'");}
$pquery = "SELECT *,(SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user=b.user AND cws_gameplays.date>=b.date_started)*100/(amount*unlock_limit) as progress FROM `cws_bonuses` b WHERE 1=1 $type $type1 ORDER BY $orderby $ordertype";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="8">'.$lang['No+results+found'].'</td></tr>';}else {
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
                    <td class="acenter"><?=$row['user']?></td>
					<td class="acenter"><strong><?=$row['code']?></strong></td>
                    <td class="acenter"><span class="cash"><?=cash_format_cws($row['amount'],2)?> <?php echo $_SESSION['currency'];?></span></td>
                    <td class="acenter"><?=$row['date_started']?></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Enabled</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
					}?>
                    <td class="acenter cash"><strong><?=$row['unlock_limit']?> <?=$lang['times']?></strong></td>
                    <td class="acenter cash"><strong><?=number_format($row['progress'],2)?> % </strong><br /><span style="font-size:9px"> (<?=cash_format_cws($row['unlock_limit']*$row['amount']*$row['progress']/100,2)?>/<?=cash_format_cws($row['unlock_limit']*$row['amount'],2)?>)</span></td>
                    <td class="acenter cash"><strong><?php if ($row['redeemed']==1){echo 'Yes';}else{echo 'No';}?></strong></td>
                    <td class="acenter cash"><strong><?php if ($row['redeemed']==1){echo $row['date_activated'];}else{echo '<span style="color:blue">Not Redeemed</span>';} ?></strong></td>
                    <td class="acenter">
                    <div class="manageTd">
                    <?php if ($row['status']==0) { echo '<a onclick="javascript:showparam(\'fn_active_bonuses\',\'status=1&id='.$row['id'].'\');" href="#show" class="button manage greenB tipS" original-title="'.$lang['Enable'].'"><img class="icon2" alt="'.$lang['Enable'].' tipS" original-title="'.$lang['Enable'].'"  src="images/icons/light/check.png" style="vertical-align:middle"></a>';}else{ echo '<a onclick="javascript:showparam(\'fn_active_bonuses\',\'status=0&id='.$row['id'].'\');" href="#show" class="button manage blackB tipS" original-title="'.$lang['Disable'].'"><img class="icon2" alt="'.$lang['Disable'].' tipS" original-title="'.$lang['Disable'].'"src="images/icons/light/block.png" style="vertical-align:middle"></a>';;}?> <a onclick="javascript:showparam('fn_active_bonuses','delete=1&id=<?=$row['id']?>');"  href="#show" class="button manage redB tipS"  original-title="<?=$lang['Delete']?>"><img class="icon2" alt="<?=$lang['Delete']?>" title="<?=$lang['Delete']?>" src="images/icons/light/close.png" style="vertical-align:middle"></a> 
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