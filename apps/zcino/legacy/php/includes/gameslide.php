<?php
#developed by www.zcino
@require_once('config.inc.php');
$result = mysqli_query($GLOBALS['con'],"select * from cws_games WHERE `status`='1' ORDER BY RAND() LIMIT 1,3");
?>
<div id="gameslide">
<h2 style="color:orange;"><?php echo $lang['Play+Games']?></h2><br />
<?php
while( $detail = mysqli_fetch_array($result) )
{
echo "
<div class=\"gamelist\" style=\"height:180px;width:148px;margin: 15px 15px 15px 5px;\">
<div style=\"font-weight:bold;color:#06C;font-size:14px;padding-top:4px\">$detail[name]</div>
<img src=\"$detail[preview_pic]\" style=\"margin-top:4px;border:0px solid #666;\" width=\"140\" height=\"86\"/>
<div style=\"color:white;font-size:9px;height:10px;padding-top:3px;\">$detail[description]</div><br /><br />
	";
$id = $detail['id'];
echo "<div style=\"margin-top:-8px\">
<a href=\"#\" onclick=\"jump('launch_game.php?game=$detail[0]&width=$detail[width]&height=$detail[height]&mode=fun','$detail[width]','$detail[height]');\">Play for Fun</a>
";
if (!empty($_SESSION['username'])) {echo "
&nbsp;&nbsp;&nbsp;
		<a href=\"#\" onclick=\"jump('launch_game.php?game=$detail[0]&width=$detail[width]&height=$detail[height]&mode=real','$detail[width]','$detail[height]');\">Play for Real</a></div></div>";} else {echo '</div></div>';}
} 
?>
</div>