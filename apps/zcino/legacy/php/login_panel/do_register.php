<?php
require_once('includes/config.inc.php');
$formx = '<table>
                    <tr>		
					<td class="grey" style="width:140px;float:left">'.$lang['Username'].':</td>
					<td><input class="field" type="text" name="usernameReg" id="usernameReg"  value="'.$_POST['usernameReg'].'"/></td></tr>
                    <tr>
					<td class="grey" style="width:140px;float:left">'.$lang['Email'].':</td>
					<td><input class="field" type="text" name="emailReg" id="emailReg"  value="'.$_POST['emailReg'].'" /></td></tr>
                    <tr>
                    <td class="grey" style="width:140px;float:left;padding-top:4px">'.$lang['Enter+Code'].':      </td>
                    <td>
                    <input class="field" type="text" name="captchaReg" id="captchaReg" style="width:90px" /><img src="includes/captcha.php" align="right"/>&nbsp;    </td></tr>
                    <tr>
                    <td colspan="2">          
					
					<input type="submit" name="submit" value="'.$lang['Register'].'" class="bt_register" onclick="registerMe();"/>
					<script type="text/javascript">
					$(\'#captchaReg\').bind(\'keypress\', function(e) {
							if(e.keyCode==13){
								logMein();
							}
					});
					</script>
					</td></tr></table>
				</form>';	
$show_type = validateInput($_POST['valdo']);
// 0 = show register form
// 1 = show user data
if (!isset($_POST['valdo'])){ $show_type = 0;}
if (isset($_SESSION['username'])){
	$loggedin = checkloggedin($_SESSION['username']); //check if user is logged in for further use
}else {
	$loggedin = 'no';
}
if ($show_type == 0 && $loggedin == 'yes') {
?>
<div id="openAccount">
<h1><?=$lang['Previous+Gameplays']?> <div id="refreshGP" style="float:right;"><a href="#refresh_gameplays" onclick="javascript: refreshGP();"><?=$lang['refresh+history']?></a></div></h1>
			  <div id="yourDetails">
			  <table width="303" height="25" cellspacing="0" style="border-color:#000; border-style:dotted;">
						<tr >
						  <td width="25" style="color:#999">ID</td>
							<td width="45" style="color:#999"><?=$lang['Date']?></td>
							<td width="53" style="color:#999"><?=$lang['Game+Played']?> </td>
							<td width="44" style="color:#999"><?=$lang['Bet']?></td>
							<td width="39" style="color:#999"><?=$lang['Won']?></td>
</tr>
						  <?php			  
$l = $_SESSION['username'];
$i = 0;
$query = "SELECT *,cws_games.name as Gname FROM cws_gameplays  INNER JOIN `cws_games` ON cws_gameplays.gamename=cws_games.id WHERE cws_gameplays.user='$l' ORDER BY cws_gameplays.date DESC LIMIT 0,3";
$result = mysqli_query($GLOBALS['con'],$query);
while($detail = mysqli_fetch_array($result)) {
	$lasttime = $detail['time'];
	$i++;
	$gamename = $detail['Gname'];
	echo "					<tr>
						  <td><strong>$detail[id]</strong></td>
						  <td><strong>$detail[date]</strong></td>
						  <td><strong>$gamename </strong></td>
						  <td><strong>$detail[bet]</strong></td>
						  <td>$detail[won]</td>
					  </tr>
					      ";
						  
	if ($i==5) {break;}						  
}
?>
</table></div></div>
<?php
;
echo '<span style="color:white;font-weight:bold">'.$lang['Registration+IP'].'</span> - <span style="color:orange">'.db_fetch_one("SELECT `ip_reg` FROM `cws_users_info` WHERE id='{$_SESSION['userid']}'").'</span><br />';
echo '<span style="color:white;font-weight:bold">'.$lang['Last+login+IP'].'</span> - <span style="color:orange">'.$_SESSION['lastIP'].'</span>';

} 
elseif ($show_type == 1) {
	$username = strtolower(validateInput($_POST['usernameReg']));
	$email = validateInput($_POST['emailReg']);
	$email = strtolower($email);
	$captcha = (int) validateInput($_POST['captchaReg']);
	if ($_SESSION['captcha'] == $captcha ) {
	 if (usernameExists($username)) { $errormsg = $lang['Username+exists']; }
	   elseif (emailExists($email)) { $errormsg = $lang['Email+exists']; }
		elseif (strlen($username)<6) { $errormsg = $lang['Username+too+short'];}	
			elseif (strlen($username)>16) { $errormsg = $lang['Username+too+long'];}
				elseif (!checkName($username)) { $errormsg = $lang['Invalid+username'];}
					elseif (checkemail($email)) {
						$domain = $_SERVER['SERVER_NAME'];
						$from = $adminemail;
						$to = $email;
						$password = substr(md5(microtime()),0,10);
						$subject = $lang['Registration+Details'];
						$body = $lang['Hello'].' <strong>'.$username.'</strong>,<br />
								'.$lang['Thanks+for+signing+up+with'].' '.$domain.'!<br />
								'.$lang['Your+details+are+below'].':<br />
								'.$lang['Username'].': <strong>'.$username.'</strong><br />
								'.$lang['Password'].': <strong>'.$password.'</strong><br /><br />
								'.$lang['To+continue+your+registration+please+visit'].' http://'.$domain.'/do_activate.php
								'.$lang['within+the+next+hours'].', '.$lang['or+your+registration+will+expire'].'<br />
								'.$lang["If+you+have+any+questions+or+comments+please+feel+free+to+contact+us+at+"].' '.$from.'.';
						if (send_mail($from,$to,$subject,$body)){
										$_SESSION['temp_username'] = $username;
										$_SESSION['temp_email'] = $email;
										$_SESSION['temp_password'] = $password;
										echo '<script type="text/javascript">window.open ("http://'.$domain.'/do_activate.php",
"Set details","menubar=1,resizable=0,width=450,height=650");</script>';
										}else{
											echo $lang['Failed+to+send+email'];	
										}
					} else { $errormsg = $lang['Invalid+email'];}
	}
	else {$errormsg = $lang['Invalid+captcha+code'];}
	if (!empty($errormsg)) {
			   echo '<form action="" method="post" onsubmit="return false">
					<h2>'.$lang['Sign+Up+Error'].' - <span class="errorinput">'.$errormsg.'</span></h2>';
				echo $formx;		
			   } else { echo '<br /><br /><p style="font-size:22px;font-weight:bold;color:white;line-height:1em">'.$lang['Your+new+password+and+activation+link+have+been+sent+at'].' <span style="color:red">'.$email.'</span></p>';}
}
elseif ($loggedin == 'no') {
?>
				<form action="" method="post" onsubmit="return false">
					<h2><?=$lang['Not+a+member+yet']?>? <?=$lang['Sign+Up']?>!</h2>	
<?php
echo $formx;
}
?>