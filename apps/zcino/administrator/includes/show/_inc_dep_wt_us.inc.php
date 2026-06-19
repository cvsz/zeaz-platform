<?php
//this php file lists all the users of the current logged in staff
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
if ($_POST['update']!=='1'){die('Error');}
?>
<?php
$deposits = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) AS total,(SELECT COUNT(*) FROM cws_deposits WHERE status='1') AS approved,(SELECT COUNT(*) FROM cws_deposits WHERE status='0') AS pending,(SELECT COUNT(*) FROM cws_deposits WHERE status<>'1' AND status<>'0') AS declined,(SELECT COUNT(*) FROM cws_deposits WHERE DATE(date) = DATE(NOW()))AS today FROM cws_deposits"));
?>
<?php
$withdrawals = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) AS total,(SELECT COUNT(*) FROM cws_withdrawals WHERE status='1') AS approved,(SELECT COUNT(*) FROM cws_withdrawals WHERE status='0') AS pending,(SELECT COUNT(*) FROM cws_withdrawals WHERE status<>'1' AND status<>'0') AS declined,(SELECT COUNT(*) FROM cws_withdrawals WHERE DATE(date) = DATE(NOW()))AS today FROM cws_withdrawals"));
?>
<?php
$users = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) AS total,(SELECT COUNT(*) FROM cws_users WHERE status='1') AS approved,(SELECT COUNT(*) FROM cws_users WHERE status='0') AS declined,(SELECT COUNT(*) FROM cws_users WHERE status<>'1' AND status<>'0') AS pending,(SELECT COUNT(*) FROM cws_users_info WHERE DATE(date) = DATE(NOW()))AS today FROM cws_users"));
echo json_encode(
array(
"dtotal"=>$deposits['total'],"dapproved"=>$deposits['approved'],"ddeclined"=>$deposits['declined'],"dpending"=>$deposits['pending'],"dtoday"=>$deposits['today'],
"wtotal"=>$withdrawals['total'],"wapproved"=>$withdrawals['approved'],"wdeclined"=>$withdrawals['declined'],"wpending"=>$withdrawals['pending'],"wtoday"=>$withdrawals['today'],
"utotal"=>$users['total'],"uapproved"=>$users['approved'],"udeclined"=>$users['declined'],"upending"=>$users['pending'],"utoday"=>$users['today']
));
?>