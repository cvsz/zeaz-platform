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
        <div id="about">
        <a href="#showHome" class="home" style="background:url(images/menu_active.jpg) repeat-x" onclick="showcontent('includes/homeleft.html','home');"><span><span><?=$lang['Home']?></span></span></a> | 
        <a href="#showGames" class="gamesid" onclick="ajaxgamestype('random')"><span><span> <?=$lang['Games']?> </span></span></a> | 
        <a href="#showPromotions" class="promotions" onclick="showcontent('includes/gameslide.php','promotions');"><span><span><?=$lang['Promotions']?> </span></span></a> | 
        <a href="#showTerms" class="toc" onclick="showcontent('includes/gameslide.php','toc');"><span><span><?=$lang['Terms']?></span></span></a> | 
        <a href="#showContact" class="contact" onclick="showcontent('includes/gameslide.php','contact');"><span><span><?=$lang['Contact+Us']?></span></span></a> 
      </div>
    
        <!-- Payment methods -->
        <div id="pay">
        <a href="#deposit" class="deposit"><img alt="<?=$sitename?> payment methods" src="template_files3/payment_.png"></a>
        </div>
    
        <!-- Payment methods -->
        <div id="associated">
        <ul>
        <li>Powered by:<a target="_blank" href="http://www.zcino/"><img alt="" src="template_files3/logoCWS.png" height="45" width="70"></a></li>
        <li>Affiliated by:<a target="_blank" href="http://www.google.com"><img alt="" src="template_files3/logo.png" height="45" width="70"></a></li>
        <li>Licensed by:<a target="_blank" href="#"><img alt="" src="template_files3/couraco-.png"></a></li>
        <li><a target="_blank" href="#"><img alt="" src="template_files3/gamblers.png"></a><img alt="" src="template_files3/18-plus_.png"></li>
        <li><a href="http://www.beyondsecurity.com/vulnerability-scanner-verification/<?=$_SERVER['SERVER_NAME']?>"><img src="https://secure.beyondsecurity.com/verification-images/<?=$_SERVER['SERVER_NAME']?>/vulnerability-scanner-2.gif" alt="Website Security Test" border="0" /></a></li>
        <li style="margin-right: 0pt;">Optimized for:<img alt="" src="template_files3/optimize.png"></li>
        </ul>
        </div>
        
   
    
    <div style="width:900px;margin-top:20px" id="cr">
    <p><?=$sitename?><br>
    &copy;2013, All rights reserved</p>
    </div>
    
</div><!-- Footer wrapper END -->  
