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
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
$sql = "SELECT status,secques FROM `cws_users` INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE `login`='{$_SESSION['username']}'";
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],$sql));

if ((int)$row['status']!== 1) {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}
?>
<form method="post" onsubmit="return false">
<div style="width:400px;padding-top:5px;" >
<div style="width:400px;float:left">
<table width="395" cellpadding="0" cellspacing="0" style="font-size:12px;font-weight:bold;font-family:'Trebuchet MS', Arial, Helvetica, sans-serif">
<tr style="height:30px">
  <td width="102">&nbsp;</td>
  <td width="291">&nbsp;</td>
</tr>
<tr style="height:30px">
<td><?php echo $lang['Amount']?><br /></td><td><input class="field" name="amount" type="text" style="font-size:12px;width:125px;" id="amount" /> <span style="color:red"><?php echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT transfer_fee FROM cws_settings"),0)?>%</span> <?php echo $lang['transfer+fee']?></td>
</tr>
<tr style="height:30px">
<td height="26"><?php echo $lang['Receiver+username']?></td><td><input class="field" name="receiver" type="text" style="font-size:12px;width:125px;" id="receiver" />
  <?php echo $_SESSION['currency']?>
  <br /></td>
</tr>
<tr style="height:30px">
<td height="26"><?php echo $lang['Secret+question']?></td><td  align="center"><?php echo $row['secques']?></td>
</tr>
<tr style="height:30px">
<td height="26"><?php echo $lang['Secret+answer']?></td><td><input class="field" name="secans" type="text" style="font-size:12px;width:125px;" id="secans" />
  <?php echo $_SESSION['currency']?>
  <br /></td>
</tr>
<tr style="height:30px">
  <td></td>
  <td>
  <input class="field" name="submit" type="submit" value="<?php echo $lang['Transfer+money']?>" style="font-size:12px;width:125px;" onclick="javascript: doTransfer();" id="SubmitAccPw"/>
  <input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back']?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
  <input type="hidden" value="<?php $_SESSION['token_transfer'] = substr(md5(uniqid()),0,15);echo $_SESSION['token_transfer'];?>" name="uid" id="uid" />
    <script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
			});
		});
</script></td>
</tr>
</table>
</div>
</div>
</form>