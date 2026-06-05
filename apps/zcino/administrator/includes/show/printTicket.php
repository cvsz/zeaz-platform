<?php
session_start();
define('EURO',chr(128));
require_once('../../../includes/connection.inc.php');
require_once('../functions.inc.php');
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
$ticketid = isset($_POST['ticketId'])?antisqli($_POST['ticketId']):antisqli($_GET['id']);
subAgentsList($_SESSION['admin']);
$squery = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_vdog_tickets_v2 WHERE ticketid='$ticketid'"),0);//ticket owner
$owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$squery'"),0);//who created the ticket owner
if (!in_array($owner,$chkdList) && $_SESSION['admin']!==$owner && $_SESSION['adminlvl']!=='admin'){
	$errormsg = $lang['Invalid+action'];
	//print_r($chkdList);
	echo 'Error:'.$errormsg;
	exit;
}
do_print_ticket($ticketid);

	
function do_print_ticket($ticketid) {
global $owner,$agency;
$agent_of_owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$owner'"),0);
if ($agent_of_owner=='0' ||$agent_of_owner==""){
		$agency = $_SERVER['SERVER_NAME'];
	}else {
		$agent_of_owner = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_staffs WHERE login='$agent_of_owner'"),0);
		$agency = getMasterAgent($agent_of_owner);
	}
require_once('../../../pdf/classpdf.php');
$ticketsql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_vdog_tickets_v2 WHERE ticketid='$ticketid'");
$raceid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT raceid FROM cws_vdog_tickets_v2 WHERE ticketid='$ticketid'"),0);
$rows = mysqli_num_rows($ticketsql);
$rownumber=4;
$yheight=10;
$xspacing=28;
$top = 10;
$left=6;
$pdf=new PDF('P','mm','A4');
$pdf->SetAutoPageBreak('false','0');
$pdf->Open();
$pdf->AddPage();
$pdf->SetDrawColor(200);

$pdf->SetFont('Courier','B',22);

$pdf->ImagePngWithAlpha('../../../images/logo.png',55,10,110,0);

$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+$xspacing*1+7,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'Agency:',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$agency,0,0,'C',0);
$rownumber++;

$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+$xspacing*1+7,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'Owner:',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$owner,0,0,'C',0);
$rownumber++;

$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+$xspacing*1+7,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'Date:',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,mysqli_result($ticketsql,0,'date'),0,0,'C',0);
$rownumber++;

$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+$xspacing*1+7,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$lang['Race'].' ID:',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$raceid,0,0,'C',0);
$rownumber++;

$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+$xspacing*1+7,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$lang['Ticket'].' ID:',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$ticketid,0,0,'C',0);
$rownumber++;

$pdf->SetXY(6,$top+15+$yheight*$rownumber);
$pdf->Line(9, $top+15+$yheight*$rownumber+4, 202,$top+15+$yheight*$rownumber+4);

$pdf->SetXY($left+$xspacing*1,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'#',0,0,'C',0);

$pdf->SetXY($left+$xspacing*2,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'TYPE',0,0,'C',0);
$pdf->SetXY($left+$xspacing*3,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'DOG',0,0,'C',0);
$pdf->SetXY($left+$xspacing*4,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'ODDS',0,0,'C',0);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'BET',0,0,'C',0);
$pdf->SetXY($left+$xspacing*6,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'TO WIN',0,0,'C',0);

$i=0;
$ticketsql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_vdog_tickets_v2 WHERE ticketid='$ticketid'");
while ($row = mysqli_fetch_array($ticketsql)){
	if ($top+10+$yheight*$rownumber>250){
		$pdf->AddPage();
		$pdf->SetTopMargin(0);
		$top = -10;
		$rownumber = -1;
	}
	$rownumber++;
	$i++;
	$pdf->SetXY($left+$xspacing*1,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$i,0,0,'C',0);
	$pdf->SetXY($left+$xspacing*2,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$row['type'],0,0,'C',0);
	$pdf->SetXY($left+$xspacing*3,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$row['dog'],0,0,'C',0);
	$pdf->SetXY($left+$xspacing*4,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$row['odds'],0,0,'C',0);
	$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$row['bet'].''.EURO,0,0,'C',0);
	$pdf->SetXY($left+$xspacing*6,$top+10+$yheight*$rownumber);
	$pdf->Cell(15,30,$row['bet']*$row['odds'].''.EURO,0,0,'C',0);
	$bet+=$row['bet'];
	$won+=$row['bet']*$row['odds'];
}
$pdf->SetXY(6,$top+15+$yheight*$rownumber);
$pdf->Line(9, $top+15+$yheight*(1+$rownumber)+4, 202,$top+15+$yheight*(1+$rownumber)+4);
$rownumber++;
$pdf->SetFont('Courier','B',22);
$pdf->SetXY($left+31,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,'TOTAL :',0,0,'C',0);
$pdf->SetFont('Courier','',22);
$pdf->SetXY($left+$xspacing*5,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$bet.''.EURO,0,0,'C',0);
$pdf->SetXY($left+$xspacing*6,$top+10+$yheight*$rownumber);
$pdf->Cell(15,30,$won.''.EURO,0,0,'C',0);

$pdf->SetXY($left+36,$top+15+$yheight*$rownumber);
$pdf->Line(9, $top+15+$yheight*(1+$rownumber)+4, 202,$top+15+$yheight*(1+$rownumber)+4);
$rownumber+=2;
$pdf->SetXY(42,$top+10+$yheight*$rownumber);
$pdf->Cell(125,30,$_SERVER['SERVER_NAME'],0,0,'C',0);

$pdf->Output();
	
}
?>
