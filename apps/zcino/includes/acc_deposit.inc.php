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
$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_settings`") or error_report(mysqli_error($GLOBALS['con']));
$row = mysqli_fetch_array($sql);
if ($status!== '1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang["Your+account+is+not+in+an+eligible+state+yet"].'</p>\').fadeOut(2000, function() {
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
        <div class="bc-modal-title"><?php echo $lang['Deposit'];?></div>
        
        <div class="bc-form-group">
            <label><?php echo $lang['Method'];?></label>
            <select name="method" class="bc-select" id="method" onchange="updateMtd()">
                <?php
                $sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_depositsettings` WHERE `status`='1' ORDER BY id") or error_report(mysqli_error($GLOBALS['con']));
                while ($rowz =  mysqli_fetch_array($sql)) {
                    echo '<option value="'.$rowz['name'].'">'.$rowz['name'].'</option>';
                }
                ?>
            </select>
            <a id="pp" style="color:red;display:none;margin-top:8px;" rel="cws_popup" href="http://<?=$_SERVER['SERVER_NAME']?>/bitcoin_pay_page.php"><?=$lang['Click+here+for+Bitcoin+payment']?></a>
        </div>

        <div class="bc-form-group" id="email-group">
            <label><?php echo $lang['Email'];?></label>
            <input class="bc-input" name="email" type="text" id="email" />
        </div>

        <div class="bc-form-group" id="amount-group">
            <label><?php echo $lang['Amount'];?></label>
            <input class="bc-input" name="amount" type="text" id="amount" />
            <div class="bc-helper-text" id="minmax">
                Min <span class="bc-cash-highlight"><?php echo $row['minimumdeposit'];?> <?php echo $_SESSION['currency'];?></span> / 
                Max <span class="bc-cash-highlight"><?php echo $row['maximumdeposit'];?> <?php echo $_SESSION['currency'];?></span>
            </div>
        </div>

        <div class="bc-form-group">
            <label><?php echo $lang['Bonus+Code']?></label>
            <input class="bc-input" name="bonus_code" type="text" onclick="show_bonus_alert()" id="bonus_code" />
        </div>

        <button class="bc-btn-primary" name="submit" onclick="javascript: doDeposit();" id="SubmitAccPw"><?php echo $lang['Deposit'];?></button>
        <button class="bc-btn-secondary" id="gobackshowaccount"><?php echo $lang['Go+Back'];?></button>
    </div>
</form>

<script type="text/javascript">
$('a[rel*=cws_popup]').facebox();
function updateMtd(){
    var mtd = $("#method").val();
    if (mtd=='BitCoin'){ 
        $("#minmax").css('display','none');
        $("#email-group").css('display','none');
        $("#amount-group").css('display','none');
    }else{
        $("#minmax").css('display','block');
        $("#email-group").css('display','flex');
        $("#amount-group").css('display','flex');
    }
}

$("#gobackshowaccount").click(function(e) {
    e.preventDefault();
    $('#loginDiv').fadeOut('slow', function() {
        $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
    });
});

var showBon = 0;        
function show_bonus_alert(){
    if (showBon==0){
        alert('<?=$lang['By+entering+a+valid+bonus+code+you+will+receive+a+bonus+amount+which+comes+with+a+rollover+limit+that+will+be+applied+to+your+account']?>. <?=$lang['You+can+withdraw+your+funds+only+after+meeting+the+rollover+limit']?>. <?=$lang['For+more+details']?>, <?=$lang['read+Terms+and+Conditions+page']?>.');
        showBon = 1;
    }
}
</script>