<?php
//this php file lets you add a deposit bonus
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

<?php
if (isset($_POST['add'])) { 
			echo '<script type="text/javascript">
					$("#code").css("border","");
					$("#status").css("border","");
					$("#amount").css("border","");
					$("#type").css("border","");
					$("#unlock_limit").css("border","");
					</script>
					'; 
			$ok = true;
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
			}
			
			$status = antisqli($_POST['status']);
			if ($status<0 || $status>1){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
			}
			
			$amount = antisqli($_POST['amount']);
			if (!is_numeric($amount) || $amount<=0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Bonus+amount+must+be+larger+than+0'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#amount").css("border","2px solid #F00");</script>';
			}
			
			$type = antisqli($_POST['type']);
			if ($type!=='fixed' && $type!=='percent'){
				$ok = false;
				echo '<script type="text/javascript">$("#type").css("border","2px solid #F00");</script>';
			}
			$unlock_limit = antisqli($_POST['unlock_limit']);
			if (!is_numeric($unlock_limit) || $unlock_limit<0){
				$ok = false;
				echo '<script type="text/javascript">$("#unlock_limit").css("border","2px solid #F00");</script>';
			}
			
			$limit_per_account = antisqli($_POST['limit_per_account']);
			if (!is_numeric($limit_per_account) || $limit_per_account<0){
				$ok = false;
				echo '<script type="text/javascript">$("#limit_per_account").css("border","2px solid #F00");</script>';
			}
			
			if ($ok!==false){
				mysqli_query($GLOBALS['con'],"INSERT INTO `cws_codes_bonus` (`code`,`amount`,`status`,`created_by`,`type`,`unlock_limit`,`limit_per_account`) VALUES ('$code','$amount','$status','{$_SESSION['admin']}','$type','$unlock_limit','$limit_per_account')");
				echo '<div class="nNote nSuccess hideit">
			<p><strong>SUCCESS: </strong>';
				echo $lang['Added+successfully'];
				echo '</p></div>';
			}else{ 
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Failed'].' </strong></p></div>';
			}
}
?>
<form name="form" onsubmit="return false" class="form" style="text-align:left">
<fieldset>
 <div class="widget">
	<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Add+Bonus+Code']?></h6></div>
	<div style="text-align:left;padding-left:25px;">
    
    
    
<div class="formRow">
<label> <?=$lang['Bonus+Code']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="code" value="<?=antisqli($_POST['code'])?>" style="width:250px"/>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label> <?=$lang['Bonus+Amount']?>/<?=$lang['Percentage']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="amount" value="<?=antisqli($_POST['amount'])?>"  style="width:100px"/><?=$_SESSION['currency']?> / %    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['How+many+times+BONUS+AMOUNT+must+be+wagered']?>,<br /> <?=$lang['to+unlock+bonus+in+account']?>(ROLLOVER)</label> 
<div class="formRight"><input type="text" class="text small" name="smallfield" id="unlock_limit" value="<?=antisqli($_POST['unlock_limit'])?>" style="width:100px"/> <?=$lang['minimum']?> recommended = <?php
	$mmin = 100/mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0);
	if ($mmin==""){
		$mmin = 1000;
	}
	echo $mmin;
	?>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['How+many+times+a+player+can+use+this']?><br /> <?=$lang['BONUS CODE']?> <?=$lang['when+depositing']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="limit_per_account" value="<?=isset($_POST['limit_per_account'])?antisqli($_POST['limit_per_account']):'9999'?>" style="width:70px"/><span style="font-size:10px;color:blue">Set to 1 for FIRST DEPOSIT BONUSES</span> </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Status']?></label>
<div class="formRight"><select id="status">
<option value="1" selected><?=$lang['Enabled']?></option>
<option value="0"><?=$lang['Disabled']?></option>
</select>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Type']?></label>
<div class="formRight"><select id="type">
<option value="fixed"><?=$lang['Fixed']?> (<?=$_SESSION['currency']?>)</option>
<option value="percent"><?=$lang['Procentual']?>(%)</option>
</select>    </div>
	<div class="clear"></div>    
</div>


<a style="margin: 5px;" class="button dblueB" id="update" title="<?=$lang['Add']?>" href="#"><span><?=$lang['Add']?></span></a>
<script type="text/javascript">
$("#update").click(function() {
				var code = $("#code").val();
				var amount = $("#amount").val();
				var status = $("#status option:selected").val();
				var type = $("#type option:selected").val();
				var unlock_limit = $("#unlock_limit").val();
				var limit_per_account = $("#limit_per_account").val();
				showparam('fn_bonus_a','add=1&'+'code='+code+'&'+'amount='+amount+'&'+'status='+status+'&'+'unlock_limit='+unlock_limit+'&'+'type='+type+'&limit_per_account='+limit_per_account);
							 });
</script>
</fieldset>
</form>
</div>