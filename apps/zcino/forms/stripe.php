<div style="text-align:center;width:460px; font-family: 'Inter', sans-serif;">
<h3>Deposit {amount} {currency} via Stripe</h3>
<p>Please enter your payment details below to complete the transaction.</p>
<br />
<div style="background:#2b2f36; padding: 20px; border-radius: 8px; border: 1px solid #3b3f46; display:inline-block; text-align:left; width:80%;">
    <label style="color:#aaa; font-size:12px;">Card Number</label><br/>
    <input type="text" placeholder="**** **** **** 4242" style="width:100%; padding:10px; margin-bottom:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px;"/>
    
    <div style="display:flex; gap:10px;">
        <div style="flex:1;">
            <label style="color:#aaa; font-size:12px;">MM/YY</label><br/>
            <input type="text" placeholder="12/26" style="width:100%; padding:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px;"/>
        </div>
        <div style="flex:1;">
            <label style="color:#aaa; font-size:12px;">CVC</label><br/>
            <input type="text" placeholder="123" style="width:100%; padding:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px;"/>
        </div>
    </div>
</div>
<br /><br />
<button id="confirm-stripe-deposit" style="background:#635bff; color:#fff; padding:12px 24px; font-weight:bold; border:none; border-radius:5px; cursor:pointer; width:80%; font-size:16px;">Pay {amount} {currency}</button>
<br /><br />
<div id="stripe-status" style="color:yellow; font-weight:bold;"></div>
<br />
<input class="field" name="submit" type="button" value="Cancel" style="font-size:12px;width:125px; background:transparent; color:#fff; border:1px solid #fff;" id="gobackshowaccount" />

<script type="text/javascript">
$("#gobackshowaccount").click(function() {
	$('#loginDiv').fadeOut('slow', function() {
		$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
	});
});

$("#confirm-stripe-deposit").click(function() {
    $("#stripe-status").css("color", "yellow").text("Processing payment via Stripe...");
    $(this).prop("disabled", true).css("opacity", "0.5");
    
    // Simulate API delay
    setTimeout(function() {
        $.post('includes/do_stripe_deposit_backend.php', { amount: "{amount}" }, function(data) {
            if(data.trim() == "Success") {
                $("#stripe-status").css("color", "#00e701").text("Payment Successful! Crediting account...");
                setTimeout(function() {
                    $('#loginDiv').fadeOut('slow', function() {
                        $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
                    });
                }, 2000);
            } else {
                $("#stripe-status").css("color", "red").text("Error: " + data);
                $("#confirm-stripe-deposit").prop("disabled", false).css("opacity", "1");
            }
        });
    }, 2000);
});
</script>
</div>
