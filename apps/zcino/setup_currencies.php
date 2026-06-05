<?php
require_once('includes/connection.inc.php');

// Add exchange_rate column if not exists (already added)

// We'll use a free API like frankfurter.app or similar for exchange rates if we want real-time.
// But for robustness without API keys, we can just use a large list of static rates or fetch from a public open API.
$api_url = "https://api.exchangerate-api.com/v4/latest/USD";
$response = @file_get_contents($api_url);

if ($response) {
    $data = json_decode($response, true);
    if (isset($data['rates'])) {
        $rates = $data['rates'];
        
        // Disable old currencies (except zUSD/USD which we might want to keep active)
        mysqli_query($GLOBALS['con'], "UPDATE cws_currencies SET status=0 WHERE code != 'zUSD'");
        
        foreach ($rates as $code => $rate) {
            $code = mysqli_real_escape_string($GLOBALS['con'], $code);
            $rate = (float)$rate;
            
            // Guess a symbol or just use the code
            $symbol = $code; 
            if ($code == 'EUR') $symbol = '&euro;';
            if ($code == 'GBP') $symbol = '&pound;';
            if ($code == 'JPY') $symbol = '&yen;';
            if ($code == 'THB') $symbol = '&#3647;';
            
            // Check if exists
            $check = mysqli_query($GLOBALS['con'], "SELECT id FROM cws_currencies WHERE code='$code'");
            if (mysqli_num_rows($check) > 0) {
                mysqli_query($GLOBALS['con'], "UPDATE cws_currencies SET exchange_rate='$rate', status=1 WHERE code='$code'");
            } else {
                mysqli_query($GLOBALS['con'], "INSERT INTO cws_currencies (code, symbol, current, status, exchange_rate) VALUES ('$code', '$symbol', '0', 1, '$rate')");
            }
        }
        echo "Currencies updated successfully from API.\n";
    }
} else {
    echo "Failed to fetch exchange rates.\n";
}
?>
