<?php
//this php file lists all the deposit bonuses
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($page_name).'</a>';}else{ echo $page_name;}?></div><br /><br />
<br />

<div class="widget" style="width:300px;overflow:hidden">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Banned+games+for+calculating']?> ROLLOVER:</h6></div>
    <div class="formRow">
    <?php
	$bq = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT banned_games FROM cws_settings"),0);
	$banned_games = explode(',',$bq);
	echo '<ul style="list-style-type: square;">';
	foreach ($banned_games as $key=>$value){
		$game_tmp = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT name,game_type FROM cws_games WHERE id='$value'"));
		echo '<li style="font-weight:bold;color:red;">'.$game_tmp['name'].' - <span style="color:blue">'.$game_tmp['game_type'].'</span></li>';
	}
	echo '</ul>';
	?>
    </div>
</div>
<br /><br /> 

<form name="form" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget" style="width:450px;">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>
    <div class="formRow">
        <label><?=$lang['Search']?> <?=$lang['Username']?>:</label>
        <div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" style="width:100px" value="<?=antisqli($_POST['lookfor'])?>" />
<a style="margin: 5px;" class="button dblueB" title="Search user" href="#" id="search"><span><?=$lang['Search+user']?></span></a></div>
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

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Add+new+code']?>" href="#" onclick="show('fn_freec_a')"><span><?=$lang['Give+more+FREE+CHIPS']?></span></a>
</div>
</div>
</fieldset>
</form>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				showparam('fn_freec_list','search='+lookfor);
							 });
</script>
<script type="text/javascript">
$("#search1").click(function() {
				var lookfor = $("#lookfor1").val();
				showparam('fn_freec_list','search1='+lookfor);
							 });
</script>
</div>
<h3 style="margin-left:10px;"><?=$lang['Free+Chips+Given']?><span style="color:red">
<?php
if (isset($_POST['status'])) { 
	$status = antisqli($_POST['status']);
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"UPDATE `cws_bonuses_instant` SET `status`='$status' WHERE `id`='$id'")) 
		{
		echo '<br />';
		if ($_POST['status']==1) {
			echo 'Bonus complete';
		}elseif ($_POST['status']==1) {
			echo $lang['Bonus+code'].' #'.$id.' '.$lang['Enabled'];
		} elseif ($_POST['status']==0) {
			echo $lang['Bonus+code'].' #'.$id.' '.$lang['Disabled'];
		}
	}
} elseif (isset($_POST['delete'])&& $_SESSION['adminlvl']=='admin' && 5==6) { 
	$id = antisqli($_POST['id']);
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_bonuses_instant` WHERE `id`='$id'")) {
		echo $lang['Bonus+code'].' #'.$id.' '.$lang['Deleted'];
	} else {
		echo $lang['Bonus+code'].' #'.$id.' '.$lang['NOT+Deleted'];
	}
}
?></span></h3>

<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6><?=$lang['Deposit+Bonus+Codes']?></h6>
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
<th class="top acenter">ID&nbsp;&nbsp;&nbsp;&nbsp;<?=show_order_by('fn_freec_list','id')?></th>
<th class="top acenter"><?=$lang['Type']?><?=show_order_by('fn_freec_list','type')?></th>
<th class="top acenter"><?=$lang['User']?> ID<?=show_order_by('fn_freec_list','userid')?></th>
<th class="top acenter"><?=$lang['Deposit+Value']?><?=show_order_by('fn_freec_list','deposit')?></th>
<th class="top acenter"><?=$lang['Bonus']?><?=show_order_by('fn_freec_list','bonus')?></th>
<th class="top acenter">Rollover<?=show_order_by('fn_freec_list','rollover')?></th>
<th class="top acenter"><?=$lang['Amount+needed+to+wager+to+withdraw']?><?=show_order_by('fn_freec_list','ulimit')?></th>
<th class="top acenter"><?=$lang['Total+player+bet']?></th>
<th class="top acenter" width="110"><?=$lang['Completed']?>(%)</th>
<th class="top acenter"><?=$lang['Date']?> <?=show_order_by('fn_freec_list','date')?></th>
<th class="top acenter"><?=$lang['Status']?><?=show_order_by('fn_freec_list','status')?></th>
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

if (isset($_POST['orderby'])&&strlen($_POST['orderby'])>0){$orderby = antisqli($_POST['orderby']);}else{$orderby='id';}
if (isset($_POST['ordertype'])&&strlen($_POST['ordertype'])>0){$ordertype = antisqli($_POST['ordertype']);}else{$ordertype='ASC';}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type= str_replace('*','%',"WHERE `login` LIKE '".antisqli($_POST['search'])."'");}
if (isset($_POST['search1'])){$type= str_replace('*','%',"WHERE `bonus` LIKE '".antisqli($_POST['search1'])."'");}
$pquery = "SELECT b.status as status,b.id as id,type,deposit,bonus,date,rollover,userid,login,(rollover*(bonus+deposit)) as ulimit FROM `cws_bonuses_instant` b INNER JOIN `cws_users` u ON u.id=b.userid $type ORDER BY $orderby $ordertype";
$query = $pquery." LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="8">'.$lang['No+results+found'].'</td></tr>';}else {
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['id']?></td>
					<td class="acenter"><strong><?php
                    
					if (stristr($row['type'],'depbn-')){
						$deposit_id = str_replace('depbn-','',$row['type']);
						echo '<span style="font-weight:bold;color:#009999">'.str_replace('depbn','Deposit Bonus - #',$row['type']).'</span>';
						echo '<br /> <a href="#check_deposit_'.$deposit_id.'" style="font-size:9px" onclick="showparam(\'fn_deposits\',\'searchid='.$deposit_id.'\');">(click for details)</a>';
					}elseif($row['type']=='free_chips'){
						echo '<span style="font-weight:bold;color:#339933">FREE CHIPS</span>';
					}
					?></strong></td>
                    <td class="acenter"><strong><a onclick="javascript:showparam('st_player','login=<?=$row['login']?>');" href="#show"><?=$row['login']?></a></strong></td>
                    <td class="acenter"><span <?php if ($row['deposit']==0.00){echo 'style="color:red"';}else{ echo 'class="cash"';}?>><?=cash_format_cws($row['deposit'],2)?><?=$_SESSION['currency']?></span></td>
                    <td class="acenter"><span class="cash"><?=cash_format_cws($row['bonus'],2)?><?=$_SESSION['currency']?></span></td>
                    <td class="acenter" style="color:blue"><strong>x <?=$row['rollover']?></strong></td>
                    <td class="acenter cash"><strong><?=cash_format_cws($row['ulimit'],2)?><?=$_SESSION['currency']?></strong></td>
                    <td class="acenter cash"><strong><?php $total_bets = get_total_bets_admin($row['login'],$row['date']); echo cash_format_cws($total_bets,2);?><?=$_SESSION['currency']?></strong></td>
                    <!-- COMPLETED STATUS -->
                    <td class="acenter" style="font-weight:bold">
                    	<?php if ($row['ulimit']==0){$percent = 100;}else{$percent = min($total_bets*100/$row['ulimit'],100);}?>
                        <span style="color:<?php if ($percent==100){echo 'blue';}elseif($percent>0){echo 'orange';}else{echo 'red';}?>"><?=number_format($percent,2)?>%</span><br />
                        <?=draw_bar($percent);?>
                    </td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Active</span>';break;
						case 2:echo '<td class="acenter positive"><span style="color:blue;font-weight:bold">Unlocked</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
					}?></td>
                    <td class="acenter">
                    <div class="manageTd">
                   <a onclick="javascript:showparam('fn_freec_list','status=2&id=<?=$row['id']?>');" href="#show" class="button manage greenB tipS" original-title="Unlock"><img class="icon2" alt="Complete tipS" original-title="Mark as Unlocked"  src="images/icons/light/check.png" style="vertical-align:middle"></a> 
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