<?php
//this php file generates a PDF invoice for money transfers ( staff to player , player to player )
//powered by zcino
session_start();
error_reporting(E_ERROR | E_PARSE);
define(PERMISSIONS,'1');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/connection.inc.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/functions.inc.php');
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/common_fc.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE `".$_SESSION['adminlvl']."`='1' AND status='1' AND shortname='$filename'");
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
if (isset($_GET['id']) && is_numeric($_GET['id'])){
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
	$owner = @mysqli_result($sql,0);
	if ($owner!=='admin' ||$agent!=='admin'){getMasterAgent1($owner);}else{return $agent;}
}
//check if sender type is not user
$receiver_type = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT receiver_type FROM cws_transfers WHERE id='$id'"),0);
$sender_type = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT sender_type FROM cws_transfers WHERE id='$id'"),0);
if ($sender_type=='user'){
	echo 'Invoice not available. Sender must be admin/agent.';
	exit;	
}
$receiver_id = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT receiver_id FROM cws_transfers WHERE receiver_type='admin' AND id='$id'"),0);
if ($receiver_id!==""){
	$tmp = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$receiver_id'"),0);
	$masterChkd[] = $tmp;
}
$sender_id = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT sender_id FROM cws_transfers WHERE sender_type='admin' AND id='$id'"),0);
if ($sender_id!==""){
	$tmp = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$sender_id'"),0);
	$masterChkd[] = $tmp;
}

$sq = mysqli_query($GLOBALS['con'],"SELECT receiver_id FROM cws_transfers WHERE id='$id'") or error_report(mysqli_error($GLOBALS['con']));
$owner = @mysqli_result($sq,0);//ticket owner
if ($receiver_type=='user'){
	$owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='$owner'"),0);
	$agent_of_owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_users WHERE login='$owner'"),0);
}elseif($receiver_type=='admin'){
	$owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$owner'"),0);
	$agent_of_owner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT owner FROM cws_staffs WHERE login='$owner'"),0);
}

if ($receiver_type=='admin'){
	$agent = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$receiver_id'"),0);
	$agency = getMasterAgent1($agent);//subagents list becomes list of all owners of agent
}
if ($sender_type=='admin'){
	$agent = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_staffs WHERE id='$sender_id'"),0);
	$agency = getMasterAgent1($agent);//subagents list becomes list of all owners of agent
}
	
if ($receiver_type=='user'){
	$agency = $_SERVER['SERVER_NAME'];
}

$subAgentsList = trim($subAgentsList,',');
$subAgentsList = str_replace(",''",'',$subAgentsList);
//print_r($masterChkd);
//allow this invoice to be seen if current admin is owner of receiver or sender, not just of receiver
if (in_array($_SESSION['admin'],$masterChkd) || $_SESSION['adminlvl']=='admin') {
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
		$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_transfers WHERE id='$id'")or error_report(mysqli_error($GLOBALS['con']));
		$invoice = mysqli_fetch_array($q);
		if ($invoice['receiver_type']=='user'){
			$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_users WHERE id='{$invoice['receiver_id']}'")or error_report(mysqli_error($GLOBALS['con']));
			$user = mysqli_fetch_array($q);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE id='{$invoice['receiver_id']}'")or error_report(mysqli_error($GLOBALS['con']));
			$user = mysqli_fetch_array($q);
		}	
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
		$pdf->Cell(15,30,'Name: '.$user['name'],0,0,'L',0);
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
		$pdf->FancyTable(array('Description','Other details','Amount'),array(0=>array(0=>'Funds transfer',1=>'-',2=>$invoice['amount'])));
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