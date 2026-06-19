<?php
#developed by www.zcino
@require_once('config.inc.php');
// this file manages the HTML output of the casino games
 //check if user is logged in for further use
if (isset($_SESSION['username'])){
	$loggedin = checkloggedin($_SESSION['username']);
}else {
	$loggedin = 'no';
}
 // check if lightbox popup is turned on
$popup = 0;
//check if game category to display was set
$cat = validateInput($_GET['page']);
if (!isset($_GET['page'])) {
	$cat = 'all';
}
$fun = 0;
$i=0;
echo '<div style="padding-top:5px;margin-left:10px;color:white;background-color:#000;width:740px">';
echo '<h1 style="color:white;padding-left:10px">CASINO GAMES</h1><br />';
?>

<?php
if ($cat=='all' || $cat=='random'){
	$categories = array('slot5rs','slot9rs','slot7rs','slot3rs','otherslot','table','videopoker','arcade','other','skill');
}else{
	switch ($cat){
		case 'all':$categories = array('slot5rs','slot9rs','slot7rs','slot3rs','otherslot','table','videopoker','arcade','other','skill');break;
		case 'slot':$categories = array('slot5rs','slot9rs','slot7rs','slot3rs','otherslot');break;
		case 'table':$categories = array('table');break;
		case 'videopoker':$categories = array('videopoker');break;
		case 'arcade':$categories = array('arcade');break;
		case 'other':$categories = array('other');break;
		case 'skill':$categories = array('skill');break;
		default:$categories = array('slot5rs','slot9rs','slot7rs','slot3rs','otherslot','table','videopoker','arcade','other','skill');break;
	}
	
}
foreach($categories as $category){
	if ($category=='otherslot'){
		$resultgames = mysqli_query($GLOBALS['con'],"SELECT * from cws_games WHERE `status`='1' AND (game_type='slot' OR game_type='slot multispin') ORDER BY `game_type` DESC,`paylines` DESC,`date` DESC") or die(mysqli_error($GLOBALS['con']));
	}else{
		$resultgames = mysqli_query($GLOBALS['con'],"SELECT * from cws_games WHERE `status`='1' AND game_type LIKE '%$category%' ORDER BY `game_type` DESC,`paylines` DESC,`date` DESC") or die(mysqli_error($GLOBALS['con']));
	}
	if (mysqli_num_rows($resultgames)!==0){
			if ($category=='other'){$category = 'Multiplayer';}
			elseif ($category=='slot3rs'){$category = '3 Reel Slot';}
			elseif ($category=='slot5rs'){$category = '5 Reel Slot';}
			elseif ($category=='slot7rs'){$category = '7 Reel Slot';}
			elseif ($category=='slot9rs'){$category = '9 Reel Slot';}
			elseif ($category=='otherslot'){$category = 'Other Slot';}
			//echo '<h2 style="color:white;padding-left:10px">'.ucfirst($category).' Games</h2>';
			//echo '<div class="divider"></div>';
		}
	//echo '<div style="width:740px">';
	$i=0;
	while($detail = mysqli_fetch_array($resultgames)) {// fetch all SQL data and display the games		
		if ($detail['id']==870){ // disable a game from being listed.FISH PRAWN
			
		}else{
			$i++;
			if ($popup=='0') { // if games are set to start in normal HTML new WINDOW POPUP
				$launch_modef = "target=\"_self\" href=\"choose_type.php?game=$detail[id]\"";
				$launch_moder = "target=\"_self\" href=\"choose_type.php?game=$detail[id]\"";
			}else { // if games are set to start in lightbox popup
				$codef = base64_encode('id='.$detail['id'].'&mode=fun');
				$coder = base64_encode('id='.$detail['id'].'&mode=real');
				$launch_modef = "href=\"play.php?game=$detail[id]&mode=fun\" rel=\"cws_popup\"";
				$launch_moder = "href=\"play.php?game=$detail[id]&mode=real\" rel=\"cws_popup\"";
			}
			$voteBar = '';
			if ($loggedin == 'yes') {
				 // check if user is logged in to decide if the votebar will be showed
				if ($popup=='1'){
					$loggedinStyle = 'style="height:180px;" ';
				}else{
					$loggedinStyle = 'style="height:160px;" ';
				}
				$launch_modeIMG = $launch_moder;
			}else{
				$launch_modeIMG = $launch_modef;
				$fun =1;
			}
		//display the HTML code that shows the games
		$tmp = explode('/',$detail['location']);
		$detail['preview_pic'] = $tmp[0].'/'.$tmp[1].'/'.$tmp[2].'/game.gif';
		echo '
		<div class="gamelist" '.$loggedinStyle.'>
		<div class="gameName" >'.$detail['name'].'</div>
		<a '.$launch_modeIMG.' >
		<div class="loading">
		<a '.$launch_modeIMG.'" id="game'.$detail['id'].'">
		<script type="text/javascript">
			load_image("'.str_replace('preview','game',$detail['preview_pic']).'","'.$detail['name'].'","'.$detail['id'].'")
		</script>
		</a>
		</div>
		</a>
		<div style="display:none;" class="hidd" id="descimage'.$detail['id'].'"></div>
		<br /><br />';
		//
		if ($popup=='0'){
			// build the HTML for the games ( see if play for real is available )
			$playdiv = "<div style=\"margin-top:5px;font-size:13px\">
			<div style=\"text-align:center;padding-left:70px\">
			<a {$launch_modef}>".ucfirst($lang['Play'])."</a>
			</div>
			";
			if ($loggedin == 'yes') {
				$playdiv = "
			<div style=\"text-align:center;padding-left:70px\">
			<a {$launch_modef}>".ucfirst($lang['Play'])."</a>
			</div>
			</div>";
				} else {
					$playdiv .= '</div></div>';
					}
		}elseif($popup=='1'){
				$playdiv = "<div style=\"margin-top:5px;font-size:13px\">
			<div style=\"text-align:center;padding-left:50px\">
			<a {$launch_modef}>{$lang['Play+for+Fun']}</a>
			</div>
			";
			if ($loggedin == 'yes') {
				$playdiv = "
			<div style=\"margin-top:5px;font-size:13px;padding-left:50px\">
			<a {$launch_modef}>{$lang['Play+for+Fun']}</a>
			<br />
			<a {$launch_moder}>{$lang['Play+for+Real']}</a>
			</div>
			</div>";
					} else {
						$playdiv .= '</div></div>';
						}	
		}
		echo $playdiv; // output image+text of each game
		if ($i == 4) {
			$i=0;
			//echo '<br />';
			}
	} 
	}
	//echo '</div>';
}
echo '</div>';
?>

