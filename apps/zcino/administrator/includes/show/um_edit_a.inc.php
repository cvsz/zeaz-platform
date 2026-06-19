<?php 
//this php file lets you edit the selected agent
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
if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT has_subagent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0)=='1'){
	if ($_SESSION['adminlvl']!=='admin'){
		$id = antisqli($_POST['id']);
		$squery = mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$id'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
			$errormsg = $lang['Invalid+subagent'];
			echo $errormsg;
			echo '</p></div>';
			exit;
		}
		$subAgents = '';
		$login = trim($login);
		$subAgents = '';
		getSubAgents($_SESSION['admin']);
		$subAgents = str_replace("'",'',$subAgents);
		$subAgents = str_replace(" ",'',$subAgents);
		$subAgents = trim($subAgents,',');
		$sa = array_unique(explode(",",$subAgents));
		if (!in_array($login,$sa) && $login!==$_SESSION['admin']){
			$errormsg =$lang['Invalid+action'];
			echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
			echo $errormsg;
			echo '</p></div>';
			exit;
		}
	}
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<?php if (isset($_POST['id'])) { 
$id = antisqli($_POST['id']);
$query = mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_staffs` WHERE `id`='{$id}'");
if (mysqli_num_rows($query)>0){
	//echo mysqli_result($query,0);
}else{
	echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
	echo 'Invalid agent';
	echo '</p></div>';
	exit;
	}
}
?>
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
				$login = antisqli($_POST['login']);
				$checklogin = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_staffs` WHERE `login`='$login' AND id<>$id"));
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `login`='$login' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
					
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `pass`='".pass_encode($pass)."' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
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
				if ($ok1!==false && $ok2!==false){
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `name`='$name' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				}
				
				$email = antisqli($_POST['email']);
				$checkmail = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `email` FROM `cws_staffs` WHERE `email`='$email' AND id<>$id"));
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `email`='$email' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_staffs WHERE id='$id'"),0);
				if ($status!=='3'){
					$status = antisqli($_POST['status']);
					if ($status<0 || $status>4){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				}
				
				$cash = antisqli($_POST['cash']);
				if (!is_numeric($cash) || $cash<0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid credit value</strong></p></div>';
					echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`='$cash' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$cash_paid = antisqli($_POST['cash_paid']);
				if (!is_numeric($cash_paid) || $cash_paid<0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid cash paid value</strong></p></div>';
					echo '<script type="text/javascript">$("#cash_paid").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash_paid`='$cash_paid' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
					
								
				$owner_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
				$percent = antisqli($_POST['percent']);
				if (!is_numeric($percent) || $percent<0 || $percent>100){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+revenue+percent'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#percent").css("border","2px solid #F00");</script>';
				}else{
					$percent = min($owner_percent,max(0,$percent));
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `percent`='$percent' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				}
				
				$has_subagent = antisqli($_POST['has_subagent']);
				if ($has_subagent!=='0' && $has_subagent!=='1'){
					$ok = false;
					echo '<script type="text/javascript">$("#has_subagent").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `has_subagent`='$has_subagent' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				for ($i=1;$i<=1;$i++){					
					$oldcash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE id='$id'"),0);
					$extra = $cash-$oldcash;
					$adminCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
					if ($adminCash<$extra){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Insufficient+funds'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
					}// if the admin doesnt have the extra added money	
						
					if ($login==$_SESSION['admin']){$percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent FROM cws_staffs WHERE id='$id'"),0);}
					$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
				}
				if ($ok!==false) {
						$amount = $oldcash-$cash;// see if we added ( $amount < 0 ) or removed ($amount<0 ) money from player
						mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET cash=cash+'$amount' WHERE login='{$_SESSION['admin']}'");
						$date = date('Y-m-j H:i:s');
						$time = date('H:i:s');
						if ($amount<0) {
							$amount=abs($amount);
							mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$adminCash','$id','$amount','$date','admin','admin','1')");
						} elseif($amount>0){
							$amount=abs($amount);
							mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$id','$oldcash','$staffid','$amount','$date','admin','admin','1')");
						}
						echo '<div class="nNote nSuccess hideit">
			<p><strong>SUCCESS: </strong>';
						echo $lang['Updated+successfully'];
						echo '</p></div>';
				}else { 
							echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
								echo $lang['Update+Failed'];
								echo '</p></div>';
				}
		}
}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE `id`='".antisqli($_POST['id'])."' AND `staff_type`='agent'"));
?>

 <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT has_subagent FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0)==1){?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png" /><h6> <a href="#" style="font-weight:bold;font-size:12px;padding:8px" onclick="javascript:showparam('um_edit_a','edit=1&id=<?=antisqli($_POST['id'])?>');"><img class="titleIcon" alt="" src="images/icons/dark/refresh3.png" align="baseline" style="margin-top:-8px"><?=$lang['Edit+Agent']?>  - <span style="font-style:italic;color:blue"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_staffs` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?></span></a></h6></div>

<div class="formRow">
<label>ID</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="id" disabled value="<?=$row['id']?>" style="width:170px;background-color:#CCC"/></div>
<div class="clear"></div>
</div>
        
<div class="formRow">
<label><?=$lang['Username']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="login" value="<?=$row['login']?>" style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Password']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="pass" value="<?php pass_decode($row['pass'])?>"  style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Email']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="email" value="<?=$row['email']?>" style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['First+Name']?></label>
<?php $name = explode(' ',$row['name']);?>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="name" value="<?=$name[0]?>" style="width:170px"/></div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Last+Name']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="fam" value="<?=$name[1]?>" style="width:170px"/></div>
<div class="clear"></div>
</div>     

<div class="formRow">
<label><?=$lang['Credit']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=$row['cash']?>" style="width:170px;color:green;"/><?=$_SESSION['currency']?></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Credit+paid+to+agent']?>:</label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash_paid" value="<?=$row['cash_paid']?>" style="width:170px;color:green;"/><?=$_SESSION['currency']?>
<br />
<span style="font-size:9px"><?=$lang['The+total+amount+you+have+paid+to+this+agent']?>.</div>
<div class="clear"></div>
</div>


<div class="formRow">
<label><?=$lang['Revenue+percent']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="percent" value="<?=isset($percent)?$percent:$row['percent']?>" style="width:170px;color:blue;"/>%
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


<div class="formRow">
<label><?=$lang['Status']?></label>
<div class="formRight">
<?php 
if ($_SESSION['adminlvl']!=='admin' && $row['status']=='3'){
	?>
    <select id="status">
    <option value="3" <?php if ($row['status']==3){echo 'selected';}?>><?=$lang['Locked']?></option>
    </select>
    <?php
}else{?>
<select id="status">
<option value="4" <?php if ($row['status']==4){echo 'selected';}?>><?=$lang['Closed']?></option>
<option value="3" <?php if ($row['status']==3){echo 'selected';}?>><?=$lang['Locked']?></option>
<option value="2" <?php if ($row['status']==2){echo 'selected';}?>><?=$lang['Suspended']?></option>
<option value="1" <?php if ($row['status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
<option value="0" <?php if ($row['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
</select>
<?php
}
?>
</div>
<div class="clear"></div>
</div>


<a href="#updated" class="button dblueB" id="update" style="padding:5px 49px 10px 40px"><span><?=$lang['Update']?></span></a><br />

<script type="text/javascript">
$('#cash,#cash_paid,#percent').keypress(function(event) {
  if (event.which == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
        return true;
    }else if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
    event.preventDefault();
  }
});
$("#update").click(function() {
				var login = $("#login").val();
				var pass = encodeURIComponent($("#pass").val());
				var email = $("#email").val();
				var name = $("#name").val();
				var fam = $("#fam").val();
				var status = $("#status option:selected").val();
				var cash = $("#cash").val();
				var cash_paid = $("#cash_paid").val();
				var has_subagent = $("#has_subagent option:selected").val();
				
				var percent = $("#percent").val();
				showparam('um_edit_a','update=1&'+'login='+login+'&'+'has_subagent='+has_subagent+'&'+'pass='+pass+'&'+'email='+email+'&'+'name='+name+'&'+'percent='+percent+'&'+'fam='+fam+'&'+'status='+status+'&cash='+cash+'&cash_paid='+cash_paid+'&'+'id='+'<?=antisqli($_POST['id'])?>');
							 });
</script>
</div>
</fieldset>
</form>
<?php }}?>