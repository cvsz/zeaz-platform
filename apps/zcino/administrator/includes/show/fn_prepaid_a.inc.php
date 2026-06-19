<?php
//this php file lets you add prepaid coupon codes
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
			if ($ok!==false){
				mysqli_query($GLOBALS['con'],"INSERT INTO `cws_codes_prepaid` (`code`,`amount`,`used`,`created_by`) VALUES ('$code','$amount','$status','{$_SESSION['admin']}')");
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
	<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Add+Prepaid+Code']?></h6></div>
	<div style="text-align:left;padding-left:25px;">
    
    
<div class="formRow">    
<label><?=$lang['Code']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="code" value="<?=antisqli($_POST['code'])?>" style="width:250px"/>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Bonus+Amount']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="amount" value="<?=antisqli($_POST['amount'])?>"  style="width:100px"/><?=$_SESSION['currency']?>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Status']?></label>
<div class="formRight"><select id="status">
<option value="0" selected><?=$lang['Enabled']?></option>
<option value="1"><?=$lang['Disabled']?></option>
</select>    </div>
	<div class="clear"></div>    
</div>

<a style="margin: 5px;" class="button dblueB" id="update" title="<?=$lang['Add']?>" href="#"><span><?=$lang['Add']?></span></a>
<script type="text/javascript">
$("#update").click(function() {
				var code = $("#code").val();
				var amount = $("#amount").val();
				var status = $("#status option:selected").val();
				showparam('fn_prepaid_a','add=1&'+'code='+code+'&'+'amount='+amount+'&'+'status='+status);
							 });
</script>
</fieldset>
</form>
</div>