<?php
@session_start();
if (!isset($_SESSION['language'])){$_SESSION['language'] = 'en';}
@include('includes/lang/'.$_SESSION['language'].'.php');
require_once('includes/connection.inc.php');
?>
<!-- top navigation start -->
<div id="topbar" style="right:15px">

	<a href="" class="topmenu home"><img src="http://<?=$_SERVER['SERVER_NAME']?>/template_files11/home-icon.png" style="padding-left:12px;padding-right:12px;width:24px;height:22px;vertical-align:text-top"/></a>

	<a href="#showGames" class="topmenu gamesid" onclick="ajaxgamestype('random')"><?=$lang["Games"]?></a>

	<a href="#showPromotions" class="topmenu promotions" onclick="showcontent('includes/gameslide.php','promotions');"><?=$lang['Promotions']?></a>

	<a href="#showAffiliate" class="topmenu affiliate" id="affiliate_program"><?=$lang["Affiliate+Program"]?></a>

	<a href="#showAffiliate" class="topmenu responsible_gam" onclick="showcontent('includes/gameslide.php','responsible_gam');"><?=$lang["Responsible+Gaming"]?></a>

	<a href="#showTerms" class="topmenu toc" onclick="showcontent('includes/gameslide.php','toc');"><?=$lang['Terms']?></a>


	<a href="#showContact" class="topmenu contact" onclick="showcontent('includes/gameslide.php','contact');"><?=$lang['Contact+Us']?></a>

	<a href="#" class="topmenu button" id="connect-wallet-btn" style="background:#00e701; color:#1c1e22 !important; padding:5px 15px; border-radius:5px; font-weight:bold;">Connect Wallet</a>
	<span id="wallet-balance-container" style="display:none; color:#00e701; font-weight:bold; margin-left:10px;"><span id="wallet-balance"></span></span>

</div>

    
<div id="pc_container"> 
<script type="text/javascript">
$("#affiliate_program").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:330px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/affiliate_generate.inc.php").fadeIn('slow');
			});
		});
</script>

<div style="float:left">
<!-- top navigation end -->
<h1 style="color:#00e701; font-size: 42px; font-weight: 900; margin-top: 35px; margin-left: 5px; text-transform: uppercase; letter-spacing: 2px;">ZCINO</h1><br />
</div>
<div id="loginDiv" class="customBox" style="float:right">

<?php include("do_login.php"); ?>

</div>    

<div id="all">
	<a href="#deposit" id="trigger_deposit"><img src="template_files11/Banner-Header.jpg" style="padding:10px;width:980px;height:367px" /></a>
    <div id="jpbox">
            <span id="casino_jackpot_total_ticker" style="position:relative;left:143px;top:72px;color:#000;">
                <script type="text/javascript">
                        showJackpot();
                </script>
            </span>
    </div>
    
    <a href="#showPromotions" onclick="showcontent('includes/gameslide.php','promotions');"><img src="template_files11/Banner-Top2.jpg" style="padding:10px;margin-left:30px" /></a>    
    
    <a href="choose_type.php?game=630"><img src="template_files11/Banner-Top3.jpg" style="padding:10px;margin-left:15px" /></a>
    <div id="categ" style="width:1000px;clear:both;text-align:center;">
    <a href="#categories" style="text-decoration:none">
    <img src="template_files11/categories/gAll.jpg"  onclick="ajaxgamestype('all')"/>
    <img src="template_files11/categories/g3rs.jpg"  onclick="ajaxgamestype('slot3rs')"/>
    <img src="template_files11/categories/g5rs.jpg"  onclick="ajaxgamestype('slot5rs')"/>
    <img src="template_files11/categories/g7rs.jpg"  onclick="ajaxgamestype('slot7rs')"/>
    <img src="template_files11/categories/gCard.jpg" onclick="ajaxgamestype('poker')"/>
    </a>
    </div>
    <div id="centermenu">
    
    <?php if (strlen($_SESSION['username'])>0){
		
	?>
	<script type="text/javascript">
    $("#trigger_deposit").click(function() {
                $('#loginDiv').fadeOut('slow', function() {
                    $('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/acc_deposit.inc.php").fadeIn('slow');
                });
            });
    </script>
    <?php
    }
    ?>
    <?php
	if (isset($error)){
		echo '<h1>Page not found</h1>';
	}else{
	    include('includes/showgames.inc.php');
	}
    ?>
    </div>
    <div id="rightmenu">
        
        <div class="clear">&nbsp;</div>

        <?php if (isset($_SESSION['userid'])){?>
        <a href="#" id="provably-fair"><img src="template_files11/rightmenu/provably-fair.png" /></a>
        <script type="text/javascript">
		$("#provably-fair").click(function() {
			$('#loginDiv').fadeOut('slow', function() {
				$('#loginDiv').html('<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/pf_update.inc.php").fadeIn('slow');
			});
		});
		$("#provably-fair").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:330px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/pf_text.inc.php").fadeIn('slow');
			});
		});
		</script>
        <?php }?>
        <div class="clear">&nbsp;</div>
        <img src="template_files11/Banner-Right1.jpg" />
        <div class="clear">&nbsp;</div>
        <img src="template_files11/Banner-Right2.jpg" />
    </div>
</div>
</div>

<!-- FOOTER START -->
<div style="margin-top:40px;width:100%;text-align:center;background-color:#1c1c1c">
<script type="text/javascript">
function update_activity(){
	$.get('<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>/includes/update_activity.inc.php');
}
update_activity();
setInterval(update_activity,1000*15);
</script>
<div id="footer">
    <div id="wrapper_footer">
   		<div class="clear"></div>
      	<div style="float:left">
        	<img src="template_files11/t11/btc1.png" style="padding:20px" />
            <img src="template_files11/t11/btc2.png" style="padding:30px" />
            <img src="template_files11/t11/btc3.png" style="padding:20px" />
        </div>
        <div style="float:right;margin-top:40px">
        	<a href="#"><img src="template_files11/t11/skype.png" style="padding:10px" /></a>
            <a href="#"><img src="template_files11/t11/twitter.png" style="padding:10px" /></a>
            <a href="#"><img src="template_files11/t11/facebook.png" style="padding:10px" /></a>
        </div>
   
    
        <div style="width:900px;margin-top:20px" id="cr">
        <p><?=$sitename?><br>
        &copy;2026, All rights reserved</p>
        </div>
    
</div><!-- Footer wrapper END -->  
<?php
require_once('google_analytics.inc.php');
?>
</div>