<?php
#developed by www.zcino
@require_once('config.inc.php');
$customerservicenr = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT phone_number FROM cws_settings"),0);
?>
<div style="text-align:center">
  <table align="center">
    <tr>
  <td width="549" align="center"> <br /><br /><?=$lang['Available+on']?> <br />
<?=$lang['Email']?> : <span style="color:orange;font-weight:bold">contact[ at ]<?php echo str_replace('www.','',$_SERVER['SERVER_NAME']);?></span><br />
<?=$lang['Phone']?> : <span style="color:orange;font-weight:bold"><?php echo $customerservicenr?></span>

<?php
if (isset($_POST['submit1'])) {
	echo '<br /><br />';
	$disabled=1;
	if ($disabled==1){
		echo 'Contact disabled in demo';
		exit;
	}
if ($_POST['vercode']!=$_SESSION['vercode']) {
	die('Invalid code');
}
$ip = $_SERVER['REMOTE_ADDR'];
$httpref = antisqli($_POST['httpref']);
$httpagent = antisqli($_POST['httpagent']);
$name = antisqli($_POST['name']);
$email = antisqli($_POST['email']);
$website = antisqli($_POST['website']);
if (!checkEmail($email)) {die('Invalid attempt');}
$notes = antisqli($_POST['notes']);
$attn = antisqli($_POST['attn']);
$ref = $_SESSION['ref'];

if (stristr($notes,'http:')) {
	die ("Error!");
}
if(!$email == "" && (!strstr($email,"@") || !strstr($email,"."))) 
{
echo "<h2>".$lang['Use+Back']." - ".$lang['Enter+valid+email']."</h2>\n"; 
$badinput = "<h2>Feedback was NOT submitted</h2>\n";
echo $badinput;
}

if(empty($name) || empty($email) || empty($notes )) {
echo "<h2>".$lang['Use+Back']." - ".$lang['fill+in+all+fields']."</h2>\n";
}

$todayis = date("l, F j, Y, g:i a") ;

$attn = $attn ; 
$subject = $attn; 

$notes = stripcslashes($notes); 

$notes = nl2br($notes);
$message = " $todayis [EST] <br /><br />
Attention: $attn <br /><br />
<b>Message:</b><br /> $notes <br /> <br />
From: $name ($email)<br /><br />
$website
Additional Info : IP = $ip <br /><br />
Referral : $ref <br /><br />
";
$from = $email;
send_mail($from,$adminemail, $subject, $message);
echo $lang['Thank+you+for+contacting+us'].' <b>'.$name.'</b> ! '.$lang['We+will+reply+to+you+in+the+shortest+time+possible'].'!';
}else {
?>
    <br />
    <br />
    <?=ucfirst($lang['Please+use+our+contact+form+for+faster+response'])?>! <br />
    <?php echo $response_time?><br /></td></tr><tr><td height="12%" colspan="3" align="center" valign="top" class="heading" style="padding-top:8px; color:#CC0000;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                      <td colspan="3" align="center" class="body">Your Name: <br />
<form action="" method="post" onsubmit="return false">                                   
<input type="text" name="name" size="35" value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''?>" id="name"/>
<br />
<?=$lang['Your+Email']?>:<br />
<input type="text" name="email" size="35" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''?>" id="email"/>
<input type="hidden" name="website" value="<?php echo $_SERVER['SERVER_NAME']?>" />
<br /> <br />
<br />
<?=$lang['Attention']?>:<br />
<select name="attn" size="1" id="attn">
<option value=" Free consultation "><?=$lang['Free+consultation']?> </option> 
<option value=" General Support "><?=$lang['General+Support']?> </option> 
<option value=" Technical Support "><?=$lang['Technical+Support']?> </option> 
<option value=" Webmaster ">Webmaster </option> 
</select>
<br /><br />
Enter result of : <span style="font-size:11px; font-weight:bold;color:red"><strong><?php $t1=round(mt_rand(0,10)); $t2=round(mt_rand(0,10)); echo $t1.'+'.$t2; $_SESSION['vercode']=$t1+$t2;?></strong></span><input type="text" name="vercode" id="vercode"/><br />
<br />

Mail Message:
<br />
<textarea name="notes" rows="4" cols="40" id="notes"><?php echo isset($_POST['notes']) ? htmlspecialchars($_POST['notes']) : ''?></textarea>
<br />
<input type="submit" value="Send Mail" name="submit" onclick="doContact()"/></form></td></tr></table><br />

</div>
<?php
}?>