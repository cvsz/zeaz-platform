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
	
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE `login`='{$_SESSION['username']}'")or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
?>
<form method="post" onsubmit="return false">
<div style="width:300px;margin-top:-5px;" >
<div style="width:200px;float:left">
<table width="500" cellpadding="0" cellspacing="0" style="font-size:12px;font-weight:bold;font-family:'Trebuchet MS', Arial, Helvetica, sans-serif">
<tr style="height:30px">
  <td width="100"><?php echo $lang['Old+Password'];?></td><td colspan="2"><input class="field" name="oldpw" type="password" style="font-size:12px;width:125px" id="oldpw" /></td>
</tr>
<tr style="height:30px">
<td><?php echo $lang['New+Password'];?></td>
<td width="75"><input class="field" name="newpw1" type="password" style="font-size:12px;width:125px" id="newpw1" />
<script type="text/javascript">
$("#newpw1").keyup(function() {
			var newpw1 = $("#newpw1").val();
			$("#passmeter").load("includes/check_pw.inc.php?newpw1="+newpw1)
		});
</script>
<td width="189">
<div id="passmeter"><?php echo $lang['Please+enter+a+password'];?></div>
</td>
<td width="34"></td>
</tr>
<tr style="height:30px">
<td><?php echo $lang['Confirm+New+Pass']?></td>
<td colspan="2"><input class="field" name="newpw2" type="password" style="font-size:12px;width:125px" id="newpw2"/>
</td>
</tr>
<tr style="height:30px">
<td height="26" colspan="3" style="color: #999"><?php echo $row['secques']; ?></td>
</tr>
<tr style="height:30px">
<td><?php echo $lang['Answer'];?></td>
<td colspan="2"><input class="field" name="secans" type="text" style="font-size:12px;width:125px" id="secans" /></td>
</tr>
<tr style="height:30px">
<td colspan="3"><input class="field" name="submit" type="submit" value="<?php echo $lang['Update'];?>" style="font-size:12px;width:125px;" onclick="javascript: doChangeMyPw();" id="SubmitAccPw"/>
<input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
<script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/account.inc.php").fadeIn('slow');
			});
		});
</script></td>
</tr>
<tr style="height:30px">
<td colspan="3" style="font-size:10px">

<?php echo $lang["Please+use+only+letters+and+numbers+in+your+password"];?> (<?php echo $lang["8-14+characters"];?>)

</td>
</tr>
</table>
</div>

</div>
</form>