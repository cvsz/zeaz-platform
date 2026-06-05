<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sweet Bonanza (Demo)</title>
    <style>
        body { margin: 0; padding: 0; background: #000; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        .header { background: #1c1e22; padding: 15px 20px; color: #fff; font-family: 'Inter', sans-serif; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ffcc00; }
        .header a { color: #ffcc00; text-decoration: none; font-weight: bold; border: 1px solid #ffcc00; padding: 5px 15px; border-radius: 5px; }
        .header a:hover { background: #ffcc00; color: #000; }
        .notice { color: #ff5555; font-size: 14px; font-weight: bold; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        iframe { width: 100%; height: 100%; border: none; flex: 1; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <strong>Sweet Bonanza (Pragmatic Play)</strong> 
            <span class="notice">| ⚠️ DEMO MODE - Playing with Fun Money (Not real zUSD)</span>
        </div>
        <a href="../../index.php">Exit Game</a>
    </div>
    
    <!-- Pragmatic Play Official Demo Iframe -->
    <iframe src="https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99" allowfullscreen></iframe>
</body>
</html>
