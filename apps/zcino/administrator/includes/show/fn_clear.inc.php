<?php
//this php file manages the GO LIVE feature. When this is activated , all user,staff,gameplays,deposits,withdrawals,transfers,tickets records are deleted from the database, and the jackpots are set to 0 - comment out line 24 to remove the modifications of jackpots
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
if ($demoMode!==1){
?>
<?php
if ($_POST['clear']=='1'){
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_deposits`")){echo 'Table <span style="color:red">`cws_deposits`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_deposits` AUTO_INCREMENT =1;");
	
	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_transfers`")){echo 'Table <span style="color:red">`cws_transfers`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_transfers` AUTO_INCREMENT =1;");

	if (mysqli_query($GLOBALS['con'],"DELETE FROM `cws_withdrawals`")){echo'Table <span style="color:red">`cws_withdrawals`</span> cleared<br />';}else{echo mysqli_error($GLOBALS['con']).'<br />';}
	@mysqli_query($GLOBALS['con'],"ALTER TABLE  `cws_withdrawals` AUTO_INCREMENT =1");

	echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
	echo 'All financial records have been cleared';
	echo '</p></div>';
	
}else{
	?>
<div id="linkheader"><?=$lang['Finances']?><span style="color:#000">&gt;&gt;&gt;</span><a href="#" onclick="showparam('fn_clear.inc.php')"><?=$lang['Clear+All+Financial+Records']?></a></div><br /><br /><br />  
	<?=$lang['This+will+delete+all+deposits']?>, <?=$lang['all+withdrawals+and+all+transfers+data']?> (<?=$lang['including+data+recorded+when+using+TRANSFER+FUNDS+TO+USER']?> <?=$lang['and+TRANSFER+FUNDS+TO+AGENT+from+administrator+panel']?>)!<br /><br /><br />    
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Clear+All+Financial+Records']?> !" href="#" onclick="clear_gm()"><span><?=$lang['Clear+All+Financial+Records']?> !</span></a>
<?php }?>
<script type="text/javascript">
function clear_gm() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to']?> <?=$lang['delete']?> <?=$lang['all']?> <?=$lang['deposits']?>, <?=$lang['all+withdrawals+and+all+transfers+data']?> ?")) {
				showparam('fn_clear','clear=1');
	}
};
</script>
<?php
}else{
	echo '<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>';	
}
?>