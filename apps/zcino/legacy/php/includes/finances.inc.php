<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}		
if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE id='{$_SESSION['userid']}'"),0)==0){
	mysqli_query($GLOBALS['con'],"UPDATE cws_bonuses_instant SET status='2' WHERE userid='{$_SESSION['userid']}'");	
}
$today = date('Y-m-d');
$sql = mysqli_query($GLOBALS['con'],"SELECT SUM(bet) AS bet,SUM(won) AS won FROM cws_gameplays WHERE user='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));
$finances = mysqli_fetch_array($sql); 
//roulette am
if (@mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT SUM(bet) AS bet,SUM(sum_won) AS won FROM cws_roulette_am_bets WHERE user='{$_SESSION['username']}'"))>0){
	$sql = @mysqli_query($GLOBALS['con'],"SELECT SUM(bet) AS bet,SUM(sum_won) AS won FROM cws_roulette_am_bets WHERE user='{$_SESSION['username']}'");
	$finances2 = @mysqli_fetch_array($sql); 
	$finances['bet'] += $finances2['bet'];
	$finances['won'] += $finances2['won'];
	//if ($finances2['sum_won']==0){$finances['lost']+=$finances2['bet'];}
}

//roulette eu
if (@mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT SUM(bet) AS bet,SUM(sum_won) AS won FROM cws_roulette_eu_bets WHERE user='{$_SESSION['username']}'"))>0){
	$sql = @mysqli_query($GLOBALS['con'],"SELECT SUM(bet) AS bet,SUM(sum_won) AS won FROM cws_roulette_eu_bets WHERE user='{$_SESSION['username']}'");
	$finances2 = @mysqli_fetch_array($sql); 
	$finances['bet'] += $finances2['bet'];
	$finances['won'] += $finances2['won'];
	//if ($finances2['sum_won']==0){$finances['lost']+=$finances2['bet'];}
}
if (strtotime($today) > strtotime($finances['ban_expire'])) {
	//mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='1' WHERE `login`='{$_SESSION['username']}'" );
}
$finances['status'] = @mysqli_result(mysqli_query($GLOBALS['con'],"select status from cws_users where login='{$_SESSION['username']}'"),0); 
if($finances['status']=="0"){
	$accstatus ='<span style="color:red">'.$lang['Inactive'].'</span>';
}
if($finances['status']=="1"){
	$accstatus = $lang["Active"];
}
if($finances['status']=="2"){
	$accstatus ='<span style="color:red">'.$lang['Suspended+until'].' '.$finances['ban_expire'].'</span>';
}
if($finances['status']=="3"){
	$accstatus ='<span style="color:red">'.$lang['Locked'].'</span>';
}
if($finances['status']=="4"){
	$accstatus ='<span style="color:red">'.$lang['Closed+until'].' '.$finances['ban_expire'].'</span>';
}
?>
<div class="myaccount" style="width:180px;float:left;overflow:hidden;">
<?php echo $lang['Welcome']?>,<br /><span style="color:#CCC"><?php  echo $_SESSION['username']; ?> </span><br /><br />


<a href="#TransferMoney" id="transfermoney"><?php echo $lang['Transfer+money']?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#transfermoney").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/transfer.inc.php").fadeIn('slow');
			});
		});
</script>
<?php
}
?>
<a href="#centermenu" id="transactions"><?php echo $lang['View+all+transactions']?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#transactions").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:330px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/transactions.inc.php").fadeIn('slow');
			});
		});
</script>
<?php
}
?>
<a href="#RedeemCoupon" id="redeem"><?=$lang['Redeem+prepaid+coupon']?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#redeem").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_redeem.inc.php").fadeIn('slow');
			});
		});
</script>
<?php
}
?>
<a href="#DepositFunds" id="deposit"><?php
$points_shop = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT points_shop FROM cws_settings"),0);
 if ($points_shop==1){echo $lang['Buy'].' '.$lang['Points'];}else {echo $lang['Deposit'];}?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#deposit").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
			});
		});
</script>
<?php
}
?>
<a href="#<?php echo ($points_shop==0)?'WithDrawFunds':'centermenu'?>" id="withdraw"><?php if ($points_shop==1){echo $lang['Exchange'].' '.$lang['Points'];}else {echo $lang['Withdraw'];}?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#withdraw").click(function() {
	<?php if ($points_shop==0) { ?>
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_withdraw.inc.php").fadeIn('slow');
			});
			<?php } else{  ?>
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/points_shop.inc.php").fadeIn('slow');
			});
			<?php
			}
			?>
		});
</script>
<?php
}
?>
<a href="#GoBack" id="goback"><?php echo $lang['Go+Back']?></a><br />
<?php if ($finances['status']=="1") 
{
	?>
<script type="text/javascript">
$("#goback").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/account.inc.php").fadeIn('slow');
			});
		});
</script>
<?php
}
?>
<a href="#loggedOut" id="logout" onclick="javascript: logMeOut();" style="color:#F33"><img src="images/logout_tiny.jpg" style="vertical-align:middle;height:20px;width:20px"/><?php echo $lang['Log+out']?></a><br />
</div>
<div style="font-size:10px;padding-top:3px;padding-left:5px;line-height:1.3em;float:right;width:265px">
<?php if ($finances['status']!=='1') {echo '<span style="color:red">'.$lang['Only+active+users+are+allowed+to+do+transactions'].'</span><br />';}?>
<?=$lang['Bet']?>: <span style="color:#0C0"><?php echo number_format($finances['bet'],2)?> <?php echo $_SESSION['currency']?></span><br />
<?=$lang['Won']?> : <span style="color:#0C0"><?php echo number_format($finances['won'],2)?> <?php echo $_SESSION['currency']?></span><br />
<?=$lang['Profit']?>: <span style="color:<?php if ($finances['won']-$finances['bet']<0){?>red<?php }else{?>#0C0<?php }?>"><?php echo number_format($finances['won']-$finances['bet'],2)?> <?php echo $_SESSION['currency']?></span><br /><br />

<?=$lang['Total+pending+bonuses']?>: <span class="cash" style="font-size:10px"><?php echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_bonuses WHERE user='{$_SESSION['username']}'"),0)?> <?php echo $_SESSION['currency']?> <a href="#centermenu" style="color:#0CF" id="pbonuses">(details)</a></span><br />
<?=$lang['Bonuses+with']?> rollover: 
<span class="cash" style="font-size:10px">
<?php 
$tq = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1' ORDER BY date ASC");
$temp_percent = 0;
$p = 0;
while ($tbon = mysqli_fetch_array($tq)){
	$start_date = $tbon['date'];// get first player bonus
	$total_bets = get_total_bets($_SESSION['username'],$start_date);//get total bets since that date
	$ulimit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM((deposit+bonus)*rollover),0) FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND id='{$tbon['id']}' AND status='1'"),0);
	$temp_percent = number_format(min($total_bets*100/$ulimit,100),2);
	if ($temp_percent==100 || $ulimit==0 || $tbon['rollover']==0){
		set_bonus_eligible($tbon['id']);	
	}
}
$tactive = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bonus),0) FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1'"),0); 
echo $tactive;
?> <?php echo $_SESSION['currency']?> <a href="#centermenu" style="color:#0CF" id="abonuses">(details)</a>
</span><br />
<?php
if ($tactive>0){?>
<span style="color:red"><?=$lang['Total']?> rollover <?=$lang['requirement']?>:</span> <span class="cash" style="font-size:10px">
<?php $ulimit = get_rollover_limit($_SESSION['userid']);echo $ulimit;?> <?php echo $_SESSION['currency']?>
</span><br />
<span style="color:red"><?=$lang['Total+wagered+for']?> rollover:</span> <span class="cash" style="font-size:10px">
<?php 
$start_date = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT date FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1' ORDER BY date ASC"),0);
$total_bets = get_total_bets($_SESSION['username'],$start_date);//get total bets since that date
echo number_format($total_bets,2);
?> <?php echo $_SESSION['currency']?>
</span><br />
<?=$lang['Completed']?>(%): <?php 
$percent = number_format(min($total_bets*100/$ulimit,100),2);
?>
<span style="color:<?php if ($percent==100){echo 'blue';}elseif($percent>0){echo 'orange';}else{echo 'red';}?>"><?=$percent?>%</span>
                        <?=draw_bar($percent);?>
<?php }?>                        
<script type="text/javascript">
$("#pbonuses").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:330px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/bonuses.inc.php").fadeIn('slow');
			});
		});
$("#abonuses").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:330px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/bonuses_rlactive.inc.php").fadeIn('slow');
			});
		});		
</script>
<br />
<?php
if ($vipMode=='1'){
	if (isset($_GET['convert']) && $_GET['token']==$_SESSION['token']){
		$VIPP_old = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT vipPoints FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0);
		if ($VIPP_old>0){
			if (mysqli_query($GLOBALS['con'],"UPDATE cws_users SET `cash`=`cash`+'".($VIPP_old/100)."' WHERE id='{$_SESSION['userid']}'")){
				mysqli_query($GLOBALS['con'],"UPDATE cws_users_info SET vipPoints=0 WHERE id='{$_SESSION['userid']}'");
				$conv = true;
			}
		}
	}
?>
VIP Points: <span class="cash" style="font-size:9px"><?php $VIPP = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT vipPoints FROM cws_users_info WHERE id='{$_SESSION['userid']}'"),0); echo number_format($VIPP,0,'.','')?>VIPP = <?=number_format($VIPP/100,2,'.','')?> <?=$_SESSION['currency']?></span><br />
<?php
if ($conv==true){?>
<span style="color:#F60"><?=$VIPP_old?> VIPP <?=$lang['converted+to+credit']?></span><br />
<?php }elseif($VIPP>0){?>
<a href="#loginDiv" id="vipPoints" style="color:#09F"><?php echo $lang['Convert']?> VIPP <?php echo $lang['to+credit']?></a><br />
<script type="text/javascript">
$("#vipPoints").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:center;padding-top:60px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/finances.inc.php?convert=1&token=<?php $_SESSION['token']=uniqid(); echo $_SESSION['token'];?>").fadeIn('slow');
			});
		});
</script>
<?php }
}
?>

<!-- zCoin Swap System -->
<br />
<h4 style="color:#00e701;">Swap Tokens</h4>
Swap Rate: 1 zUSD = 100 zCoin<br/>
<input type="text" id="swapAmount" placeholder="Amount in zUSD" style="width:100px; padding:3px; background:#1c1e22; color:#fff; border:1px solid #3b3f46;" />
<button id="btnSwap" style="background:#00e701; color:#1c1e22; border:none; padding:3px 10px; font-weight:bold; cursor:pointer;">Swap to zCoin</button>
<br/><br/>
<input type="text" id="swapAmountCoin" placeholder="Amount in zCoin" style="width:100px; padding:3px; background:#1c1e22; color:#fff; border:1px solid #3b3f46;" />
<button id="btnSwapBack" style="background:#00e701; color:#1c1e22; border:none; padding:3px 10px; font-weight:bold; cursor:pointer;">Swap to zUSD</button>
<div id="swapResult" style="color:yellow; margin-top:5px; font-size:10px;"></div>

<script type="text/javascript">
$("#btnSwap").click(function() {
    var amt = $("#swapAmount").val();
    if(amt > 0) {
        $.post("includes/do_swap.php", { amount: amt, dir: 'to_zcoin' }, function(data) {
            $("#swapResult").html(data);
            setTimeout(function(){
                $('#loginDiv').load("includes/finances.inc.php");
            }, 1000);
        });
    }
});
$("#btnSwapBack").click(function() {
    var amt = $("#swapAmountCoin").val();
    if(amt > 0) {
        $.post("includes/do_swap.php", { amount: amt, dir: 'to_zusd' }, function(data) {
            $("#swapResult").html(data);
            setTimeout(function(){
                $('#loginDiv').load("includes/finances.inc.php");
            }, 1000);
        });
    }
});
</script>

<div id="showname"><?php @require_once('do_name.inc.php');?></div>
</div>