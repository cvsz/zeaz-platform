<div style="text-align:center;width:460px; font-family: 'Inter', sans-serif;">
<h3>Deposit {amount} {currency} via TrueMoney Wallet</h3>
<p style="color:#aaa;">Enter your TrueMoney Wallet phone number to receive a payment request, or scan the QR Code.</p>
<br />
<div style="background:#fff; padding: 20px; border-radius: 8px; display:inline-block; border:3px solid #f37021;">
    <!-- Mock QR Code -->
    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="TrueMoney QR" width="200" height="200" />
</div>
<br /><br />
<div style="width:80%; margin:0 auto; text-align:left;">
    <label style="color:#aaa; font-size:12px;">Mobile Number</label><br/>
    <input type="text" placeholder="08x-xxx-xxxx" style="width:100%; padding:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px;"/>
</div>
<br />
<button id="confirm-truemoney-deposit" style="background:#f37021; color:#fff; padding:12px 24px; font-weight:bold; border:none; border-radius:5px; cursor:pointer; width:80%; font-size:16px;">Pay {amount} {currency}</button>
<br /><br />
<div id="payment-status" style="color:yellow; font-weight:bold;"></div>
<br />
<input class="field" name="submit" type="button" value="Cancel" style="font-size:12px;width:125px; background:transparent; color:#fff; border:1px solid #fff;" id="gobackshowaccount" />

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
	$('#loginDiv').fadeOut('slow', function() {
		$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
	});
});

$("#confirm-truemoney-deposit").click(function() {
    $("#payment-status").css("color", "yellow").text("Sending payment request to your TrueMoney Wallet...");
    $(this).prop("disabled", true).css("opacity", "0.5");
    
    setTimeout(function() {
        $("#payment-status").css("color", "#00e701").text("TrueMoney Payment Received! Crediting account...");
        $.post('includes/do_stripe_deposit_backend.php', { amount: "{amount}" }, function(data) {
            if(data.trim() == "Success") {
                setTimeout(function() {
                    $('#loginDiv').fadeOut('slow', function() {
                        $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
                    });
                }, 1500);
            }
        });
    }, 3000);
});
</script>
</div>
