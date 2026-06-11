<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
//turn to 0 any field that you do not want to appear in the REGISTRATION page
define('F_'.'EMAIL',1);//require email
define('F_'.'GENDER',1);//require gender
define('F_'.'NAME',1);//require First name
define('F_'.'FAM',1);//require Last name
define('F_'.'DOB',1);//require Date of birth
define('F_'.'STREET',1);//require Street
define('F_'.'ZIP',1);//require ZIP
define('F_'.'ORT',1);//require City
define('F_'.'COUNTRY',1);//require Country
define('F_'.'MOBILETEL',1);//require Mobile phone
define('F_'.'SECQUES',1);//require Secret question
define('F_'.'SECANS',1);//require Secret answer
define('F_'.'KNOW',1);//where from do you know about us

if (isset($_POST['login'])) {
	 $login = antisqli($_POST['login']);
	 if (usernameExists($login)){
			echo '&login='.$lang['Username+is+already+taken'];die();
		}elseif(!checkName($login)){
			echo '&login='.$lang['Invalid+username'];die();
			}else{
				echo '&login=OK';
			}
}	
if (isset($_POST['email'])) {
	 $email = antisqli($_POST['email']);
	 if (emailExists($email)){
			echo '&email='.$lang['Email+is+already+taken'];die();
		}elseif(!checkEmail($email)){
			echo '&email='.$lang['Invalid+email'];die();
			}else{
				echo '&email=OK';
			}
}				
if (isset($_POST['submit1'])) {
				 $user_ip_address = $_SERVER["REMOTE_ADDR"];
				 $email = strtolower(antisqli($_POST['email']));
 				 $login = strtolower(antisqli($_POST['login']));
				 $pass =  antisqli($_POST['pass']);
				 
				
				
				 
				 
				 if (empty($_POST['login']) || strlen($_POST['login'])==0){$errormsg = 'login';}
				 if (usernameExists($username)){$errormsg = 'login';}
				  				 
				 if (empty($_POST['pass']) || strlen($_POST['pass'])==0){$errormsg = 'pass';}
				 if (!check_pw($pass)){$errormsg = 'pass';}
				 if (strlen($_POST['pass'])<6) {
					 $errormsg = 'pass';
				 }
				 
				 if (F_EMAIL==1){
					 if (!checkEmail($email)){$errormsg = 'email';}
					 if (emailExists($email)){$errormsg = 'email';}
				 }
				 
				 if (F_NAME==1){
					 if (empty($_POST['name']) || strlen($_POST['name'])==0){$errormsg = 'fname';}
				 }
				 if (F_FAM==1){
					 if (empty($_POST['fam']) || strlen($_POST['fam'])==0){$errormsg = 'fam';}
				 }
				 if (F_GENDER==1){
					 if (empty($_POST['gender']) || strlen($_POST['gender'])==0){$errormsg = 'gender';}
				 }
				 
				 if (F_DOB==1){
					 if (empty($_POST['dob']) || strlen($_POST['dob'])==0){$errormsg = 'dob';}
					 $ddate = explode('/',$_POST['dob']);
					 if (!is_numeric($ddate[0]) || !is_numeric($ddate[1]) || !is_numeric($ddate[2])){
						 $errormsg = 'datepicker1';
					 }elseif (!checkdate($ddate[1],$ddate[0],$ddate[2])){
						 $errormsg = 'datepicker2';
					 }
				 }
				 
				 if (F_STREET==1){
					 if (empty($_POST['street']) || strlen($_POST['street'])==0){$errormsg = 'street';}
				 }
				 if (F_ZIP==1){
					 if (empty($_POST['zip']) || strlen($_POST['zip'])==0){$errormsg = 'zip';}
				 }
				 if (F_ORT==1){
					 if (empty($_POST['ort']) || strlen($_POST['ort'])==0){$errormsg = 'ort';}
				 }
				 if (F_COUNTRY==1){
					 if (empty($_POST['country']) || strlen($_POST['country'])==0 || $_POST['country']=='0'){$errormsg = 'country';}
				 }
				 if (F_MOBILETEL==1){
					 if (empty($_POST['mobiletel']) || strlen($_POST['mobiletel'])==0 || !is_numeric($_POST['mobiletel'])){$errormsg = 'mobiletel';}
				 }
				 if (F_SECANS==1){
					 if (empty($_POST['secans']) || strlen($_POST['secans'])<6){$errormsg = 'secans';}
				 }
				 
				 if (F_SECQUES==1){
					 if (empty($_POST['secques']) || strlen($_POST['secques'])==0 || $_POST['secques']=='0'){$errormsg = 'secques';}
				 }

				 if (F_KNOW==1){
					 switch ($_POST['whereknowfrom']){
						 case '1':$whereknowfrom = 'Internet advertising';break;
						 case '2':$whereknowfrom = 'E-mail';break;
						 case '3':$whereknowfrom = 'Search engine';break;
						 case '4':$whereknowfrom = 'Friend/colleague';break;
						 case '5':$whereknowfrom = 'Television';break;
						 case '6':$whereknowfrom = 'Radio';break;
						 case '7':$whereknowfrom = 'Newspaper/magazine';break;
						 case '8':$whereknowfrom = 'Event';break;
						 case '9':$whereknowfrom = 'Poster/billboard';break;
						 case '10':$whereknowfrom = 'Flyers';break;
						 case '11':$whereknowfrom = 'Other';break;
						 default: $errormsg = 'whereknowfrom';break;
					 }
				 }
				 
				 
				 if (!isset($_SESSION['reff'])){
					 $_SESSION['reff'] = 'admin';
				 }
				 if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE id='{$_SESSION['reff']}'"))==0){ // if referrer doesnt exist
					$_SESSION['reff'] = 'admin';
				 }
				 $aff_id = '';
				 if (AFFILIATES==1 && !has_duplicate_ip($_SERVER['REMOTE_ADDR'])){
					 //check affiliate id
					 include(BASE_PATH.'/includes/affiliate_chk.inc.php');
					 //end check affiliate id
				 }
				 $name = antisqli($_POST['name']).' '.antisqli($_POST['fam']);
				 $rbonus = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `reg_bonus` FROM `cws_settings`"),0);
				 if ($rbonus==""){$rbonus = 0;}
				 $sql = "INSERT INTO `cws_users` (`cash`,`status`,`login`,`owner`) VALUES ('0','1','".antisqli($login)."','".antisqli($_SESSION['reff'])."')";		 
				 if ($login == $_SESSION['reg_user']){
						$errormsg = 'registered';
					}
				 if(empty($errormsg)){ 
				 	if (mysqli_query($GLOBALS['con'],$sql)) {
									$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='".antisqli(strtolower($_POST['login']))."'"),0); 
									mysqli_query($GLOBALS['con'],"INSERT INTO `cws_users_info` (`id`,`pass`,`ip_reg`,`aff_id`) VALUES ('$userid','".pass_encode($pass)."','".antisqli($user_ip_address)."','".antisqli($aff_id)."')") or die(mysqli_error($GLOBALS['con']));
									$sql2 = "UPDATE cws_users_info SET `email`='".antisqli($email)."',`gender`='".antisqli($_POST['gender'])."',`name`='".antisqli($_POST['name'])." ".antisqli($_POST['fam'])."',`dob`='".antisqli($_POST['dob'])."',`street`='".antisqli($_POST['street'])."',`zip`='".antisqli($_POST['zip'])."',`ort`='".antisqli($_POST['ort'])."',`country`='".antisqli($_POST['country'])."',`mobiletel`='".antisqli($_POST['mobiletel'])."',`secques`='".antisqli($_POST['secques'])."',`secans`='".antisqli($_POST['secans'])."',`whereknowfrom`='".antisqli($whereknowfrom)."' WHERE id='$userid'";
									if (mysqli_query($GLOBALS['con'],$sql2)) {
										echo 'success';
										if (strlen($_POST['affiliate'])>0 && $aff_id==''){
											$_SESSION['show_alert'] = 2;//affiliate was sent, but incorrect
										}elseif(strlen($aff_id)>0){
											$_SESSION['show_alert'] = 1;//affiliate was sent and was correct	
										}else{
											$_SESSION['show_alert'] = 0;//affliate was NOT sent
										}
										
										credit_just_bonus('reg_bonus',$userid,'0',$rbonus,'10');
										$_SESSION['reg_user'] = $login;
									}else{
										die($sql.'<br />'.mysqli_error($GLOBALS['con']));
									}
								} else {
									die($sql2.'<br />'.mysqli_error($GLOBALS['con']));
									}
				 }else{
					 echo $errormsg;
				 }
							
}else {
?>
<html>
<head>
<link rel="stylesheet" href="http://<?=$_SERVER['SERVER_NAME']?>/css/register.css" type="text/css"/>
<link rel="stylesheet" href="http://<?=$_SERVER['SERVER_NAME']?>/css/calendar.css" type="text/css"/>
<script  src="http://<?=$_SERVER['SERVER_NAME']?>/jscript/jquery.js" type="text/javascript"></script>
<script  src="http://<?=$_SERVER['SERVER_NAME']?>/jscript/calendar.js" type="text/javascript"></script>
<script type="text/javascript">
	$(function() {
		$("#datepicker").datepicker({dateFormat:'dd/mm/yy'},{maxDate: 'D/M/-0Y'});
	});
</script>
<script type="text/javascript">
	var errormsg = 0;
	function check(parameter) {
		var param = $("#"+parameter).val();
		var msg = '';
		if (parameter == 'country' || parameter == 'secques') { param = $("#"+parameter+" option:selected").text();}
		if (param.length<5 || param.length>25) {
			if (parameter!=='country' && parameter!=='secques' && parameter!=='street') {
				msg = '<?=$lang['Length+must+be+between']?> 5-25';
				errormsg = 1;
			} else {
				msg = '<span style="color:green">OK</span>';
				errormsg = 0;	
				}
		} else {
			msg = '<span style="color:green">OK</span>';	
		}
		if (parameter=='street'&&(param.length<4 || param.length>45)) {
				msg = '<?=$lang['Length+must+be+between']?> 4-45';
				errormsg = 1;
			} else {
				msg = '<span style="color:green">OK</span>';
				errormsg = 0;	
				}
		if (parameter=='zip'&&(param.length<3 || param.length>25)) {
				msg = '<?=$lang['Length+must+be+between']?> 3-25';
				errormsg = 1;
			} else {
				msg = '<span style="color:green">OK</span>';
				errormsg = 0;	
				}			
		if (parameter == 'mobiletel') {
			if (isNaN(param)) {
				msg = '<?=$lang['Value+must+be+numeric']?>';
				errormsg = 1;
			}
		}
		if (parameter == 'country') {
			if (param=='<?=$lang['Please+choose+a+country']?>') {
				msg = '<?=$lang['Not+a+valid+country']?>';
				errormsg = 1;
			}
		}
		if (parameter == 'email') {
			$.post('http://<?=$_SERVER['SERVER_NAME']?>/pages/register.php',{email:email},function(data) {$("#email_error").html(data);
			if (data=='<span style="color:green">OK</span>'){
				$("#"+parameter).removeClass('errorBorder');}else {$("#"+parameter).addClass('errorBorder');
				}
			});
		}
		if (parameter == 'login') {
			$.post('http://<?=$_SERVER['SERVER_NAME']?>/pages/register.php',{login:login},function(data) {$("#username_error").html(data);
			if (data=='<span style="color:green">OK</span>'){$("#"+parameter).removeClass('errorBorder');}else {$("#"+parameter).addClass('errorBorder');}
			});
		}
		if (parameter !=='login' || parameter !=='email'){
			$("#"+parameter+"_error").html(msg);
			if (msg=='<span style="color:green">OK</span>') {
				$("#"+parameter).removeClass('errorBorder');
			}
			else {
				$("#"+parameter).addClass('errorBorder');
				}
		}
	}
	function doActivate() {
		var pass = $("#pass").val();	
		var login = $("#login").val();	
		var email = $("#email").val();	
		var gender = $("input[name='gender']:checked").val();
		var name = $("#name").val();
		var fam = $("#fam").val();
		var dob = $("#datepicker").val();
		var street = $("#street").val();
		var zip = $("#zip").val();
		var ort = $("#ort").val();
		var country = $("#country option:selected").val();
		var mobiletel = $("#mobiletel").val();
		var secques = $("#secques option:selected").val();
		var secans = $("#secans").val();
		var whereknowfrom = $("#whereknowfrom option:selected").val();
		var affiliate = $("#affiliate").val();
		$.post('http://<?=$_SERVER['SERVER_NAME']?>/pages/register.php',{affiliate:affiliate, pass: pass,gender:gender,email:email,login:login,name:name,fam:fam,dob:dob,street:street,zip:zip,ort:ort,country:country,mobiletel:mobiletel,secques:secques,secans:secans,submit1:'submit1',whereknowfrom:whereknowfrom},
			function(msg) {
			if (msg.search('success')<0) {
				if (msg.search('&email=OK')<0 && msg.search('&email=')>=0){
					$("#email").addClass('errorBorder');
					if (msg.search('&email=')>=0){
						var email_msg = msg.replace('&login=OK','');
						email_msg = email_msg.replace('&login=','');
						email_msg = email_msg.replace('&email=','');
						$("#email_error").html(email_msg);
					}
				}else{
					$("#email_error").html('');
					$("#email").removeClass('errorBorder');
				}
				if (msg.search('pass')>=0){
					$("#pass").addClass('errorBorder');
					$("#pass_error").html('<?=$lang['Password+too+short']?>');
				}else{
					$("#pass").removeClass('errorBorder');
					$("#pass_error").html('');
				}
				
				if (msg.search('secques')>=0){
					$("#secques").addClass('errorBorder');
					$("#secques_error").html('<?=$lang['Secret+question+not+selected']?>');
				}else{
					$("#secques").removeClass('errorBorder');
					$("#secques_error").html('');
				}
				
				if (msg.search('whereknowfrom')>=0){
					$("#whereknowfrom").addClass('errorBorder');
					$("#whereknowfrom_error").html('Invalid "Where did you find about us"');
				}else{
					$("#whereknowfrom").removeClass('errorBorder');
					$("#whereknowfrom_error").html('');
				}
				
				if (msg.search('secans')>=0){
					$("#secans").addClass('errorBorder');
					$("#secans_error").html('<?=$lang['Secret+answer+not+selected']?>');
				}else{
					$("#secans").removeClass('errorBorder');
					$("#secans_error").html('');
				}
				
				if (msg.search('fam')>=0){
					$("#fam").addClass('errorBorder');
					$("#fam_error").html('<?=$lang['Last+name+invalid']?>');
				}else{
					$("#fam").removeClass('errorBorder');
					$("#fam_error").html('');
				}
				
				if (msg.search('fname')>=0){
					$("#name").addClass('errorBorder');
					$("#name_error").html('<?=$lang['First+name+invalid']?>');
				}else{
					$("#name").removeClass('errorBorder');
					$("#name_error").html('');
				}

				
				if (msg.search('dob')>=0){
					$("#datepicker").addClass('errorBorder');
					$("#datepicker_error").html('<?=$lang['Date+of+birth+not+selected']?>');
				}else{
					$("#datepicker").removeClass('errorBorder');
					$("#datepicker_error").html('');
				}
				
				if (msg.search('secans')>=0){
					$("#secans").addClass('errorBorder');
					$("#secans_error").html('<?=$lang['You+must+type+a+secret+answer+having+minimum+6+chars']?>');
				}else{
					$("#secans").removeClass('errorBorder');
					$("#secans_error").html('');
				}
				
				if (msg.search('mobiletel')>=0){
					$("#mobiletel").addClass('errorBorder');
					$("#mobiletel_error").html('<?=$lang['Mobile+phone+invalid']?>');
				}else{
					$("#mobiletel").removeClass('errorBorder');
					$("#mobiletel_error").html('');
				}
				
				if (msg.search('ort')>=0){
					$("#ort").addClass('errorBorder');
					$("#ort_error").html('<?=$lang['City+field+empty']?>');
				}else{
					$("#ort").removeClass('errorBorder');
					$("#ort_error").html('');
				}
				
				if (msg.search('zip')>=0){
					$("#zip").addClass('errorBorder');
					$("#zip_error").html('<?=$lang['ZIP+Code+invalid']?>');
				}else{
					$("#zip").removeClass('errorBorder');
					$("#zip_error").html('');
				}
				
				if (msg.search('street')>=0){
					$("#street").addClass('errorBorder');
					$("#street_error").html('<?=$lang['Street+field+empty']?>');
				}else{
					$("#street").removeClass('errorBorder');
					$("#street_error").html('');
				}
				
				if (msg.search('datepicker')>=0){
					$("#datepicker").addClass('errorBorder');
				}else{
					$("#datepicker").removeClass('errorBorder');
				}
				if (msg.search('&login=OK')<0 && msg.search('&login=')>=0){
					$("#login").addClass('errorBorder');
					if (msg.search('&login=')>=0){
						var login_msg = msg.replace('&login=','');
						login_msg = login_msg.replace('&email=OK','');
						login_msg = login_msg.replace('&email=','');
						$("#login_error").html(login_msg);
					}
				}else{
					$("#login_error").html('');
					$("#login").removeClass('errorBorder');
				}
				
			}else{
				$("#email").removeClass('errorBorder');
				$("#login").removeClass('errorBorder');
			}
			if (msg.search('registered')>=0) { 
					err = '<?=$lang['You+just+registered']?>. <?=$lang['Please+wait+5+minutes+before+registering+again']?>!';
					$("#tmpdata").html(err);
				}else {
					 if (msg.search('success')>=0) {
						 err = '<?=$lang['You+have+successfully+registered']?>';
						 alert('<?=$lang['You+have+successfully+registered']?>');
						 $("#tmpdata").html(err);
										 }
					}
			}
			);
			window.location.hash="tmpdata";
		}
	</script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<body>
<div id="page">
<form action="" method="post" onSubmit="return false">
<span id="tmpdata"></span>
<table width="590" border="0" cellpadding="0" cellspacing="0" class="openAccTable">
						<tr><td height="5" colspan="3"></td></tr>
						<tr>
							<td colspan="3">
								<p class="bold"><?=$lang['Please+fill+out+your+personal+and+account+details+below']?>: </p>							
                                </td>
						</tr>
						<tr><td height="10" colspan="3"></td></tr>
                        <tr>
                          <td>*<?=$lang['Username']?>: </td><td><strong><input name="login" type="text" class="normal" id="login" style="width:180px;" value="<?php  echo $login; ?>"  /></strong></td>
                          <td><span id="login_error" class="error"></span></td></tr>
                        <tr>
							<td class="bold">*<?=$lang['Password']?>: </td>
							<td width="284"><input name="pass" type="text" class="normal" id="pass" style="width:180px;" value="<?php  echo $pass; ?>" onBlur="check('pass')"/></td>
							<td width="99" align="center"><span id="pass_error" class="error"></span></td>
						</tr>
                        <tr <?php if (F_EMAIL==1){}else{echo 'style="display:none"';}?>><td>*<?=$lang['Email']?>: </td><td><strong><input name="email" type="text" class="normal" id="email" style="width:180px;" value="<?php  echo $email; ?>"/></strong></td>
                          <td><span id="email_error" class="error"></span></td></tr>
					  	<tr <?php if (F_GENDER==1){}else{echo 'style="display:none"';}?>>
							<td width="141" class="bold"><?=$lang['Gender']?>:</td>
							<td><table cellspacing="0" cellpadding="0">
							  <tr>
                                <td><?=$lang['Male']?></td>
							    <td><input type="radio" value="M" name="gender" checked></td>
							    <td>&nbsp;<?=$lang['Female']?></td>
							    <td><input type="radio" value="F" name="gender"></td>
							    <td>&nbsp;</td>
						      </tr>
							  </table>							</td><td><!---       --------> </td>
							
					  </tr>
						<tr <?php if (F_NAME==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['First+Name']?>: </td>
							<td><input name="name" type="text" class="normal" id="name" style="width:180px;" value="<?php  echo $name; ?>" onKeyUp="check('name')"/></td>
							<td align="center"><span id="name_error" class="error"></span></td>
						</tr>
                        
						<tr <?php if (F_FAM==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['Last+Name']?>: </td>
							<td><input name="fam" type="text" class="normal" id="fam" style="width:180px;" value="<?php  echo $fam; ?>" onKeyUp="check('fam')"/></td>
							<td align="center"><span id="fam_error" class="error"></span></td>
						</tr>
						<tr <?php if (F_DOB==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['Date+of+Birth']?>: </td>
							<td><input type="text" value="" name="dob" id="datepicker" style="width:75px" />(DD/MM/YYYY)</td>
							<td  align="center"><span id="datepicker_error" class="error"></span></td>
						</tr>
						<tr <?php if (F_STREET==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['Street']?>:</td>
							<td><input name="street" type="text" class="normal" id="street" style="width:180px;" value="<?php  echo $street; ?>" onKeyUp="check('street')"/></td>
							<td align="center"><span id="street_error" class="error"></span></td>
						</tr>
						<tr <?php if (F_ZIP==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*ZIP/<?=$lang['Postal+Code']?>:</td>
							<td><input name="zip" type="text" class="normal" id="zip" style="width:180px;" value="<?php  echo $zip; ?>" onKeyUp="check('zip')"/></td>
							<td align="center"><span id="zip_error" class="error"></span></td>
						</tr>
						<tr <?php if (F_ORT==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['City']?>:</td>
							<td><input name="ort" type="text" class="normal" id="ort" style="width:180px;" value="<?php  echo $ort; ?>" onKeyUp="check('ort')"/></td>
							<td align="center"><span id="ort_error" class="error"></span></td>
						</tr>
						<tr <?php if (F_COUNTRY==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['Country']?>:</td>
							<td><select name="country" id="country" onChange="check('country')">										
                                      <option value="0"><?=$lang['Please+choose+a+country']?></option>
                                      <option value="no" <?php if($country=="us"){echo "selected=\"selected\"";} ?>>USA</option>                                      <option value="se" <?php if($country=="se"){echo "selected=\"selected\"";} ?>>Sweden</option>                                      <option value="fr" <?php if($country=="fr"){echo "selected=\"selected\"";} ?>>France</option>
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
                                      <option value="zw" <?php if($country=="zw"){echo "selected=\"selected\"";} ?>>Zimbabwe</option>										<option value="other" <?php if($country=="other"){echo "selected=\"selected\"";} ?>>Other</option>
                                    </select></td>
                                    <td align="center"><span id="country_error" class="error"><?=$lang['Choose+a+country']?></span></td>
						</tr>
						<tr>
						  <td class="bold">&nbsp;</td>
						  <td>&nbsp;</td> 
                          <td></td>
                          </tr>
						<tr <?php if (F_MOBILETEL==1){}else{echo 'style="display:none"';}?>>
							<td class="bold">*<?=$lang['Phone+Number']?>:</td>
							<td><input name="mobiletel" type="text" class="normal" id="mobiletel" style="width:180px;" value="<?php  echo $mobiletel; ?>" onKeyUp="check('mobiletel')"/></td><td align="center"><span id="mobiletel_error" class="error"></span></td>
						</tr>

                       <tr <?php if (F_SECQUES==1){}else{echo 'style="display:none"';}?>> 
							<td class="bold"><?=$lang['Secret+question']?>:</td>
							<td><select id="secques" name="secques" onChange="check('secques')">
                              <option value="0">Choose secret question</option>
                              <option value="What s my mother s first name?">What's my mother's first name?</option>
                              <option value="What s my favourite hobby?">What's my favourite hobby?</option>
                              <option value="What s my favourite sport club?">What's my favourite sport club?</option>
                              <option value="What s the name of my favourite book?">What's the name of my favourite book?</option>
                              <option value="Who was my childhood hero?">Who was my childhood hero?</option>
                              <option value="What s my best friend's name?">What's my best friend's name?</option>
                              <option value="What s the name of my pet?">What's the name of my pet?</option>
                              <option value="What s my nickname?">What's my nickname?</option>
                              <option value="What was the make of my first car?">What was the make of my first car?</option>
                              <option value="What s my secret code?">What's my secret code?</option>
							  </select></td>
                               <td  align="center"><span id="secques_error" class="error"><?=$lang['Choose+secret+question']?></span></td>
                       </tr>
					  <tr <?php if (F_SECQUES==1){}else{echo 'style="display:none"';}?>>
							<td class="bold"><?=$lang['Secret+answer']?>: </td>
							<td><input name="secans" type="text" class="normal" id="secans" style="width:180px;" value="<?php  echo $secans; ?>" onKeyUp="check('secans')"/></td>
							<td align="center"><span id="secans_error" class="error"></span></td>
					  </tr>
						<tr <?php if (F_KNOW==1){}else{echo 'style="display:none"';}?>>
							<td class="bold"><?=$lang['Where+did+you+find+about+us']?>: </td>
							<td><select id="whereknowfrom" name="whereknowfrom">
                              <option value="0" selected>How did you get to know of us?</option>
                              <option value="1">Internet advertising</option>
                              <option value="2">E-mail</option>
                              <option value="3">Search engine</option>
                              <option value="4">Friend/colleague</option>
                              <option value="5">Television</option>
                              <option value="6">Radio</option>
                              <option value="7">Newspaper/magazine</option>
                              <option value="8">Event/function</option>
                              <option value="9">Poster/billboard</option>
                              <option value="10">Flyers</option>
                              <option value="11">Other</option>
						    </select></td>
                            <td><span id="whereknowfrom_error" class="error"></span></td>
						</tr>
                        <?php if (AFFILIATES=='1' && !has_duplicate_ip($_SERVER['REMOTE_ADDR'])){?>
                        <tr>
							<td class="bold"><?=$lang['Affiliate']?> ID: </td>
							<td><input name="affiliate" type="text" class="normal" id="affiliate" style="width:180px;" value="<?php  echo $_SESSION['aff']; ?>" onKeyUp="check('affiliate')"/><br />
                            </td>
							<td align="center"><span id="affiliate_error" class="error"></span></td>
						</tr>
                        <?php }?>
						<tr>
							<td colspan="3">
						</td>
						</tr>
						<tr>
							<td colspan="3" height="30">
                                <?=$lang['By+pressing+REGISTER+I+agree+to+the']?>  
								<a href="terms.php" target="_blank"><?=$lang['terms+and+conditions']?></a> <?=$lang['and+confirm+that+I+am+of+18+years+or+over']?>.							</td>
						</tr>
                        <tr>
                        <td></td>
                        <td></td>
                        <td><input type="submit" name="submit" value="<?=$lang['Register']?>" class="bt_register" onClick="doActivate();"/></td>
                        
                        </tr>
				  </table>
</form>

</div>													 
</body>
<?php
}
?>