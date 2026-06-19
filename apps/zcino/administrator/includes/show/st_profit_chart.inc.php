<?php
//this php file calculates and shows all the earnings of the current logged in staff . It shows TODAY's earnings and ALL TIME earnings
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
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
	<title>Profit Evolution</title>
	<link href="http://<?=$_SERVER['SERVER_NAME']?>/administrator/css/basic.css" type="text/css" rel="stylesheet" />
	<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/enhance.js"></script>		
	<script type="text/javascript">
		// Run capabilities test
		enhance({
			loadScripts: [
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/excanvas.js',
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/jquery-1.4.4.js',
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/visualize.jQuery.js',
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/example.js'
			],
			loadStyles: [
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/css/visualize.css',
				'http://<?=$_SERVER['SERVER_NAME']?>/administrator/css/visualize-light.css'
			]	
		});   
    </script>
</head>
<body>
<?php 
$days = array(
date('Y-m-d',strtotime('-10 days',time())),
date('Y-m-d',strtotime('-9 days',time())),
date('Y-m-d',strtotime('-8 days',time())),
date('Y-m-d',strtotime('-7 days',time())),
date('Y-m-d',strtotime('-6 days',time())),
date('Y-m-d',strtotime('-5 days',time())),
date('Y-m-d',strtotime('-4 days',time())),
date('Y-m-d',strtotime('-3 days',time())),
date('Y-m-d',strtotime('-2 days',time())),
date('Y-m-d',strtotime('-1 days',time())),
date('Y-m-d',time())
);
//print_r($days);
?>
<table width="924">
	<caption>NET <?=$lang['Daily+Profit+in+last+10+days']?><br /><span style="font-size:9px">(<?=$lang['value+of+profit+in+each+day']?> - <?=$lang['see+in+which+days+the+profit+was+the+biggest']?>)</span></caption>
	<thead>
		<tr>
			<td width="120"><?=$lang['Date']?></td> 
			<th width="126" scope="col"><?=date('M-d',strtotime($days[0]))?></th>
			<th width="69" scope="col"><?=date('M-d',strtotime($days[1]))?></th>
			<th width="71" scope="col"><?=date('M-d',strtotime($days[2]))?></th>
			<th width="73" scope="col"><?=date('M-d',strtotime($days[3]))?></th>
			<th width="55" scope="col"><?=date('M-d',strtotime($days[4]))?></th>
			<th width="55" scope="col"><?=date('M-d',strtotime($days[5]))?></th>
			<th width="55" scope="col"><?=date('M-d',strtotime($days[6]))?></th>
			<th width="55" scope="col"><?=date('M-d',strtotime($days[7]))?></th>
            <th width="55" scope="col"><?=date('M-d',strtotime($days[8]))?></th>
			<th width="55" scope="col"><?=date('M-d',strtotime($days[9]))?></th>
            <th width="83" scope="col"><?=date('M-d',strtotime($days[10]))?></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="row"><?=$lang['Profit']?></th>
			<?php
			$staff = $_SESSION['admin']; // current logged in agent or requested agent
			$stafftype = $_SESSION['adminlvl'];
			$percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT percent/100 as percent FROM `cws_staffs` WHERE login='{$_SESSION['admin']}'"),0);
			?>
            <td>
            <?php
			//-10 days
			//echo 'DATE='.date('Y-m-d',strtotime('-10 days',time()));
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-10 days',time())).' 00:00:00',date('Y-m-d',strtotime('-10 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-10 days',time())).' 00:00:00',date('Y-m-d',strtotime('-10 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-10 days',time())).' 00:00:00',date('Y-m-d',strtotime('-10 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-9 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-9 days',time())).' 00:00:00',date('Y-m-d',strtotime('-9 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-9 days',time())).' 00:00:00',date('Y-m-d',strtotime('-9 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-9 days',time())).' 00:00:00',date('Y-m-d',strtotime('-9 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-8 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-8 days',time())).' 00:00:00',date('Y-m-d',strtotime('-8 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-8 days',time())).' 00:00:00',date('Y-m-d',strtotime('-8 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-8 days',time())).' 00:00:00',date('Y-m-d',strtotime('-8 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-7 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-7 days',time())).' 00:00:00',date('Y-m-d',strtotime('-7 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-7 days',time())).' 00:00:00',date('Y-m-d',strtotime('-7 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-7 days',time())).' 00:00:00',date('Y-m-d',strtotime('-7 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-6 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-6 days',time())).' 00:00:00',date('Y-m-d',strtotime('-6 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-6 days',time())).' 00:00:00',date('Y-m-d',strtotime('-6 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-6 days',time())).' 00:00:00',date('Y-m-d',strtotime('-6 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-5 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-5 days',time())).' 00:00:00',date('Y-m-d',strtotime('-5 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-5 days',time())).' 00:00:00',date('Y-m-d',strtotime('-5 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-5 days',time())).' 00:00:00',date('Y-m-d',strtotime('-5 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-4 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-4 days',time())).' 00:00:00',date('Y-m-d',strtotime('-4 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-4 days',time())).' 00:00:00',date('Y-m-d',strtotime('-4 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-4 days',time())).' 00:00:00',date('Y-m-d',strtotime('-4 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-3 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-3 days',time())).' 00:00:00',date('Y-m-d',strtotime('-3 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-3 days',time())).' 00:00:00',date('Y-m-d',strtotime('-3 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-3 days',time())).' 00:00:00',date('Y-m-d',strtotime('-3 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-2 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-2 days',time())).' 00:00:00',date('Y-m-d',strtotime('-2 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-2 days',time())).' 00:00:00',date('Y-m-d',strtotime('-2 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-2 days',time())).' 00:00:00',date('Y-m-d',strtotime('-2 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-1 days
			$won = getMyPlayers('won',date('Y-m-d',strtotime('-1 days',time())).' 00:00:00',date('Y-m-d',strtotime('-1 days',time())).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',strtotime('-1 days',time())).' 00:00:00',date('Y-m-d',strtotime('-1 days',time())).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',strtotime('-1 days',time())).' 00:00:00',date('Y-m-d',strtotime('-1 days',time())).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
            <td>
            <?php
			//-0 days
			$won = getMyPlayers('won',date('Y-m-d',time()).' 00:00:00',date('Y-m-d',time()).' 23:59:59',$_SESSION['admin']);
			$bets = getMyPlayers('bet',date('Y-m-d',time()).' 00:00:00',date('Y-m-d',time()).' 23:59:59',$_SESSION['admin']);
			$playersRev = ($bets-$won)*$percent;
			$fromSubAgents = calculate_all_share($_SESSION['admin'],$percent,0,date('Y-m-d',time()).' 00:00:00',date('Y-m-d',time()).' 23:59:59',1);
			$profit = $playersRev+$fromSubAgents;
			echo cash_format_cws($profit,0,'.','');
			?>
            </td>
		</tr>	
	</tbody>
</table>	
</body>
</html>