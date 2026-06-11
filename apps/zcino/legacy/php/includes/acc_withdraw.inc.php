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
$sql = "SELECT * FROM `cws_users` INNER JOIN cws_settings WHERE `login`='{$_SESSION['username']}'";
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],$sql));
if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
//available for withdrawal:
//1. ALL MONEY if no active bonuses , ELSE
//2. TOTAL DEPOSITS after last deposit that had bonus + TOTAL TRANSFERS after last deposit that has bonus - TOTAL WITHDRAWAL AMOUNT after last bonus
$has_bonuses = has_active_bonuses($_SESSION['userid']);
if ($has_bonuses){
	//get date of last deposit with bonus
	$last_dwb = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT date FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1' AND bonus>0 AND rollover>0 ORDER BY date DESC"),0);
	//TOTAL DEPOSITS after last deposit that had bonus
	$total_dep = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE status='1' AND user='{$_SESSION['username']}' AND date>='$last_dwb'"),0);
	//TOTAL TRANSFERS after last deposit that has bonus
	$total_tr = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_transfers WHERE status='1' AND receiver_id='{$_SESSION['userid']}' AND receiver_type='user' AND date>='$last_dwb'"),0);
	//TOTAL WITHDRAWAL AMOUNT after last bonus
	$total_with = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_withdrawals WHERE (status='1' || status='0') AND user='{$_SESSION['username']}' AND date>='$last_dwb'"),0);
	
	$av4withd = $total_dep + $total_tr - $total_with;
}else{
	$av4withd = $row['cash'];
}
	
if ($has_bonuses  && $av4withd<0){
	echo $lang['You+cannot+ask+for+a+withdrawal+until+you+complete+the+rollover+limit+of+your+bonus'].'!<br /><br />';
	?>
    <button id="goback"><?php echo $lang['Go+Back']?></button><br />
	<script type="text/javascript">
	$("#goback").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
			});
		});
	</script>
    <?php
	exit;	
}
	


if ($row['status']!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}
?>
<style>
.bc-modal-container {
    background: #1C1E22;
    color: #98A7B5;
    font-family: 'Inter', sans-serif;
    border-radius: 12px;
    padding: 24px;
    width: 400px;
    box-sizing: border-box;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    margin: 0 auto;
}
.bc-modal-title {
    color: #FFFFFF;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
}
.bc-form-group {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    text-align: left;
}
.bc-form-group label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #98A7B5;
}
.bc-input, .bc-select {
    background: #0F1115;
    border: 1px solid #2D3035;
    border-radius: 8px;
    color: #FFFFFF;
    padding: 12px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
}
.bc-input:focus, .bc-select:focus {
    border-color: #00e701;
}
.bc-helper-text {
    font-size: 12px;
    color: #55657E;
    margin-top: 6px;
}
.bc-cash-highlight {
    color: #00e701;
    font-weight: bold;
}
.bc-btn-primary {
    background: #00e701;
    color: #121418;
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    transition: opacity 0.2s;
}
.bc-btn-primary:hover {
    opacity: 0.9;
}
.bc-btn-secondary {
    background: #2D3035;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
}
.bc-btn-secondary:hover {
    background: #3E4249;
}
</style>
<form method="post" onsubmit="return false">
    <div class="bc-modal-container">
        <div class="bc-modal-title"><?php echo $lang['Withdraw'];?></div>

        <div class="bc-form-group">
            <label><?php echo $lang['Method'];?></label>
            <select name="method" class="bc-select" id="method" onChange="updateTxt()">
                <?php
                $sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_depositsettings` WHERE `status`='1'") or error_report(mysqli_error($GLOBALS['con']));  
                while ($rowz =  mysqli_fetch_array($sql)) {
                    echo '<option value="'.$rowz['name'].'">'.$rowz['name'].'</option>';
                }
                ?>
            </select>
        </div>

        <div class="bc-form-group">
            <label id="change"><?php echo $lang['Email'];?></label>
            <input class="bc-input" name="email" type="text" id="email" />
        </div>

        <div class="bc-form-group">
            <label><?php echo $lang['Withdraw+Amount'];?></label>
            <input class="bc-input" name="amount" type="text" id="amount" />
            <div class="bc-helper-text">
                Available: <span class="bc-cash-highlight"><?php echo max(0,$av4withd); ?> <?php echo $_SESSION['currency'];?></span><br/>
                Min <span class="bc-cash-highlight"><?php echo $row['minimumwithdrawal'];?>  <?php echo $_SESSION['currency']?></span> / 
                Max <span class="bc-cash-highlight"><?php echo $row['maximumwithdrawal'];?> <?php echo $_SESSION['currency'];?></span>
            </div>
        </div>

        <div class="bc-form-group">
            <label>Secret Question:</label>
            <div style="color:#00e701; font-weight:600; font-size:14px; padding: 12px; background: #0F1115; border-radius: 8px;">
                <?=mysqli_result(mysqli_query($GLOBALS['con'],"SELECT secques FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0)?>
            </div>
        </div>

        <div class="bc-form-group">
            <label>Secret Answer:</label>
            <input class="bc-input" name="secans" type="text" id="secans" />
        </div>

        <button class="bc-btn-primary" name="submit" onclick="javascript: doWithdraw();" id="SubmitAccPw"><?php echo $lang['Withdraw']?></button>
        <button class="bc-btn-secondary" id="gobackshowaccount"><?php echo $lang['Go+Back']?></button>
    </div>
</form>

<script type="text/javascript">
async function updateTxt(){
    var mtd = $("#method").val();
    if (mtd=='BitCoin'){ 
        $("#change").html('BTC Address');
    } else if (mtd=='Web3 Wallet (ETH)' || mtd=='Web3 Wallet (zCoin)'){
        $("#change").html('Wallet Address (0x...)');
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                $("#email").val(accounts[0]);
            }
        }
    } else if (mtd=='Stripe'){
        $("#change").html('Stripe Account Email');
    } else if (mtd=='PromptPay'){
        $("#change").html('PromptPay Number (Phone/ID)');
    } else if (mtd=='ShopeePay'){
        $("#change").html('ShopeePay Mobile Number');
    } else if (mtd=='LINEPay'){
        $("#change").html('LINE Pay ID');
    } else if (mtd=='CreditCard'){
        $("#change").html('Credit/Debit Card Number');
    } else if (mtd=='TrueMoney'){
        $("#change").html('TrueMoney Wallet Number');
    } else if (mtd=='Bank Transfer'){
        $("#change").html('Bank Account No. & Bank Name');
    } else{
        $("#change").html('<?=$lang['Email']?>');
    }
}

$("#gobackshowaccount").click(function(e) {
    e.preventDefault();
    $('#loginDiv').fadeOut('slow', function() {
        $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
    });
});
</script>