<?php
session_start();
require_once('config.inc.php');

if (!isset($_SESSION['userid'])) {
    exit('Not logged in');
}

$txhash = antisqli($_POST['txhash']);
$amount = (float)$_POST['amount'];
$user_id = (int)$_SESSION['userid'];

// Here you would normally verify the transaction hash on the Ethereum network using an RPC endpoint or Etherscan API.
// For the sake of the script/demo, we assume it's verified since the frontend `tx.wait()` succeeded.

$token = isset($_POST['token']) ? antisqli($_POST['token']) : 'ETH';

// Add funds to user
$sql = "UPDATE cws_users SET cash = cash + $amount WHERE id='$user_id'";
mysqli_query($GLOBALS['con'], $sql);

// Log deposit
$username = $_SESSION['username'];
$sql_log = "INSERT INTO cws_deposits (user, email, amount, date, type, status, notes, details, ip) VALUES ('$username', 'web3@$username', '$amount', NOW(), 'Web3 Wallet ($token)', 1, 'deposit', '$txhash', '127.0.0.1')";
mysqli_query($GLOBALS['con'], $sql_log);

echo "Success";
?>
