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
<?php 
if ($_SESSION['adminlvl']!=='admin'){
	$subAgents = "'".$_SESSION['admin']."',";
	getSubAgents($_SESSION['admin']);
	$subAgents = trim($subAgents,',');
}
if (isset($_POST['login']) && $_SESSION['adminlvl']!=='admin') { 
	$login = antisqli($_POST['login']);
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_users` WHERE `login`='{$login}' AND owner IN ($subAgents)") or error_report(mysqli_error($GLOBALS['con']));
	if (mysqli_num_rows($query)>0){
		//echo mysqli_result($query,0);
	}else{
		echo $lang['Invalid+username'];
		exit;
	}
if($_SESSION['adminlvl']!=='admin' && isset($_POST['login'])){
		$login = antisqli($_POST['login']);
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='$login' AND owner IN ($subAgents)"))==0){
			die("ERROR");
		}
	}
}
?>
<?php
if (isset($_POST['refresh_credit'])){
	$login = antisqli($_POST['login']);
	$refresh_credit = cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='$login'"),0),2,'.','');
	$refresh_cashin = cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE user='{$login}' AND status='1'"),0),2,'.','');
	?>
	<label><?=$lang['PLAYER+CREDIT']?></label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_credit?></span></div>
   <div class="clear"></div>
   <label><?=$lang['TOTAL+DEPOSIT']?></label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_cashin?></span></div>
   <div class="clear"></div>
    <?php
	exit;
}
if (isset($_POST['checkonline'])){
	$login = antisqli($_POST['login']);
	if (checkloggedin($login)=='yes'){
				echo '<span style="color:green">'.$lang['ONLINE'].'</span>';
			}else{
				echo '<span style="color:red">'.$lang['OFFLINE'].'</span>';
			}
	exit;			
}
?>
<?php
	if (isset($_POST['update'])) { 
			$login = antisqli($_POST['login']);
			$id = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$login'"),0);
			$cash = antisqli($_POST['cash']);
			if (antisqli($_POST['cashout'])==1){
				$cash = -abs($cash);
			}else{
				$cash = abs($cash);
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE login='$login'"))==0){$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';
			}
			mysqli_query($GLOBALS['con'],"UPDATE cws_users SET cash=cash WHERE login='$login'");
			$playerCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_users WHERE login='$login'"),0);
			if ($cash<0 && abs($cash)>$playerCash) {$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'_1</p></div>';}
			$agentCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			if ($agentCash<$cash){$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'_2</p></div>';}
			if (!is_numeric($cash)){$errormsg_tr =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+amount'].'</p></div>';}
			$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			
				
			if (!isset($errormsg_tr)) {
			if (@mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`=cash+'$cash'  WHERE `login`='$login'")) 
			{
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash-'$cash'  WHERE `login`='{$_SESSION['admin']}'");
					if ($cash>0){$type=$lang['to'];}else{$type=$lang['from'];}
					$errormsg_tr =  '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>'.$lang['Transfered'].' <span style="color:green">'.abs($cash).' '.$_SESSION['currency'].'</span> '.$type.' '.$lang['user'].' <strong>'.$login.'</strong> '.$lang['successfully'].'</p></div>';
					$amount = $cash;
					$date = date('Y-m-j H:i:s');
					$time = date('H:i:s');
					if ($_POST['affpay']==1){
						$notes = 'aff';
					}
					if ($amount>0) {
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status,notes) VALUES ('$staffid','$agentCash','$id','$amount','$date','admin','user','1','$notes')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}elseif($amount<0) { 
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status,notes) VALUES ('$id','$playerCash','$staffid','$amount','$date','user','admin','1','$notes')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}elseif($amount==0){
						$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';	
					}
				}else { 
					$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
				}
			}
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE `id`='".antisqli($_POST['id'])."'"));
if ($_POST['update']!==1 && $_POST['affpay']==1){
	echo '<p><strong>'.$lang['Please+confirm+the+payment+below'].'!</strong></p>';
}
?>

<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<div style="width:100%;text-align:center">
<form name="ff1" onsubmit="return false">
<fieldset>
<div class="widget">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png">
        <h6><?=$lang['Transfer+Funds+to+User+from+your+Balance+of']?>
        <span style="color:green"><?php echo cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM `cws_staffs` WHERE `login`='{$_SESSION['admin']}'"),0),2);?> <?=$_SESSION['currency']?></span><br /><span style="color:red" id="updated">
        <?php
        if (isset($errormsg_tr)){
			echo $errormsg_tr;
		}?>
        </span>
        </h6>
    </div>
    <div class="formRow" style="text-align:left">
	<label><?=$lang['Player+Username']?></label>
	<div class="formRight"><select id="login" onchange="refresh_credit()">
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE owner IN ($subAgents) ORDER BY login");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['login'].'"';
		if ($_POST['login']==$row['login']){
			echo 'selected="selected"';
		}
		echo '>'.$row['login'].'</option>';
		if (!isset($refresh_credit)){
			$refresh_credit = cash_format_cws($row['cash'],2,'.','');
		}
		if (!isset($refresh_cashin)){
			$refresh_cashin = cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(amount),0) FROM cws_deposits WHERE user='{$row['login']}' AND status='1'"),0),2,'.','');
		}
		if (!isset($online)){
			if (checkloggedin($row['login'])=='yes'){
				$online = '<span style="color:green">ONLINE</span>';
			}else{
				$online = '<span style="color:red">OFFLINE</span>';
			}
		}
	}
	
	?>
    </select><span id="checkonline" style="font-weight:bold"><?=$online?></span>
    </div>
    <div class="clear"></div>
    </div>
    
<div class="formRow" style="text-align:left" id="refresh_data">
   <label><?=$lang['PLAYER+CREDIT']?></label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_credit?></span></div>
   <div class="clear"></div>
   <label><?=$lang['TOTAL+DEPOSIT']?></label>
   <div class="formRight"><span class="cash" style="font-weight:bold"><?=$refresh_cashin?></span></div>
   <div class="clear"></div>
</div>

<div class="formRow" style="text-align:left">
	<label><?=$lang['Amount+to+transfer']?></label>
	<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=antisqli($_POST['cash'])?>" style="width:170px;color:green;" onkeyup="check_negative(this.value)"/><?=$_SESSION['currency']?></div>
	<div class="clear"></div>
</div>
<div class="formRow" style="text-align:left">
   <label>CASH <span style="color:red">IN</span></label>
   <div class="formRight"><input type="checkbox" name="cashin" id="cashin" value="1" checked/></div>
   <div class="clear"></div>
</div>
<div class="formRow" style="text-align:left">
   <label>CASH <span style="color:red">OUT</span></label>
   <div class="formRight"><input type="checkbox" name="cashout" id="cashout" value="1"/></div>
   <div class="clear"></div>
</div>
<?php if (AFFILIATES==1){?>
<div class="formRow" style="text-align:left">
<label><?=$lang['AFFILIATE+PAYMENT']?></label>
<div class="formRight"><input type="checkbox" name="affpay" id="affpay" <?php if ($_POST['affpay']==1){echo 'checked';}?> /></div>
<div class="clear"></div>
</div>
    <?php }?>
<div class="formRow" style="text-align:left">
<a href="#updated" class="button dblueB" id="update" style="padding:5px 49px 10px 40px"><span><?=$lang['Transfer']?></span></a>
</div>
</div>
</fieldset>
</form>
</div>
<script type="text/javascript">
$("#update").click(function() {
				var login = $("#login option:selected").val();
				var cash = $("#cash").val();
				if(document.ff1.cashin.checked == true) { var cashin = '&cashin=1';}else {cashin = '&cashin=0';}
				if(document.ff1.cashout.checked == true) { var cashout = '&cashout=1';}else {cashout = '&cashout=0';}
				if(document.ff1.affpay.checked == true) { var affpay = '&affpay=1';}else {affpay = '&affpay=0';}
				showparam('transfer_funds_u','update=1&'+'login='+login+'&'+'cash='+cash+cashout+cashin+affpay);
							 });
function check_negative(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#cash").val('');
	}
}
function refresh_credit(){
		var login = $("#login option:selected").val();	
		$.post("./includes/show/transfer_funds_u.inc.php", {refresh_credit:1,login: login}, function(welcome) { $("#refresh_data").html(welcome); // send data to the php
		}); 
		$.post("./includes/show/transfer_funds_u.inc.php", {checkonline:1,login: login}, function(welcome) { $("#checkonline").html(welcome); // send data to the php 
		});
}
$("#cashout").click(function() {
	$("#cashin").attr("checked", false);	
	$.uniform.update();
});
$("#cashin").click(function() {
	$("#cashout").attr("checked", false);	
	$.uniform.update();
});
refresh_credit();
$(function(){
	$("select, input:checkbox").uniform();
});
</script>
