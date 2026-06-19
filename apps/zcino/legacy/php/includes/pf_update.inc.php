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

if (!isset($_SESSION['client_seed']) || !is_numeric($_SESSION['client_seed']) || $_SESSION['client_seed']<0){
	$_SESSION['client_seed'] = mt_rand(0,999999999);
}	
if (isset($_GET['update'])){
	if (!isset($_GET['t']) || $_GET['t']=="" || !is_numeric($_GET['t']) || $_GET['t']<1 || $_GET['t']>1){
		$errormsg = $lang['Invalid+number+for+shuffling+the+deck'];
	}else{
		$nrsh = $_GET['t'];
	}
	
	if (!isset($_GET['s']) || $_GET['s']=="" || !is_numeric($_GET['s']) || $_GET['s']<1 || $_GET['s']>999999999){
		$errormsg = $lang['Invalid+seed+string'];
	}else{
		$_SESSION['client_seed'] = $_GET['s'];
	}
	
	if (isset($errormsg)){
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/pf_update.inc.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}else{
		mysqli_query($GLOBALS['con'],"UPDATE cws_users_info SET nrsh='$nrsh' WHERE id='{$_SESSION['userid']}'");
		echo '<span style="color:#09C;font-size:14px">'.$lang['Data+updated+successfully'].'</span>';
	}
}
?>
<form method="post" onsubmit="return false">
<div style="width:450px;margin-top:-5px;" >

<table width="450" cellpadding="0" cellspacing="0" style="font-size:12px;font-weight:bold;font-family:'Trebuchet MS', Arial, Helvetica, sans-serif">
<tr style="height:30px">
  <td width="142" height="52"><?=$lang['How+many+times+to+shuffle+each+deck']?>:</td>
  <td width="356" colspan="2">
  <select id="times">
  <option value="1">1</option>
  </select>
  </td>
</tr>
<tr style="height:30px">
  <td width="142" height="52">Client RNG seed:</td>
  <td width="356" colspan="2">
  <input class="field" name="seedstr" type="text" style="font-size:12px;width:125px" id="seedstr" value="<?=$_SESSION['client_seed']?>" />1-999999999
  </td>
</tr>

<tr style="height:22px">
<td colspan="2">
<input class="field" name="submit" type="submit" value="<?php echo $lang['Update'];?>" style="font-size:12px;width:125px;" id="updateData"/>
<input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
</td>
</tr>
</table>

</div>
</form>
<script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/account.inc.php").fadeIn('slow');
			});
		});
$("#updateData").click(function() {
			var seedstr = $("#seedstr").val();
			var times = $("#times").val();
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/pf_update.inc.php?update=1&s="+seedstr+"&t="+times).fadeIn('slow');
			});
		});		
</script>