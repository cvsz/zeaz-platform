<?php
session_start();
require_once('config.inc.php');

if (!isset($_SESSION['userid'])) {
    exit('Not logged in');
}

$amount = (float)$_POST['amount'];
$dir = $_POST['dir'];
$user_id = (int)$_SESSION['userid'];

if ($amount <= 0) {
    exit("Invalid amount.");
}

$sql = mysqli_query($GLOBALS['con'], "SELECT cash, zcoin FROM cws_users WHERE id='$user_id'");
$row = mysqli_fetch_array($sql);
$cash = (float)$row['cash'];
$zcoin = (float)$row['zcoin'];

$rate = 100; // 1 zUSD = 100 zCoin

if ($dir == 'to_zcoin') {
    if ($cash < $amount) {
        exit("Insufficient zUSD balance.");
    }
    $receive = $amount * $rate;
    $new_cash = $cash - $amount;
    $new_zcoin = $zcoin + $receive;
    mysqli_query($GLOBALS['con'], "UPDATE cws_users SET cash='$new_cash', zcoin='$new_zcoin' WHERE id='$user_id'");
    echo "Swapped $amount zUSD for $receive zCoin successfully.";
} elseif ($dir == 'to_zusd') {
    if ($zcoin < $amount) {
        exit("Insufficient zCoin balance.");
    }
    $receive = $amount / $rate;
    $new_zcoin = $zcoin - $amount;
    $new_cash = $cash + $receive;
    mysqli_query($GLOBALS['con'], "UPDATE cws_users SET cash='$new_cash', zcoin='$new_zcoin' WHERE id='$user_id'");
    echo "Swapped $amount zCoin for $receive zUSD successfully.";
} else {
    echo "Invalid swap direction.";
}
?>
