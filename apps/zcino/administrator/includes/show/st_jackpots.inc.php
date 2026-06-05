<?php
//this php file lists all the gameplays
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst(str_replace(' ','+',$page_name)).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<div style="text-align:left;padding-left:25px;">
<script type="text/javascript">
	$(function() {
		$("#fromdate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
		$("#todate").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<form name="form" class="form"  onsubmit="return false" style="text-align:left;float:left">
<fieldset>
<div class="widget" style="width:450px;">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Search']?></h6></div>


<div class="formRow">
<label><?=$lang['Username']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="lookfor" value="<?=antisqli($_POST['search'])?>" /></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Start+date']?></label>
<div class="formRight"><input type="text" class="text small" id="fromdate" value="<?=antisqli($_POST['fromdate'])?>"/>
</div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['End+date']?></label>
<div class="formRight"><input type="text" class="text small" id="todate" value="<?=antisqli($_POST['todate'])?>"  />
</div>
<div class="clear"></div>
</div>
<div class="formRow">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Search']?>" href="#" id="search"><span><?=$lang['Search']?></span></a>
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Reset+filters']?>" href="#" id="reset" onclick="javascript:show('<?=str_replace('.inc.php','',$page_sname)?>');"><span><?=$lang['Reset+filters']?></span></a>
<br />
<span style="font-size:8px;color:red;padding-left:8px"><?=$lang['USE']?> *(<?=$lang['ASTERISK']?>) <?=$lang['AS+WILDCARD+FOR+SEARCH']?></span><br />
</div>
<script type="text/javascript">
$("#search").click(function() {
				var lookfor = escape($("#lookfor").val());
				var fromdate = $("#fromdate").val();
				var todate = $("#todate").val();
				showparam('st_jackpots','search='+lookfor+'&fromdate='+fromdate+'&todate='+todate);
							 });
</script>
</div>
<br />
<h3 style="margin-left:10px;">Jackpot Winners</h3>


<div class="widget">
    <div class="title">
    <img src="images/icons/dark/full2.png" alt="" class="titleIcon" /><h6>Jackpot Winners</h6>
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
<td class="top acenter"><?=$lang['User']?></td>
<td class="top acenter"><?=$lang['Game']?></td>
<td class="top acenter"> <?=$lang['Date']?></td>
<td class="top acenter">Client IP</td>
<td class="top acenter"><?=$lang['Bet']?></td>
<td class="top acenter"><?=$lang['Won']?></td>
<td class="top acenter" width="300"><?=$lang['Gameplay']?> hand log</td>
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
if (isset($_POST['type'])) { 
	if ($_POST['type']=='real') {
		$type = "AND `user`<>'guestlogin'";
		} else {
			$type = "AND `user`='guestlogin'";
		}
}
$datefilter ='';
$_POST['fromdate'] = antisqli($_POST['fromdate']);
$_POST['todate'] = antisqli($_POST['todate']);
if (strlen($_POST['fromdate'])>0){
						$_POST['fromdate'] = date('Y-m-d H:i:s',strtotime(antisqli($_POST['fromdate'])));
						$fromdate = "AND cws_gameplays.date>='".antisqli($_POST['fromdate'])."'";
						$datefilter .= '&fromdate='.$_POST['fromdate'];
					} else {
						$fromdate = "AND cws_gameplays.date>='2000-01-01'";
					}
if (strlen($_POST['todate'])>0){
						$tdate = date('Y-m-d H:i:s',strtotime($_POST['todate']));
						$todate = "AND cws_gameplays.date<='".$tdate."'";
						$datefilter .= '&todate='.$_POST['todate'];
					}else {
						$todate = "AND cws_gameplays.date<'".date('Y-m-d H:i:s',time()+86400)."'";
					}
if (isset($_POST['search'])&& strlen($_POST['search'])>0){$type="AND `user` LIKE '".str_replace('*','%',$_POST['search'])."'";}
$pquery = "SELECT *,
cws_gameplays.id as gpid,
cws_gameplays.status as status,
(SELECT name FROM cws_games WHERE id=cws_gameplays.gamename)

FROM `cws_gameplays` RIGHT JOIN cws_gameplays_logs ON cws_gameplays.id=cws_gameplays_logs.id WHERE player_hand LIKE '%winjackpot=1%' AND mode='real' $fromdate $todate $type $agentfilter";
$query = $pquery." ORDER BY gpid LIMIT $l1,$perpage";
$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($sql)==0) { echo '<tr><td colspan="9">'.$lang['No+results+found'].'</td></tr>';}else{
	$o=1;
while ($row = mysqli_fetch_array($sql)) {
	$o++;
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td class="acenter"><?=$row['gpid']?></td>
					<td class="acenter"><strong><?=$row['user']?></strong></td>
					<td class="acenter"><strong><?=$row['gamename'].' - '.$row['name']?></strong></td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <td class="acenter"><?=$row['ip']?></td>
                    <td class="acenter cash"><?=cash_format_cws($row['bet'],0,',','.')?> <?=$_SESSION['currency']?></td>
                    <td class="acenter cash"><?=cash_format_cws($row['won'],0,',','.')?>  <?=$_SESSION['currency']?></td>
                    <td class="acenter cash"><?=$row['player_hand']?> </td>
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