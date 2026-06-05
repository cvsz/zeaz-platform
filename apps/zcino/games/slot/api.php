<?php
session_start();
require_once('../../includes/config.inc.php');

header('Content-Type: application/json');

if (!isset($_SESSION['userid'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$bet = isset($_POST['bet']) ? (float)$_POST['bet'] : 0;
$user_id = (int)$_SESSION['userid'];

if ($bet <= 0) {
    echo json_encode(['error' => 'Invalid bet']);
    exit;
}

// Get user balance
$res = mysqli_query($GLOBALS['con'], "SELECT cash FROM cws_users WHERE id='$user_id'");
$row = mysqli_fetch_assoc($res);
$cash = (float)$row['cash'];

if ($cash < $bet) {
    echo json_encode(['error' => 'Insufficient funds']);
    exit;
}

// Deduct bet
mysqli_query($GLOBALS['con'], "UPDATE cws_users SET cash = cash - $bet WHERE id='$user_id'");

// RNG Logic
$symbols = ['🍒', '🍋', '🍉', '⭐', '💎', '7️⃣'];
$reels = [
    $symbols[array_rand($symbols)],
    $symbols[array_rand($symbols)],
    $symbols[array_rand($symbols)]
];

$win = 0;

// Win Logic (Simple)
if ($reels[0] == $reels[1] && $reels[1] == $reels[2]) {
    // 3 of a kind
    if ($reels[0] == '7️⃣') $win = $bet * 50;
    elseif ($reels[0] == '💎') $win = $bet * 25;
    elseif ($reels[0] == '⭐') $win = $bet * 15;
    else $win = $bet * 5;
} elseif ($reels[0] == $reels[1] || $reels[1] == $reels[2] || $reels[0] == $reels[2]) {
    // 2 of a kind
    $win = $bet * 1.5;
}

// Credit win
if ($win > 0) {
    mysqli_query($GLOBALS['con'], "UPDATE cws_users SET cash = cash + $win WHERE id='$user_id'");
}

// Log gameplay
$sql_log = "INSERT INTO cws_gameplays (user_id, game_id, bet, win, date) VALUES ('$user_id', (SELECT id FROM cws_games WHERE name='zCino Slots' LIMIT 1), '$bet', '$win', NOW())";
// Assuming table cws_gameplays exists; ignoring error if not for this demo.
@mysqli_query($GLOBALS['con'], $sql_log);

echo json_encode([
    'reels' => $reels,
    'win' => $win,
    'balance' => $cash - $bet + $win
]);
?>
