<?php 
//this php file lets you edit the selected game
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
$global_mode = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT global_mode FROM cws_settings"),0);
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 

<?php
if (isset($_POST['update'])) { 
		if ($demoMode==1){
			echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
				echo $lang['No+changes+allowed+in+demo'];
				echo '</strong></p></div>';
		}else{
			echo '<script type="text/javascript">
					$("#symbols_odds").css("border","");
					$("#freespins_bank").css("border","");
					$("#bank").css("border","");
					$("#coef").css("border","");
					$("#megawin_bank").css("border","");
					$("#ultrawin_bank").css("border","");
					$("#animation_speed").css("border","");
					$("#freespins_odds").css("border","");
					$("#win_mult").css("border","");
					$("#pays_rtl").css("border","");
					$("#megawin_mult").css("border","");
					$("#firstreelstop").css("border","");
					$("#reelstop").css("border","");
					$("#autofullscreen").css("border","");
					$("#bet_sizes").css("border","");
					$("#name").css("border","");
					$("#status").css("border","");
					$("#bonus_bank").css("border","");
					$("#max_win").css("border","");
					$("#max_bet").css("border","");
					$("#min_bet").css("border","");
					$("#rules").css("border","");
					$("#description").css("border","");
					$("#jackpot").css("border","");
					$("#jp_min_pay").css("border","");
					$("#jp_win_chances").css("border","");
					</script>
					'; 
			$ok = true;
			$id = antisqli($_POST['id']);
			if (!is_numeric($id) || $id<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
						<p><strong>FAILED: </strong>';
							echo $lang['Update+failed'];
							echo '</strong></p></div>';
			}else{
				$data = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE id='{$id}'"));
				if ($demoMode!==1){
					$name = antisqli($_POST['name']);
					if (strlen($name)>60 || !is_good_name($name) || strlen($name)<=1){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Name'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#name").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `name`='$name' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				if ($demoMode!==1){
					$description = urlencode($_POST['description']);
					mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `description`='$description' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				}
				
				if ($demoMode!==1){
					$rules = urlencode($_POST['rules']);
					mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `rules`='$rules' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				}
				
				if (isset($_POST['pays_rtl']) && !noValue($_POST['pays_rtl'])){
					$pays_rtl = antisqli($_POST['pays_rtl']);
					if ($pays_rtl!=='0' && $pays_rtl!=='1'){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Pays+Right+to+Left'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#pays_rtl").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `pays_rtl`='$pays_rtl' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['reelstop']) && !noValue($_POST['reelstop'])){
					$reelstop = antisqli($_POST['reelstop']);
					if (!is_numeric($reelstop) || $reelstop<=100 || $reelstop>=5000){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Reel+stop'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#reelstop").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `reelstop`='$reelstop' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['firstreelstop']) && !noValue($_POST['firstreelstop'])){
					$firstreelstop = antisqli($_POST['firstreelstop']);
					if (!is_numeric($firstreelstop) || $firstreelstop<=100 || $firstreelstop>=5000){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Firstreelstop</strong></p></div>';
						echo '<script type="text/javascript">$("#firstreelstop").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `firstreelstop`='$firstreelstop' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['win_mult']) && !noValue($_POST['win_mult'])){
					$win_mult = antisqli($_POST['win_mult']);
					if (!is_numeric($win_mult) || $win_mult<5 || $win_mult>=500000){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Max Win Multiplier</strong></p></div>';
						echo '<script type="text/javascript">$("#win_mult").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `win_mult`='$win_mult' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['jp_min_pay']) && !noValue($_POST['jp_min_pay'])){
					$jp_min_pay = antisqli($_POST['jp_min_pay']);
					if (!is_numeric($jp_min_pay) || $jp_min_pay<100 || $jp_min_pay>=500000){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Jackpot MIN PAYOUT</strong></p></div>';
						echo '<script type="text/javascript">$("#jp_min_pay").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `jp_min_pay`='$jp_min_pay' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['megawin_mult']) && !noValue($_POST['megawin_mult'])){
					$megawin_mult = antisqli($_POST['megawin_mult']);	
					if (!is_numeric($megawin_mult) || $megawin_mult<=0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Megawin Multiplier</strong></p></div>';
						echo '<script type="text/javascript">$("#megawin_mult").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `megawin_mult`='$megawin_mult' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['min_bet']) && !noValue($_POST['min_bet'])){
					$min_bet = antisqli($_POST['min_bet']);	
					if (!is_numeric($min_bet) || $min_bet<=0 || $min_bet>=$_POST['max_bet']){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Min Bet</strong></p></div>';
						echo '<script type="text/javascript">$("#min_bet").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `min_bet`='$min_bet' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['max_bet']) && !noValue($_POST['max_bet'])){
					$max_bet = antisqli($_POST['max_bet']);	
					if (!is_numeric($max_bet) || $max_bet<=0 || $max_bet<=$_POST['min_bet']){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Max Bet</strong></p></div>';
						echo '<script type="text/javascript">$("#max_bet").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `max_bet`='$max_bet' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['max_win']) && !noValue($_POST['max_win'])){
					$max_win = antisqli($_POST['max_win']);	
					if (!is_numeric($max_win) || $max_win<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Max Win</strong></p></div>';
						echo '<script type="text/javascript">$("#max_win").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `max_win`='$max_win' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				$okBet = true;
				if (isset($_POST['bet_sizes']) && !noValue($_POST['bet_sizes'])){
					$bet_sizes = antisqli($_POST['bet_sizes']);	
					$tmp_bets = explode(',',$bet_sizes);
					foreach($tmp_bets as $tBet){
						if (!is_numeric($tBet) || $tBet<0){
							$okBet = false;
						}
					}
					if ($okBet==false){
							$ok = false;
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Bet sizes</strong></p></div>';
							echo '<script type="text/javascript">$("#bet_sizes").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `bet_sizes`='$bet_sizes' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['animation_speed']) && !noValue($_POST['animation_speed'])){
					$animation_speed = antisqli($_POST['animation_speed']);	
					if (!is_numeric($animation_speed) || $animation_speed<0 || $animation_speed>5){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Animation+Speed'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#animation_speed").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `animation_speed`='$animation_speed' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['autofullscreen']) && !noValue($_POST['autofullscreen'])){
					$autofullscreen = antisqli($_POST['autofullscreen']);	
					if ($autofullscreen!=='0' && $autofullscreen!=='1' && $autofullscreen!=='2'){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Autofullscreen</strong></p></div>';
						echo '<script type="text/javascript">$("#autofullscreen").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `autofullscreen`='$autofullscreen' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['coef']) && !noValue($_POST['coef'])){
					$coef = antisqli($_POST['coef']);	
					if (!is_numeric($coef) || $coef<0 || $coef>99){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Hit Frequency; '.$lang['Value+must+be'].' 1-99</strong></p></div>';
						echo '<script type="text/javascript">$("#coef").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `coef`='$coef' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['jp_win_chances']) && !noValue($_POST['jp_win_chances'])){
					$jp_win_chances = antisqli($_POST['jp_win_chances']);	
					if (!is_numeric($jp_win_chances) || $jp_win_chances<1 || $jp_win_chances>10000){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Jackpot Win Chances</strong></p></div>';
						echo '<script type="text/javascript">$("#jp_win_chances").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `jp_win_chances`='$jp_win_chances' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}

				if (isset($_POST['jackpot']) && !noValue($_POST['jackpot'])){
					$jackpot = antisqli($_POST['jackpot']);	
					if (!is_numeric($jackpot) || $jackpot<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Jackpot</strong></p></div>';
						echo '<script type="text/javascript">$("#jackpot").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `jackpot`='$jackpot' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['status']) && !noValue($_POST['status'])){
					$status = antisqli($_POST['status']);	
					if ($status!=='0' && $status!=='1'){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				
				if (isset($_POST['freespins_odds']) && !noValue($_POST['freespins_odds']) && (stristr($data['game_type'],'slot5rs') || stristr($data['game_type'],'slot7rs') || stristr($data['game_type'],'slot9rs'))){
					/*create freespins string to insert in DB - format demo : 1000,100,50,25,10*/
					$freespins_odds = antisqli($_POST['freespins_odds']);
					$fs_test = explode(',',$freespins_odds);
					$fstr = '';
					$fOK = true;
					foreach($fs_test as $fs){
						if (!is_numeric($fs) ||$fs<1){
							$fs = 1000;
							$fOK = false;
						}
						$fstr .= $fs.',';
					}	
					$freespins_odds = trim($fstr,',');		
					if ($fOK==false){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Freespins Odds</strong></p></div>';
						echo '<script type="text/javascript">$("#freespins_odds").css("border","2px solid #F00");</script>';
					}else{
						mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `freespins_odds`='$freespins_odds' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
					}
				}
			
				if (isset($_POST['symbols_odds']) && !noValue($_POST['symbols_odds']) && stristr($data['game_type'],'slot')){
					/*create symbols string to insert in DB - format demo : 2,2,2,3,3,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,10,10,11,11,11,12,12,12,12*/
					$symbols_odds = antisqli($_POST['symbols_odds']);
					$fs_test = explode(',',$symbols_odds);// fs_test[0] == symbol1
					$fstr = '';
					$sOK = true;
					for ($s=0;$s<=11;$s++){
						if ($fs_test[$s]==""){
							$fs_test[$s] = 0;
						}
						if (!is_numeric($fs_test[$s])||$fs_test[$s]<0){
							$fs_test[$s] = 0;
							$sOK = false;
						}
						if ($fs_test[$s]>10){ //maximum 10 apparitions of each symbol is allowed
							$fs_test[$s]=10;
							$sOK = false;
						}
						if ($fs_test[$s]>0){
							//echo 'S'.$s.'='.$fs_test[$s];
							for ($i=1;$i<=$fs_test[$s];$i++){
								$fstr .= ($s+1).',';
							}
						}
					}	
					$symbols_odds = trim($fstr,',');
					if ($sOK==false){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Symbols Odds</strong></p></div>';
						echo '<script type="text/javascript">$("#symbols_odds").css("border","2px solid #F00");</script>';
					}else{
						mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `symbols_odds`='$symbols_odds' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
					}
				}
				
				if (isset($_POST['bank']) && !noValue($_POST['bank'])){
					$bank = antisqli($_POST['bank']);	
					if (!is_numeric($bank) || $bank<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Game Bank</strong></p></div>';
						echo '<script type="text/javascript">$("#bank").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `bank`='$bank' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				if (isset($_POST['bonus_bank']) && !noValue($_POST['bonus_bank'])){
					$bonus_bank = antisqli($_POST['bonus_bank']);	
					if (!is_numeric($bonus_bank) || $bonus_bank<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Bonus Bank</strong></p></div>';
						echo '<script type="text/javascript">$("#bonus_bank").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `bonus_bank`='$bonus_bank' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				if (isset($_POST['freespins_bank']) && !noValue($_POST['freespins_bank'])){
					$freespins_bank = antisqli($_POST['freespins_bank']);	
					if (!is_numeric($freespins_bank) || $freespins_bank<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Freespins Bank</strong></p></div>';
						echo '<script type="text/javascript">$("#freespins_bank").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `freespins_bank`='$freespins_bank' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				if (isset($_POST['megawin_bank']) && !noValue($_POST['megawin_bank'])){
					$megawin_bank = antisqli($_POST['megawin_bank']);	
					if (!is_numeric($megawin_bank) || $megawin_bank<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Megawin Bank</strong></p></div>';
						echo '<script type="text/javascript">$("#megawin_bank").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `megawin_bank`='$megawin_bank' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}
				if (isset($_POST['ultrawin_bank']) && !noValue($_POST['ultrawin_bank'])){
					$ultrawin_bank = antisqli($_POST['ultrawin_bank']);	
					if (!is_numeric($ultrawin_bank) || $ultrawin_bank<0){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Ultra win Bank</strong></p></div>';
						echo '<script type="text/javascript">$("#ultrawin_bank").css("border","2px solid #F00");</script>';
					}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `ultrawin_bank`='$ultrawin_bank' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con'])); }
				}

				if ($ok!==false){
					echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>';
						echo $lang['Updated+successfully'];
						echo '</strong></p></div>';
				}else { 
					echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>';
						echo $lang['Update+Failed'];
						echo '</strong></p></div>';
				}
			}
		}
}
$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;
if (isset($_POST['id'])) {$_POST['id'] = antisqli($_POST['id']);}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_games WHERE `id`='".antisqli($_POST['id'])."'"));
?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
    <div class="widget">
        <div class="title">
        <img class="titleIcon" alt="" src="images/icons/dark/list.png" />
        <div style="display:block;float:left">
        <a href="#" style="font-weight:bold;font-size:12px;padding:8px;display:block" onclick="javascript:showparam('gm_list_e','edit=1&id=<?=antisqli($_POST['id'])?>');"><?=$lang['Edit+Game']?>  - <span style="font-style:italic;color:blue"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_games` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?></span></a>
        </div>
        <div style="display:block;float:left">
        <a href="#" style="font-weight:bold;font-size:12px;padding:8px;" onclick="javascript:showparam('gm_list_e','edit=1&id=<?=antisqli($_POST['id'])?>');"><img class="titleIcon" alt="" src="images/icons/dark/refresh3.png"></a>
        </div>
        </div>
<span style="color:red;font-weight:bold;padding:4px;"><?=$lang['NO+GAME+MUST+BE+ACTIVE+WHEN+DOING+THESE+CHANGES']?>!</span>
<table>
<tr>
<td width="741" valign="top" style="vertical-align:top">
<div>
<table>
    <tr class="formRow cwsList">
        <td width="304">
        	<label> <?=$lang['Name']?></label>
        </td>
        <td width="400">
        	<input type="text" class="text small" name="smallfield" id="name" value="<?=$row['name']?>" style="width:225px"/>
        </td>
    </tr>
    <tr class="formRow cwsList">
        <td style="vertical-align:top">
            <label><?=$lang['Description']?></label>
        </td>
		<td>
        	<textarea class="text small" name="smallfield" id="description" style="height:80px;width:400px"><?php echo urldecode($row['description'])?></textarea>
        </td>
   </tr>
   <tr class="formRow cwsList">
        <td style="vertical-align:top">
      		<label> <?=$lang['Rules']?> </label>
        </td>
        <td>
      		<textarea class="text small" name="smallfield" id="rules" style="height:150px;width:400px"><?php echo urldecode($row['rules'])?></textarea>
        </td>
	</tr>
    <tr class="formRow cwsList">
        <td>
            <label> <?=$lang['Status']?></label>
        </td>
        <td>
            <select id="status">
            <option value="1" <?php if ($row['status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
            <option value="0" <?php if ($row['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
            </select>
        </td>
    </tr>
    <tr class="formRow cwsList">
        <td>
            <label> <?=$lang['Total+Wins']?></label>
        </td>
        <td>
            <span style="font-weight:bold;color:#0C3">
            <?php
            $tgp = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(won),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0);
			if ($tgp>0){
				echo cash_format_cws($tgp,2,'.','').' '.$_SESSION['currency'];
			}else{
				echo $lang['No+gameplays'];
			}
			?></span>
        </td>
    </tr>
    <tr class="formRow cwsList">
        <td>
            <label><?=$lang['Total+Bets']?></label>
        </td>
        <td>
            <span style="font-weight:bold;color:#0C3">
            <?php
            $tgp = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0);
			if ($tgp>0){
				echo cash_format_cws($tgp,2,'.','').' '.$_SESSION['currency'];
			}else{
				echo $lang['No+gameplays'];
			}
			?></span>
        </td>
    </tr>
    <?php if ($global_mode=='0'){?>
    <?php if (stristr($row['game_type'],'other') || stristr($row['game_type'],'skill')){}else{?>
    <tr class="formRow cwsList">
        <td>
            <label> "Hit Frequency" <?=$lang['Percent']?> </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['How+often+a+game+might+pay+the+player']?>.</span>
            <br /><span style="color:#09C;font-size:9px"><?=$lang['If+this+value+is+closer+to']?> 99%, <?=$lang['the+players+will+win+smaller+wins']?>, <?=$lang['but+more+often']?>. <?=$lang['Set+this+to+lower+value+so+that+the+wins+become+bigger']?>, <?=$lang['but+are+paid+less+often']?>.<?php if ($demoMode!==1){?> <?=$lang['This+will+work+only+if+there+are+enough+money+in+the+casino+payout+bank+to+pay']?>.<?php }?></span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="coef" value="<?=$row['coef']?>" style="width:170px;background-color:#0FF"/>
            % <span style="color:red;font-size:9px">Value range 1-99</span>
        </td>
    </tr>
    <?php }?>
    <?php }?>
    <?php if($demoMode!==1){?>
    <tr class="formRow cwsList">
        <td>
            <label> Avg. Win Frequency<br />(<?=$lang['Based+on+calculations']?>)</label>
        </td>
        <td>
            <span style="font-weight:bold;color:#F60">
            <?php
            $tgp = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0);
			$twins = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_gameplays WHERE gamename='{$row['id']}' AND won>0 AND mode='real'"),0);
			if ($tgp>0){
				echo cash_format_cws($twins*100/$tgp,2,'.','').'% <span style="color:#FC0">('.$twins.'/'.$tgp.')</span>';
			}else{
				echo 'No gameplays';
			}
			?></span>
        </td>
    </tr>
    
    <tr class="formRow cwsList">
        <td>
            <label> Jackpot WIN % </label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+100+to+have+1+out+of+100+chances+to+give+MEGA+jackpot+to+player+when+placing+MAXIMUM+BET+on+ALL+PAYLINES']?>.<br /><br />
<?=$lang['If+this+value+is+set+to+100']?>, <?=$lang['the+player+will+have']?> 1:100 <?=$lang['chances']?> , 1:33 <?=$lang['to+win']?> MAJOR JACKPOT and 1:10 <?=$lang['to+win']?> MINI JACKPOT, <?=$lang['if+player+bet+maximum+amount+on+all+paylines']?>.<br /><br />
<?=$lang['If+MAXIMUM+BET+is']?> 50$ <?=$lang['and+TOTAL+PAYLINES+number+is']?> 50$, <?=$lang['it+means+that+MAXIMUM+TOTAL+BET+allowed+is']?> 2500$.<br />
<?=$lang['If+player+bets']?> 1$ x 9 LINES, <?=$lang['then+his+JackPot+WIN+CHANCES+will+be']?> <?=$lang['277+times+lower+than+normal']?>(2500/9). <?=$lang['The+player+will+have']?> 1:27700 <?=$lang['chances+to+win']?> MEGA JACKPOT.<br /><br /></span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="jp_win_chances" value="<?=$row['jp_win_chances']?>" style="width:170px;background-color:#0FF"/>% 
            <span style="color:red;font-size:9px"><?=$lang['Value+range']?> 1-10000</span>
        </td>
    </tr>
    <?php if($row['id']=='1011'){}else{?>
    <tr class="formRow cwsList">
        <td>
            <label> Jackpot Minimum Payout </label>
            <br /><span style="color:red;font-size:9px">EG: <?=$lang['set+this+to+1000+so+that+the+jackpot+prize+is+given+only+after+the+JACKPOT+is+larger+than+1000']?>. <?=$lang['This+also+includes']?> MINI/MAJOR/MEGA JACKPOT. MINI JACKPOT <?=$lang['is+equal+to']?> TOTAL JACKPOT/10. MINI JACKPOT <?=$lang['will+pay+when']?> TOTAL Jackpot <?=$lang['will+reach']?> 10000, <?=$lang['because']?> MINI JACKPOT <?=$lang['needs+to+be+larger+than']?> 1000 (10,000/10).</span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="jp_min_pay" value="<?=$row['jp_min_pay']?>" style="width:170px;background-color:#0FC"/>
            <span style="color:red;font-size:9px"><?=$lang['Value+range']?> 1-1,000,000.000</span>
        </td>
    </tr>
    <?php }?>
    <tr class="formRow cwsList">
        <td>
       	 	<label> <?=$lang['Jackpot']?> </label>
        </td>
        
        <td>
            <input type="text" class="text small" name="smallfield" id="jackpot" value="<?=$row['jackpot']?>" style="width:170px"/><?=$_SESSION['currency']?></label>
        </td>   
    </tr>
    <?php }?>
    
    <?php if ($global_mode=='0'){?>
    <?php if (stristr($row['game_type'],'other') || stristr($row['game_type'],'skill')){}else{?>
    <tr class="formRow cwsList">
        <td>
            <label> <?=$lang['Game']?> Bank </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="bank" value="<?=$row['bank']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php if ((stristr($row['game_type'],'slot5rs')||stristr($row['game_type'],'slot7rs')||stristr($row['game_type'],'slot9rs')) && !stristr($row['game_type'],'multispin') && !stristr($row['game_type'],'slot3rs')){?>
    <tr class="formRow cwsList">
        <td>
            <label> Freespins Bank </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="freespins_bank" value="<?=$row['freespins_bank']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php }?>
    <?php if(stristr($row['game_type'],'slot') && ($row['bonus']!=='0' || $row['bonus2']!=='0')){?>
    <tr class="formRow cwsList">
        <td>
            <label> Bonus Bank </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="bonus_bank" value="<?=$row['bonus_bank']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php }?>
    <?php if (stristr($row['game_type'],'slot') && !stristr($row['game_type'],'multispin')){?>
    <tr class="formRow cwsList">
        <td>
            <label> Megawin Bank </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="megawin_bank" value="<?=$row['megawin_bank']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <tr class="formRow cwsList">
        <td>
            <label> Ultrawin Bank </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="ultrawin_bank" value="<?=$row['ultrawin_bank']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php }?>
    <tr class="formRow cwsList">
        <td>
            <label> 
            <?php if ($demoMode==1){?>
            Casino Profit
			<?php }else {?>
            Reserved as Casino <?=$lang['Profit']?> (<span style="color:#33F"><?=$profit_percent*100?>%</span> from each bet) :
            <?php }?>
            </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" disabled="disabled" id="currentprofit" value="<?php if (stristr($row['game_type'],'other')){?>
                    <?php
					$payout = 'payout';
					switch ($row['id']){
						case '1006':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_roulette_am_bets` r WHERE mode='real'");$bets = mysqli_result($bets,0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_am_bets` r WHERE mode='real'");$profit = mysqli_result($profit,0);break; // roulette am
						
						case '1005':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_roulette_eu_bets` r WHERE mode='real'") ;$bets = mysqli_result($bets,0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_eu_bets` r WHERE mode='real'");$profit = mysqli_result($profit,0);break; // roulette eu
						
						case '1014':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_sicbo_bets` t") ;$bets = mysqli_result($bets,0); // sicbo
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_sicbo_bets` t");$profit = mysqli_result($profit,0);break; // sicbo
						
						case '1001':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_bingo_tickets_v2` t") ;$bets = mysqli_result($bets,0); // bingo
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_bingo_tickets_v2` t");$profit = mysqli_result($profit,0);break; // bingo
						
						case '998':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='car'") ;$bets = mysqli_result($bets,0); // speed racers
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='car'");$profit = mysqli_result($profit,0);break; // car
						
						case '1016':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='hr'") ;$bets = mysqli_result($bets,0); //hr
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='hr'");$profit = mysqli_result($profit,0);break; // hr
						
						case '1017':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='mk'") ;$bets = mysqli_result($bets,0); //monkey
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='mk'");$profit = mysqli_result($profit,0);break; // monkey
						
						case '1018':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='dog'") ;$bets = mysqli_result($bets,0); //dog
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='dog'");$profit = mysqli_result($profit,0);break; // dog
						
						case '1019':
						$bets = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM `cws_race_tickets` t WHERE game_type='vd'") ;$bets = mysqli_result($bets,0); //vdogs
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE game_type='vd'");$profit = mysqli_result($profit,0);break; // vdogs
						
						default: 
						$bets = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0);
						$profit =  mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'");$profit = mysqli_result($profit,0);break;
						
					}
					
					echo '<span class="cash">+'.cash_format_cws($profit).$_SESSION['currency'].'</span>';
					?>
                   
					
					<?php }else{
					$payout = 'payout';	
					?>
                    <?=cash_format_cws(mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM cws_gameplays WHERE gamename='{$row['id']}' AND mode='real'"),0))?>
                    <?php }?>" style="width:170px;background-color:#0C3;color:#000;font-weight:bold;"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php }?>
    <?php }?>
	<tr class="formRow cwsList">
        <td>
            <label> <?=$lang['Min+Bet']?> </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="min_bet" value="<?=$row['min_bet']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    
	<tr class="formRow cwsList">
    	<td>
        	<label> <?=$lang['Max+Bet']?> </label>
            <br /><span style="color:red;font-size:9px">Please note that if MAXBET is set to <?=$row['max_bet']?> <?=$_SESSION['currency']?>, then all bet sizes over <?=$row['max_bet']?> <?=$_SESSION['currency']?> will not appear in the game !</span>
        </td>
        <td>
         	<input type="text" class="text small" name="smallfield" id="max_bet" value="<?=$row['max_bet']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php if (stristr($row['game_type'],'other')){}else{?>
    <tr class="formRow cwsList" <?php if ($demoMode==1){echo 'style="display:none"';}?>>
        <td>
            <label> <?=$lang['Max+Win+Allowed']?> </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['Please+note+that+if+this+value+is+set+to']?> <?=$row['max_win']?> <?=$_SESSION['currency']?>, <?=$lang['then+the+player+can+win+maximum']?> <?=$row['max_win']?> <?=$_SESSION['currency']?> <?=$lang['per+each+round']?>!</span>
        </td>
        <td>
        	<input type="text" class="text small" name="smallfield" id="max_win" value="<?=$row['max_win']?>" style="width:170px"/><?=$_SESSION['currency']?>
        </td>
    </tr>
    <?php }?>
    <?php if ($row['win_mult']>0 && ($row['game_type']=='slot3rs' || $row['game_type']=='slot5rs' || $row['game_type']=='slot7rs' || $row['game_type']=='slot9rs')){?>
    <tr class="formRow cwsList" <?php if ($demoMode==1){echo 'style="display:none"';}?>>
        <td>
            <label> Max Win Multiplier </label>
            <br />
            <span style="color:red;font-size:9px">EG: <?=$lang['If+your+total+bet+is+250+and+WIN+MULTIPLIER+is+100']?>, <?=$lang['then+the+player+cannot+win+more+than']?> 250*100=25,000.
            	<span><?=$lang['If+you+set+this+to+0']?>, <?=$lang['then+nobody+will+win+at+this+game']?>.</span>
            </span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="win_mult" value="<?=$row['win_mult']?>" style="width:170px"/>
        </td>
    </tr>
    <?php } ?>
    <?php if (stristr($row['game_type'],'slot')){?>
    <?php if ($row['megawin_mult']>0){?>
    <tr class="formRow cwsList">
        <td>
        
            <label> MEGAWIN Animation multiplier </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['A+slot+vibration+animation+will+play+when+a+player+wins+a+certain+amount']?>.EG: <?=$lang['If+MEGAWIN+multiplier+is+100+and+player+bet+per+line']?> = 10, <?=$lang['then+if+his+total+win+is+larger+than']?> 100*10=1000 <?=$lang['the+animation+will+play']?>. <?=$lang['Set+this+to+0+to+disable+it']?></span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="megawin_mult" value="<?=$row['megawin_mult']?>" style="width:170px"/>
        </td>
    </tr>
    <?php } ?>
    <?php if ($row['animation_speed']!=='0'){?>
    <tr class="formRow cwsList">
        <td>
            <label><?=$lang['Animation+Speed']?> </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['How+fast+the+reels+will+spin']?></span><br />
        </td>
        <td>
            <select id="animation_speed">
            <option value="5" <?php if ($row['animation_speed']==5){echo 'selected';}?>>Fastest</option>
            <option value="4" <?php if ($row['animation_speed']==4){echo 'selected';}?>>Fast</option>
            <option value="3" <?php if ($row['animation_speed']==3){echo 'selected';}?>>Medium</option>
            <option value="2" <?php if ($row['animation_speed']==2){echo 'selected';}?>>Slow</option>
            <option value="1" <?php if ($row['animation_speed']==1){echo 'selected';}?>>Slowest</option>
            </select>
        </td>
    </tr>
	<?php } ?>
    <?php  if ($row['firstreelstop']>0){?>
    <tr class="formRow cwsList">
        <td>
            <label> First reel stop </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['How+long+to+wait+until+first+reel+stops']?>( in miliseconds ; 1000ms = 1 second ) </span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="firstreelstop" value="<?=$row['firstreelstop']?>" style="width:170px"/> ms; <?=$lang['Value+range']?> 100-5000</td>
    </tr>
    <?php } ?>
    <?php  if ($row['reelstop']>0){?>
    <tr class="formRow cwsList">
        <td>
            <label> Reel spin duration </label>
            <br /><span style="color:red;font-size:9px"><?=$lang['How+long+each+reel+will+spin']?> ( in miliseconds ; 1000ms = 1 second ) </span>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="reelstop" value="<?=$row['reelstop']?>" style="width:170px"/>             ms
        ; <?=$lang['Value+range']?> 100-5000</td>
    </tr>
    <?php }
	}?>
	<?php  if (!(strlen($row['bet_sizes'])<1 || $row['bet_sizes']==0 || stristr($row['game_type'],'table'))){?>
    <tr class="formRow cwsList">
        <td>
            <label> <?=$lang['Bet+sizes']?> </label>
        </td>
        <td>
            <input type="text" class="text small" name="smallfield" id="bet_sizes" value="<?=$row['bet_sizes']?>" style="width:400px"/></td>
    </tr>
    <?php }elseif(stristr($row['game_type'],'table')){?>
    <tr class="formRow cwsList">
        <td>
            <label>Min Chip</label>
            <br /><span style="color:red;font-size:9px">(<?=$lang['the+lowest+chip+that+will+appear+on+the+bet+area']?>)</span>
        </td>
        <td>
            <select id="minchip">
			<?php
            $minchip = explode(',',$row['bet_sizes']);
            $minchip = $minchip[0];
			$maxchip = $minchip[1];
			if ($minChip<=0 || !is_numeric($minChip) || $minChip==""){
				$minChip = 1;
			}
			if ($maxChip==0 || !is_numeric($maxChip) || $maxchip==""){
				$maxChip = 500;
			}
            ?>
            <option value="0.01" <?php if ($minchip=='0.01'){echo 'selected';}?>>0.01</option>
            <option value="0.05" <?php if ($minchip=='0.05'){echo 'selected';}?>>0.05</option>
            <option value="0.10" <?php if ($minchip=='0.10'){echo 'selected';}?>>0.10</option>
            <option value="0.25" <?php if ($minchip=='0.25'){echo 'selected';}?>>0.25</option>
            <option value="1" <?php if ($minchip=='1'){echo 'selected';}?>>1</option>
            <option value="5" <?php if ($minchip=='5'){echo 'selected';}?> >5</option>
            <option value="10" <?php if ($minchip=='10'){echo 'selected';}?> >10</option>
            <option value="25" <?php if ($minchip=='25'){echo 'selected';}?> >25</option>
            <option value="100" <?php if ($minchip=='100'){echo 'selected';}?> >100</option>
            <option value="500" <?php if ($minchip=='500'){echo 'selected';}?> >500</option>
            </select>
            
        </td>
    </tr>
    <tr class="formRow cwsList">
        <td>
            <label>Max Chip</label>
            <br /><span style="color:red;font-size:9px">(<?=$lang['the+highest+value+chip+that+will+appear+on+the+bet+area']?>)</span>
        </td>
        <td>
        	<select id="maxchip">
            <option value="0.01" <?php if ($maxChip=='0.01'){echo 'selected';}?>>0.01</option>
            <option value="0.05" <?php if ($maxChip=='0.05'){echo 'selected';}?>>0.05</option>
            <option value="0.10" <?php if ($maxChip=='0.10'){echo 'selected';}?>>0.10</option>
            <option value="0.25" <?php if ($maxChip=='0.25'){echo 'selected';}?>>0.25</option>
            <option value="1" <?php if ($maxChip=='1'){echo 'selected';}?>>1</option>
            <option value="5" <?php if ($maxChip=='5'){echo 'selected';}?> >5</option>
            <option value="10" <?php if ($maxChip=='10'){echo 'selected';}?> >10</option>
            <option value="25" <?php if ($maxChip=='25'){echo 'selected';}?> >25</option>
            <option value="100" <?php if ($maxChip=='100'){echo 'selected';}?> >100</option>
            <option value="500" <?php if ($maxChip=='500'){echo 'selected';}?> >500</option>
            </select>    
        </td>
    </tr>
    <?php }?>
    <?php if (stristr($row['game_type'],'slot')){?>
	<?php if ($row['autofullscreen']!=='2'){?>
    <tr class="formRow cwsList">
    	<td>
    		<label>Autofullscreen</label>
            <br /><span style="color:red;font-size:9px"><?=$lang['If+enabled']?>, <?=$lang['when+game+starts+show+text']?> "CLICK HERE TO START GAME". <?=$lang['When+user+clicks+the+text']?>, <?=$lang['the+game+will+open+in+fullscreen']?>.<br /><?=$lang['If+disabled']?>, <?=$lang['no+text+will+appear+and+player+must+manually+enter+fullscreen']?></span>
        </td>
        <td>        
            <select id="autofullscreen">
            <option value="1" <?php if ($row['autofullscreen']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
            <option value="0" <?php if ($row['autofullscreen']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
            </select>
        </td>
    </tr>
    <?php } ?>
    <?php if (strlen($row['freespins_odds'])>1){
	$scatters = explode(',',$row['freespins_odds']);	
	?>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds to give 5 scatters</label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+1000+to+have+1+out+of+1000+chances+to+give+the+player']?> 5 scatters</span><br /><span style="color:blue;font-size:9px">3+ scatters give freespins in 5RS games<br />4+ scatters give freespins in 7RS games</span>
        </td>
        <td>        
            1:<input type="text" class="text small" name="smallfield" id="fs_odds5" value="<?=$scatters[4]?>" style="width:170px"/>
        </td>
    </tr>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds to give 4 scatters</label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+1000+to+have+1+out+of+1000+chances+to+give+the+player']?> 4 scatters</span><br /><span style="color:blue;font-size:9px">3+ scatters give freespins in 5RS games<br />4+ scatters give freespins in 7RS games</span>
        </td>
        <td>        
            1:<input type="text" class="text small" name="smallfield" id="fs_odds4" value="<?=$scatters[3]?>" style="width:170px"/>            
        </td>
    </tr>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds to give 3 scatters</label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+1000+to+have+1+out+of+1000+chances+to+give+the+player']?> 3 scatters</span><br /><span style="color:blue;font-size:9px">3+ scatters give freespins in 5RS games<br />4+ scatters give freespins in 7RS games</span>
        </td>
        <td>        
            1:<input type="text" class="text small" name="smallfield" id="fs_odds3" value="<?=$scatters[2]?>" style="width:170px"/>          
        </td>
    </tr>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds to give 2 scatters</label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+1000+to+have+1+out+of+1000+chances+to+give+the+player']?> 2 scatters</span><br /><span style="color:blue;font-size:9px">3+ scatters give freespins in 5RS games<br />4+ scatters give freespins in 7RS games</span>
        </td>
        <td>        
            1:<input type="text" class="text small" name="smallfield" id="fs_odds2" value="<?=$scatters[1]?>" style="width:170px"/>
        </td>
    </tr>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds to give 1 scatters</label>
            <br /><span style="color:red;font-size:9px">EG : <?=$lang['set+this+to+1000+to+have+1+out+of+1000+chances+to+give+the+player']?> 1 scatters</span><br /><span style="color:blue;font-size:9px">3+ scatters give freespins in 5RS games<br />4+ scatters give freespins in 7RS games</span>
        </td>
        <td>        
            1:<input type="text" class="text small" name="smallfield" id="fs_odds1" value="<?=$scatters[0]?>" style="width:170px"/>            
        </td>
    </tr>
    <?php } ?>
    <?php if (strlen($row['symbols_odds'])>1){
	$symbols = explode(',',$row['symbols_odds']);
	$symbols = array_count_values($symbols);
	//print_r($symbols);
	?>
    <tr class="formRow cwsList">
    	<td>
    		<label>Odds of apparition for each symbol</label>
            <br />
            <span style="color:red;font-size:10px"><?=$lang['With+this+feature+you+can+set+which+symbols+to+appear+more+often+and+which+should+appear+less+often']?>. <?=$lang['The+apparition+odds+of+each+symbol+should+be+a+value+between+1+and+10']?>!</span><br />
            <br /><span style="font-size:9px;color:blue">SYMBOL 1 is SCATTER. 3RS slots dont have SCATTER.</span><br /><span style="font-size:9px;color:blue">SYMBOL 2 is WILD. 3RS slots dont have WILD.</span><br><span style="font-size:9px;color:blue">SYMBOL 4 is BONUS. 3RS slots dont have BONUS.</span>
            <br /><span style="font-size:9px;color:blue">SYMBOL 7 is JP BONUS. 3RS slots dont have JP BONUS.</span>
            <br /><span style="font-size:9px;color:red">EG: Set all symbols to value 2 and S3 to value 7 and this way the players will have the chance to get bonus mode more often!<br />Set all symbols to value 2 and S9,S10,S11,S12 to higher values, and the symbols S9,S10,S11,S12 will appear more often in each spin.</span>
            </td>
        <td> 
        	<div style="float:left;width:50px">
            <?php if ($row['game_type']=='slot3rs' || $row['id']=='1100' ||stristr($row['game_type'],'multispin')){?><span style="color:#930">S 1</span><br /><?php } ?>
            <input <?php if ($row['game_type']=='slot3rs' || $row['id']=='1100' ||stristr($row['game_type'],'multispin')){echo 'type="text"';}else{echo 'type="hidden"';}?> class="text small" name="smallfield" id="sym1" value="<?php if (isset($symbols[1]) && is_numeric($symbols[1])){echo $symbols[1];}else{echo '0';}?>" style="width:30px"/>
            </div> 
            <div style="float:left;width:50px">
            <span style="color:#930"><?php if ($row['game_type']=='slot5rs' ||$row['game_type']=='slot7rs' ||$row['game_type']=='slot9rs'){echo 'S 2<span style="font-size:8px">(WILD)</span>';}else{echo 'S 2';}?></span><br />
            <input type="text" class="text small" name="smallfield" id="sym2" value="<?php if (isset($symbols[2]) && is_numeric($symbols[2])){echo $symbols[2];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 3</span><br />
            <input type="text" class="text small" name="smallfield" id="sym3" value="<?php if (isset($symbols[3]) && is_numeric($symbols[3])){echo $symbols[3];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 4</span><br />
            <input type="text" class="text small" name="smallfield" id="sym4" value="<?php if (isset($symbols[4]) && is_numeric($symbols[4])){echo $symbols[4];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 5</span><br />
            <input type="text" class="text small" name="smallfield" id="sym5" value="<?php if (isset($symbols[5]) && is_numeric($symbols[5])){echo $symbols[5];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 6</span><br />
            <input type="text" class="text small" name="smallfield" id="sym6" value="<?php if (isset($symbols[6]) && is_numeric($symbols[6])){echo $symbols[6];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <br /><br /><br /><br />
            <div style="float:left;width:40px">
            <span style="color:#930">S 7</span><br />
            <input type="text" class="text small" name="smallfield" id="sym7" value="<?php if (isset($symbols[7]) && is_numeric($symbols[7])){echo $symbols[7];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 8</span><br />
            <input type="text" class="text small" name="smallfield" id="sym8" value="<?php if (isset($symbols[8]) && is_numeric($symbols[8])){echo $symbols[8];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <?php if (!(stristr($row['game_type'],'slot3rs'))){?>
            <div style="float:left;width:40px">
            <span style="color:#930">S 9</span><br />
            <input type="text" class="text small" name="smallfield" id="sym9" value="<?php if (isset($symbols[9]) && is_numeric($symbols[9])){echo $symbols[9];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <div style="float:left;width:40px">
            <span style="color:#930">S 10</span><br />
            <input type="text" class="text small" name="smallfield" id="sym10" value="<?php if (isset($symbols[10]) && is_numeric($symbols[10])){echo $symbols[10];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <?php if (!(stristr($row['game_type'],'multispin'))){?>
            <div style="float:left;width:40px">
            <span style="color:#930">S 11</span><br />
            <input type="text" class="text small" name="smallfield" id="sym11" value="<?php if (isset($symbols[11]) && is_numeric($symbols[11])){echo $symbols[11];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <?php if (!(stristr($row['game_type'],'slot7rs'))){?>
            <div style="float:left;width:40px">
            <span style="color:#930">S 12</span><br />
            <input type="text" class="text small" name="smallfield" id="sym12" value="<?php if (isset($symbols[12]) && is_numeric($symbols[12])){echo $symbols[12];}else{echo '0';}?>" style="width:30px"/>
            </div>
            <?php } ?>
            <?php } ?>
            <?php } ?>
        </td>
        
    </tr>
     <?php
	if (stristr($row['game_type'],'slot') && !stristr($row['game_type'],'slot3rs')){
		$paytable_path = $_SERVER['DOCUMENT_ROOT'].'/'.str_replace('preview.gif','paytable.php',$row['preview_pic']);
		if (file_exists($paytable_path)){
	?>
    <tr class="formRow cwsList">
    	<td>
        <label><?=$lang['Paytable+values+of+game+symbols']?><br /><span style="font-size:10px">(<?=$lang['editable+from']?> paytable.php <?=$lang['file']?>)</span></label>
        </td>
        <td>
        <div style="display:none">
        <?php
		@require_once($paytable_path);
		?>
        </div>
        <div>
        <table style="width:400px;border:2px solid #CCC">
        <tr>
        <td class="acenter" style="font-size:16px;font-weight:bold;color:#00F">
        SYMBOL
        </td>
        <td class="acenter" style="font-size:19px;font-weight:bold;color:#00F">
        x3
        </td>
        <td class="acenter" style="font-size:19px;font-weight:bold;color:#00F">
        x4
        </td>
        <td class="acenter" style="font-size:19px;font-weight:bold;color:#00F">
        x5
        </td>
        </tr>
        <?php
		foreach($winmultiplier as $key=>$val){
			echo '<tr><td class="acenter" style="color:orange;font-weight:bold;font-size:17px">S'.$key.'</td>';
			if (is_array($val)){
				foreach($val as $key2=>$val2){
					if ($key==1){
						$val2 = 'FREESPINS';
						$color = 'blue';	
					}elseif($key==2){
						$val2 = 'WILD';	
						$color = 'red';
					}else{
						$val2 = 'x'.$val2;
						$color = 'green';
					}
					echo '<td class="acenter" style="color:'.$color.'">'.$val2.'</td>';
				}
			}
			echo '</tr>';
		}
		?>
        </table>
        </div>
        </td>
    </tr>
    <?php
		}
	}
	?>
    <?php
	if (stristr($row['game_type'],'slot3rs')){
		$paytable_path = $_SERVER['DOCUMENT_ROOT'].'/'.str_replace('preview.gif','3rspaytable.php',$row['preview_pic']);
		if (file_exists($paytable_path)){
	?>
    <tr class="formRow cwsList">
    	<td>
        <label><?=$lang['Paytable+values+of+game+symbols']?><br /><span style="font-size:10px">(<?=$lang['editable+from']?> paytable.php <?=$lang['file']?>)</span></label>
        </td>
        <td>
        <div style="display:none">
        <?php
		@require_once($paytable_path);
		?>
        </div>
        <div>
        <table style="width:200px;border:2px solid #CCC">
        <tr>
        <td class="acenter" style="font-size:16px;font-weight:bold;color:#00F">
        SYMBOL
        </td>
        <td class="acenter" style="font-size:19px;font-weight:bold;color:#00F">
        x3
        </td>
        </tr>
        <?php
		foreach($winmultiplier as $key=>$val){
			echo '<tr><td class="acenter" style="color:orange;font-weight:bold;font-size:17px">S'.$key.'</td>';
			echo '<td class="acenter" style="color:green">x'.$val.'</td>';
			echo '</tr>';
		}
		?>
        </table>
        </div>
        </td>
    </tr>
    <?php
		}
	}
	?>
    <?php } ?>
    <?php if (!(stristr($row['game_type'],'slot3rs'))){?>
    <tr class="formRow cwsList">
        <td>
            <label><?=$lang['Paylines+also+pay+from']?> <br /><?=$lang['RIGHT+to+LEFT']?></label>
        </td>
        <td>
            <select id="pays_rtl">
            <option value="1" <?php if ($row['pays_rtl']==1){echo 'selected';}?>><?=$lang['Yes']?></option>
            <option value="0" <?php if ($row['pays_rtl']==0){echo 'selected';}?>><?=$lang['No']?></option>
            </select>
        </td>
    </tr>
    <?php } ?>
    <tr class="formRow cwsList"> 
        <td>
            <label> Paylines </label>
        </td>
        <td>
            <span style="font-weight:bold;color:blue"><?=$row['paylines']?></span>
        </td>
    </tr>
    <?php } ?>
    <tr class="formRow cwsList">
    <td colspan="2">
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" id="update"><span><?=$lang['Update']?></span></a>
    <script type="text/javascript">
	$("#rules").cleditor({
		width:"100%",
		height:"100%",
		bodyStyle: "margin: 10px; font: 12px Arial,Verdana; cursor:text"
	});
	$("#description").cleditor({
		width:"100%",
		height:"100%",
		bodyStyle: "margin: 10px; font: 12px Arial,Verdana; cursor:text"
	});
    $("#update").click(function() {
                    var name = $("#name").val();
                    var description = $("#description").val();
                    var rules = $("#rules").val();
                    var min_bet = $("#min_bet").val();
                    var max_bet = $("#max_bet").val();
                    var max_win = $("#max_win").val();
                    var win_mult = $("#win_mult").val();
					
					var jp_win_chances = $("#jp_win_chances").val();
					var coef = $("#coef").val();
					var bank = $("#bank").val();
					var freespins_bank = $("#freespins_bank").val();
					var bonus_bank = $("#bonus_bank").val();
					var megawin_bank = $("#megawin_bank").val();
					var ultrawin_bank = $("#ultrawin_bank").val();

				    var megawin_mult = $("#megawin_mult").val();
					var jp_min_pay = $("#jp_min_pay").val();
                    var pays_rtl = $("#pays_rtl").val();
                    var firstreelstop = $("#firstreelstop").val();
					var reelstop = $("#reelstop").val();
					var fs1 = $("#fs_odds1").val();
					if (fs1==undefined){
						var freespins_odds = '';	
					}else{
						var freespins_odds = $("#fs_odds1").val()+','+$("#fs_odds2").val()+','+$("#fs_odds3").val()+','+$("#fs_odds4").val()+','+$("#fs_odds5").val();
					}
					var s1 = $("#sym1").val();
					if (s1==undefined || s1==""){
						s1 = 0;
					}
					var s2 = $("#sym2").val();
					if (s2==undefined || s2==""){
						s2 = 0;
					}
					var s3 = $("#sym3").val();
					if (s3==undefined || s3==""){
						s3 = 0;
					}
					var s4 = $("#sym4").val();
					if (s4==undefined || s4==""){
						s4 = 0;
					}
					var s5 = $("#sym5").val();
					if (s5==undefined || s5==""){
						s5 = 0;
					}
					var s6 = $("#sym6").val();
					if (s6==undefined || s6==""){
						s6 = 0;
					}
					var s7 = $("#sym7").val();
					if (s7==undefined || s7==""){
						s7 = 0;
					}
					var s8 = $("#sym8").val();
					if (s8==undefined || s8==""){
						s8 = 0;
					}
					var s9 = $("#sym9").val();
					if (s9==undefined || s9==""){
						s9 = 0;
					}
					
					var s10 = $("#sym10").val();
					if (s10==undefined || s10==""){
						s10 = 0;
					}
					var s11 = $("#sym11").val();
					if (s11==undefined || s11==""){
						s11 = 0;
					}
					var s12 = $("#sym12").val();
					if (s12==undefined || s12==""){
						s12 = 0;
					}
					var symbols_odds = s1+','+ s2+','+ s3+','+ s4+','+ s5+','+ s6+','+ s7+','+ s8+','+ s9+','+ s10+','+ s11+','+ s12;
					//alert(symbols_odds);
                    
                    <?php if (stristr($row['game_type'],'table')){?>
						var minc = $("#minchip option:selected").val();
						var maxc = $("#maxchip option:selected").val();
						var bet_sizes = minc+','+maxc;
					<?php }else{ ?>
						var bet_sizes = $("#bet_sizes").val();
					<?php } ?>
                    var autofullscreen = $("#autofullscreen option:selected").val();
                    var animation_speed = $("#animation_speed option:selected").val();
                    var jackpot = $("#jackpot").val();
					if (jackpot==undefined){
						jackpot = 0;
					}
                    var status = $("#status option:selected").val();
                    $.post("includes/show/gm_list_e.inc.php", { update: "1",ultrawin_bank:ultrawin_bank,symbols_odds:symbols_odds,freespins_bank:freespins_bank,bank:bank,coef:coef,megawin_bank:megawin_bank,animation_speed:animation_speed,freespins_odds:freespins_odds,win_mult:win_mult,pays_rtl:pays_rtl,megawin_mult:megawin_mult,firstreelstop:firstreelstop,reelstop:reelstop,autofullscreen:autofullscreen,bet_sizes:bet_sizes, name: name, id: <?=antisqli($_POST['id'])?>, status: status,bonus_bank:bonus_bank, max_win: max_win, max_bet: max_bet, min_bet: min_bet, rules: rules, description: description, jackpot:jackpot,jp_min_pay:jp_min_pay, jp_win_chances:jp_win_chances },
       function(data){
         $("#show").html(data);
         $("#updated").fadeTo(5000,0);
       });
                                 });
    </script>
    </td>
    </tr>
    </table>
    
</div>
</td>
<td width="480" valign="top">
<?php
$tmp = explode('/',$row['location']);
?>
<a href="<?=get_protocol_srv().$_SERVER['SERVER_NAME'].'/launch_game.php?id='.$row['id']?>" title="Play <?=$row['name']?>">
<img src="<?='http://'.$_SERVER['SERVER_NAME'].'/'.$tmp[0].'/'.$tmp[1].'/'.$tmp[2].'/preview_pic.jpg'?>" align="left" height="360" width="480" style="border:1px solid #999;padding:2px;margin:30px"/>
</a>
</td>
</tr>
</table>
</div>
</fieldset>
</form>