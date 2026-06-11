<?php
#developed by www.zcino
@require_once('config.inc.php');
// this file manages the HTML output of the casino games
if (!isset($_GET['page'])) { require_once('_drawrating.php');} else { require_once('../_drawrating.php');}//load the VOTEBAR
 //check if user is logged in for further use
if (isset($_SESSION['username'])){
	$loggedin = checkloggedin($_SESSION['username']);
}else {
	$loggedin = 'no';
}
$popup = 0;
//check if game category to display was set
$cat = validateInput($_GET['page']);
if (!isset($_GET['page'])) {
	$cat = 'arcade';
	}
if ($_GET['page']!=='all'){ $game_type = "`game_type` LIKE '%$cat%' AND ";}
$resultgames = mysqli_query($GLOBALS['con'],"SELECT * from cws_games WHERE $game_type `status`='1' ORDER BY `name`") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($resultgames)==0){echo 'No games available';exit;} // display message and abort execution if the category has no games
$fun = 0;
if ($loggedin == 'no') {$notloggedin = 'style="height:260px;" ';$fun =1;}
$i=0;
while($detail = mysqli_fetch_array($resultgames)){// fetch all SQL data and display the games
$i++;
if ($popup=='0') { // if games are set to start in normal HTML new WINDOW POPUP
	$launch_modef = "target=\"_blank\" href=\"launch_game.php?game=$detail[id]&mode=fun\" rel='' ";
	$launch_moder = "target=\"_blank\" href=\"launch_game.php?game=$detail[id]&mode=real\" rel='' ";
} else { // if games are set to start in lightbox popup
	$codef = base64_encode('id='.$detail['id'].'&mode=fun');
	$coder = base64_encode('id='.$detail['id'].'&mode=real');
	$launch_modef = "href=\"{$codef}\" rel=\"cws_popup\" title='{$lang['Play+for+Fun']}'";
	$launch_moder = "href=\"{$coder}\" rel=\"cws_popup\" title='{$lang['Play+for+Real']}'";
}
$voteBar = '';
if ($loggedin == 'yes') {
		 // check if user is logged in to decide if the votebar will be showed
		$voteBar = '<div style="padding-left:25px" id="vote'.$detail['id'].'" class="votestar">'.rating_bar($detail['id'],5).'</div>';
		$launch_modeIMG = $launch_moder;
	}else{
		$launch_modeIMG = $launch_modef;
	}
//display the HTML code that shows the games
$color = ($i%2==0)?'#039':'#000';
$colorText = ($i%2==0)?'#09C':'#666';
$allowFunMode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT allowfunplay FROM cws_settings"),0);
$rulesHref = base64_encode('rules='.$detail['id']);
echo '
<div class="gamelist" style="background-color:'.$color.'" onmouseover="ShowImage(\''.$detail['id'].'\')">
<a '.$launch_modeIMG.' id="namelaunch'.$detail['id'].'" class="gameName" style="color:'.$colorText.'">'.$detail['name'].'</a>
&nbsp;
<a class="popup" href="'.$rulesHref.'" rel="rules" style="font-size:8px;color:'.$colorText.'">'.ucwords($lang['Rules']).'</a>	
<div style="display:none">
	<img src="'.$detail['preview_pic'].'" id="gameImg'.$detail['id'].'" />
</div>';
if ($allowFunMode=='1'){
	$playdiv = "<a class='launchgamef".$detail['id']."'  {$launch_modef}>{$lang['Play+for+Fun']}</a>";
}else{
	$playdiv = "<a class='launchgame'  href=''>{$lang['You+are+not+logged+in']}</a>";
}
// build the HTML for the games ( see if play for real is available )

if ($loggedin == 'yes') {
	$playdiv = "
<a class='launchgamef".$detail['id']."' {$launch_modef}>{$lang['Play+for+Fun']}</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a class='launchgamer".$detail['id']."'  {$launch_moder}>{$lang['Play+for+Real']}</a>";
		}
echo '<div id="launcher'.$detail['id'].'" style="display:none">'.$playdiv.'</div>'; // output image+text of each game
echo $voteBar; // output the votebar
echo '</div>';
} 
?>

