<?php
$auto_reg = 0;
define('ENABLE_BONUSPL',1);//enable affiliates to create bonus codes and be rewarded with 10% from the bonus received by user with rollover of 10
define("COUNT_ROLLOVER",0);//If this is enable, DO NOT count the gameplays with rollover status in the equation of affiliate bonus
define('NET_REVENUE','1');
define('AFFNET_REV','1');
// if NET REVENUE is 1, the share of agents is calculated from (bet-won) * share . If this is 0, the share of agents is calculated from (bet)*share
// You should know that if payout is 80%, then 80% from each bet is put back at stake for players to win, and 20% goes to casino real profit.
// if NET REVENUE is 0, the agent revenue will be calculated using (bet)*share, then each agent share must be smaller than (100-payout%). The share of the agent can be 20% maximum ( if payout% is 80%) and it would be like the agent would get an amount equal to the casino real profit
// if NET REVENUE is 1, then if a player bets 1000$ and wins 500$, it means that the player made a NET profit of -500$, bringing 500$ profit to casino. From this value you would have to pay the agent a percentage equal to his share.
// the reason for which we placed a limit equal to 100-payout% on the agent share is to avoid the following scenario when NET REVENUE is 1: a player bets 1000$ and wins back 100$. His NET PROFIT would be 900$. If agent share is 50%, you would have to pay the agent 450$. If you would pay the agent instantly that money, the player can come back and win maximum 890$, because the amount in casino bank would be 890$.
// to avoid this issue you must empty the casino bank each time you pay your agents, or set the share percentage to be smaller than (100-payout%)
define('REDIRECT_NO_CREDIT','0');//if the user has no credit in REAL MODE, he is redirected to main page
define('MAINTENANCE','0'); // set this to 1 to put website in maintenance mode
define('BASE_PATH',$_SERVER['DOCUMENT_ROOT']);

define('LOGIN_PAGE','0'); //enable/disable guest access. show a page that will request username+password before allowing access to the website - available as OPTIONAL FEATURE
define('FB_LOGIN','0'); //enable/disable facebook login - available as OPTIONAL FEATURE
define('AFFILIATES','0');//enable/disable player affiliate system - available as OPTIONAL FEATURE
?>