<?php
//this php file lets you edit the selected deposit bonus
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
}?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<?php
if (isset($_POST['update'])) { 
			echo '<script type="text/javascript">
					$("#code").css("border","");
					$("#status").css("border","");
					$("#amount").css("border","");
					$("#type").css("border","");
					$("#unlock_limit").css("border","");
					</script>
					'; 
			$ok = true;
			$id = antisqli($_POST['id']);
			if (!is_numeric($id) || $id<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
						<p><strong>FAILED: </strong>';
							echo $lang['Update+failed'];
							echo '</p></div>';
			}else{
				$code = antisqli($_POST['code']);
				if (strlen($code)>20 || !checkName($code)){
					$ok = false;
					if (!checkName($code)){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+code'].'</strong></p></div>';
						}elseif(strlen($code)>20){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Code+too+long'].'</strong></p></div>';
						}
					echo '<script type="text/javascript">$("#code").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `code`='$code' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$status = antisqli($_POST['status']);
				if ($status<0 || $status>1){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$amount = antisqli($_POST['amount']);
				if (!is_numeric($amount) || $amount<=0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Bonus+amount+must+be+larger+than+0'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#amount").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `amount`='$amount' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
			
			
				$type = antisqli($_POST['type']);
				if ($type!=='fixed' && $type!=='percent'){
					$ok = false;
					echo '<script type="text/javascript">$("#type").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `type`='$type' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$unlock_limit = antisqli($_POST['unlock_limit']);
				if (!is_numeric($unlock_limit) || $unlock_limit<0){
					$ok = false;
					echo '<script type="text/javascript">$("#unlock_limit").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `unlock_limit`='$unlock_limit' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$limit_per_account = antisqli($_POST['limit_per_account']);
				if (!is_numeric($limit_per_account) || $limit_per_account<0){
					$ok = false;
					echo '<script type="text/javascript">$("#limit_per_account").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_codes_bonus` SET `limit_per_account`='$limit_per_account' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
			
				if ($ok!==false){				
						echo '<div class="nNote nSuccess hideit">
					<p><strong>SUCCESS: </strong>';
						echo $lang['Updated+successfully'];
						echo '</p></div>';
					}else { 
						echo '<div class="nNote nFailure hideit">
					<p><strong>'.$lang['Failed'].' </strong></p></div>';
					}
		}
	}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_codes_bonus WHERE `id`='".antisqli($_POST['id'])."'"));
?>
<form name="form" onsubmit="return false" class="form" style="text-align:left">
<fieldset>
 <div class="widget">
	<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Edit+Bonus+Code']?></h6></div>
	<div style="text-align:left;padding-left:25px;">
    
    
<div class="formRow">    
<label><?=$lang['Bonus+Code']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="code" value="<?=$row['code']?>" style="width:250px"/>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Bonus+Amount']?>/<?=$lang['Percentage']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="amount" value="<?=$row['amount']?>"  style="width:100px"/><?=$_SESSION['currency']?> / %    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['How+many+times+BONUS+AMOUNT+must+be+wagered']?>,<br /> <?=$lang['to+unlock+bonus+in+account']?>(ROLLOVER)</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="unlock_limit" value="<?=$row['unlock_limit']?>" style="width:70px"/> <?=$lang['minimum']?> recommended = <?=(100/mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0))?>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['How+many+times+a+player+can+use+this']?><br /> <?=$lang['BONUS CODE']?> <?=$lang['when+depositing']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="limit_per_account" value="<?=$row['limit_per_account']?>" style="width:70px"/><span style="font-size:10px;color:blue">Set to 1 for FIRST DEPOSIT BONUSES</span> </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Status']?></label>
<div class="formRight"><select id="status">
<option value="1" <?php if ($row['status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
<option value="0" <?php if ($row['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
</select>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Type']?></label>
<div class="formRight"><select id="type">
<option value="fixed" <?php if ($row['type']=='fixed'){echo 'selected';}?>><?=$lang['Fixed']?> (<?=$_SESSION['currency']?>)</option>
<option value="percent" <?php if ($row['type']=='percent'){echo 'selected';}?>><?=$lang['Procentual']?>(%)</option>
</select>    </div>
	<div class="clear"></div>    
</div>

<a style="margin: 5px;" class="button dblueB" id="update" title="<?=$lang['Update']?>" href="#"><span><?=$lang['Update']?></span></a>
<script type="text/javascript">
$("#update").click(function() {
				var code = $("#code").val();
				var amount = $("#amount").val();
				var status = $("#status option:selected").val();
				var type = $("#type option:selected").val();
				var unlock_limit = $("#unlock_limit").val();
				var limit_per_account = $("#limit_per_account").val();
				showparam('fn_bonus_e','update=1&'+'code='+code+'&'+'amount='+amount+'&'+'status='+status+'&'+'unlock_limit='+unlock_limit+'&'+'type='+type+'&'+'id=<?=antisqli($_POST['id'])?>'+'&limit_per_account='+limit_per_account);
							 });
</script>
</fieldset>
</form>
</div>
