
<?php
#developed by www.zcino
@require_once('config.inc.php');
$form = '
    <form action="" method="post" onsubmit="return false">
					<span style="color:white;font-size:9px">'.$lang['REFER+A+FRIEND'].'</span>	
					<div class="grey" style="width:110px;float:left;font-size: 9px">'.$lang['Friend+Name'].'</div>
					<input class="field" type="text" name="friendname" id="friendname" style="width:90px;float:left;font-size: 9px"/>
                    <br />
					<div class="grey" style="width:110px;float:left;font-size: 9px">'.$lang['Friend+Email'].'</div>
					<input class="field" type="text" name="friendemail" id="friendemail" size="12" style="width:90px;float:left;font-size: 9px"/>
					<input type="submit" name="submit" value="'.$lang['Refer+friend'].'" class="bt_register" onclick="referafriend();" style="font-size:9px"/>
				</form>
                ';
if (isset($_POST['friendemail'])) {
if (checkEmail($_POST['friendemail'])) {
	$user = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE login='{$_SESSION['username']}'"));
	$settings = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings"));
	$from = $user['email'];
	$to = $_POST['friendemail'];
	$subject = 'Join us at '.$sitename;
	$reflink = 'http://'.$_SERVER['SERVER_NAME'].'/friend_register.php';
	$body = "<div style=\"background-color:black;color:#FFF;font-weight:bold;font-family:'Verdana', Courier, monospace;padding:25px 25px 25px 25px;\">
	<img src=\"http://{$_SERVER['SERVER_NAME']}/images/logo.png\" />
<p>Make sure you act quickly: {$settings['1stdepositbonus']} - first deposit bonus <br>
  Hi {$_POST['friendname']},!<br>
  With this promotion, both of us are in with a chance of getting free betting credit worth RON 75 and a Poker Bonus worth $30 at $sitename, the No. 1 in online entertainment. We'll have to act quickly, though. This offer is only valid until ".date('Y-m-d', time()+(60*60*24*7))."<br>
  Here's how it works:<br>
  <ol><li>Click on the button below and open an account with $sitename</li>
  <li>Deposit at least {$mindeposit} $ into your account and $sitename will give you an extra {$settings['1stdepositbonus']}.</li>
  <li>I will also receive a {$settings['affilperc']}% bonus.</li></ol>
  <a href=\"{$reflink}\">Register now !</a><br />
  Thanks and good luck! <br />
  {$user['name']} <br /><br />
  $sitename is the one of the top in online entertainment. Whether it's on the internet or your mobile phone, there are up to 30,000 bets on offer 24/7 from over 90 different countries. What are you waiting for? Play for real! </p>
<p>This e-mail was sent to you by {$user['email']} via the Friendship Program at $sitename.</p>
</div>";
	$headers = '';
	$headers .= "From: $from\n";
	$headers .= "Reply-to: $from\n";
	$headers .= "Return-Path: $from\n";
	$headers .= "Message-ID: <" . md5(uniqid(time())) . "@" . $_SERVER['SERVER_NAME'] . ">\n";
	$headers  .= 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
	$headers .= "Date: " . date('r', time()) . "\n";

	
	if (mail($to,$subject,$body,$headers)) {
		echo '<script type="text/JavaScript">
    $(\'#referafriend\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Email+sent'].'</p>\').fadeOut(2000, function() {
				$(\'#referafriend\').load("includes/referafriend.inc.php").fadeIn(\'slow\');
			});
</script>';
	}
	else {echo '<script type="text/JavaScript">
    $(\'#referafriend\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Please+try+again'].'</p>\').fadeOut(2000, function() {
				$(\'#referafriend\').load("includes/referafriend.inc.php").fadeIn(\'slow\');
			});
</script>';
	}} else {echo '<script type="text/JavaScript">
    $(\'#referafriend\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">Invalid Email</p>\').fadeOut(2000, function() {
				$(\'#referafriend\').load("includes/referafriend.inc.php").fadeIn(\'slow\');
			});
</script>';}}
	else {echo $form;}
?>