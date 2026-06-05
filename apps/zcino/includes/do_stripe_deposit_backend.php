<?php
session_start();
require_once('config.inc.php');

if (!isset($_SESSION['userid'])) {
    exit('Not logged in');
}

$amount = (float)$_POST['amount'];
$user_id = (int)$_SESSION['userid'];
$username = $_SESSION['username'];

// Mock Stripe Transaction ID
$txhash = 'pi_' . bin2hex(random_bytes(12));

// Add funds to user
$sql = "UPDATE cws_users SET cash = cash + $amount WHERE id='$user_id'";
mysqli_query($GLOBALS['con'], $sql);

// Log deposit
$sql_log = "INSERT INTO cws_deposits (user, email, amount, date, type, status, notes, details, ip) VALUES ('$username', 'stripe@$username', '$amount', NOW(), 'Stripe', 1, 'deposit', '$txhash', '127.0.0.1')";
mysqli_query($GLOBALS['con'], $sql_log);

echo "Success";
?>
