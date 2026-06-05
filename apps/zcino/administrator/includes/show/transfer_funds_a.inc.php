<?php 
//this php file manages the transfer of funds/credits to an agent
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
<?php 
if (isset($_POST['login'])) { 
	$login = antisqli($_POST['login']);
	$query = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_staffs` WHERE `login`='{$login}'");
	if (mysqli_num_rows($query)>0){
		//echo mysqli_result($query,0);
	}else{
		echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.''.$lang['Invalid+username'].'</p></div>';
		exit;
	}
if($_SESSION['adminlvl']!=='admin' && isset($_POST['login'])){
		$subAgentsList = '';
		subAgentsList($_SESSION['admin']);
		$login = antisqli($_POST['login']);
		$squery = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_staffs WHERE login='$login'");
		if (mysqli_num_rows($squery)>0){
			$login = mysqli_result($squery,0);
		}else{
			$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+user'].'</p></div>';
			echo $errormsg;
			exit;
		}
		if (!in_array($login,$chkdList) && $login!==$_SESSION['admin']){
			$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+action'].'</p></div>';
			echo $errormsg;
			exit;
		}
	}
}
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<?php if (isset($_POST['update'])) { 
			$login = antisqli($_POST['login']);
			$id = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='$login'"),0);
			$cash = antisqli($_POST['cash']);
			if (antisqli($_POST['cashout'])==1){
				$cash = -abs($cash);
			}else{
				$cash = abs($cash);
			}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE login='$login'"))==0){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';}
			$agentCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='$login'"),0);
			if ($cash<0 && abs($cash)>$agentCash) {$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'</p></div>';}
			$adminCash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			if ($adminCash<$cash){$errormsg =  '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Insufficient+Funds'].'</p></div>';}
			if (!is_numeric($cash)){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+amount'].'</p></div>';}
			$staffid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			
			if ($_SESSION['admin']==$login){$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Invalid+username'].'</p></div>';}
				
			if (!isset($errormsg)) {
			if (@mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash+'$cash'  WHERE `login`='$login'")) 
			{
					mysqli_query($GLOBALS['con'],"UPDATE `cws_staffs` SET `cash`=cash-'$cash'  WHERE `login`='{$_SESSION['admin']}'");
					if ($cash>0){$type=$lang['to'];}else{$type=$lang['from'];}
					$errormsg = '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>'.$lang['Transfered'].' <span style="color:green">'.abs($cash).' '.$_SESSION['currency'].'</span> '.$type.' '.$lang['agent'].' <strong>'.$login.'</strong> '.$lang['successfully'].'</p></div>';
					$amount = $cash;
					$date = date('Y-m-j H:i:s');
					$time = date('H:i:s');
					if ($amount>0) {
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$staffid','$adminCash','$id','$amount','$date','admin','admin','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}elseif($amount<0){
						$amount=abs($amount);
						mysqli_query($GLOBALS['con'],"INSERT INTO `cws_transfers` (sender_id,sender_cash_b4,receiver_id,amount,date,sender_type,receiver_type,status) VALUES ('$id','$agentCash,'$staffid','$amount','$date','admin','admin','1')");
						$lastid = mysqli_insert_id($GLOBALS['con']);
					}else{
						$errormsg_tr = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
					}
				}else { 
					$errormsg = '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$lang['Failed'].'</p></div>';
				}
			}
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE `id`='".antisqli($_POST['id'])."'"));
?>
<script type="text/javascript">
function open_invoice(id){
	mywindow = window.open("includes/show/pdf_invoice_tr.php?id="+id, "PDF Invoice", "location=1,status=1,scrollbars=1,  width=500,height=500");
}
</script>


<div style="width:100%;text-align:center">
<form name="ff1" onsubmit="return false">
<fieldset>
<div class="widget">
    <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png">
        <h6><?=$lang['Transfer+Funds+to+Agent+from+your+Balance+of']?>
        <span style="color:green"><?php echo cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `cash` FROM `cws_staffs` WHERE `login`='{$_SESSION['admin']}'"),0),2);?></span><br /><span style="color:red" id="updated">
        <?php
        if (isset($errormsg)){
			echo $errormsg;
		}?>
        </span>
        <?php if (isset($lastid)){?> <br /><a href="#viewInvoice<?=$lastid?>" onclick="javascript:open_invoice('<?=$lastid?>')"><?=$lang['Click+to+see+INVOICE']?> #<?=$lastid?></a><?php } ?>
        </h6>
    </div>
    <div class="formRow" style="text-align:left">
	<label><?=$lang['Agent+Username']?></label>
	<div class="formRight"><select id="login">
    <?php
	if ($_SESSION['adminlvl']!=='admin') {
	$subAgentsList = "'".$_SESSION['admin']."',";
	subAgentsList($_SESSION['admin']);
		foreach ($chkdList as $agg) {
			$subAgentsList .= "'".$agg."',";
		}
		$subAgentsList = trim($subAgentsList,',');
$subAgentsList = str_replace(",''",'',$subAgentsList);
	if (strlen($subAgentsList)<3){
		$subAgentsList = "'a35a35a35zxc9s'";
	}
	$thefilter = " AND owner IN ($subAgentsList)";
	$query ="SELECT * FROM cws_staffs WHERE 1=1 $thefilter ORDER BY login";
	$sql = mysqli_query($GLOBALS['con'],$query) or error_report(mysqli_error($GLOBALS['con']));
	}else {
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs ORDER BY login");
	}
	while ($row = mysqli_fetch_array($sql)){
		echo '<option value="'.$row['login'].'">'.$row['login'].'</option>';
	}
	?>
    </select>
    </div>
    <div class="clear"></div>
    </div>
<div class="formRow" style="text-align:left">
	<label><?=$lang['Amount+to+transfer']?></label>
	<div class="formRight"><input type="text" class="text small" name="smallfield" id="cash" value="<?=$row['cash']?>" style="width:170px;color:green;" onkeyup="check_negative(this.value)"/><?=$_SESSION['currency']?></div>
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
				showparam('transfer_funds_a','update=1&'+'login='+login+'&'+'cash='+cash+cashout+cashin);
							 });
function check_negative(number){
	if (number<0 ||number.indexOf('-')!=-1 ||isNaN(number)) {
		$("#cash").val('');
	}
}							 
$("#cashout").click(function() {
	$("#cashin").attr("checked", false);	
	$.uniform.update();
});
$("#cashin").click(function() {
	$("#cashout").attr("checked", false);	
	$.uniform.update();
});					
$(function(){
	$("select, input:checkbox").uniform();
});		 
</script>
