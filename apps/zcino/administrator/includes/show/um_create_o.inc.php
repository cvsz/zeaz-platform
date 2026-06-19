<?php 
//this php file lets you create an operator
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
			$login = antisqli($_POST['login']);
				$checklogin = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_staffs` WHERE `login`='$login'"));
				if (strlen($login)>40 || strlen($login)<6 || !checkName($login) || $checklogin>0){
					$ok = false;
					if (strlen($login)<6){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+too+short'].'</strong></p></div>';
					}elseif (strlen($login)>40){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+too+long'].'</strong></p></div>';
					}elseif (!checkName($login)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+username'].'</strong></p></div>';
					}elseif($checklogin>0){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+already+exists'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#login").css("border","2px solid #F00");</script>';
				}
				$pass = antisqli(urldecode($_POST['pass']));
				if (strlen($pass)>30 || strlen($pass)<6 || stristr($pass,' ') || !check_pw($pass)){
					$ok = false;
					if (strlen($pass)<6){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Password+too+short'].'</strong></p></div>';
					}elseif (strlen($pass)>30){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Password+too+long'].'</strong></p></div>';
					}elseif (!check_pw($pass)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+password'].' - '.$lang['cannot+contain+spaces+or+invalid+characters'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#pass").css("border","2px solid #F00");</script>';
				}
				
				$name = antisqli($_POST['name']);
				if (strlen($name)>20 || strlen($name)<3 || !is_good_name($name)){
					$ok = false;
					$ok1 = false;
					if (strlen($name)<3){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['First+name+too+short'].'</strong></p></div>';
					}elseif (strlen($name)>20){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['First+name+too+long'].'</strong></p></div>';
					}elseif (!is_good_name($name)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+first+name'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#name").css("border","2px solid #F00");</script>';
				}
				
				$fam = antisqli($_POST['fam']);
				if (strlen($fam)>20 || strlen($fam)<3 || !is_good_name($fam)){
					$ok = false;
					$ok2 = false;
					if (strlen($fam)<3){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Last+name+too+short'].'</strong></p></div>';
					}elseif (strlen($fam)>20){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Last+name+too+long'].'</strong></p></div>';
					}elseif (!is_good_name($fam)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+last+name'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#fam").css("border","2px solid #F00");</script>';
				}
				
				$name = $name.' '.$fam;
				
				$email = antisqli($_POST['email']);
				$checkmail = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `email` FROM `cws_staffs` WHERE `email`='$email'"));
				if (!checkEmail($email) || $checkmail>0){
					$ok = false;
					if (!checkEmail($email)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+email'].'</strong></p></div>';
					}elseif ($checkmail>0){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Email+exists'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#email").css("border","2px solid #F00");</script>';
				}
				
				$status = antisqli($_POST['status']);
				if ($status!=='3'){
					$status = antisqli($_POST['status']);
					if ($status<0 || $status>4){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
					}
				}
				
				$cash = antisqli($_POST['cash']);
				if (!is_numeric($cash) || $cash<0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+balance'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
				}
				
					
				if ($_SESSION['adminlvl']!=='admin'){
					//$owner_percent = number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0),0);
				}else{
					//$owner_percent = number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0),0);
				}
				$owner_percent = number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0),0);
				$percent = antisqli($_POST['percent']);
				if (!is_numeric($percent) || $percent<0 || $percent>100){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+revenue+percent'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#percent").css("border","2px solid #F00");</script>';
				}else{
					$percent = min($owner_percent,max(0,$percent));
				}
				
				
				$has_subagent = antisqli($_POST['has_subagent']);
				if ($has_subagent!=='0' && $has_subagent!=='1'){
					$ok = false;
					echo '<script type="text/javascript">$("#has_subagent").css("border","2px solid #F00");</script>';
				}
				
			for ($i=1;$i<=1;$i++){
				$agentCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
				if (abs($cash)>$agentCash) {
						$ok = false;
							echo '<div class="nNote nFailure hideit">
					<p><strong>'.$lang['Incorrect+value'].': '.$lang['Insufficient+funds'].'</strong></p></div>';
							echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
						}
			}
			if ($ok!==false) {
				$date = date('Y-m-j H:i:s');
				$time = date('H:i:s');
				mysqli_query($GLOBALS['con'],"INSERT INTO `cws_staffs` (`login`,`pass`,`name`,`email`,`cash`,`status`,`owner`,`staff_type`,`percent`,`has_subagent`) VALUES ('$login','".pass_encode($pass)."','$name','$email','$cash','$status','{$_SESSION['admin']}','operator','$percent','$has_subagent')");
				$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
				$receiverid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$login}'"),0);
				if ($cash>0){
					mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$agentCash','$receiverid','$cash','$date','admin','admin','1')");
				}				
				mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET cash=cash-'$cash' WHERE login='{$_SESSION['admin']}'");
				echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
				echo 'Operator '.$login.' '.$lang['created+successfully'];
				echo '</p></div>';
			} else {
				echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
				echo $lang['Failure'];
				echo '</p></div>';
				}
		}
?>

 <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT has_subagent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0)==1){?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png" /><h6><?=$lang['Create+Operator']?></h6></div>
<div class="formRow">        
<label><?=$lang['Username']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="login" value="<?=antisqli($_POST['login'])?>" style="width:170px"/></div>
<div class="clear"></div>
</div>    

<div class="formRow">    
<label><?=$lang['Password']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="pass" value="<?php echo urldecode($_POST['pass'])?>"  style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Email']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="email" value="<?=antisqli($_POST['email'])?>" style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['First+Name']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="name" value="<?=antisqli($_POST['name'])?>" style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Last+Name']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="fam" value="<?=antisqli($_POST['fam'])?>" style="width:170px"/></div>
<div class="clear"></div>
</div>

    
<div class="formRow">       
<label><?=$lang['Balance']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=isset($_POST['cash'])?$_POST['cash']:'0.00'?>" style="width:170px;color:green;"/> <?=$_SESSION['currency']?></div>
<div class="clear"></div>
</div>

    
<div class="formRow">    
<label><?=$lang['Revenue+percent']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="percent" value="<?=isset($percent)?$percent:$_POST['percent']?>" style="width:170px;color:blue;"/>%
<br />
<span style="font-size:9px"><?=$lang['We+recommend+that+you+set+the+REVENUE+PERCENT+to+maximum']?> <b><?php
 	if ($_SESSION['adminlvl']!=='admin'){
		echo number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0),0);
		}else{
		echo number_format(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0),0);
	}?></b>%, <?=$lang['and+to+empty+the+CASINO+BANK+everytime+you+pay+your+agents']?>!
</span>
</div>
<div class="clear"></div>
</div>    
    
<div class="formRow">     
<label><?=$lang['Can+he+have+subagent']?> ?</label>
<div class="formRight">
<select id="has_subagent">
<option value="0" <?php if ($_POST['has_subagent']==0){echo 'selected';}?>><?=$lang['No']?></option>
<option value="1" <?php if ($_POST['has_subagent']==1|!isset($_POST['status'])){echo 'selected';}?>><?=$lang['Yes']?></option>
</select>
</div>
<div class="clear"></div>
</div>

<div class="formRow"><br />
<label><?=$lang['Status']?></label>
<div class="formRight">
<select id="status">
<option value="4" <?php if ($_POST['status']==4){echo 'selected';}?>><?=$lang['Closed']?></option>
<option value="3" <?php if ($_POST['status']==3){echo 'selected';}?>><?=$lang['Locked']?></option>
<option value="2" <?php if ($_POST['status']==2){echo 'selected';}?>><?=$lang['Suspended']?></option>
<option value="0" <?php if ($_POST['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
<option value="1" <?php if ($_POST['status']==1|!isset($_POST['status'])){echo 'selected';}?>><?=$lang['Enabled']?></option>
</select>
</div>
<div class="clear"></div>
</div>

<a href="#updated" class="button dblueB" id="add" style="padding:5px 49px 10px 40px"><span><?=$lang['Create+Operator']?></span></a><br />

<script type="text/javascript">
$('#cash,#cash_paid,#percent').keypress(function(event) {
  if (event.which == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
        return true;
    }else if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
    event.preventDefault();
  }
});
$("#add").click(function() {
				var login = $("#login").val();
				var pass = encodeURIComponent($("#pass").val());
				var email = $("#email").val();
				var name = $("#name").val();
				var percent = $("#percent").val();
				var fam = $("#fam").val();
				var cash = $("#cash").val();
				var has_subagent = $("#has_subagent option:selected").val();
				var status = $("#status option:selected").val();
				showparam('um_create_o','add=1&'+'login='+login+'&'+'has_subagent='+has_subagent+'&'+'pass='+pass+'&'+'email='+email+'&'+'percent='+percent+'&'+'name='+name+'&'+'fam='+fam+'&'+'status='+status+'&'+'cash='+cash);
							 });
</script>
</div>
</fieldset>
</form>
<?php } ?>