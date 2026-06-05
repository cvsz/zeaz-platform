<?php
#developed by www.zcino
@require_once('config.inc.php');
// this file manages the HTML output of the casino games

$resultgames = mysqli_query($GLOBALS['con'],"SELECT DISTINCT(game_type) from cws_games WHERE $game_type `status`='1' ORDER BY `game_type`") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($resultgames)==0){echo 'No games available';exit;} // display message and abort execution if the category has no games

$i=0;
while($detail = mysqli_fetch_array($resultgames)){// fetch all SQL data and display the games
$i++;

//display the HTML code that shows the categories
$color = ($i%2==0)?'#039':'#000';
$colorText = ($i%2==0)?'#09C':'#666';
echo '
<div class="categorylist" style="background-color:'.$color.'"><a href="#'.ucfirst($detail['game_type']).'" onclick="ShowGames(\''.$detail['game_type'].'\')" style="text-align:center;color:'.$colorText.'">'.ucfirst($detail['game_type']).'</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
} 
?>

