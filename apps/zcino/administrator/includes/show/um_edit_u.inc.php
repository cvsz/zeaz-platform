<?php 
//this php file lets you edit the selected user
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
if (isset($_POST['id'])) { 
$id = antisqli($_POST['id']);
$query = mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_users` WHERE `id`='{$id}'");
if (mysqli_num_rows($query)>0){
	//echo mysqli_result($query,0);
}else{
	echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
	echo $lang['Invalid+username'];
	echo '</p></div>';
	exit;
	}
if($_SESSION['adminlvl']!=='admin'){
		$ok = true;
			$id = antisqli($_POST['id']);
			if (!is_numeric($id) || $id<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
						<p><strong>FAILED: </strong>';
							echo $lang['Update+failed'];
							echo '</p></div>';
			}else{
		$squery = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE id='$id'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			$errormsg = $lang['Invalid+user'];
			echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
			echo $errormsg;
			echo '</p></div>';
			exit;
		}
		getSubAgents($_SESSION['admin']);
		$subAgents = str_replace("'",'',$subAgents);
		$subAgents = str_replace(" ",'',$subAgents);
		$subAgents = trim($subAgents,',');
		$sa = array_unique(explode(",",$subAgents));
		$login = trim($login);
		if (!in_array($login,$sa) && $login!==$_SESSION['admin']){
			echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
			$errormsg =$lang['Invalid+action'];
			echo $errormsg;
			echo '</p></div>';
			exit;
		}
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
				$checklogin = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_users` WHERE `login`='$login' AND id<>$id"));
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `login`='$login' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$pass = antisqli(urldecode($_POST['pass']));
				if (strlen($pass)>35 || strlen($pass)<6 || stristr($pass,' ') || !check_pw($pass)){
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `pass`='".pass_encode($pass)."' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$name = antisqli($_POST['name']);
				if (strlen($name)>20 || !is_good_name($name)){
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
				if (strlen($fam)>20 || !is_good_name($fam)){
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
				$street = antisqli($_POST['street']);
				$country = antisqli($_POST['country']);
				$city = antisqli($_POST['city']);
				$ph_no = antisqli($_POST['ph_no']);
				mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `street`='$street',`country`='$country',`ort`='$city',`mobiletel`='$ph_no' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				
				$name = $name.' '.$fam;
				if ($ok1!==false && $ok2!==false){
					mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `name`='$name' WHERE  `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				}
				
				$email = antisqli($_POST['email']);
				$checkmail = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `email` FROM `cws_users_info` WHERE `email`='$email' AND id<>$id"));
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `email`='$email' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='$id'"),0);
				if ($status!=='3'){
					$status = antisqli($_POST['status']);
					if ($status<0 || $status>4){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
					}else{
						mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
						if ($status!==1){
							mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `ip_notify`='0' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));	
						}
					}
				}
				
				$aff_status = antisqli($_POST['aff_status']);
				if ($aff_status<0 || $aff_status>1){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid affiliate status</strong></p></div>';
						echo '<script type="text/javascript">$("#aff_status").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `aff_status`='$aff_status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$aff_id = antisqli($_POST['aff_id']);
				if (!(is_numeric($aff_id) || $aff_id=="")){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid affiliate ID</strong></p></div>';
						echo '<script type="text/javascript">$("#aff_id").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users_info` SET `aff_id`='$aff_id' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$cash = antisqli($_POST['cash']);
				if (!is_numeric($cash) || $cash<0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+balance'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`='$cash' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
					
				for ($i=1;$i<=1;$i++){					
					$oldcash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE id='$id'"),0);
					$extra = $cash-$oldcash;
					$adminCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
					$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
					if ($adminCash<$extra){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Insufficient+funds'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#cash").css("border","2px solid #F00");</script>';
					}// if the admin doesnt have the extra added money
				}
				if ($ok!==false) {
						$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
						$amount = $oldcash-$cash;
						$date = date('Y-m-j H:i:s');
						$time = date('H:i:s');
						mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET cash=cash+'$amount' WHERE login='{$_SESSION['admin']}'");
						if ($amount<0) {
							$amount=abs($amount);
							mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$adminCash','$id','$amount','$date','admin','user','1')");
						} elseif($amount>0) { 
							$amount=abs($amount);
							mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$id','$oldcash','$staffid','$amount','$date','user','admin','1')");
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
}
			
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE cws_users.id='".antisqli($_POST['id'])."'"));
?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png" /><h6> <a href="#" style="font-weight:bold;font-size:12px;padding:8px" onclick="javascript:showparam('um_edit_u','edit=1&id=<?=antisqli($_POST['id'])?>');"><img class="titleIcon" alt="" src="images/icons/dark/refresh3.png" align="baseline" style="margin-top:-8px" /><?=$lang['Edit+User']?>  - <span style="font-style:italic;color:blue"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_users` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?>
</span></a></h6></div>
    
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
<label><?=$lang['Password']?> </label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="pass" value="<?=pass_decode($row['pass'])?>"  style="width:170px"/></div>
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
<label><?=$lang['Balance']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=$row['cash']?>" style="width:170px;color:green;"/> <?=$_SESSION['currency']?></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Address']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="street" value="<?=$row['street']?>" style="width:170px"/></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Country']?></label>
<div class="formRight">
<select name="country" id="country">				
<?php $country = $row['country'];?>						
<option value="0">Please choose a country</option>
<option value="no" <?php if($country=="us"){echo "selected=\"selected\"";} ?>>USA</option>                                      
<option value="se" <?php if($country=="se"){echo "selected=\"selected\"";} ?>>Sweden</option>                                     
<option value="fr" <?php if($country=="fr"){echo "selected=\"selected\"";} ?>>France</option>
<option value="no" <?php if($country=="no"){echo "selected=\"selected\"";} ?>>Norway</option>
<option value="dk" <?php if($country=="dk"){echo "selected=\"selected\"";} ?>>Denmark</option>
<option value="it" <?php if($country=="it"){echo "selected=\"selected\"";} ?>>Italy</option>
<option value="de" <?php if($country=="de"){echo "selected=\"selected\"";} ?>>Germany</option>
<option value="fi" <?php if($country=="fi"){echo "selected=\"selected\"";} ?>>Finland</option>
<option value="pl" <?php if($country=="pl"){echo "selected=\"selected\"";} ?>>Poland</option>
<option value="nl" <?php if($country=="nl"){echo "selected=\"selected\"";} ?>>Netherlands</option>
<option value="be" <?php if($country=="be"){echo "selected=\"selected\"";} ?>>Belgium</option>
<option value="af" <?php if($country=="af"){echo "selected=\"selected\"";} ?>>Afghanistan</option>
<option value="al" <?php if($country=="al"){echo "selected=\"selected\"";} ?>>Albania</option>
<option value="dz" <?php if($country=="dz"){echo "selected=\"selected\"";} ?>>Algeria</option>
<option value="ad" <?php if($country=="ad"){echo "selected=\"selected\"";} ?>>Andorra</option>
<option value="ao" <?php if($country=="ao"){echo "selected=\"selected\"";} ?>>Angola</option>
<option value="ai" <?php if($country=="ai"){echo "selected=\"selected\"";} ?>>Anguilla</option>
<option value="aq" <?php if($country=="aq"){echo "selected=\"selected\"";} ?>>Antarctica</option>
<option value="ag" <?php if($country=="ag"){echo "selected=\"selected\"";} ?>>Antigua and Barbuda</option>
<option value="ar" <?php if($country=="ar"){echo "selected=\"selected\"";} ?>>Argentina</option>
<option value="am" <?php if($country=="am"){echo "selected=\"selected\"";} ?>>Armenia</option>
<option value="aw" <?php if($country=="aw"){echo "selected=\"selected\"";} ?>>Aruba</option>
<option value="au" <?php if($country=="au"){echo "selected=\"selected\"";} ?>>Australia</option>
<option value="at" <?php if($country=="at"){echo "selected=\"selected\"";} ?>>Austria</option>
<option value="az" <?php if($country=="az"){echo "selected=\"selected\"";} ?>>Azerbaidjan</option>
<option value="bs" <?php if($country=="bs"){echo "selected=\"selected\"";} ?>>Bahamas</option>
<option value="bh" <?php if($country=="bh"){echo "selected=\"selected\"";} ?>>Bahrain</option>
<option value="bd" <?php if($country=="bd"){echo "selected=\"selected\"";} ?>>Bangladesh</option>
<option value="bb" <?php if($country=="bb"){echo "selected=\"selected\"";} ?>>Barbados</option>
<option value="by" <?php if($country=="by"){echo "selected=\"selected\"";} ?>>Belarus</option>
<option value="bz" <?php if($country=="bz"){echo "selected=\"selected\"";} ?>>Belize</option>
<option value="bj" <?php if($country=="bj"){echo "selected=\"selected\"";} ?>>Benin</option>
<option value="bm" <?php if($country=="bm"){echo "selected=\"selected\"";} ?>>Bermuda</option>
<option value="bt" <?php if($country=="bt"){echo "selected=\"selected\"";} ?>>Bhutan</option>
<option value="bo" <?php if($country=="bo"){echo "selected=\"selected\"";} ?>>Bolivia</option>
<option value="ba" <?php if($country=="ba"){echo "selected=\"selected\"";} ?>>Bosnia-Herzegovina</option>
<option value="bw" <?php if($country=="bw"){echo "selected=\"selected\"";} ?>>Botswana</option>
<option value="bv" <?php if($country=="bv"){echo "selected=\"selected\"";} ?>>Bouvet Island</option>
<option value="br" <?php if($country=="br"){echo "selected=\"selected\"";} ?>>Brazil</option>
<option value="io" <?php if($country=="io"){echo "selected=\"selected\"";} ?>>British Indian Ocean Territory</option>
<option value="bn" <?php if($country=="bn"){echo "selected=\"selected\"";} ?>>Brunei Darussalam</option>
<option value="bg" <?php if($country=="bg"){echo "selected=\"selected\"";} ?>>Bulgaria</option>
<option value="bf" <?php if($country=="bf"){echo "selected=\"selected\"";} ?>>Burkina Faso</option>
<option value="bi" <?php if($country=="bi"){echo "selected=\"selected\"";} ?>>Burundi</option>
<option value="kh" <?php if($country=="kh"){echo "selected=\"selected\"";} ?>>Cambodia, Kingdom of</option>
<option value="cm" <?php if($country=="cm"){echo "selected=\"selected\"";} ?>>Cameroon</option>
<option value="ca" <?php if($country=="ca"){echo "selected=\"selected\"";} ?>>Canada</option>
<option value="cv" <?php if($country=="cv"){echo "selected=\"selected\"";} ?>>Cape Verde</option>
<option value="ky" <?php if($country=="ky"){echo "selected=\"selected\"";} ?>>Cayman Islands</option>
<option value="cf" <?php if($country=="cf"){echo "selected=\"selected\"";} ?>>Central African Republic</option>
<option value="td" <?php if($country=="td"){echo "selected=\"selected\"";} ?>>Chad</option>
<option value="cl" <?php if($country=="cl"){echo "selected=\"selected\"";} ?>>Chile</option>
<option value="cn" <?php if($country=="cn"){echo "selected=\"selected\"";} ?>>China</option>
<option value="cx" <?php if($country=="cx"){echo "selected=\"selected\"";} ?>>Christmas Island</option>
<option value="cc" <?php if($country=="cc"){echo "selected=\"selected\"";} ?>>Cocos (Keeling) Islands</option>
<option value="co" <?php if($country=="co"){echo "selected=\"selected\"";} ?>>Colombia</option>
<option value="km" <?php if($country=="km"){echo "selected=\"selected\"";} ?>>Comoros</option>
<option value="cg" <?php if($country=="cg"){echo "selected=\"selected\"";} ?>>Congo</option>
<option value="cd" <?php if($country=="cd"){echo "selected=\"selected\"";} ?>>Congo, The Democratic Republic of the</option>
<option value="ck" <?php if($country=="ck"){echo "selected=\"selected\"";} ?>>Cook Islands</option>
<option value="cr" <?php if($country=="cr"){echo "selected=\"selected\"";} ?>>Costa Rica</option>
<option value="hr" <?php if($country=="hr"){echo "selected=\"selected\"";} ?>>Croatia</option>
<option value="cu" <?php if($country=="cu"){echo "selected=\"selected\"";} ?>>Cuba</option>
<option value="cy" <?php if($country=="cy"){echo "selected=\"selected\"";} ?>>Cyprus</option>
<option value="cz" <?php if($country=="cz"){echo "selected=\"selected\"";} ?>>Czech Republic</option>
<option value="dj" <?php if($country=="dj"){echo "selected=\"selected\"";} ?>>Djibouti</option>
<option value="dm" <?php if($country=="dm"){echo "selected=\"selected\"";} ?>>Dominica</option>
<option value="do" <?php if($country=="do"){echo "selected=\"selected\"";} ?>>Dominican Republic</option>
<option value="tp" <?php if($country=="tp"){echo "selected=\"selected\"";} ?>>East Timor</option>
<option value="ec" <?php if($country=="ec"){echo "selected=\"selected\"";} ?>>Ecuador</option>
<option value="eg" <?php if($country=="eg"){echo "selected=\"selected\"";} ?>>Egypt</option>
<option value="sv" <?php if($country=="sv"){echo "selected=\"selected\"";} ?>>El Salvador</option>
<option value="gq" <?php if($country=="gq"){echo "selected=\"selected\"";} ?>>Equatorial Guinea</option>
<option value="er" <?php if($country=="er"){echo "selected=\"selected\"";} ?>>Eritrea</option>
<option value="ee" <?php if($country=="ee"){echo "selected=\"selected\"";} ?>>Estonia</option>
<option value="et" <?php if($country=="et"){echo "selected=\"selected\"";} ?>>Ethiopia</option>
<option value="fk" <?php if($country=="fk"){echo "selected=\"selected\"";} ?>>Falkland Islands</option>
<option value="fo" <?php if($country=="fo"){echo "selected=\"selected\"";} ?>>Faroe Islands</option>
<option value="fj" <?php if($country=="fj"){echo "selected=\"selected\"";} ?>>Fiji</option>
<option value="gf" <?php if($country=="gf"){echo "selected=\"selected\"";} ?>>French Guyana</option>
<option value="tf" <?php if($country=="tf"){echo "selected=\"selected\"";} ?>>French Southern Territories</option>
<option value="ga" <?php if($country=="ga"){echo "selected=\"selected\"";} ?>>Gabon</option>
<option value="gm" <?php if($country=="gm"){echo "selected=\"selected\"";} ?>>Gambia</option>
<option value="ge" <?php if($country=="ge"){echo "selected=\"selected\"";} ?>>Georgia</option>
<option value="gh" <?php if($country=="gh"){echo "selected=\"selected\"";} ?>>Ghana</option>
<option value="gi" <?php if($country=="gi"){echo "selected=\"selected\"";} ?>>Gibraltar</option>
<option value="gr" <?php if($country=="gr"){echo "selected=\"selected\"";} ?>>Greece</option>
<option value="gl" <?php if($country=="gl"){echo "selected=\"selected\"";} ?>>Greenland</option>
<option value="gd" <?php if($country=="gd"){echo "selected=\"selected\"";} ?>>Grenada</option>
<option value="gp" <?php if($country=="gp"){echo "selected=\"selected\"";} ?>>Guadeloupe (French)</option>
<option value="gt" <?php if($country=="gt"){echo "selected=\"selected\"";} ?>>Guatemala</option>
<option value="gn" <?php if($country=="gn"){echo "selected=\"selected\"";} ?>>Guinea</option>
<option value="gw" <?php if($country=="gw"){echo "selected=\"selected\"";} ?>>Guinea Bissau</option>
<option value="gy" <?php if($country=="gy"){echo "selected=\"selected\"";} ?>>Guyana</option>
<option value="ht" <?php if($country=="ht"){echo "selected=\"selected\"";} ?>>Haiti</option>
<option value="hm" <?php if($country=="hm"){echo "selected=\"selected\"";} ?>>Heard and McDonald Islands</option>
<option value="va" <?php if($country=="va"){echo "selected=\"selected\"";} ?>>Holy See (Vatican City State)</option>
<option value="hn" <?php if($country=="hn"){echo "selected=\"selected\"";} ?>>Honduras</option>
<option value="hk" <?php if($country=="hk"){echo "selected=\"selected\"";} ?>>Hong Kong</option>
<option value="hu" <?php if($country=="hu"){echo "selected=\"selected\"";} ?>>Hungary</option>
<option value="is" <?php if($country=="is"){echo "selected=\"selected\"";} ?>>Iceland</option>
<option value="in" <?php if($country=="in"){echo "selected=\"selected\"";} ?>>India</option>
<option value="id" <?php if($country=="id"){echo "selected=\"selected\"";} ?>>Indonesia</option>
<option value="ir" <?php if($country=="ir"){echo "selected=\"selected\"";} ?>>Iran</option>
<option value="iq" <?php if($country=="iq"){echo "selected=\"selected\"";} ?>>Iraq</option>
<option value="ie" <?php if($country=="ie"){echo "selected=\"selected\"";} ?>>Ireland</option>
<option value="il" <?php if($country=="il"){echo "selected=\"selected\"";} ?>>Israel</option>
<option value="ci" <?php if($country=="ci"){echo "selected=\"selected\"";} ?>>Ivory Coast (Cote D'Ivoire)</option>
<option value="jm" <?php if($country=="jm"){echo "selected=\"selected\"";} ?>>Jamaica</option>
<option value="jp" <?php if($country=="jp"){echo "selected=\"selected\"";} ?>>Japan</option>
<option value="jo" <?php if($country=="jo"){echo "selected=\"selected\"";} ?>>Jordan</option>
<option value="kz" <?php if($country=="kz"){echo "selected=\"selected\"";} ?>>Kazakhstan</option>
<option value="ke" <?php if($country=="ke"){echo "selected=\"selected\"";} ?>>Kenya</option>
<option value="ki" <?php if($country=="ki"){echo "selected=\"selected\"";} ?>>Kiribati</option>
<option value="kw" <?php if($country=="kw"){echo "selected=\"selected\"";} ?>>Kuwait</option>
<option value="kg" <?php if($country=="kg"){echo "selected=\"selected\"";} ?>>Kyrgyz Republic (Kyrgyzstan)</option>
<option value="la" <?php if($country=="la"){echo "selected=\"selected\"";} ?>>Laos</option>
<option value="lv" <?php if($country=="lv"){echo "selected=\"selected\"";} ?>>Latvia</option>
<option value="lb" <?php if($country=="lb"){echo "selected=\"selected\"";} ?>>Lebanon</option>
<option value="ls" <?php if($country=="ls"){echo "selected=\"selected\"";} ?>>Lesotho</option>
<option value="lr" <?php if($country=="lr"){echo "selected=\"selected\"";} ?>>Liberia</option>
<option value="ly" <?php if($country=="ly"){echo "selected=\"selected\"";} ?>>Libya</option>
<option value="li" <?php if($country=="li"){echo "selected=\"selected\"";} ?>>Liechtenstein</option>
<option value="lt" <?php if($country=="lt"){echo "selected=\"selected\"";} ?>>Lithuania</option>
<option value="lu" <?php if($country=="lu"){echo "selected=\"selected\"";} ?>>Luxembourg</option>
<option value="mo" <?php if($country=="mo"){echo "selected=\"selected\"";} ?>>Macau</option>
<option value="mk" <?php if($country=="mk"){echo "selected=\"selected\"";} ?>>Macedonia</option>
<option value="mg" <?php if($country=="mg"){echo "selected=\"selected\"";} ?>>Madagascar</option>
<option value="mw" <?php if($country=="mw"){echo "selected=\"selected\"";} ?>>Malawi</option>
<option value="my" <?php if($country=="my"){echo "selected=\"selected\"";} ?>>Malaysia</option>
<option value="mv" <?php if($country=="mv"){echo "selected=\"selected\"";} ?>>Maldives</option>
<option value="ml" <?php if($country=="ml"){echo "selected=\"selected\"";} ?>>Mali</option>
<option value="mt" <?php if($country=="mt"){echo "selected=\"selected\"";} ?>>Malta</option>
<option value="mh" <?php if($country=="mh"){echo "selected=\"selected\"";} ?>>Marshall Islands</option>
<option value="mq" <?php if($country=="mq"){echo "selected=\"selected\"";} ?>>Martinique (French)</option>
<option value="mr" <?php if($country=="mr"){echo "selected=\"selected\"";} ?>>Mauritania</option>
<option value="mu" <?php if($country=="mu"){echo "selected=\"selected\"";} ?>>Mauritius</option>
<option value="yt" <?php if($country=="yt"){echo "selected=\"selected\"";} ?>>Mayotte</option>
<option value="mx" <?php if($country=="mx"){echo "selected=\"selected\"";} ?>>Mexico</option>
<option value="fm" <?php if($country=="fm"){echo "selected=\"selected\"";} ?>>Micronesia</option>
<option value="md" <?php if($country=="md"){echo "selected=\"selected\"";} ?>>Moldavia</option>
<option value="mc" <?php if($country=="mc"){echo "selected=\"selected\"";} ?>>Monaco</option>
<option value="mn" <?php if($country=="mn"){echo "selected=\"selected\"";} ?>>Mongolia</option>
<option value="ms" <?php if($country=="ms"){echo "selected=\"selected\"";} ?>>Montserrat</option>
<option value="ma" <?php if($country=="ma"){echo "selected=\"selected\"";} ?>>Morocco</option>
<option value="mz" <?php if($country=="mz"){echo "selected=\"selected\"";} ?>>Mozambique</option>
<option value="mm" <?php if($country=="mm"){echo "selected=\"selected\"";} ?>>Myanmar</option>
<option value="na" <?php if($country=="na"){echo "selected=\"selected\"";} ?>>Namibia</option>
<option value="nr" <?php if($country=="nr"){echo "selected=\"selected\"";} ?>>Nauru</option>
<option value="np" <?php if($country=="np"){echo "selected=\"selected\"";} ?>>Nepal</option>
<option value="nc" <?php if($country=="nc"){echo "selected=\"selected\"";} ?>>New Caledonia (French)</option>
<option value="nz" <?php if($country=="nz"){echo "selected=\"selected\"";} ?>>New Zealand</option>
<option value="ni" <?php if($country=="ni"){echo "selected=\"selected\"";} ?>>Nicaragua</option>
<option value="ne" <?php if($country=="ne"){echo "selected=\"selected\"";} ?>>Niger</option>
<option value="ng" <?php if($country=="ng"){echo "selected=\"selected\"";} ?>>Nigeria</option>
<option value="nu" <?php if($country=="nu"){echo "selected=\"selected\"";} ?>>Niue</option>
<option value="nf" <?php if($country=="nf"){echo "selected=\"selected\"";} ?>>Norfolk Island</option>
<option value="kp" <?php if($country=="kp"){echo "selected=\"selected\"";} ?>>North Korea</option>
<option value="om" <?php if($country=="om"){echo "selected=\"selected\"";} ?>>Oman</option>
<option value="pk" <?php if($country=="pk"){echo "selected=\"selected\"";} ?>>Pakistan</option>
<option value="pw" <?php if($country=="pw"){echo "selected=\"selected\"";} ?>>Palau</option>
<option value="pa" <?php if($country=="pa"){echo "selected=\"selected\"";} ?>>Panama</option>
<option value="pg" <?php if($country=="pg"){echo "selected=\"selected\"";} ?>>Papua New Guinea</option>
<option value="py" <?php if($country=="py"){echo "selected=\"selected\"";} ?>>Paraguay</option>
<option value="pe" <?php if($country=="pe"){echo "selected=\"selected\"";} ?>>Peru</option>
<option value="ph" <?php if($country=="ph"){echo "selected=\"selected\"";} ?>>Philippines</option>
<option value="pn" <?php if($country=="pn"){echo "selected=\"selected\"";} ?>>Pitcairn Island</option>
<option value="pf" <?php if($country=="pf"){echo "selected=\"selected\"";} ?>>Polynesia (French)</option>
<option value="pt" <?php if($country=="pt"){echo "selected=\"selected\"";} ?>>Portugal</option>
<option value="qa" <?php if($country=="qa"){echo "selected=\"selected\"";} ?>>Qatar</option>
<option value="re" <?php if($country=="re"){echo "selected=\"selected\"";} ?>>Reunion (French)</option>
<option value="ro" <?php if($country=="ro"){echo "selected=\"selected\"";} ?>>Romania</option>
<option value="ru" <?php if($country=="ru"){echo "selected=\"selected\"";} ?>>Russian Federation</option>
<option value="rw" <?php if($country=="rw"){echo "selected=\"selected\"";} ?>>Rwanda</option>
<option value="gs" <?php if($country=="gs"){echo "selected=\"selected\"";} ?>>S. Georgia &amp; S. Sandwich Isls.</option>
<option value="sh" <?php if($country=="sh"){echo "selected=\"selected\"";} ?>>Saint Helena</option>
<option value="kn" <?php if($country=="kn"){echo "selected=\"selected\"";} ?>>Saint Kitts &amp; Nevis Anguilla</option>
<option value="lc" <?php if($country=="lc"){echo "selected=\"selected\"";} ?>>Saint Lucia</option>
<option value="pm" <?php if($country=="pm"){echo "selected=\"selected\"";} ?>>Saint Pierre and Miquelon</option>
<option value="st" <?php if($country=="st"){echo "selected=\"selected\"";} ?>>Saint Tome (Sao Tome) and Principe</option>
<option value="vc" <?php if($country=="vc"){echo "selected=\"selected\"";} ?>>Saint Vincent &amp; Grenadines</option>
<option value="ws" <?php if($country=="ws"){echo "selected=\"selected\"";} ?>>Samoa</option>
<option value="sm" <?php if($country=="sm"){echo "selected=\"selected\"";} ?>>San Marino</option>
<option value="sa" <?php if($country=="sa"){echo "selected=\"selected\"";} ?>>Saudi Arabia</option>
<option value="sn" <?php if($country=="sn"){echo "selected=\"selected\"";} ?>>Senegal</option>
<option value="sc" <?php if($country=="sc"){echo "selected=\"selected\"";} ?>>Seychelles</option>
<option value="sl" <?php if($country=="sl"){echo "selected=\"selected\"";} ?>>Sierra Leone</option>
<option value="sg" <?php if($country=="sg"){echo "selected=\"selected\"";} ?>>Singapore</option>
<option value="sk" <?php if($country=="sk"){echo "selected=\"selected\"";} ?>>Slovak Republic</option>
<option value="si" <?php if($country=="si"){echo "selected=\"selected\"";} ?>>Slovenia</option>
<option value="sb" <?php if($country=="sb"){echo "selected=\"selected\"";} ?>>Solomon Islands</option>
<option value="so" <?php if($country=="so"){echo "selected=\"selected\"";} ?>>Somalia</option>
<option value="za" <?php if($country=="za"){echo "selected=\"selected\"";} ?>>South Africa</option>
<option value="kr" <?php if($country=="kr"){echo "selected=\"selected\"";} ?>>South Korea</option>
<option value="es" <?php if($country=="es"){echo "selected=\"selected\"";} ?>>Spain</option>
<option value="lk" <?php if($country=="lk"){echo "selected=\"selected\"";} ?>>Sri Lanka</option>
<option value="sd" <?php if($country=="sd"){echo "selected=\"selected\"";} ?>>Sudan</option>
<option value="sr" <?php if($country=="sr"){echo "selected=\"selected\"";} ?>>Suriname</option>
<option value="sj" <?php if($country=="sj"){echo "selected=\"selected\"";} ?>>Svalbard and Jan Mayen Islands</option>
<option value="sz" <?php if($country=="sz"){echo "selected=\"selected\"";} ?>>Swaziland</option>
<option value="ch" <?php if($country=="ch"){echo "selected=\"selected\"";} ?>>Switzerland</option>
<option value="sy" <?php if($country=="sy"){echo "selected=\"selected\"";} ?>>Syria</option>
<option value="tj" <?php if($country=="tj"){echo "selected=\"selected\"";} ?>>Tadjikistan</option>
<option value="tw" <?php if($country=="tw"){echo "selected=\"selected\"";} ?>>Taiwan</option>
<option value="tz" <?php if($country=="tz"){echo "selected=\"selected\"";} ?>>Tanzania</option>
<option value="th" <?php if($country=="th"){echo "selected=\"selected\"";} ?>>Thailand</option>
<option value="tg" <?php if($country=="tg"){echo "selected=\"selected\"";} ?>>Togo</option>
<option value="tk" <?php if($country=="tk"){echo "selected=\"selected\"";} ?>>Tokelau</option>
<option value="to" <?php if($country=="to"){echo "selected=\"selected\"";} ?>>Tonga</option>
<option value="tt" <?php if($country=="tt"){echo "selected=\"selected\"";} ?>>Trinidad and Tobago</option>
<option value="tn" <?php if($country=="tn"){echo "selected=\"selected\"";} ?>>Tunisia</option>
<option value="tr" <?php if($country=="tr"){echo "selected=\"selected\"";} ?>>Turkey</option>
<option value="tm" <?php if($country=="tm"){echo "selected=\"selected\"";} ?>>Turkmenistan</option>
<option value="tc" <?php if($country=="tc"){echo "selected=\"selected\"";} ?>>Turks and Caicos Islands</option>
<option value="tv" <?php if($country=="tv"){echo "selected=\"selected\"";} ?>>Tuvalu</option>
<option value="ug" <?php if($country=="ug"){echo "selected=\"selected\"";} ?>>Uganda</option>
<option value="ua" <?php if($country=="ua"){echo "selected=\"selected\"";} ?>>Ukraine</option>
<option value="ae" <?php if($country=="ae"){echo "selected=\"selected\"";} ?>>United Arab Emirates</option>
<option value="uk" <?php if($country=="uk"){echo "selected=\"selected\"";} ?>>United Kingdom</option>
<option value="uy" <?php if($country=="uy"){echo "selected=\"selected\"";} ?>>Uruguay</option>
<option value="uz" <?php if($country=="uz"){echo "selected=\"selected\"";} ?>>Uzbekistan</option>
<option value="vu" <?php if($country=="vu"){echo "selected=\"selected\"";} ?>>Vanuatu</option>
<option value="ve" <?php if($country=="ve"){echo "selected=\"selected\"";} ?>>Venezuela</option>
<option value="vn" <?php if($country=="vn"){echo "selected=\"selected\"";} ?>>Vietnam</option>
<option value="vg" <?php if($country=="vg"){echo "selected=\"selected\"";} ?>>Virgin Islands (British)</option>
<option value="vg" <?php if($country=="vg"){echo "selected=\"selected\"";} ?>>Virgin Islands (British)</option>
<option value="wa" <?php if($country=="wa"){echo "selected=\"selected\"";} ?>>Wales</option>
<option value="wf" <?php if($country=="wf"){echo "selected=\"selected\"";} ?>>Wallis and Futuna Islands</option>
<option value="eh" <?php if($country=="eh"){echo "selected=\"selected\"";} ?>>Western Sahara</option>
<option value="ye" <?php if($country=="ye"){echo "selected=\"selected\"";} ?>>Yemen</option>
<option value="zr" <?php if($country=="zr"){echo "selected=\"selected\"";} ?>>Zaire</option>
<option value="zm" <?php if($country=="zm"){echo "selected=\"selected\"";} ?>>Zambia</option>
<option value="zw" <?php if($country=="zw"){echo "selected=\"selected\"";} ?>>Zimbabwe</option>										
<option value="other" <?php if($country=="other"){echo "selected=\"selected\"";} ?>>Other</option>
</select>
</div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['City']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="city" value="<?=$row['ort']?>" style="width:170px"/></div>
<div class="clear"></div>
</div>

<div class="formRow">
<label><?=$lang['Phone+Number']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="ph_no" value="<?=$row['mobiletel']?>" style="width:170px"/></div>
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


<div class="formRow" <?php if (AFFILIATES==1){}else{echo 'style="display:none"';}?>>
<label><?=$lang['Affiliated+by']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="aff_id" value="<?=$row['aff_id']?>" style="width:170px"/> <span style="font-size:9px">(<?=$lang['remove+the+value+from+this+box+so+the+user+has+no+affiliate']?>)</span></div>
<div class="clear"></div>
</div>


<div class="formRow" <?php if (AFFILIATES==1){}else{echo 'style="display:none"';}?>>
<label><?=$lang['Affiliate+Activity+Status']?></label>
<div class="formRight">
<select id="aff_status">
<option value="1" <?php if ($row['aff_status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
<option value="0" <?php if ($row['aff_status']==0){echo 'selected';}?>><?=$lang['Locked']?></option>
</select>
</div>
<div class="clear"></div>
</div>

<?php if (AFFILIATES==1){
$aff_rev = get_aff_revenue($row['id']);
$aff_last = get_aff_revenue_perm($row['id'],date('Y-m-d',strtotime("-1 month")));
$aff_this = get_aff_revenue_perm($row['id'],date('Y-m-d'));
$caplayers = count_active_players($row['id'],$row['mrp_months'],$row['mrp_dep']);
$total_aff_paid = total_aff_paid($row['id']);
?>
<div class="formRow">
<label><?=$lang['Affiliate+details']?></label>
<div class="formRight">
<?=$lang['Number+of+players+affiliated']?>: <span style="font-weight:bold;color:#F60"><?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_users_info WHERE aff_id='{$row['id']}'"),0)?></span>
<br /><?=$lang['Number+of+active+players+affiliated']?>: <span style="font-weight:bold;color:#F60"><?=$caplayers?>/<?=$aff_settings['mrp_players']?></span>
<br /><br /><?=$lang['Revenue+last+month+from+affiliated+players']?>: <span style="font-weight:bold;<?php if ($aff_last<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_last,2);?><?=$_SESSION['currency']?></span>
<br /><?=$lang['Revenue+this+month+from+affiliated+players']?>: <span style="font-weight:bold;<?php if ($aff_this<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_this,2);?><?=$_SESSION['currency']?></span>
<br />
<?=$lang['Total+revenue+from+affiliated+players']?>: <span style="font-weight:bold;<?php if ($aff_rev<0){echo 'color:red"';}else{ echo 'color:#0C3';}?>"><?php echo cash_format_cws($aff_rev,2);?><?=$_SESSION['currency']?></span>
<br /><?=$lang['Total+revenue+payments+received']?>: <span style="font-weight:bold;color:#0C3"><?php echo cash_format_cws($total_aff_paid,2);	?><?=$_SESSION['currency']?></span> <span style="font-size:12px;font-weight:bold"><a href="#details" onclick="javascript:showparam('fn_transfers','player_search=<?=$row['id']?>&cash_out=1')">(<?=$lang['details']?>)</a></span>
<br /><br /><?=$lang['Last+payment+received']?>: <span style="font-weight:bold;color:#0C3"><?php	echo cash_format_cws(last_payment_val($row['id']),2);?><?=$_SESSION['currency']?></span>
<br /><?=$lang['Last+payment+date']?>: <span style="font-weight:bold;color:#930"><?php echo last_payment_date($row['id']);?></span>
<br /><br />
<?php if ($caplayers>=$aff_settings['mrp_players'] && $aff_rev>=0){ 
		echo '<span style="color:green">Eligible for payment: ';
		$to_pay = $aff_rev - $total_aff_paid;
		echo cash_format_cws($to_pay,2).$_SESSION['currency'].'</span>';
	?>
    <?php if ($to_pay>0){?>
    <br />
    <button onclick="javascript:showparam('transfer_funds_u','affpay=1&cash=<?=$to_pay?>&login=<?=$row['login']?>')">SEND PAYMENT</button>
    <?php }?>
    <?php
	}else{
		echo '<span style="color:red">Ineligible for payment</span>';
	}?>
</div>
<div class="clear"></div>
</div>
<?php }?>

<div class="formRow">
<label>Other details</label>
<div class="formRight">
<?php
if (strlen($row['country'])<2){
	$row['country'] = 'unknown';
}
?>
<?=$lang['Country']?>: <img src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/images/flags/<?=$row['country']?>.png" alt="Country <?=$row['country']?>" title="Country <?=$row['country']?>"/><br />
<?=$lang['City']?>: <span style="font-weight:bold;color:#06C"><?=strlen($row['ort'])>0?$row['ort']:'-'?></span><br />
<?=$lang['Street']?>: <span style="font-weight:bold;color:#06C"><?=strlen($row['street'])>0?$row['street']:'-'?></span><br />
<?=$lang['Phone']?>: <span style="font-weight:bold;color:#06C"><?=strlen($row['mobiletel'])>0?$row['mobiletel']:'-'?></span><br />
<?=$lang['Gender']?>: <span style="font-weight:bold;color:#C60"><?=strlen($row['gender'])>0?$row['gender']:'-'?></span><br />
<?=$lang['Date+of+Birth']?>: <span style="font-weight:bold;color:#0C3"><?=strlen($row['dob'])>0?$row['dob']:'-'?></span><br />
<?=$lang['Registration']?> IP: <span style="font-weight:bold;color:#F60"><?=strlen($row['ip_reg'])>0?$row['ip_reg']:'-'?></span><br />
<?=$lang['Last+login']?> IP: <span style="font-weight:bold;color:#F60"><?=strlen($row['ip_last'])>0?$row['ip_last']:'-'?></span><br />
<?=$lang['Security+answer']?>: <a href="#" onclick="showPopup2('<?=strlen($row['secans'])>0?$row['secans']:''?>')" style="font-weight:bold;color:#09F">(<?=$lang['click+for+details']?>)</a>
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
				var street = $("#street").val();
				var city = $("#city").val();
				var country = $("#country option:selected").val();
				var aff_id = $("#aff_id").val();
				var aff_status = $("#aff_status option:selected").val();
				var ph_no = $("#ph_no").val();
				showparam('um_edit_u','update=1'+'&aff_id='+aff_id+'&aff_status='+aff_status+'&login='+login+'&'+'pass='+pass+'&'+'email='+email+'&city='+city+'&country='+country+'&ph_no='+ph_no+'&street='+street+'&'+'name='+name+'&'+'fam='+fam+'&'+'status='+status+'&'+'cash='+cash+'&'+'id='+'<?=antisqli($_POST['id'])?>');
							 });
</script>
</div>
</fieldset>
</form>
