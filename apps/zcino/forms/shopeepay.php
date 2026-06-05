<div style="text-align:center;width:460px; font-family: 'Inter', sans-serif;">
<h3>Deposit {amount} {currency} via ShopeePay</h3>
<p style="color:#aaa;">Open your Shopee app and scan this QR Code.</p>
<br />
<div style="background:#fff; padding: 20px; border-radius: 8px; display:inline-block; border:3px solid #ee4d2d;">
    <!-- Mock QR Code -->
    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="ShopeePay QR" width="200" height="200" />
</div>
<br /><br />
<div id="payment-status" style="color:yellow; font-weight:bold;">Waiting for ShopeePay confirmation...</div>
<br />
<input class="field" name="submit" type="button" value="Cancel" style="font-size:12px;width:125px; background:transparent; color:#fff; border:1px solid #fff;" id="gobackshowaccount" />

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
	$('#loginDiv').fadeOut('slow', function() {
		$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
	});
});

setTimeout(function() {
    $("#payment-status").css("color", "#00e701").text("ShopeePay Payment Received! Crediting account...");
    $.post('includes/do_stripe_deposit_backend.php', { amount: "{amount}" }, function(data) {
        if(data.trim() == "Success") {
            setTimeout(function() {
                $('#loginDiv').fadeOut('slow', function() {
                    $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
                });
            }, 1000);
        }
    });
}, 5000);
</script>
</div>
