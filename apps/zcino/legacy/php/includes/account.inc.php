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

if (isset($_SESSION['alertip'])){
?>
<script type="text/javascript">alert('<?=$_SESSION['alertip']?>');</script>	
<?php
unset($_SESSION['alertip']);
}
if ($_SESSION['show_alert']==1){
	$_SESSION['show_alert'] = 0;
?>
<script type="text/javascript">alert('<?=$lang['Your+affiliate+ID+was+validated+successfully']?>');</script>
<?php }elseif($_SESSION['show_alert']==2){
	$_SESSION['show_alert'] = 0;
?>
<script type="text/javascript">alert('<?=$lang['The+affiliate+ID+you+have+submitted+was+incorrect']?>');</script>
<?php }?>

<?php if (isset($_SESSION['rbonus_alert'])){
	if ($_SESSION['rbonus_alert']==1){
		unset($_SESSION['rbonus_alert']);
?>
<script type="text/javascript">alert('<?=$lang['Your+account+was+credited+with+a+registration+bonus+of']?> <?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT reg_bonus FROM cws_settings"),0)?> CREDIT. <?=$lang['You+can+see+more+details+under+your+FINANCES+page']?>!');</script>
<?php }} ?>	

<?php if (isset($_SESSION['lbonus_alert'])){
	if ($_SESSION['lbonus_alert']==1){
		unset($_SESSION['lbonus_alert']);
?>
<script type="text/javascript">alert('<?=$lang['Your+account+was+credited+with+a+daily+login+bonus+of']?> <?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login_bonus FROM cws_settings"),0)?> CREDIT. <?=$lang['You+can+see+more+details+under+your+FINANCES+page']?>!');</script>
<?php }} ?>	

<?php if (isset($_SESSION['aff_alert'])){
	if ($_SESSION['aff_alert']==1){
		unset($_SESSION['aff_alert']);
?>
<script type="text/javascript">alert('<?=$lang['Your+account+was+credited+with+a+bonus+of']?> <?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT aff_bon FROM cws_affiliate_settings"),0)?> CREDIT, <?=$lang['based+on+your+correct+affiliate+ID']?>. <?=$lang['You+can+see+more+details+under+your+FINANCES+page']?>!');</script>
<?php }} ?>	

<?php
$l = $_SESSION['username'];
$today = date('Y-m-d');
$luserdet=mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE login='$l'")); 
if (strtotime($today) > strtotime($luserdet['ban_expire'])) {
	//mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='1' WHERE `login`='$l'" );
	$luserdet=mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE login='$l'")); 
	}
if($luserdet['status']=="0"){
	$accstatus ='<span style="color:red">'.$lang['Inactive'].'</span>';
}
if($luserdet['status']=="1"){
	$accstatus = '<span style="color:#09C">'.$lang['Active'].'</span>';
}
if($luserdet['status']=="2"){
$accstatus ='<span style="color:red">'.$lang['Suspended+until'].' '.$luserdet['ban_expire'].'</span>';
}
if($luserdet['status']=="3"){
$accstatus ='<span style="color:red">'.$lang['Locked'].'</span>';
}
if($luserdet['status']=="4"){
$accstatus ='<span style="color:red">'.$lang['Closed+until'].' '.$luserdet['ban_expire'].'</span>';
}
if($luserdet['status']=="5"){
$accstatus ='<span style="color:red">'.$lang['Temporary+blocked'].'</span>';
}
?>
<div class="myaccount" style="width:180px;float:left;overflow:hidden;">
<?=$lang['Welcome']?>,<br /><span style="color:#CCC"><?php  echo $luserdet['login']; ?> </span><br /><br />
<a href="#changeDetails" id="changedetails"><?=$lang['Change+details']?></a><br />
<script type="text/javascript">
$("#changedetails").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_change_details.inc.php").fadeIn('slow');
			});
		});
</script>
<a href="#changePw" id="changepw"><?=$lang['Change+password']?></a><br />
<script type="text/javascript">
$("#changepw").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_change_pw.inc.php").fadeIn('slow');
			});
		});
</script>
<a href="#Finances" id="finances"><?=$lang['Finances']?></a><br />
<script type="text/javascript">
$("#finances").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
			});
		});
</script>
<a href="#centermenu" id="gameplays"><?=$lang['Gameplay+history']?></a><br />
<script type="text/javascript">
$("#gameplays").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays.inc.php").fadeIn('slow');
			});
		});
</script>
<?php if (AFFILIATES==1){?>
<a href="#Affiliate_Center" id="affcenter" style="color:#FFC"><?=$lang['Affiliate+Center']?></a><br />
<script type="text/javascript">
$("#affcenter").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/affiliate_center.inc.php").fadeIn('slow');
			});
		});
</script>
<?php }?>
<a href="#CloseAccount" id="closeacc"><?=$lang['Close+Account']?></a><br />
<script type="text/javascript">
$("#closeacc").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_close.inc.php").fadeIn('slow');
			});
		});
</script>
<div id="logout_id">
<a href="#loggedOut" id="logout" onclick="javascript: logMeOut();" style="color:#F33"><img src="images/logout_tiny.jpg" style="vertical-align:middle;height:20px;width:20px"/><?=$lang['Log+out']?></a>
</div>
<script type="text/javascript">
	$.get('./facebook/index.php', function(data) {
		if (data.search('Facebook-Logout.gif')>0){
			$("#logout_id").html(data);	
		}
	});
</script>
<br />
</div>
<div style="float:right;width:255px;overflow:hidden;font-size:10px;padding-left:17px;">
<div style="height:170px;width:255px;overflow:hidden;">
<span style="color:#CCC;font-size:11px;font-weight:bold;font-style:italic"><?php if ($luserdet['gender']=='M') { echo 'Mr.';}else{ echo 'Ms.';}?><?php echo $luserdet['name']; ?></span><br />
<?=$lang['Status']?>:<span style="color:#CCC"><strong><?php  echo $accstatus; ?></strong></span><br />
<?=$lang['Date+of+birth']?>: <span style="color:#CCC"><?php echo $luserdet['dob']; ?></span><br />
<?=$lang['Email']?>: <span style="color:#CCC"><?php echo $luserdet['email']; ?></span><br />
<?=$lang['Street']?>: <span style="color:#CCC"><?php echo substr($luserdet['street'],0,10); ?></span><br />
<?=$lang['ZIP+Code']?>: <span style="color:#CCC"><?php echo $luserdet['zip']; ?></span><br />
<?=$lang['City']?>: <span style="color:#CCC"><?php echo $luserdet['ort']; ?></span><br />
<?php
if (strlen($luserdet['country'])<2){
	$luserdet['country'] = 'unknown';
}
?>
<?=$lang['Country']?>: <img src="http://<?=$_SERVER['SERVER_NAME']?>/images/flags/<?=$luserdet['country']?>.png" alt="Country <?=$luserdet['country']?>" title="Country <?=$luserdet['country']?>"/><br />
<?=$lang['Phone']?>: <span style="color:#CCC"><?php echo $luserdet['mobiletel'];?></span><br /><br />
</div>
<div id="showname"><?php @require_once('do_name.inc.php');?></div>
</div>