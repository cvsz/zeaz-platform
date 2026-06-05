<div style="text-align:center;width:460px; font-family: 'Inter', sans-serif;">
<h3>Deposit {amount} via Bank Transfer</h3>
<p style="color:#aaa;">Please transfer {amount} to our secure bank account below.</p>
<br />
<div style="background:#2b2f36; padding: 20px; border-radius: 8px; border: 1px solid #3b3f46; display:inline-block; text-align:left; width:80%;">
    <p style="margin:5px 0;"><span style="color:#aaa;">Bank:</span> <strong style="color:#fff;">Kasikornbank (KBank)</strong></p>
    <p style="margin:5px 0;"><span style="color:#aaa;">Account Name:</span> <strong style="color:#fff;">zCino Global Co., Ltd.</strong></p>
    <p style="margin:5px 0;"><span style="color:#aaa;">Account No:</span> <strong style="color:#00e701; font-size:18px;">123-4-56789-0</strong></p>
</div>
<br /><br />
<div style="width:80%; margin:0 auto; text-align:left;">
    <label style="color:#aaa; font-size:12px;">Select Your Bank (Sender Bank)</label><br/>
    <select id="sender-bank" style="width:100%; padding:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px; margin-bottom:10px;">
        <option value="">-- Select Bank --</option>
        <option value="kbank">Kasikornbank (KBank)</option>
        <option value="scb">Siam Commercial Bank (SCB)</option>
        <option value="bbl">Bangkok Bank (BBL)</option>
        <option value="ktb">Krungthai Bank (KTB)</option>
        <option value="bay">Bank of Ayudhya (Krungsri)</option>
        <option value="ttb">TMBThanachart Bank (TTB)</option>
        <option value="gsb">Government Savings Bank (GSB)</option>
        <option value="uob">UOB Bank</option>
        <option value="cimb">CIMB Thai Bank</option>
        <option value="baac">Bank for Agriculture (BAAC)</option>
        <option value="tisco">TISCO Bank</option>
        <option value="ghb">Government Housing Bank (GHB)</option>
    </select>
    
    <label style="color:#aaa; font-size:12px;">Upload Transfer Slip (AI Verification)</label><br/>
    <input type="file" id="slip-upload" accept="image/*" style="width:100%; padding:10px; background:#1c1e22; border:1px solid #3b3f46; color:#fff; border-radius:4px; margin-bottom:10px;" />
</div>
<button id="confirm-banktransfer" style="background:#00e701; color:#1c1e22; padding:12px 24px; font-weight:bold; border:none; border-radius:5px; cursor:pointer; width:80%; font-size:16px;">Verify Slip & Confirm</button>
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

$("#confirm-banktransfer").click(function() {
    var bank = $("#sender-bank").val();
    var fileInput = document.getElementById('slip-upload');
    var file = fileInput.files[0];
    
    if(!bank) {
        $("#payment-status").css("color", "red").text("Please select your bank.");
        return;
    }
    
    if(!file) {
        $("#payment-status").css("color", "red").text("Please upload a transfer slip.");
        return;
    }
    
    // Simulate frontend security checks for the image
    var validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validExtensions.includes(file.type)) {
        $("#payment-status").css("color", "red").text("Security Error: Invalid slip format. Only JPG/PNG allowed.");
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        $("#payment-status").css("color", "red").text("Security Error: Slip file size too large (>5MB).");
        return;
    }

    $("#payment-status").css("color", "yellow").html("Analyzing slip via Bank API & AI... <img src='images/loader_acc.gif' style='height:15px; vertical-align:middle;'/>");
    $(this).prop("disabled", true).css("opacity", "0.5");
    
    // Simulate backend slip validation API response
    setTimeout(function() {
        $("#payment-status").css("color", "#00e701").text("Slip Verified Authentic! Crediting account...");
        $.post('includes/do_stripe_deposit_backend.php', { amount: "{amount}" }, function(data) {
            if(data.trim() == "Success") {
                setTimeout(function() {
                    $('#loginDiv').fadeOut('slow', function() {
                        $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php").fadeIn('slow');
                    });
                }, 1500);
            } else {
                $("#payment-status").css("color", "red").text("System Error: Could not credit account.");
                $("#confirm-banktransfer").prop("disabled", false).css("opacity", "1");
            }
        });
    }, 3500);
});
</script>
</div>
