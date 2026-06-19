<?php
require_once('../config.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE ".$_SESSION['adminlvl']."='1' AND status='1' AND shortname='$filename'");
	if (mysqli_num_rows($q)==0){
		die('<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>');	
	}else{
		$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
		$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
		$page_menu = mysqli_result($q,0,'menu');
		$page_sname = mysqli_result($q,0,'shortname');
	}
}else{
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
	$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
	$page_menu = mysqli_result($q,0,'menu');
	$page_sname = mysqli_result($q,0,'shortname');
}
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<?php
if (isset($_POST['update']) && $_SESSION['adminlvl']=='admin') { 
			echo '<script type="text/javascript">
					$("#bank").css("border","");
					$("#coef").css("border","");
					$("#funcoef").css("border","");
					$("#profit").css("border","");
					$("#fee").css("border","");
					$("#jackpot_percent").css("border","");
					</script>
					'; 
			$bank = antisqli($_POST['bank']);
			$coef = antisqli($_POST['coef']);
			$funcoef = antisqli($_POST['funcoef']);
			$profit_percent = 100- antisqli($_POST['profit']);
			$fee = antisqli($_POST['fee']);
			$jackpot_percent = antisqli($_POST['jackpot_percent']);
			$ok = true;
			
			if (!is_numeric($bank) || $bank<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Casino+Bank+value+must+be+numeric+and+positive'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#bank").css("border","2px solid #F00");</script>';
			}else{mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET bank='$bank'") or error_report(mysqli_error($GLOBALS['con']));}
			
			if (!is_numeric($coef) || $coef<0 || $coef>99){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': "'.'Hit Frequency'.'" '.$lang['for+REAL+MODE+must+be+value+between+1+and+99'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#coef").css("border","2px solid #F00");</script>';
			}else{mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET coef='$coef'") or error_report(mysqli_error($GLOBALS['con']));}
			
			
			if (!is_numeric($funcoef) || $funcoef<0 || $funcoef>99){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': "'.'Hit Frequency'.'" '.$lang['for+FUN+MODE+must+be+value+between+1+and+99'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#funcoef").css("border","2px solid #F00");</script>';
			}else{mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET funcoef='$funcoef'") or error_report(mysqli_error($GLOBALS['con']));}
			
			if (!is_numeric($jackpot_percent) || $jackpot_percent<0 || $jackpot_percent>100){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Jackpot+increase+percent+must+be+value+between+0+and+100'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#jackpot_percent").css("border","2px solid #F00");</script>';
			}else{mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET jackpot_percent='$jackpot_percent'") or error_report(mysqli_error($GLOBALS['con']));}
			
			if ($profit_percent>20 && $demoMode==1){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Payout+percent+must+be+minimum'].' 80% '.$lang['in+DEMO+MODE'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#profit").css("border","2px solid #F00");</script>';
			}else{
				if (!is_numeric($profit_percent) || $profit_percent<0 || $profit_percent>100){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
					<p><strong>'.$lang['Incorrect+value'].': '.$lang['Payout+percent+must+be+value+between+0+and+100'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#profit").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET profit_percent='$profit_percent'") or error_report(mysqli_error($GLOBALS['con']));}
				}
			
			if (!is_numeric($fee) || $fee<0 || $fee>100){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Transfer+fee+percent+must+be+value+between+0+and+100'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#fee").css("border","2px solid #F00");</script>';
			}else{mysqli_query($GLOBALS['con'],"UPDATE cws_settings SET transfer_fee='$fee'") or error_report(mysqli_error($GLOBALS['con']));}
			
			if ($ok!==false){
				if ($coef == 0 ) { 
					echo '<div class="nNote nInformation hideit">
				<p><strong>INFORMATION: </strong>';
					echo $lang['Now+nobody+will+ever+win'];
					echo '</p></div>';
				}else {
					echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
					echo $lang['Updated+successfully'];
					echo '</p></div>';
				}
			}else { 
					echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
					echo $lang['Update+failed'].':'.mysqli_error($GLOBALS['con']);
					echo '</p></div>';
				}
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM bank_tbl"));
$fee = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `transfer_fee` FROM cws_settings"),0);
$gmode = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0);

?>
<form name="ff1" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
    <div class="widget" style="width:600px">
	<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6>Global <?=$lang['Casino+Bank']?> <?=$lang['and']?> <?=$lang['WIN']?></h6></div>
    <div class="formRow">
    <label>Global Casino <?php if ($demoMode==0){?>Payout<?php }?> Bank</label>
    <div class="formRight"><input type="text" <?php if ($gmode=='0') {echo 'disabled style="background-color:#CCC;width:100px"';}else{ echo ' style="width:100px"';}?> class="text small" name="smallfield" id="bank" value="<?=$row['bank']?>"/><?=$_SESSION['currency']?></div>
    <div style="font-size:10px;float:left;clear:both"><?php if ($demoMode==0){?>( <?=$lang['How+much+money+the+casino+has+for+payments']?> - <?=$lang['this+can+be+disabled+so+that+the+payouts+are+not+influenced+by+casino+bank']?> )<br />
    <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0)=='0') {echo '<span style="color:red">'.$lang['At+the+current+moment'].', '.$lang['individual+settings+per+game+are+Enabled'].', '.$lang['which+means+that+Global+Casino+Bank+is+Disabled'].'</span>';}?>
    <?php }?>
    </div>
    <div class="clear"></div>
    </div>
	
    <div class="formRow" <?php if ($demoMode==5){echo 'style="display:none"';}?>>
    <label>1.*"Hit Frequency" <?=$lang['for+Play+for+Real+Mode']?></label>
  	<div class="formRight"><input type="text" class="text small" name="smallfield" <?php if ($gmode=='0') {echo 'disabled style="background-color:#CCC;width:35px"';}else{ echo ' style="width:35px"';}?> id="coef" value="<?=$row['coef']?>" />% <span style="color:red;font-size:9px">Value range 1-99</span></div>
    <div style="font-size:10px;float:left;clear:both">(if this is set to a low value, the player will win very rarely, but will get big wins)<br />
    <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0)=='0') {echo '<span style="color:red">At the current moment, individual settings per game are Enabled.</span>';}?></div>
    <div class="clear"></div>
    </div>
    
	<div class="formRow" <?php if ($demoMode==5){echo 'style="display:none"';}?>>
    <label>2.*"Hit Frequency" <?=$lang['for+Play+for+Fun+Mode']?></label> 
  	<div class="formRight"><input type="text" class="text small" name="smallfield"  style="width:35px" id="funcoef" value="<?=$row['funcoef']?>"/>% <span style="color:red;font-size:9px"><?=$lang['Value+range']?> 1-99</span></div>
    <div style="font-size:10px;float:left;clear:both"></div>
    <div class="clear"></div>
    </div>
    
	<div class="formRow">
    <label>**<?=$lang['Payout+Percent']?> <?=$lang['for+all+the+games']?></label>
  	<div class="formRight"><input type="text" class="text small" name="smallfield" id="profit" value="<?=(100-$row['profit_percent'])?>" style="width:35px"/>%</div>
    <div style="font-size:10px;float:left;clear:both;color:red">(<?=$lang['we+recommend+you+do+not+change+this+value+after+your+casino+is+online']?>. <?=$lang['Recommended+value']?>: >80%)</div>
    <div class="clear"></div>
    </div>
    
    
	<div class="formRow">
    <label>***<?=$lang['JACKPOT+Increase+Percent']?></label>
  	<div class="formRight"><input type="text" class="text small" name="smallfield" id="jackpot_percent" value="<?=$row['jackpot_percent']?>" style="width:70px"/>%</div>
  	<div class="clear"></div>
    </div>
    
    
	<div class="formRow">
    <label><?=$lang['Player+to+player+money+transfer+fee']?></label>
  	<div class="formRight"><input type="text" class="text small" name="smallfield" id="fee" value="<?=$fee?>" style="width:70px"/>%</div>
    <div class="clear"></div>
    </div>
    

	<div class="formRow">
    <label>
    <?php if ($demoMode==1){?>
    <?=$lang['Casino+Profit']?>
	<?php }else {?>
    <?=$lang['Reserved+as+Casino+Profit']?> (<span style="color:#33F"><?=$row['profit_percent']?>%</span> <?=$lang['from+each+bet']?>):<?php }?>
    </label>
    <div class="formRight"><span style="color:green"><?php $profit = getMyProfit('bet','0','0','admin',true); echo cash_format_cws($profit);?><?=$_SESSION['currency']?></span></div>
    <div class="clear"></div>
    </div>
	<a style="margin: 5px;" class="button dblueB" id="update" title="<?=$lang['Update']?>" href="#"><span><?=$lang['Update']?></span></a>
    <div class="formRow" <?php if ($demoMode==1){echo 'style="display:none"';}?>>
	<span style="font-size:10px;color:black"><span style="color:#09F">*"Hit Frequency" <?=$lang['percent']?></span>: <?=$lang['If+this+value+is+closer+to']?> 99%, <?=$lang['the+players+will+win+smaller+wins']?>, <?=$lang['but+more+often']?>. <?=$lang['Set+this+to+lower+value+so+that+the+wins+become+bigger']?>, <?=$lang['but+are+given+less+often']?>. <?=$lang['This+will+work+only+if+there+are+enough+money+in+the+casino+payout+bank+to+pay']?>.</span><br /><br />
	<span style="font-size:10px;color:black"><span style="color:#09F">**Payout %</span>: <?=$lang['influences+the+increase+of+Casino+Bank']?> .If Payout Percent is 75%, and user placed bet of <span class="cash">400$</span>, then 75%(<span class="cash">300$</span>) will go to Casino Bank and will be put at stake for the players to win. The remaining 25%(<span class="cash">100$</span>) will go to Casino Profit .</span><br /><br />
	<span style="font-size:10px;color:black"><span style="color:#09F">***<?=$lang['Jackpot+Increase+Percentage']?></span>: (<?=$row['jackpot_percent']?>
	% from each Casino Bank revenue goes to jackpot.<br /><?=$lang['EXAMPLE']?>: if bet=<span class="cash">100$</span> and payout=10% , and jackpot_percent=25% , then <span class="cash">90$</span> go to profit , and <span class="cash">10$</span> will go to  Casino Bank.  If the game has jackpot, then from the <span class="cash">10$</span>, <span class="cash">2.5$</span> will go to Jackpot and <span class="cash">7.5$</span> to Casino Bank)</span><br /><br />
    </div>
</fieldset>
</form>
<script type="text/javascript">  
$("#update").click(function() {
				var bank = $("#bank").val();
				var coef = $("#coef").val();
				var funcoef = $("#funcoef").val();
				var jackpot_percent = $("#jackpot_percent").val();
				var profit = $("#profit").val();
				var fee = $("#fee").val();
				var dog_bonus = $("#dog_bonus").val();
				showparam('cas_percent','update=1&'+'&'+'bank='+bank+'&'+'dog_bonus='+dog_bonus+'&coef='+coef+'&funcoef='+funcoef+'&profit='+profit+'&fee='+fee+'&jackpot_percent='+jackpot_percent);});
</script> 
<script type="text/javascript">
$(function(){
	$("select, input:checkbox").uniform();
	$(".formRow .formRight").css('width','50%');
});
</script>
 </div>