<?php
session_start();
if (!isset($_SESSION['userid'])) {
    die("Please login first.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zCino Slots - HTML5</title>
    <style>
        body { margin: 0; padding: 0; background: #111; color: #fff; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        #slot-machine { background: #222; border: 4px solid #ffcc00; border-radius: 20px; padding: 20px; text-align: center; width: 400px; box-shadow: 0 0 30px rgba(255, 204, 0, 0.4); }
        .reels-container { display: flex; justify-content: space-around; background: #000; border-radius: 10px; padding: 10px; margin-bottom: 20px; }
        .reel { width: 100px; height: 100px; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 50px; color: #000; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); overflow: hidden; position: relative; }
        .controls { display: flex; justify-content: space-between; align-items: center; }
        .btn-spin { background: #ffcc00; color: #000; border: none; padding: 15px 30px; font-size: 20px; font-weight: bold; border-radius: 10px; cursor: pointer; text-transform: uppercase; }
        .btn-spin:active { transform: scale(0.95); }
        .btn-spin:disabled { background: #555; color: #888; cursor: not-allowed; }
        .bet-info { font-size: 18px; }
        .status { margin-top: 15px; font-size: 20px; font-weight: bold; color: #00e701; min-height: 25px; }
        .symbol { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .spinning .symbol { animation: spinReel 0.1s linear infinite; }
        @keyframes spinReel { 0% { top: -100px; } 100% { top: 100px; } }
    </style>
</head>
<body>
    <div id="slot-machine">
        <h1 style="color:#ffcc00; margin-top:0;">zCino 777 Slots</h1>
        <div class="reels-container">
            <div class="reel" id="reel1"><div class="symbol">🍒</div></div>
            <div class="reel" id="reel2"><div class="symbol">🍒</div></div>
            <div class="reel" id="reel3"><div class="symbol">🍒</div></div>
        </div>
        <div class="controls">
            <div class="bet-info">Bet: $<span id="bet-amount">1.00</span></div>
            <button class="btn-spin" id="btn-spin">SPIN</button>
        </div>
        <div class="status" id="status">Good Luck!</div>
    </div>

    <script>
        const btnSpin = document.getElementById('btn-spin');
        const statusEl = document.getElementById('status');
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];

        btnSpin.addEventListener('click', () => {
            btnSpin.disabled = true;
            statusEl.textContent = 'Spinning...';
            statusEl.style.color = 'yellow';
            
            reels.forEach(r => r.classList.add('spinning'));

            fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'bet=1.00'
            })
            .then(res => res.json())
            .then(data => {
                setTimeout(() => {
                    reels.forEach(r => r.classList.remove('spinning'));
                    if (data.error) {
                        statusEl.textContent = data.error;
                        statusEl.style.color = 'red';
                    } else {
                        reels[0].innerHTML = `<div class="symbol">${data.reels[0]}</div>`;
                        reels[1].innerHTML = `<div class="symbol">${data.reels[1]}</div>`;
                        reels[2].innerHTML = `<div class="symbol">${data.reels[2]}</div>`;
                        
                        if (data.win > 0) {
                            statusEl.textContent = `YOU WON $${data.win}! 🎉`;
                            statusEl.style.color = '#00e701';
                        } else {
                            statusEl.textContent = `Try Again!`;
                            statusEl.style.color = '#fff';
                        }
                    }
                    btnSpin.disabled = false;
                }, 1000); // 1s spin animation
            })
            .catch(err => {
                reels.forEach(r => r.classList.remove('spinning'));
                statusEl.textContent = 'Connection error!';
                statusEl.style.color = 'red';
                btnSpin.disabled = false;
            });
        });
    </script>
</body>
</html>
