<?php 
//this php file lets you edit a banned IP address
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
<script type="text/javascript">
	$(function() {
		$("#ban_date").datetimepicker({dateFormat: 'yyyy-mm-dd',maxDate: 'D/M/-0Y',timeFormat: 'hh:mm:ss',dateFormat : 'yy-mm-dd',showTimezone: true,timezone: "+<?=$G_M_T?>00"});
	});
</script>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<?php
if (isset($_POST['update'])) { 
			$ok = true;
			$id = antisqli($_POST['id']);
			if (!is_numeric($id) || $id<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
						<p><strong>FAILED: </strong>';
							echo $lang['Update+failed'];
							echo '</p></div>';
			}else{
				$client_ip = antisqli($_POST['client_ip']);
				if (!is_validIP($client_ip)){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid'].' IP</strong></p></div>';
					echo '<script type="text/javascript">$("#client_ip").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE cws_bans_ip SET client_ip='$client_ip' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$duration_minutes = antisqli($_POST['duration_minutes']);
				if ($duration_minutes<=0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Duration+minutes+must+be+0+or+larger+value'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#duration_minutes").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE cws_bans_ip SET duration_minutes='$duration_minutes' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$ban_date = date('Y-m-d H:i:s',strtotime(antisqli($_POST['ban_date']))); 
				if (strlen($ban_date)<=10){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+ban+start+date'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#ban_date").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE cws_bans_ip SET ban_date='$ban_date' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$type = antisqli($_POST['type']);
				if ($type!=='frontend' && $type!=='backend'){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+type'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#type").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE cws_bans_ip SET type='$type' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				if ($demoMode!==1){
					if (@mysqli_query($GLOBALS['con'],"UPDATE `cws_bans_ip` SET `client_ip`='$client_ip',`ban_date`='$ban_date',`duration_minutes`='$duration_minutes',`type`='$type' WHERE `id`='$id'")) 
						{
							echo '<div class="nNote nSuccess hideit">
					<p><strong>SUCCESS: </strong>';
							echo $lang['Updated+successfully'];
						}else { 
							echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
							echo $lang['Update+Failed'];
							echo '</p></div>';
						}
				}else {
					echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
					echo $lang['No+changes+allowed+in+demo'];
					echo '</p></div>';
				}
			}
		}
if (isset($_POST['id'])) {$_POST['id'] = antisqli($_POST['id']);}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bans_ip WHERE `id`='".antisqli($_POST['id'])."'"));
?>


<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png" /><h6><?=$lang['Edit']?> <?=$lang['Ban']?> <span style="font-style:italic"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `client_ip` FROM `cws_bans_ip` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?></span></h6></div>
        
<div class="formRow">
<label><?=$lang['Client']?> IP </label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="client_ip" value="<?=$row['client_ip']?>" style="width:225px"/><br /><span style="font-size:10px"><?=$lang['USE']?> (%) as wildcard ( <?=$lang['Example']?> : "81.%" <?=$lang['bans+all']?> IP <?=$lang['that+start+with']?> "81." ) </span></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Duration']?> (<?=$lang['minutes']?>)</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="duration_minutes" value="<?=$row['duration_minutes']?>"  style="width:190px"/></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Ban']?> <?=$lang['Start']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="ban_date" value="<?=$row['ban_date']?>" style="width:225px"/></div>
<div class="clear"></div>
</div>



<div class="formRow">
<label><?=$lang['Type']?></label>
<div class="formRight">
<select id="type">
<option value="frontend" <?php if ($row['type']=='frontend'){echo 'selected';}?>>Frontend</option>
<option value="backend" <?php if ($row['type']=='backend'){echo 'selected';}?>>Backend(admin)</option>
</select>
</div>
<div class="clear"></div>
</div>


<a href="#updated" class="button dblueB" id="update" style="padding:5px 49px 10px 40px"><span><?=$lang['Update']?></span></a><br />
<script type="text/javascript">
$("#update").click(function() {
				var client_ip = $("#client_ip").val();
				var duration_minutes = $("#duration_minutes").val();
				var ban_date = $("#ban_date").val();
				var type = $("#type").val();
				$.post("includes/show/sec_bans_edit.inc.php", { update: "1", id: <?=antisqli($_POST['id'])?>, client_ip: client_ip, duration_minutes: duration_minutes, ban_date: ban_date, type: type},
   function(data){
     $("#show").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>
</div>
</fieldset>
</form>