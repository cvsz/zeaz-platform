$(document).ready(function() {
    // Check if Web3 provider (like MetaMask) is available
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        console.log('MetaMask is not installed.');
    }

    // Attach click event to the connect wallet button
    $(document).on('click', '#connect-wallet-btn', async function(e) {
        e.preventDefault();
        
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                
                // Truncate the address for display
                const truncatedAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
                
                // Initialize Ethers.js
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const balance = await provider.getBalance(account);
                const ethBalance = ethers.utils.formatEther(balance);
                
                // Update UI
                $('#connect-wallet-btn').text(truncatedAddress);
                $('#connect-wallet-btn').css('background-color', '#28a745');
                $('#wallet-balance').text(parseFloat(ethBalance).toFixed(4) + ' ETH');
                $('#wallet-balance-container').show();
                
                // Optionally send this address to the backend PHP server to associate with the current user
                $.post('includes/update_wallet.php', { wallet_address: account }, function(data) {
                    console.log('Wallet saved to account: ', data);
                });

            } catch (error) {
                console.error(error);
                alert("Failed to connect wallet: " + error.message);
            }
        } else {
            alert('Please install MetaMask or a compatible Web3 wallet to use this feature.');
            window.open('https://metamask.io/download.html', '_blank');
        }
    });

    // Handle network change
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                window.location.reload();
            } else {
                console.log('Please connect to MetaMask.');
            }
        });
    }
});
