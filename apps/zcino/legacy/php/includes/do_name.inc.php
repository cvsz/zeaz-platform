<?php
#developed by www.zcino
@require_once('config.inc.php');

if (isset($_POST['set_currency'])) {
    $_SESSION['display_currency'] = mysqli_real_escape_string($GLOBALS['con'], $_POST['set_currency']);
}

$refreshicon = '<img onmouseover="onmenter()" src="images/reficon.png" id="cashrefresh" title="Mouse over to refresh balance every 5 seconds" style="vertical-align:middle;margin-right:8px; cursor:pointer;" />';

$loggedin = isset($_SESSION['username']) ? checkloggedin($_SESSION['username']) : 'no';

if ($loggedin == 'yes') {
    $sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='{$_SESSION['username']}'")or error_report(mysqli_error($GLOBALS['con']));
    $user_details = mysqli_fetch_array($sql); 
    
    // Default system currency is zUSD
    $system_currency = 'zUSD';
    $display_currency = isset($_SESSION['display_currency']) ? $_SESSION['display_currency'] : $system_currency;
    
    // Get exchange rate for selected currency
    $rate_q = mysqli_query($GLOBALS['con'], "SELECT symbol, exchange_rate FROM cws_currencies WHERE code='$display_currency' AND status=1");
    if(mysqli_num_rows($rate_q) > 0) {
        $rate_row = mysqli_fetch_assoc($rate_q);
        $symbol = $rate_row['symbol'];
        $rate = (float)$rate_row['exchange_rate'];
    } else {
        $symbol = '$';
        $rate = 1.0;
        $display_currency = $system_currency;
    }
    
    $converted_cash = number_format($user_details['cash'] * $rate, 2);
    
    echo '<span style="color:#999">'.$user_details['login'].'</span> '.$refreshicon;
    echo '<span class="cash">'.$symbol.' '.$converted_cash.' '.$display_currency.'</span> | <span class="cash" style="color:#00e701;">zCoin: '.$user_details['zcoin'].'</span>';
    
    // Currency Selector
    echo '<form method="post" id="currForm" style="display:inline; margin-left:10px;">';
    echo '<select name="set_currency" onchange="$(\'#currForm\').submit()" style="background:#1c1e22; color:#fff; border:1px solid #333; font-size:10px; padding:2px;">';
    $curr_q = mysqli_query($GLOBALS['con'], "SELECT code FROM cws_currencies WHERE status=1 ORDER BY code");
    while($cr = mysqli_fetch_assoc($curr_q)) {
        $sel = ($cr['code'] == $display_currency) ? 'selected' : '';
        echo '<option value="'.$cr['code'].'" '.$sel.'>'.$cr['code'].'</option>';
    }
    echo '</select></form>';
    
} else {
    echo $lang['Hello'].','.$lang['Guest'].' !';
}
?>