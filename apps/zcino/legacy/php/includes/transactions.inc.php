<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
?>
<div style="padding-top:20px;text-align:center"><h2><?php echo $lang['Transactions+history']?></h2></div>
<br /><br /><br />
<div id="yourDetails" style="padding-top:30px">
			  <table width="760" height="25" cellspacing="5" style="border-color:#000; border-style:dotted;">
						<tr>
                        	<td width="48" style="color:#999;text-align:center">ID</td>
							<td width="84" style="color:#999;text-align:center"><?php echo $lang['Date']?></td>
                            <td width="82" style="color:#999;text-align:center"><?php echo $lang['Payment+Method']?> </td>
							<td width="103" style="color:#999;text-align:center"><?php echo $lang['Type']?> </td>
							<td width="115" style="color:#999;text-align:center"><?php echo $lang['Amount']?></td>
							<td width="54" style="color:#999;text-align:center"><?php echo $lang['From']?></td>
						    <td width="126" style="color:#999;text-align:center"><?php echo $lang['To']?></td>
</tr>
<?php		
if (!is_numeric($_GET['page']) ||$_GET['page']<0 ||!isset($_GET['page']) ||empty($_GET['page'])){$_GET['page'] = 1;}
$page = antisqli($_GET['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;  

$sql = mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='{$_SESSION['username']}'") or error_report('0_'.mysqli_error($GLOBALS['con']));
$userid = mysqli_result($sql,0);
$query = "(SELECT * FROM cws_deposits WHERE `user`='{$_SESSION['username']}') UNION (SELECT * FROM cws_withdrawals WHERE `user`='{$_SESSION['username']}') UNION (SELECT id,'{$_SESSION['username']}' AS user,'' AS email,amount,date,'ADMIN TRANSFER' as type,status,notes,'' AS details,'N/A' AS ip FROM cws_transfers WHERE `receiver_type`='user' AND receiver_id='{$_SESSION['userid']}') ORDER BY `date` DESC LIMIT $l1,$perpage";
$result = mysqli_query($GLOBALS['con'],$query) or error_report('1_'.mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($result)==0){
	echo '<tr><td colspan="7" align="center"><br />'.$lang['No+results+found'].'</td></tr>';
}
$i=0;
while($row = mysqli_fetch_assoc($result)) {
	$i++;
	if (strlen($row['email'])<1) { 
		if ($row['notes']=='withdraw'){
			$to = $row['user'];
		}else{
			$to = $_SESSION['username'];
		}
	}else{
		$to = $row['email'];
	}
	if ($row['notes']=='withdraw' || $row['notes']=='aff' || $row['notes']=='') {
		$from ='Casino';
	}
	elseif($row['notes']=='deposit') {
		$from=$row['user'];
	}else {
		$from = $row['user'];
	}
	if ($row['notes']=='withdraw'){$row['id']='W'.$row['id'];}elseif($row['notes']=='deposit'){$row['id']='D'.$row['id'];}else{$row['id']='T'.$row['id'];}
	if ($row['notes']=='aff'){$row['notes'] = 'AFFILIATE PAYMENT';}
	if ($row['notes']==''){$row['notes'] = 'transfer';}
	$fee = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `transfer_fee` FROM cws_settings"),0);
	if ($from!==$l && $from!=='Casino' && $row['notes']=='transfer'){
		$row['amount'] = $row['amount']*(100-$fee)/100;
	}
	if ($from!==$l) {$style = "<span style='color:#00FF00;font-weight:bold;font-size:13px'>$row[amount] {$_SESSION['currency']}</span>";} else { $style="<span style='color:red;font-weight:bold;font-size:13px'>-$row[amount] {$_SESSION['currency']}</span>";}
	if ($i%2==0){
		$tdstyle = 'style="background-color:#333;text-align:center"';
	} else {$tdstyle = 'style="text-align:center"';}
	echo "			  <tr $tdstyle>
						  <td $tdstyle><strong>{$row['id']}</strong></td>
						  <td $tdstyle><span style=\"color:#09C;font-weight:bold\">{$row['date']}</span></td>
						  <td $tdstyle><span style=\"color:orange;font-weight:bold\">{$row['type']}</span></td>
						  <td $tdstyle><strong>{$row['notes']}</strong></td>
						  <td $tdstyle>$style</td>
						  <td $tdstyle><span style=\"color:red;font-weight:bold\">$from</span></td>
						  <td $tdstyle><span style=\"color:green;font-weight:bold\">$to</span></td>
					  </tr>
					      ";					  
}
?>
</table></div>
<br /><br /><br />
<div style="text-align:center;width:700px;">
<?php                        
			$sql = mysqli_query($GLOBALS['con'],"(SELECT * FROM cws_deposits WHERE `user`='{$_SESSION['username']}') UNION (SELECT * FROM cws_withdrawals WHERE `user`='{$_SESSION['username']}') UNION (SELECT id,'{$_SESSION['username']}' AS user,amount,'' AS email,date,'ADMIN TRANSFER' as type,status,notes,'' AS details,'N/A' AS ip FROM cws_transfers WHERE `receiver_type`='user' AND receiver_id='{$_SESSION['userid']}')") or error_report('2_'.mysqli_error($GLOBALS['con']));       
			$pages = ceil(mysqli_num_rows($sql)/10);
			for ($i=1;$i<=$pages;$i++) {
				echo "<a href=\"#page\" style='background-color:#000;color:#09C' onclick=\"transPage('".$i."')\">".$i.'</a>&nbsp; ';
			}
			?>
<script type="text/javascript">
function transPage(page) {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px"><img src="images/loader.gif" height="45" width="45"/></div>').load("includes/transactions.inc.php?page="+page).fadeIn('slow');
			});
		}
</script>
</div>