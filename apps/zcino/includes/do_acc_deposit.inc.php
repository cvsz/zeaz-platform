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
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
}
$method = antisqli($_POST['method']);	
if (strlen($_POST['bonus_code'])>0){
	$bonuscode = antisqli($_POST['bonus_code']);
	$bonusCheck = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_codes_bonus WHERE code='$bonuscode' AND status='1'");
	if (mysqli_num_rows($bonusCheck)>0 && $method=='BitCoin'){
		$_SESSION['boncodeBTC'] = $bonuscode;
	}
}
if ($method=='BitCoin'){
?>	
<div style="text-align:center;width:460px;">
<?=$lang['BONUS+CODE']?>: <span style="color:#0F3;font-weight:bold"><?=$_SESSION['boncodeBTC']?></span><br /><br /><br />
<a id="pp" style="color:red;font-size:14px" rel="cws_popup" href="http://<?=$_SERVER['SERVER_NAME']?>/bitcoin_pay_page.php"><?=$lang['Click+here+to+continue+to']?> Bitcoin Payment Page</a><br /><br /><br /><br />
<input class="field" name="submit" type="submit" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />
<script type="text/javascript">
$("#gobackshowaccount").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
			});
		});
$('a[rel*=cws_popup]').facebox();		
</script>		
</div>
<?php
} elseif ($method=='Web3 Wallet (ETH)'){
	$amount = antisqli($_POST['amount']);
	$min = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `minimumdeposit` FROM `cws_settings`"),0);
	if (!is_numeric($amount) || $amount < $min) {
		echo '<p style="color:red;text-align:center">Invalid amount or below minimum ('.$min.')</p>';
		exit;
	}
?>
<div style="text-align:center;width:460px;">
<h3>Deposit <?=$amount?> ETH via Web3</h3>
<p>Please confirm the transaction in your Web3 wallet (MetaMask).</p>
<br />
<button id="confirm-web3-deposit" style="background:#00e701; color:#1c1e22; padding:10px 20px; font-weight:bold; border:none; border-radius:5px; cursor:pointer;">Pay <?=$amount?> ETH</button>
<br /><br />
<div id="web3-status" style="color:yellow; font-weight:bold;"></div>
<br />
<input class="field" name="submit" type="button" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
	$('#loginDiv').fadeOut('slow', function() {
		$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
	});
});

$("#confirm-web3-deposit").click(async function() {
	if (typeof window.ethereum === 'undefined') {
		alert('MetaMask is not installed!');
		return;
	}
	try {
		$("#web3-status").text("Waiting for confirmation...");
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const tx = await signer.sendTransaction({
			to: "0x0000000000000000000000000000000000000000", // Central Casino Wallet
			value: ethers.utils.parseEther("<?=$amount?>")
		});
		$("#web3-status").text("Transaction sent! Hash: " + tx.hash + " - Waiting for confirmation...");
		await tx.wait();
		$("#web3-status").text("Transaction confirmed! Crediting account...");
		
		$.post('includes/do_web3_deposit_backend.php', { txhash: tx.hash, amount: "<?=$amount?>" }, function(data) {
			$("#web3-status").css("color", "#00e701").text("Account Credited Successfully!");
		});
	} catch (e) {
		$("#web3-status").css("color", "red").text("Transaction failed: " + e.message);
	}
});
</script>
</div>
<?php
} elseif ($method=='Web3 Wallet (zCoin)'){
	$amount = antisqli($_POST['amount']);
	$min = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `minimumdeposit` FROM `cws_settings`"),0);
	if (!is_numeric($amount) || $amount < $min) {
		echo '<p style="color:red;text-align:center">Invalid amount or below minimum ('.$min.')</p>';
		exit;
	}
?>
<div style="text-align:center;width:460px;">
<h3>Deposit <?=$amount?> zCoin via Web3</h3>
<p>Please confirm the token transfer in your Web3 wallet (MetaMask).</p>
<br />
<button id="confirm-web3-deposit-zcoin" style="background:#00e701; color:#1c1e22; padding:10px 20px; font-weight:bold; border:none; border-radius:5px; cursor:pointer;">Pay <?=$amount?> zCoin</button>
<br /><br />
<div id="web3-status" style="color:yellow; font-weight:bold;"></div>
<br />
<input class="field" name="submit" type="button" value="<?php echo $lang['Go+Back'];?>" style="font-size:12px;width:125px;" id="gobackshowaccount" />

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
	$('#loginDiv').fadeOut('slow', function() {
		$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
	});
});

$("#confirm-web3-deposit-zcoin").click(async function() {
	if (typeof window.ethereum === 'undefined') {
		alert('MetaMask is not installed!');
		return;
	}
	try {
		$("#web3-status").text("Waiting for confirmation...");
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		
		// zCoin ERC20 Mock Contract ABI & Address
		const zCoinAddress = "0x1234567890123456789012345678901234567890";
		const zCoinABI = ["function transfer(address to, uint256 amount) returns (bool)"];
		const zCoinContract = new ethers.Contract(zCoinAddress, zCoinABI, signer);
		
		const tx = await zCoinContract.transfer("0x0000000000000000000000000000000000000000", ethers.utils.parseEther("<?=$amount?>"));
		
		$("#web3-status").text("Transaction sent! Hash: " + tx.hash + " - Waiting for confirmation...");
		await tx.wait();
		$("#web3-status").text("Transaction confirmed! Crediting account...");
		
		$.post('includes/do_web3_deposit_backend.php', { txhash: tx.hash, amount: "<?=$amount?>", token: "zCoin" }, function(data) {
			$("#web3-status").css("color", "#00e701").text("Account Credited Successfully!");
		});
	} catch (e) {
		$("#web3-status").css("color", "red").text("Transaction failed: " + e.message);
	}
});
</script>
</div>
<?php
exit;
}

$min = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `minimumdeposit` FROM `cws_settings`"),0);
$max = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `maximumdeposit` FROM `cws_settings`"),0);

$email = antisqli($_POST['email']);
$amount = antisqli($_POST['amount']);

if (!checkName($method) || strlen($method)>20) { 
	$errormsg = 'Invalid withdraw method';//error
}	
if (!is_numeric($amount)) { 
				$errormsg = $lang['Invalid+amount'];//error
				}
if ($amount > $max || $amount < $min ) {
			$errormsg = $lang['Invalid+amount'];//error
				}
if (!checkEmail($email)) { 
		$errormsg = $lang['Invalid+email'];
		}
if (!empty($errormsg)){	
	echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$errormsg.'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/acc_deposit.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;
	}
if (empty($errormsg)) {
	$_SESSION['bonuscode'] = $bonuscode;
	$method_file = str_replace(' ', '', strtolower($method));
	if ($method_file=='ipaydna'){
		$orderDescription = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_deposits ORDER BY id DESC"),0)+1;
		$orderDescription = 'CWS/DEP/'.$orderDescription;
		$_SESSION['ipayDna'] = $orderDescription;	
	}
	if ($method_file=='banktransfer'){
		$form = @file_get_contents('forms/banktransfer.php');
		$form = str_replace('{amount}',$amount,$form);
		$form = str_replace('{user}',$_SESSION['userid'],$form);
		echo $form;
	}else{
		$deposit_email = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `deposit_email` FROM cws_depositsettings WHERE `name`='$method'"),0);
		$currencyP = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `currency` FROM `cws_settings`"),0); // get current default currency from database
		$form = @file_get_contents('forms/'.$method_file.'.php');
		$form = str_replace('{orderDescription}',$orderDescription,$form);
		$form = str_replace('{email}',$email,$form);
		$form = str_replace('{currency}',$currencyP,$form);
		$form = str_replace('{amount}',$amount,$form);
		$form = str_replace('{customer_login}',$l,$form);
		$form = str_replace('{bonus_code}',$bonus_code,$form);
		$form = str_replace('{rate}','1',$form);
		$form = str_replace('{{clientAccnum}','youraccccccccccccccccccccccccccccccount-ID-HERERERERERERERE',$form);
		$form = str_replace('{formPeriod}','10',$form); 
		$form = str_replace('{currencyCode}','840',$form);
		$formDigest =  md5($amount.$formPeriod.$currencyCode.$salt);
		$form = str_replace('{formDigest}',$formDigest,$form);
		$form = str_replace('{deposit_email}',$deposit_email,$form);
		$form = str_replace('{website_name}',$_SERVER['HTTP_HOST'],$form);
		echo $form;
	}
}
?>