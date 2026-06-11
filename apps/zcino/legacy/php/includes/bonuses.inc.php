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
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}		
?>
<style type="text/css">
.cTable td{
	border-color:#900;
	border-style:double;
	text-align:center;
}
</style>
<div style="padding-top:20px;text-align:center"><h2><?php echo $lang['My+Bonuses']?></h2></div>
<div id="yourDetails" style="padding-top:30px">
			  <table width="760" height="50" cellspacing="5" class="cTable">
						<tr >
                        	<td width="48" height="32" style="color:#999">ID</td>
							<td width="84" style="color:#999"><?=$lang['Bonus+code']?></td>
							<td width="79" style="color:#999"><?php echo $lang['Amount']?></td>
                            <td width="82" style="color:#999"><?php echo $lang['Start+Date']?></td>
							<td width="103" style="color:#999"><?php echo $lang['Progress']?><br /><span style="font-size:9px">(played/must play)</span> </td>
							<td width="115" style="color:#999"><?php echo $lang['Status']?></td>
</tr>
<?php		
$page = antisqli($_GET['page']);
$rows = antisqli($_GET['rows']);
if (!isset($page) || empty($page)){$page = 1;}
if (!isset($rows) || empty($rows)){$rows = 10;}
$l1 = ($page-1) * $rows;
$l2 = $l1+$rows-1;	  
$result = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses WHERE status='1' AND user='{$_SESSION['username']}' LIMIT $l1,$l2") or error_report(mysqli_error($GLOBALS['con']));;
if (mysqli_num_rows($result)==0){echo '<tr><td colspan="6" style="text-align:center">'.$lang['No+results+found'].'</td></tr></table>';exit;}
$i=0;
while($row = mysqli_fetch_assoc($result)) {
	$i++;
	if ($i%2==0){
		$tdstyle= 'style="background-color:#333"';
	} else {$tdstyle='';}
	$mustplay = $row['unlock_limit'] * $row['amount'];
	$totalplayed = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='{$_SESSION['username']}' AND `date`>='{$row['date_started']}'"),0);
	$progress = number_format(($totalplayed*100/$mustplay),2).'%';
	if ($row['status']!=='1'){$status='Unavailable.Contact support!';}elseif ($row['redeemed']=='1'){$status = 'Redeemed on '.$row['date_activated'];}elseif ($totalplayed*100/$mustplay < 1 ) {$status = 'In progress';}elseif ($totalplayed*100/$mustplay>=1){$status='<a href="#Redeem" onclick="doRedeemBonus(\''.$row['id'].'\')">Redeem</a>';}
	echo "			  <tr $tdstyle>
						  <td><strong>{$row['id']}</strong></td>
						  <td><strong>{$row['code']}</strong></td>
						  <td class='cash'><strong>{$row['amount']} ".$_SESSION['currency']."</strong></td>
						  <td><strong>{$row['date_started']} </strong></td>
						  <td><strong>$progress<br /><span style='font-size:9px'>($totalplayed / $mustplay)</span></strong></td>
						  <td><strong>$status</strong></td>
					  </tr>
					      ";					  
}
?>
</table></div>
<div style="text-align:center;width:700px">
<?=$lang['Pages']?>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<?php                        
			$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses WHERE status='1' AND user='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con']));       
			$pages = ceil(mysqli_num_rows($sql)/10);
			for ($i=1;$i<=$pages;$i++) {
				echo "<a href=\"#page\" onclick=\"transPage('".$i."')\">[".$i.']</a>&nbsp; ';
			}
			?>
<script type="text/javascript">
function transPage(page) {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/transactions.inc.php?page="+page).fadeIn('slow');
			});
		}
</script>
</div>