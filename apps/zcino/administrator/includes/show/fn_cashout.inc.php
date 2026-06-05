<?php
//this php file manages the profit cash out
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
<h3 style="margin-left:10px;"><?=$lang['Cash+Out']?><span style="color:red">
<?php
$newvalue = antisqli($_POST['newvalue']);
$profit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `currentprofit` FROM `bank_tbl`"),0);
if (isset($_POST['update'])) { 
	if ($newvalue>$profit) { 
		echo $lang['You+dont+have+that+much+profit'];
		}
		else {
			$newvalue = antisqli($_POST['newvalue']);
			if (mysqli_query($GLOBALS['con'],"UPDATE `cws_profitpurse` SET `totalcashedout`=totalcashedout+'$newvalue',`currentprofit`=currentprofit-'".($newvalue)."'")) 
			{
				mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET currentprofit=currentprofit-'{$newvalue}'");
					echo $newvalue.' '.$_SESSION['currency'].' '.$lang['successfully'];
				} else { 
					echo $lang['Failed'];
				}
		}
	}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_profitpurse"));
?>
</span>
</h3>
<h5><?=$lang['Total+Cash+Out']?>: <span class="cash"><?=cash_format_cws($row['totalcashedout'],2)?> <?=$_SESSION['currency']?></span> (<?=$lang['The+profit+that+has+been+withdrawn+from+the+system']?>)<br />
<?=$lang['Possible+Cash+Out']?> = <?=$lang['Current+profit']?>: <span class="cash"><?=cash_format_cws($profit,2)?> <?=$_SESSION['currency']?></span> (<?=$lang['The+profit+that+can+be+withdrawn+from+the+system']?>) 
</h5>
<div style="text-align:left;padding-left:25px;">
<input type="text" class="text small" name="smallfield" id="newvalue" value="<?=$profit?>"/>
<input type="submit" class="btn def" id="update" value="<?=$lang['Cash+Out']?>"/>
<script type="text/javascript">
$("#update").click(function() {
				var newvalue = $("#newvalue").val();
				showparam('fn_cashout','update=1&'+'newvalue='+newvalue);
							 });
</script>
</div>
