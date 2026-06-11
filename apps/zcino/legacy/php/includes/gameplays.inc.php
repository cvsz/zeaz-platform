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
<style type="text/css">
.cTable td{
	border-color:#900;
	border-style:double;
	text-align:center;
}
.cash{padding:3px;}
.btnGP{padding-left:5px;padding-right:5px;color:#FFF;font-size:13px;height:25px;background-color:#F00;font-weight:bold}
</style>
<div style="width:800px;text-align:center">
<button id="sp" class="btnGP">Single Player Games</button>
<button id="mr" class="btnGP">Multiplayer Racing</button>
<button id="sicbo" class="btnGP">Multiplayer SicBo</button><br /><br />
<button id="mra" class="btnGP">Multiplayer American Roulette</button>
<button id="mre" class="btnGP">Multiplayer EU Roulette</button>
</div>
<script type="text/javascript">
$("#sp").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays.inc.php").fadeIn('slow');
			});
		});
$("#mra").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays_mra.inc.php").fadeIn('slow');
			});
		});
$("#mre").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays_mre.inc.php").fadeIn('slow');
			});
		});
$("#mr").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays_mr.inc.php").fadeIn('slow');
			});
		});
$("#sicbo").click(function() {
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px;padding-left:300px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays_sicbo.inc.php").fadeIn('slow');
			});
		});						
</script>
<div style="padding-top:20px;text-align:center"><h2><?php echo $lang['Gameplay+history']?></h2></div>
<div id="yourDetails" style="padding-top:30px;text-align:center">
			  <table width="760" height="25" cellspacing="5" class="cTable">
						<tr>
                        	<td width="46" style="color:#999">ID</td>
                            <td width="125" style="color:#999"><?php echo $lang['Game+Played']?></td>
							<td width="75" style="color:#999"><?php echo $lang['Date']?></td>                            
							<td width="31" style="color:#999"><?php echo $lang['Balance+before+play']?></td>
                            <td width="84" style="color:#999"><?php echo $lang['Bet']?> </td>
							<td width="103" style="color:#999"><?php echo $lang['Won']?> </td>
							<td width="136" style="color:#999"><?php echo $lang['Profit']?></td>
                            <td width="97" style="color:#06F;font-weight:bold"><?=$lang['Manage']?></td>
                            
							
</tr>
<?php		
if (!is_numeric($_GET['page']) ||$_GET['page']<0 ||!isset($_GET['page']) ||empty($_GET['page'])){$_GET['page'] = 1;}
$page = antisqli($_GET['page']);
if ($_POST['perpage']>100 ||!is_numeric($_POST['perpage']) ||$_POST['perpage']<0 ||!isset($_POST['perpage']) ||empty($_POST['perpage'])){$_POST['perpage'] = 10;}
$perpage = antisqli($_POST['perpage']);
$l1 = ($page-1) * $perpage;

$query = "SELECT *,won-bet AS profit,(SELECT name FROM `cws_games` WHERE `id`=`g`.`gamename`) AS gname FROM `cws_gameplays` `g` WHERE user='{$_SESSION['username']}' ORDER BY `date` DESC LIMIT $l1,$perpage";
$result = mysqli_query($GLOBALS['con'],$query);
$i=0;
if (mysqli_num_rows($result)==0){echo '<tr><td colspan="7" style="text-align:center">'.$lang['No+results+found'].'</td></tr></table>';exit;}

while($row = mysqli_fetch_assoc($result)) {
	$i++;
	if ($i%2==0){
		$tdstyle= 'style="background-color:#333;height:45px"';
	} else {$tdstyle='style="height:30px"';}
	$profit = $row['profit'];
	if ($profit<0){$pstyle= 'style="color:red;font-size:11px"';}else {$pstyle = ' class="cash"';}
	echo "				  <tr $tdstyle>
						  <td><strong>$row[id]</strong></td>
						  <td style='color:#09C;padding:3px'><strong>{$row['gname']}</strong></td>
						  <td><strong>$row[date]</strong></td>
						  <td class='cash'>".number_format($row['balance'],2,'.','')."{$_SESSION['currency']}</td>
						  <td class='cash'>".number_format($row['bet'],2,'.','')."{$_SESSION['currency']}</td>
						  <td class='cash'>".number_format($row['won'],2,'.','')."{$_SESSION['currency']}</td>
						  <td $pstyle>".number_format($profit,2,'.','')."{$_SESSION['currency']}</td>
						  <td><a href='includes/explain_hand.inc.php?gid=".$row['id']."' rel='cws_popup' style='color:#09C'><img src='images/details_button.png' /></a></td>
						  
					  </tr>
					      ";					  
}
?>
</table></div>
<div style="text-align:center;width:700px">
<?=$lang['Pages']?>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<?php                        
			$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_gameplays` INNER JOIN (SELECT id,name FROM cws_games) AS g ON g.id = gamename WHERE user='{$_SESSION['username']}' ORDER BY `date` DESC") or error_report(mysqli_error($GLOBALS['con']));       
			$pages = ceil(mysqli_num_rows($sql)/10);
			for ($i=1;$i<=$pages;$i++) {
				echo "<a href=\"#yourDetails\" style='background-color:#000;color:#09C'  \" onclick=\"gpPage('".$i."')\">[".$i.']</a>&nbsp; ';
			}
			?>
<script type="text/javascript">
$('a[rel*=cws_popup]').facebox();
$(document).bind('beforeReveal.facebox', function() {
    $('#facebox .body').width('700px');
});
$(document).bind('afterReveal.facebox', function() {
    $('#facebox .body').width('700px');
});


function gpPage(page) { // show gameplays
			$('#centermenu').fadeOut('slow', function() {
				$('#centermenu').html('<div style="text-align:center;padding-top:60px"><img src="images/loader_acc.gif" height="45" width="45"/></div>').load("includes/gameplays.inc.php?page="+page).fadeIn('slow');
			});
		}
</script>
</div>