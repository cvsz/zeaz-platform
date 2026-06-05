<?php
#developed by www.zcino
@require_once('config.inc.php');
require_once('bonusfc.inc.php');
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
<div style="padding-top:20px;text-align:center"><h2>Active bonuses with rollover</h2></div>
<div id="yourDetails" style="padding-top:30px">
			  <table width="760" height="50" cellspacing="5" class="cTable">
						<tr >
                        	<td width="48" height="32" style="color:#999">ID</td>
							<td width="84" style="color:#999"><?=$lang['Type']?></td>
							<td width="79" style="color:#999"><?=$lang['Deposit+value']?></td>
                            <td width="82" style="color:#999"><?=$lang['Bonus+value']?></td>
							<td width="103" style="color:#999">Rollover</td>
							<td width="115" style="color:#999"><?=$lang['Amount+needed+to+wager+to+withdraw']?></td>
                            <td width="115" style="color:#999"><?=$lang['Total+bet']?></td>
                            <td width="115" style="color:#999"><?=$lang['Completed']?>(%)</td>
                            <td width="115" style="color:#999"><?=$lang['Date']?></td>
                            <td width="115" style="color:#999"><?=$lang['Status']?></td>
</tr>
<?php		
$page = antisqli($_GET['page']);
$rows = antisqli($_GET['rows']);
if (!isset($page) || empty($page)){$page = 1;}
if (!isset($rows) || empty($rows)){$rows = 10;}
$l1 = ($page-1) * $rows;
$l2 = $l1+$rows-1;	  
$result = mysqli_query($GLOBALS['con'],"SELECT b.status as status,b.id as id,type,deposit,bonus,date,rollover,userid,login,(rollover*(bonus+deposit)) as ulimit FROM `cws_bonuses_instant` b INNER JOIN `cws_users` u ON u.id=b.userid WHERE b.status='1' AND userid='{$_SESSION['userid']}' LIMIT $l1,$l2") or error_report(mysqli_error($GLOBALS['con']));;
if (mysqli_num_rows($result)==0){echo '<tr><td colspan="10" style="text-align:center">'.$lang['No+results+found'].'</td></tr></table>';exit;}
$o=0;
while($row = mysqli_fetch_assoc($result)) {
	$o++;
	$row['userid'] = $_SESSION['userid'];
?>
<tr class="<?=($o%2)?'gradeA odd':'gradeA even'?>">
                    <td style="text-align:center"><?=$row['id']?></td>
					<td style="text-align:center"><strong><?php
                    
					if (stristr($row['type'],'depbn-')){
						$deposit_id = str_replace('depbn-','',$row['type']);
						echo '<span style="font-weight:bold;color:#009999">'.str_replace('depbn','Deposit Bonus - #',$row['type']).'</span>';
					}elseif($row['type']=='free_chips'){
						echo '<span style="font-weight:bold;color:#339933">FREE CHIPS</span>';
					}else{
						echo '<span style="font-weight:bold;color:#339933">'.strtoupper(str_replace('_',' ',$row['type'])).'</span>';
					}	
					?></strong></td>
                    <td style="text-align:center"><span <?php if ($row['deposit']==0.00){echo 'style="color:red"';}else{ echo 'class="cash"';}?>><?=number_format($row['deposit'],2)?><?=$_SESSION['currency']?></span></td>
                    <td style="text-align:center"><span class="cash"><?=number_format($row['bonus'],2)?><?=$_SESSION['currency']?></span></td>
                    <td style="text-align:center;color:blue"><strong>x <?=$row['rollover']?></strong></td>
                    <td class="acenter cash"><strong><?=number_format($row['ulimit'],2)?><?=$_SESSION['currency']?></strong></td>
                    <td class="acenter cash"><strong><?php $total_bets = get_total_bets_admin($row['login'],$row['date']); echo number_format($total_bets,2);?><?=$_SESSION['currency']?></strong></td>
                    <!-- COMPLETED STATUS -->
                    <td style="text-align:center;font-weight:bold">
                    	<?php if ($row['ulimit']==0){$percent = 100;}else{$percent = min($total_bets*100/$row['ulimit'],100);}?>
                        <span style="color:<?php if ($percent==100){echo 'blue';}elseif($percent>0){echo 'orange';}else{echo 'red';}?>"><?=number_format($percent,2)?>%</span><br />
                        <?=draw_bar($percent);?>
                    </td>
                    <td class="acenter time"><?=$row['date']?></td>
                    <?php switch ($row['status']) { 
						case 0:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
						case 1:echo '<td class="acenter positive"><span style="color:green">Active</span>';break;
						case 2:echo '<td class="acenter positive"><span style="color:blue;font-weight:bold">Unlocked</span>';break;
						default:echo '<td class="acenter negative"><span style="color:red">Disabled</span></td>';break;
					}?></td>
<?php
}
?>
</table></div>
<div style="text-align:center;width:700px">
<?=$lang['Pages']?>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<?php                        
			$sql = mysqli_query($GLOBALS['con'],"SELECT b.status as status,b.id as id,type,deposit,bonus,date,rollover,userid,login,(rollover*(bonus+deposit)) as ulimit FROM `cws_bonuses_instant` b INNER JOIN `cws_users` u ON u.id=b.userid WHERE b.status='1' AND userid='{$_SESSION['userid']}'") or error_report(mysqli_error($GLOBALS['con']));       
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