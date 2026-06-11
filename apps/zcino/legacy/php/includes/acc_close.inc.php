<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
if ($row['status']!==1 && 2==3) {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px">\').load("includes/account.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}
?>
<form method="post" onsubmit="return false">
<div style="width:450px;margin-top:-10px;" >
<div style="width:450px;float:left">
<table>
<tr>
<td>
<table width="257" cellpadding="0" cellspacing="0" style="font-size:12px;font-weight:bold;font-family:'Trebuchet MS', Arial, Helvetica, sans-serif">
<tr style="height:35px">
  <td width="113"><?php echo $lang['Password'];?></td><td width="142"><input class="field" name="pass" type="password" style="font-size:12px;width:125px" id="pass" /></td>
</tr>
<tr style="height:35px">
<td height="18" colspan="2" style="color: #999"><?=$lang['Secret+question']?>:<?php echo $row['secques']; ?></td>
</tr>
<tr style="height:35px">
<td><?php echo $lang['Answer'];?></td><td><input class="field" name="secans" type="text" style="font-size:12px;width:125px" id="secans" /></td>
</tr>
<tr style="height:35px">
<td><?php echo $lang['Close+account+for+how+many+days'];?> ?</td>
<td><input class="field" name="time" type="text" style="font-size:12px;width:125px" id="time" /></td>
</tr>
<tr style="height:35px">
<td><?php echo $lang['Reason'];?></td>
<td><textarea name="reason" style="font-size:12px;width:125px;height:24px;color:white;background-color: #333" id="reason"></textarea></td>
</tr>
<tr style="height:35px">
<td></td><td>  <input class="field" name="submit" type="submit" value="<?php echo $lang['Close+Account'];?>" style="font-size:12px;width:125px;" onclick="javascript: doClose();" id="SubmitAccPw"/>
<input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
<script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/account.inc.php").fadeIn('slow');
			});
		});
</script></td>
</tr>
</table>
</td>
<td>
<div style="width:150px;float:right;font-size:11px;margin-top:-15px;color:red" class="extradata">*<?php echo $lang["Please+note+that+this+decission+is+irrevocable+and+once+your+account+will+be+closed+all+the+current+funds+will+be+blocked+so+ask+for+a+refund+before+closing+your+account+"];?>
</div>
</td>
</tr>
</table>
</div>
</div>
</form>