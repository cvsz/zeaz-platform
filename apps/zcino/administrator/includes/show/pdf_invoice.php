<?php
//this php file generates a PDF invoice for deposit
//powered by zcino
session_start();
error_reporting(E_ERROR | E_PARSE);
define(PERMISSIONS,'1');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.inc.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/common_fc.inc.php');
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
if (isset($_GET['id'])){
?>
<?php
define('EURO',chr(128));
$id = antisqli($_GET['id']);
$subAgentsList ='';
//check if the id belongs to admin
$masterChkd = array();
function getMasterAgent1($agent) {
	global $subAgentsList;
	global $masterChkd;
	$masterChkd[] = $agent;
	$subAgentsList .= $agent.',';
	if ($agent=='admin'){return $agent;}
	$sql = mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_staffs WHERE login='$agent'") or error_report(mysqli_error($GLOBALS['con']));
	$owner = mysqli_result($sql,0);
	if ($owner!=='admin' ||$agent!=='admin'){getMasterAgent1($owner);}else{return $agent;}
}
$sq = mysqli_query($GLOBALS['con'],"SELECT user FROM cws_deposits WHERE id='$id'") or error_report(mysqli_error($GLOBALS['con']));
$owner = @mysqli_result($sq,0);
$agent_of_owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$owner'"),0);
if ($agent_of_owner=='0'){
		$agency = $_SERVER['SERVER_NAME'];
	}else {
		$agency = getMasterAgent1($agent_of_owner);//get all the agents and master agents of user and check if logged in agent is amont them
	}
$subAgentsList = trim($subAgentsList,',');
$subAgentsList = str_replace(",''",'',$subAgentsList);
if (in_array($_SESSION['admin'],$masterChkd) ||$_SESSION['adminlvl']=='admin') {
		//echo 't1';
	function generate_invoice($id){	
    //generate pdf
  	//echo 't3';
    require_once('pdf/classpdf.php');
	$company = array(
	'name'=>$_SERVER['SERVER_NAME'],
	'street'=>'St. Street Str 123456',
	'country'=>'COUNTRY',
	'email'=>'contact@'.trim($_SERVER['SERVER_NAME'],'www.'),
	'phone'=>mysqli_result(mysqli_query($GLOBALS['con'],"SELECT phone_number FROM cws_settings"),0)
	);
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE id='$id'")or error_report(mysqli_error($GLOBALS['con']));
	$invoice = mysqli_fetch_array($q);
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users INNER JOIN cws_users_info ON cws_users.id=cws_users_info.id WHERE login='{$invoice['user']}'")or error_report(mysqli_error($GLOBALS['con']));
	$user = mysqli_fetch_array($q);
	if (mysqli_num_rows($q)==0){
		$user = array('name'=>'User "'.$invoice['user'].'" doesnt exist in the database anymore');	
	}
	$q = mysqli_query($GLOBALS['con'],"SELECT code FROM cws_currencies WHERE current='1'")or error_report(mysqli_error($GLOBALS['con']));
	$currency = mysqli_result($q,0);
	$rownumber=0;
	$yheight=6;
	$xspacing=10;
	$top = 1;
	$left=2;
    $pdf=new PDF('P','mm','A4');
	$pdf->Open();
	$pdf->AddPage();
	$pdf->SetMargins(20, 20, 20);
	$pdf->SetDrawColor(200);
	$pdf->Line(20,8,180,8);

	$pdf->SetFont('Helvetica','B',8);
	$pdf->ImagePngWithAlpha('http://'.$_SERVER['SERVER_NAME'].'/images/logo.png',145,12,35,25);
	//invoice #
	$pdf->SetFont('Helvetica','B',9);
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,'Invoice #'.$invoice['id'],0,0,'L',0);
	$pdf->Ln();
	$rownumber++;
	//invoice date
	$pdf->SetFont('Helvetica','',9);
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,'Invoice Date : '.$invoice['date'],0,0,'L',0);
	$rownumber++;
	//invoice date
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,'Payment Date : '.$invoice['date'],0,0,'L',0);
	$rownumber+=3;
	//invoice to
	$pdf->SetFont('Helvetica','B',9);
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,'Invoice To :',0,0,'L',0);
	//company details
	require_once('../company_details.inc.php');
	$pdf->SetFont('Helvetica','',9);
	$pdf->SetXY($left+$xspacing*1+153,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,$company['name'],0,0,'R',0);
	$pdf->SetXY($left+$xspacing*1+153,$top+$yheight*($rownumber+1));
	$pdf->Cell(15,30,$company['street'],0,0,'R',0);
	$pdf->SetXY($left+$xspacing*1+153,$top+$yheight*($rownumber+2));
	$pdf->Cell(15,30,$company['country'],0,0,'R',0);
	$pdf->SetXY($left+$xspacing*1+153,$top+$yheight*($rownumber+3));
	$pdf->Cell(15,30,'Email: '.$company['email'],0,0,'R',0);
	$pdf->SetXY($left+$xspacing*1+153,$top+$yheight*($rownumber+4));
	$pdf->Cell(15,30,'Tel: '.$company['phone'],0,0,'R',0);
	$rownumber++;
	//user name
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,$user['name'],0,0,'L',0);
	$rownumber++;
	//user address
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,$user['street'].','.$user['zip'],0,0,'L',0);
	$rownumber++;
	//user country
	$pdf->SetXY($left+$xspacing*1+7,$top+$yheight*$rownumber);
	$pdf->Cell(15,30,$user['country'],0,0,'L',0);
	$pdf->Ln();
	//table with description and amount
	$invoice['amount'] .= ' '.$currency;
	$pdf->SetFont('','',12);
	$pdf->FancyTable(array('Description','Other details','Amount'),array(0=>array(0=>$invoice['type'],1=>$invoice['email'],2=>$invoice['amount'])));
	$pdf->Ln();
	//total table
    $pdf->SetTextColor(0,0,0);
    $pdf->SetDrawColor(255,255,255);
    $pdf->SetFont('','B');
	$pdf->SetXY($left+$xspacing*1+141,$top+$yheight*($rownumber+5)+2);
    $pdf->Cell(15,30,'Total : '.$invoice['amount'],0,0,'R',0);
	$pdf->SetXY($left+$xspacing*1+141,$top+$yheight*($rownumber+6)+2);
    $pdf->Cell(15,30,'Credit : '.trim($invoice['amount'],$currency),0,0,'R',0); 

	$pdf->Output();
}
		generate_invoice($id);
		//echo 't2';
	}else{
		echo 'Insufficient privileges';
	}

}else{
	echo 'Invalid data';
	}

?>