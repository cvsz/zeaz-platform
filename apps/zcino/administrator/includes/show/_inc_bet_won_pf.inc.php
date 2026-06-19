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
//calculate total value of bets
//calculate total nr of bets
//calculate avg bet per day
//calculate today value of bets TODAY
//calculate today nr of bets TODAY
$bets['todayValue'] = getMyPlayers('bet',date('Y-m-d H:i:s',time()),date('Y-m-d H:i:s',time()),$_SESSION['admin']);
$bets['totalValue'] = getMyPlayers('bet',0,0,$_SESSION['admin']);

if ($bets['todayValue']>0){
	$betUpdate = round($bets['todayValue']*100/$bets['totalValue']);
}else{
	$betUpdate = 0;	
}
?>
<?php
//calculate total value of wons
//calculate total nr of wons
//calculate avg won per day
//calculate today value of wons TODAY
//calculate today nr of wons TODAY
$wons['todayValue'] = getMyPlayers('won',date('Y-m-d H:i:s',time()),date('Y-m-d H:i:s',time()),$_SESSION['admin']);
$wons['totalValue'] = getMyPlayers('won',0,0,$_SESSION['admin']);

if ($wons['todayValue']>0){
	$wonUpdate = round($wons['todayValue']*100/$wons['totalValue']);
}else{
	$wonUpdate = 0;	
}
//echo $bets['todayValue'].'-'.$wons['todayValue'].'*100/'.$bets['totalValue'].'-'.$wons['totalValue'];
$totalProfit = $bets['totalValue']-$wons['totalValue'];
$todayProfit = $bets['todayValue']-$wons['todayValue'];
//echo 'TODAY = '.$todayProfit;
//echo '   Total = '.$totalProfit;
if ($totalProfit<0 && $todayProfit>0){//if today profit>all time profit, then everything is positive)
	$pfUpdate = ((abs($totalProfit)+$todayProfit)/abs($totalProfit)) * 100;
}elseif($totalProfit<0 && $todayProfit<0){
	$pfUpdate = -($todayProfit*100/$totalProfit);
}elseif($totalProfit==0){
	$pfUpdate = 0;
}else{
	$pfUpdate = $todayProfit*100/$totalProfit;
}

?>
<?php
$betUpdate = round($betUpdate);
$wonUpdate = round($wonUpdate);
$pfUpdate = round($pfUpdate);
$cash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
$cash = cash_format_cws($cash,2).' '.$_SESSION['currency'];
echo json_encode(array("cash"=>"$cash","betUpdate"=>"$betUpdate","wonUpdate"=>"$wonUpdate","pfUpdate"=>"$pfUpdate"));
?>