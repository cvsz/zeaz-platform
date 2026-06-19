<?php
session_start();
require_once('connection.inc.php');

if (isset($_POST['wallet_address'])) {
    $wallet = mysqli_real_escape_string($GLOBALS['con'], $_POST['wallet_address']);
    
    // Check if the user is logged in
    if (isset($_SESSION['userid'])) {
        $user_id = (int)$_SESSION['userid'];
        
        // Update user's wallet address in the database (assuming we add a wallet_address column or store it in an existing field)
        // Since we didn't add a column yet, let's just save it in the session for now or update a profile field if available.
        $_SESSION['wallet_address'] = $wallet;
        
        // Example query if we were to save to DB (we'd need to ALTER TABLE cws_users ADD wallet_address VARCHAR(100)):
        $q = mysqli_query($GLOBALS['con'], "UPDATE cws_users SET address='$wallet' WHERE id='$user_id'");
        
        echo json_encode(['status' => 'success', 'message' => 'Wallet address updated', 'wallet' => $wallet]);
    } else {
        // Just store it in session for anonymous users
        $_SESSION['wallet_address'] = $wallet;
        echo json_encode(['status' => 'success', 'message' => 'Wallet connected (guest)', 'wallet' => $wallet]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No wallet address provided']);
}
?>
