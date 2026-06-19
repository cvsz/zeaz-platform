<?php
//this php file lets you add a deposit bonus
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
if ($_POST['check_ip']==1){
	$login = antisqli($_POST['user']);
	$udata = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT ip_reg,ip_last FROM cws_users u INNER JOIN cws_users_info i ON u.id=i.id WHERE login='{$login}'"));
	$login_ip = $udata['ip_last'];
	$reg_ip = $udata['ip_reg'];
	$ok = true;
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users_info WHERE  ip_reg='$reg_ip'");
	if (mysqli_num_rows($q)>1){
		$ok = false;
		echo '<span style="color:red">'.$lang['We+have+duplicated+registration+IP'].'!</span><br />';
		$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users u INNER JOIN cws_users_info i ON u.id=i.id WHERE ip_reg='$reg_ip'");
		while ($tmp = mysqli_fetch_array($q)){
			echo $lang['User'].': <strong>'.$tmp['login'].'</strong> ... IP=<span style="color:green">'.$tmp['ip_reg'].'</span><br />';
		}
	}
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users_info WHERE ip_last='$login_ip'");
	if (mysqli_num_rows($q)>1){
		$ok = false;
		echo '<span style="color:red">'.$lang['We+have+duplicated+login+IP'].'!</span><br />';
		$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users u INNER JOIN cws_users_info i ON u.id=i.id WHERE ip_last='$login_ip'");
		while ($tmp = mysqli_fetch_array($q)){
			echo $lang['User'].': <strong>'.$tmp['login'].'</strong> ... IP=<span style="color:green">'.$tmp['ip_last'].'</span><br />';
		}
	}
	if ($ok==true){
		echo '<span style="color:blue">'.$lang['No+duplicate+IP+found'].'</span>';
	}
	exit;
}
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($page_name).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<?php

if (isset($_POST['add'])) { 
			echo '<script type="text/javascript">
					$("#user").css("border","");
					$("#status").css("border","");
					$("#amount").css("border","");
					$("#unlock_limit").css("border","");
					</script>
					'; 
			$ok = true;
			
			$login = antisqli($_POST['user']);
				$checklogin = mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT `login` FROM `cws_users` WHERE `login`='$login'"));
				if (strlen($login)>40 || strlen($login)<6 || !checkName($login) || $checklogin==0){
					$ok = false;
					if (strlen($login)<6){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+too+short'].'</strong></p></div>';
					}elseif (strlen($login)>40){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+too+long'].'</strong></p></div>';
					}elseif (!checkName($login)){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+username'].'</strong></p></div>';
					}elseif($checklogin>0){
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Username+already+exists'].'</strong></p></div>';
					}
					echo '<script type="text/javascript">$("#login").css("border","2px solid #F00");</script>';
				}
			if ($_SESSION['adminlvl']!=='admin'){
				$subAgents = "'".$_SESSION['admin']."',";
				getSubAgents($_SESSION['admin']);
				$subAgents = trim($subAgents,',');
			}
			if (isset($_POST['login']) && $_SESSION['adminlvl']!=='admin') { 
				$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `login`='{$login}' AND owner IN ($subAgents)") or error_report(mysqli_error($GLOBALS['con']));
				if (mysqli_num_rows($query)>0){
					//echo mysqli_result($query,0);
				}else{
					echo $lang['Invalid+username'];
					exit;
				}
			}
			$status = 1;
			if ($status<0 || $status>1){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
			}
			
			$amount = antisqli($_POST['amount']);
			if (!is_numeric($amount) || $amount<=0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Bonus+amount+must+be+larger+than+0'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#amount").css("border","2px solid #F00");</script>';
			}
			
			$type = 'free_chips';
			$unlock_limit = antisqli($_POST['unlock_limit']);
			if (!is_numeric($unlock_limit) || $unlock_limit<0){
				$ok = false;
				echo '<script type="text/javascript">$("#unlock_limit").css("border","2px solid #F00");</script>';
			}
			
			$admin_credit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			if ($amount>$admin_credit){
				$ok = false;
			}
			if ($ok!==false){
				$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$login'"),0);
				mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET cash=cash-'$bonus' WHERE login='{$_SESSION['admin']}");
				credit_just_bonus('free_chips',$userid,'0',$amount,$unlock_limit);
				echo '<div class="nNote nSuccess hideit">
			<p><strong>SUCCESS: </strong>';
				echo $amount.' '.$_SESSION['currency'].' '.$lang['given+successfully+to'].$login;
				echo '</p></div>';
			}else{ 
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Failed'].' </strong></p></div>';
			}
}
?>
<form name="form" onsubmit="return false" class="form" style="text-align:left">
<fieldset>
 <div class="widget">
	<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Add+FREE+CHIPS+CREDIT']?></h6></div>
	<div style="text-align:left;padding-left:25px;">
    
    
    
<div class="formRow">
<label><?=$lang['Username']?></label>
<div class="formRight">
<select id="login" onchange="update_txt()">
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents) ORDER BY login");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['login'].'"';
		if ($_POST['user']==$row['login']){
			echo 'selected="selected"';
		}
		echo '>'.$row['login'].'</option>';
	}
	
	?>
    </select>
</div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label> <?=$lang['Bonus+Amount']?></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" id="amount" value="<?=antisqli($_POST['amount'])?>"  style="width:100px;color:#093" onkeyup="check_negative(this.value);update_txt()"/><?=$_SESSION['currency']?></div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label> <button onclick="check_ip()"><?=$lang['Check+IP']?></button></label>
<div class="formRight" id="ip_result"></div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['How+many+times+BONUS+AMOUNT+must+be+wagered']?>,<br /> <?=$lang['to+unlock+bonus+in+account']?><strong>(ROLLOVER)</strong></label> 
<div class="formRight"><input type="text" class="text small" name="smallfield" id="unlock_limit" value="<?=antisqli($_POST['unlock_limit'])?>" style="width:100px" onkeyup="check_negative2(this.value);update_txt()"/> <?=$lang['minimum']?> <?=$lang['recommended']?> = <?php
	$mmin = round(100/mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0));
	if ($mmin==""){
		$mmin = 10;
	}
	echo $mmin;
	?>    </div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Total+amount+that+the+player+must+wager+to+withdraw']?></label> 
<div class="formRight"><input type="text" class="text small" name="smallfield" value="0.00" style="width:100px;color:#093" disabled id="to_withdraw"/><?=$_SESSION['currency']?></div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label>
<div id="xtxt" style="width:300px">The total amount that the casino owner must have in his bank account to pay other users if this user loses everything from the first gameplay:<br>
<span style="font-size:11px">If <span style="color:blue;font-weight:bold" class="slogin">{login}</span> receives <span style="color:#0C3;font-weight:bold" class="samount">{amount}</span> FREE CREDIT, and he loses all, the CASINO BANK will increase by <span style="color:#0C3;font-weight:bold" class="samp">{amount*payout}</span>, meaning that the <span style="color:#0C3;font-weight:bold" class="samp">{amount*payout}</span> amount can be won by any OTHER player.<br>
So you must be prepared to pay this value if this scenario happens.<br>
The payout rate for "FREE CHIPS" is <span style="color:#F90;font-weight:bold" class="spayout_fc">{payout_fc}</span>, half the normal payout rate.<br />
Upon request the payout % for FREE CHIPS can be set to <span style="color:#F90;font-weight:bold">0%</span>, but this may cause FREE CHIPS users to win the money of other players, and the other players that deposited and wagered real money to have nothing left to win.</span></div></label>
<div class="formRight"><input type="text" class="text small" name="smallfield" value="0.00" style="width:100px;color:#093" disabled id="reserve"/><?=$_SESSION['currency']?></div>
	<div class="clear"></div>    
</div>

<div class="formRow">
<label><?=$lang['Status']?></label>
<div class="formRight"><select id="status">
<option value="1" selected><?=$lang['Active']?></option>
</select>    
</div>
	<div class="clear"></div>    
</div>


<a style="margin: 5px;" class="button dblueB" id="update" title="<?=$lang['Add']?>" href="#"><span><?=$lang['Add']?></span></a>
<script type="text/javascript">
function check_ip(){
	var user = $("#login").val();
	$.post("includes/show/fn_freec_a.inc.php",{user:user,check_ip:'1'}, function(data) {
 		 $("#ip_result" ).html(data);
	});
}
function check_negative(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#amount").val('');
	}
}

function check_negative2(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#unlock_limit").val('');
	}
}

var payout = <?=(100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0))?>;
function update_txt(){
	var user = $("#login").val();
	var amount = $("#amount").val();
	var unlock_limit = $("#unlock_limit").val();
	var reserve = amount * payout / 200;
	$("span.slogin").text(user);
	$("span.samount").text(amount);
	$("span.samp").text(amount*payout/200);
	$("span.spayout_fc").text(payout/2);
	
	$("#reserve").val(reserve);
	$("#to_withdraw").val(amount*unlock_limit);
}
update_txt();
$("#update").click(function() {
				var user = $("#login").val();
				var amount = $("#amount").val();
				var status = $("#status option:selected").val();
				var unlock_limit = $("#unlock_limit").val();
				showparam('fn_freec_a','add=1&'+'user='+user+'&'+'amount='+amount+'&'+'status='+status+'&'+'unlock_limit='+unlock_limit);
							 });
</script>
</fieldset>
</form>
</div>