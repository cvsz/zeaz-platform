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
$sql = mysqli_query($GLOBALS['con'],"SELECT status FROM `cws_users` WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));	
$status = mysqli_result($sql,0);
$row = mysqli_fetch_array($sql);
if ($status!== '1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang["Your+account+is+not+in+an+eligible+state+yet"].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}
?>
<form method="post" onsubmit="return false">
<div style="width:480px;padding-top:75px;" >
<div style="width:480px;float:left">
<table width="465" cellpadding="0" cellspacing="0" style="font-size:12px;font-weight:bold;font-family:'Trebuchet MS', Arial, Helvetica, sans-serif">
<tr style="height:35px">
<td width="98"><?php echo $lang['Coupon+Code'];?><br /></td>
<td width="365"><input class="field" name="code" type="text" style="font-size:12px;width:125px" id="code" /></td>
</tr>
<tr style="height:35px">
  <td></td><td>  <input class="field" name="submit" type="submit" value="<?php echo $lang['Redeem+Coupon'];?>" style="font-size:12px;width:125px;" onclick="javascript: doRedeem();" id="SubmitAccPw"/>
    <input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
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