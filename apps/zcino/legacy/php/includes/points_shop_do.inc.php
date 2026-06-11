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
if (isset($_POST['address'])){
	$productid = antisqli($_POST['productid']); // product id sent by PHP 
	$productPoints = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT points_price FROM cws_shop_products WHERE id='{$productid}'"),0);// get price of the item
	$buyerid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$_SESSION['username']}'"),0);// get id of current player
	$cash =  mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='{$_SESSION['username']}'"),0);// get balance of current player
	$address = antisqli($_POST['address']); // get the address
	if ($cash<$productPoints){ // check if player has enough money to pay
		echo '<span style="color:red">'.$lang['INSUFFICIENT+FUNDS'].'</span>';
		exit;
	}
	if(mysqli_query($GLOBALS['con'],"INSERT INTO cws_shop_orders (productid,buyerid,address,status) VALUES('$productid','$buyerid','$address','0')")){ // record data to orders table
		echo '<span style="color:green">'.$lang['Order+placed+successfully'].'</span>';
		mysqli_query($GLOBALS['con'],"UPDATE cws_users SET cash=cash-'{$productPoints}' WHERE id='{$buyerid}'");
	}else{
		echo '<span style="color:red">'.$lang['Order+placed+UNsuccessfully'].'</span>';
	}
}else{
$id = antisqli($_POST['id']);
$detail = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_shop_products WHERE id='{$id}'"));
$cash =  mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='{$_SESSION['username']}'"),0);
if ($detail['points_price']>$cash){
	echo '<span style="color:red">'.$lang['INSUFFICIENT+FUNDS'].'</span>';
	exit;
}
?>
<div id="askAddress">
<form method="post" onsubmit="return false">
<?php echo $detail['name']?><br />
<img src="<?php echo $detail['image_url']?>" style="border:0px solid #666;" width="184" height="156" alt="<?php echo $detail['name']?>" />
<?php echo "{$lang['Buy']} {$lang['for']} <span style='color:#09C'>".$detail['points_price']."</span> {$lang['Points']} {$lang['and']} <br /> <span class='cash'>".$detail['shipping_price']." &euro;/$(shipping)</span>"; ?><br />
<?php echo $lang['Enter']?> <?php echo $lang['your']?> <?php echo $lang['Address']?><br />
<textarea id="address"></textarea><br /><br />
<input type="hidden" id="productid" value="<?php echo $id?>" />
<input class="field" name="submit" type="submit" value="<?php echo $lang['Confirm']?>" style="font-size:8px;width:75px;" onclick="javascript: doOrder();" id="SubmitAccPw"/>
</form>
</div>
<?php
}
?>