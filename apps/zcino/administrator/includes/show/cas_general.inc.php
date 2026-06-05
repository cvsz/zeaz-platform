<?php
//this php file manages the general settings : language, template, phone number, lightbox popup
//powered by zcino
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br />

<?php
$profit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `bank`,`coef` FROM `bank_tbl`"),0);
if (isset($_POST['update']) && $_SESSION['adminlvl']=='admin' && $demoMode==0) { 
			echo '<script type="text/javascript">
					$("#phone_number").css("border","");
					</script>
					'; 
			if (strlen($_POST['currency'])>1){
				$currency = antisqli($_POST['currency']);
				if (strlen($currency)>6){
						$currency = substr($currency,0,6);
				}
				mysqli_query($GLOBALS['con'],"UPDATE `cws_currencies` SET `current`='0'");
				mysqli_query($GLOBALS['con'],"UPDATE `cws_currencies` SET `current`='1' WHERE `code`='$currency'");
			}
			$popup = antisqli($_POST['popup']);
			if ($popup!=='1'){
				$popup = 0;
			}
			$allowfunplay = antisqli($_POST['allowfunplay']);
			if ($allowfunplay!=='1'){
				$allowfunplay = 0;
			}
			$thousand_sep = antisqli($_POST['thousand_sep']);
			if ($thousand_sep!=='1'){
				$thousand_sep = 0;
			}
			$allowent = antisqli($_POST['allowent']);
			if ($allowent!=='1'){
				$allowent = 0;
			}
			$allowrealplay = antisqli($_POST['allowrealplay']);
			if ($allowrealplay!=='1'){
				$allowrealplay = 0;
			}
			$phone_number = antisqli($_POST['phone_number']);
			if (strlen($phone_number)<6 || stristr($phone_number,'<') || stristr($phone_number,'>')){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+phone+number'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#phone_number").css("border","2px solid #F00");</script>';
			}else{
				mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `phone_number`='$phone_number'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$mind = antisqli($_POST['mind']);
			if ($mind<0 || !is_numeric($mind)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+minimum+deposit+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#mind").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `minimumdeposit`='$mind'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$maxd = antisqli($_POST['maxd']);
			if ($maxd<0 || !is_numeric($maxd)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+maximum+deposit+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#maxd").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `maximumdeposit`='$maxd'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$minw = antisqli($_POST['minw']);
			if ($minw<0 || !is_numeric($minw)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+minimum+withdrawal+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#minw").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `minimumwithdrawal`='$minw'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$maxw = antisqli($_POST['maxw']);
			if ($maxw<0 || !is_numeric($maxw)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+maximum+withdrawal+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#maxw").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `maximumwithdrawal`='$maxw'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$lbonus = antisqli($_POST['lbonus']);
			if ($lbonus<0 || !is_numeric($lbonus)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+login+bonus+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#lbonus").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `login_bonus`='$lbonus'") or error_report(mysqli_error($GLOBALS['con']));
			}
			
			$reg_bonus = antisqli($_POST['reg_bonus']);
			if ($reg_bonus<0 || !is_numeric($reg_bonus)){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+registration+bonus+value'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#reg_bonus").css("border","2px solid #F00");</script>';
			}else{
				@mysqli_query($GLOBALS['con'],"UPDATE `cws_settings` SET `reg_bonus`='$reg_bonus'") or error_report(mysqli_error($GLOBALS['con']));
			}

			
			$points_shop = antisqli($_POST['points_shop']);
			if ($points_shop!=='1'){
				$points_shop = 0;
			}
			$vipmode = antisqli($_POST['vipmode']);
			if ($vipmode!=='1'){
				$vipmode = 0;
			}
			
			$global_mode = antisqli($_POST['global_mode']);
			if ($global_mode!=='1'){
				$global_mode = 0;
			}
			
			mysqli_query($GLOBALS['con'],"UPDATE cws_settings SET global_mode='$global_mode',thousand_sep='$thousand_sep',points_shop='$points_shop',allowfunplay='$allowfunplay',allowent='$allowent',allowrealplay='$allowrealplay',vipmode='$vipmode'") or error_report(mysqli_error($GLOBALS['con']));
			$_SESSION['currency'] = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `symbol` FROM `cws_currencies` WHERE `code`='$currency'"),0);
			$template = antisqli($_POST['template']);
			mysqli_query($GLOBALS['con'],"UPDATE cws_templates SET selected='0'") or error_report(mysqli_error($GLOBALS['con']));
			mysqli_query($GLOBALS['con'],"UPDATE cws_templates SET selected='1' WHERE id='$template'") or error_report(mysqli_error($GLOBALS['con']));			
			//add language - add currency , activate / deactivate them
			if ($ok!==false){					
					echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
						echo $lang['Updated+successfully'];
						echo '</p></div>';

			}else { 
					echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
						echo $lang['Update+failed'];
						echo '</p></div>';
				}
			if ($thousand_sep!==$_SESSION['delimiter']){
				echo '<script type="text/javascript">window.location = "index.php"</script>';
				$_SESSION['delimiter'] = $thousand_sep;
			}
}elseif(isset($_POST['update']) && $demoMode==1){
	echo '<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>';	
	echo '</p></div>';
	exit;
}
$settings = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings"));
?>
<form name="ff1" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
    <div class="widget" style="width:600px">
        <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Casino+General+Settings']?></h6></div>
        
<?php
if ($_SESSION['adminlvl']=='admin'){?>
<div class="formRow">
<label><?=$lang['Template']?></label> 
<select id="template" style="font-weight:bold" onchange="update_settings()">
<?php
$template = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_templates` WHERE status='1'");
while ($row = mysqli_fetch_array($template)) {
?>
<option value="<?=$row['id']?>" <?php if ($row['selected']=='1') {echo 'selected';}?> ><?=$row['name']?></option>
<?php
}
?>
</select>
<div class="clear"></div>
</div>

<div class="formRow">
<label> <?=$lang['Currency']?> </label> 
<select id="currency" style="font-weight:bold" onchange="update_settings()">
<?php
$currency = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_currencies`");
while ($row = mysqli_fetch_array($currency)) {
?>
<option value="<?=$row['code']?>" <?php if ($row['current']=='1') {echo 'selected';}?> ><?=$row['code']?></option>
<?php
}
?>
</select>
<div class="clear"></div>
</div>

<?php } ?>

<div class="formRow">
	<label><?=$lang['Phone+number']?></label> 
	<div class="formRight"><input type="text" name="phone_number" id="phone_number" value="<?=$settings['phone_number']?>" style="width:200px"/></div>
<div class="clear"></div>
</div>
<?php
if (mysqli_num_rows(mysqli_query($GLOBALS['con'],'SELECT login_bonus FROM cws_settings'))>0){
	?>
<div class="formRow">
	<label><?=$lang['Daily+Login+Bonus']?><br /><span style="font-size:10px;color:red;">(<?=$lang['Set+value+to']?> 0.00 <?=$lang['to+disable']?>)</span></label> 
	<div class="formRight"><input type="text" name="phone_number" id="lbonus" value="<?=$settings['login_bonus']?>" style="width:200px"/> <?=$_SESSION['currency']?></div>
<div class="clear"></div>
</div>

<div class="formRow">
	<label><?=$lang['Registration+Bonus']?><br /><span style="font-size:10px;color:red;">(<?=$lang['Set+value+to']?> 0.00 <?=$lang['to+disable']?>)</span></label> 
	<div class="formRight"><input type="text" name="phone_number" id="reg_bonus" value="<?=$settings['reg_bonus']?>" style="width:200px"/> <?=$_SESSION['currency']?></div>
<div class="clear"></div>
</div>
<?php } ?>

<div class="formRow">
	<label><?=$lang['Deposit+limits']?></label> 
	<div class="formRight">
    	<div style="display:block;float:left;width:100px;"><?=$lang['Min+deposit']?><br /><input type="text" name="mind" id="mind" value="<?=$settings['minimumdeposit']?>" style="width:60px;color:#093"/> <?=$_SESSION['currency']?></div>
        <div style="display:block;float:left"><?=$lang['Max+deposit']?><br /><input type="text" name="maxd" id="maxd" value="<?=$settings['maximumdeposit']?>" style="width:80px;color:#093"/> <?=$_SESSION['currency']?></div>
    </div>
<div class="clear"></div>
</div>

<div class="formRow">
	<label><?=$lang['Withdrawal+limits']?></label> 
	<div class="formRight">
    	<div style="display:block;float:left;width:100px;"><?=$lang['Min+withdrawal']?><br /><input type="text" name="minw" id="minw" value="<?=$settings['minimumwithdrawal']?>" style="width:60px;color:#093"/> <?=$_SESSION['currency']?></div>
        <div style="display:block;float:left"><?=$lang['Max+withdrawal']?><br /><input type="text" name="maxw" id="maxw" value="<?=$settings['maximumwithdrawal']?>" style="width:80px;color:#093"/> <?=$_SESSION['currency']?></div>
        </div>
<div class="clear"></div>
</div>

<div class="formRow">
    <label for="thousand_sep"><?=$lang['Thousand+Separator']?></label> 
    <div class="formRight"><input type="checkbox" name="thousand_sep" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT thousand_sep FROM cws_settings"),0)=='1') {echo 'checked';}?> id="thousand_sep" value="On" onchange="javascript:update_settings()"/>
    </div>
     <div style="font-size:10px;float:left;clear:both"><?=$lang['Use+thousand+separator+when+displaying+money']?>(EG: <span style="color:#093">1,000</span> -<?=$lang['if+enabled']?> <?=$lang['or']?> <span style="color:#093">1000</span> -<?=$lang['if+disabled']?>)</div>
<div class="clear"></div>
</div>

<div class="formRow">
    <label for="allowfunplay"><?=$lang['Enable']?> <?=$lang['Play+For+Fun']?> <?=$lang['Games']?></label> 
    <div class="formRight"><input type="checkbox" name="allowfunplay" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowfunplay FROM cws_settings"),0)=='1') {echo 'checked';}?> id="allowfunplay" value="On" onchange="javascript:update_settings()"/>
    </div>
<div class="clear"></div>
</div>

<div class="formRow">
    <label for="allowrealplay"><?=$lang['Enable']?> <?=$lang['Play+For+Real']?> <?=$lang['Games']?></label> 
    <div class="formRight"><input type="checkbox" name="allowrealplay" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowrealplay FROM cws_settings"),0)=='1') {echo 'checked';}?> id="allowrealplay" value="On" onchange="javascript:update_settings()"/>
    </div>
<div class="clear"></div>
</div>

<div class="formRow">
    <label for="allowent"><?=$lang['Enable']?> <?=$lang['Skill+Games']?></label> 
    <div class="formRight"><input type="checkbox" name="allowent" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowent FROM cws_settings"),0)=='1') {echo 'checked';}?> id="allowent" value="On" onchange="javascript:update_settings()"/>
    </div>
<div class="clear"></div>
</div>

<div class="formRow" <?php if ($demoMode==1){?>style="display:none"<?php }?>>

    <label for="global_mode"><?=$lang['Global+Mode']?></label> 
    <div class="formRight"><input type="checkbox" name="global_mode" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0)=='1') {echo 'checked';}?> id="global_mode" value="On" onchange="javascript:update_settings()"/> 
    </div>
    <div style="font-size:10px;float:left;clear:both">(<?=$lang['if+this+is+enabled']?> , <?=$lang['all+games+will+share+same+bank+and+payout']?> %)</div>
<div class="clear"></div>
</div>

<div class="formRow">

    <label for="global_mode">VIP Points (100VPP=1$)</label> 
    <div class="formRight"><input type="checkbox" name="vipmode" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT vipmode FROM cws_settings"),0)=='1') {echo 'checked';}?> id="vipmode" value="On" onchange="javascript:update_settings()"/> 
    </div>
    <div style="font-size:10px;float:left;clear:both">(<?=$lang['if+this+is+enabled']?> , <?=$lang['for+every']?> 10CREDIT <?=$lang['that+the+player+will+bet']?>, <?=$lang['he+will+receive']?> 1VPP)</div>
<div class="clear"></div>
</div>

<div class="formRow">
	<label for="points_shop">
	<?=$lang['Points+Shop']?>
	</label> 
    <div class="formRight">	<input type="checkbox" name="points_shop" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT points_shop FROM cws_settings"),0)=='1') {echo 'checked';}?> id="points_shop" value="1" onchange="javascript:update_settings()"/>
    </div>
    <div style="font-size:10px;float:left;clear:both">(<?=$lang['disable+user+withdraw+option+and+allow+users+to+buy+products+with+their+credit']?>)</div>
<div class="clear"></div>
<div class="formRow" style="text-align:left">
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" id="update" onclick="javascript:update_settings()"><span><?=$lang['Update']?></span></a>
</div>
</div>
</fieldset>
</form>
<script type="text/javascript">
$(function(){
	$("select, input:checkbox").uniform();
	$(".formRow .formRight").css('width','70%');
});
</script>

</div>