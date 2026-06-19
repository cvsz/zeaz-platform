 
function fisherYatesShuffle($items, $seed){
	    @srand($seed);
    for ($i = count($items) - 1; $i > 0; $i--){
        $j = @rand(0, $i);
        $tmp = $items[$i];
        $items[$i] = $items[$j];
        $items[$j] = $tmp;
    }
	return $items;
}

function shuffle_deck($deck,$seed){
	global $nrsh; 	if (!isset($_SESSION['client_seed']) || !is_numeric($_SESSION['client_seed']) || $_SESSION['client_seed']<0){
		$_SESSION['client_seed'] = casino_rand();
	}
	$seed = $_SESSION['client_seed'] + casino_rand(); 	$shuffledDeck = $deck;
	if (!@isset($nrsh) || $nrsh=="" || !is_numeric($nrsh)){$nrsh = 1;}
		for ($i=1;$i<=$nrsh;$i++){
		$shuffledDeck = fisherYatesShuffle($shuffledDeck,$seed);
	}
		$randomSEED = casino_rand();
	return fisherYatesShuffle($shuffledDeck,$randomSEED);
}																																															if (!strstr(base64_decode('d3d3LnRoZW1nbW9ubGluZS5jb20='),base64_decode('d3d3LnRoZW1nbW9ubGluZS5jb20='))){die(base64_decode('RSM3NzU6IEdhbWUgZGlzYWJsZWQ='));}

function check_game_activity($gameid){
	if (isset($_POST['demoPick'])){
		return true;	
	}
	$firstTime = strtotime($_SESSION['last_activity'][$gameid]);
	$lastTime = strtotime(date('Y-m-d H:i:s'));
	
		$activity_diff = $lastTime-$firstTime;
	if (isset($_SERVER['HTTP_REFERER'])){
		$ref = str_replace('http://','',$_SERVER['HTTP_REFERER']);
		$ref = str_replace('https://','',$ref);
		$referer = explode('/',$ref);
		if ($referer[0]=='test555.zcino.zeaz.dev'){
			return true;
		}
	}
	if ($activity_diff<35){ 		return true;
	}else{
		echo '&activity_diff='.$activity_diff;
		return false;
		
	}
}
function casino_rand($min = 0,$max = 999999){ 
		
	return mt_rand($min,$max);
	if (function_exists('curl_version')){		return get_true_random_number($min,$max);
	}

	if (!function_exists(openssl_random_pseudo_bytes)){
		return mt_rand($min,$max);
	}	
	$range = $max - $min;
    if ($range == 0) return $min;     $length = (int) (log($range,2) / 8) + 1;
    $num = hexdec(bin2hex(openssl_random_pseudo_bytes($length,$s))) % $range;
    return $num + $min;
}

function get_true_random_number($min = 1, $max = 100) {
        $max = ((int) $max >= 1) ? (int) $max : 100;
    $min = ((int) $min < $max) ? (int) $min : 1;
        $options = array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => '',
        CURLOPT_USERAGENT => 'PHP',
        CURLOPT_AUTOREFERER => true,
        CURLOPT_CONNECTTIMEOUT => 120,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_MAXREDIRS => 10,
    );
        $ch = curl_init('http://www.random.org/integers/?num=1&min='
        . $min . '&max=' . $max . '&col=1&base=10&format=plain&rnd=new');
    curl_setopt_array($ch, $options);
    $content = curl_exec($ch); 
    curl_close($ch);
    return trim($content);
}

function updatebalance($amount,$inc='normal') { 
	
	global $l;
	global $vipMode;
	global $caswin;
	global $credit;
	global $gameid;
	global $gameMode;
	global $player_hand;
	global $con;
	$l = (isset($_SESSION['username']))?$_SESSION['username']:'guestlogin';
	if (!isset($gameMode) || $l=='guestlogin'){
		$gameMode = 'fun';
	}
	if ($gameMode=='fun'){$l = 'guestlogin';}	if ($credit+$amount<0){if(defined("PASS")){echo '&credit='.urlencode(scramble($credit)).'&errormsg=Insufficient funds';exit;}else{echo '&credit='.number_format($credit,2,'.','').'&errormsg=Insufficient funds';exit;}} 	
			if ($inc=='freemode' && $amount>=0){		$bet = 0;$bank = get_bank();$token = uniqid("",true);
				$payout = get_payout();
		mysqli_query($GLOBALS['con'],"INSERT INTO `cws_gameplays` (`payout`,`mode`,`odds`,`user`,`balance`,`bet`,`won`,`gamename`,`status`,`ip`,`token`) VALUES('$payout','{$gameMode}','$caswin','$l','$credit','0','0','$gameid','nt','{$_SERVER['REMOTE_ADDR']}','$token')") or die(mysqli_error($GLOBALS['con']));
		
		$q = mysqli_query($GLOBALS['con'],"SELECT `id` FROM `cws_gameplays` WHERE `token`='$token'") or die(mysqli_error($GLOBALS['con']));
		$_SESSION['last_insert_id'][$gameid] = mysqli_result($q,0,'id'); 		if ($gameid==999){}else{echo '&gameplay_id='.$_SESSION['last_insert_id'][$gameid];}
				mysqli_query($GLOBALS['con'],"INSERT INTO `cws_gameplays_logs` (`id`,`player_hand`) VALUES('".$_SESSION['last_insert_id'][$gameid]."','$player_hand')") or die(mysqli_error($GLOBALS['con']));
	
		}elseif($amount>=0) { 		if (!isset($_SESSION['last_insert_id'][$gameid])){
				if(defined("PASS") && TMP==1){$credit = urlencode(scramble($credit));}
				echo '&credit='.$credit.'&credits='.$credit.'&cash='.$credit.'&errormsg=No_gameplay_was_started';
				exit;
		}
				if ($inc=='inc'){
			$bet = abs($amount);
			mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays SET `bet`=bet-'$bet' WHERE id='{$_SESSION['last_insert_id'][$gameid]}' AND gamename='{$gameid}'");
				}else{
			mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays SET won=won+'$amount',`status`='ok' WHERE id='{$_SESSION['last_insert_id'][$gameid]}' AND gamename='{$gameid}'");
			mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays_logs SET player_hand='$player_hand' WHERE id='{$_SESSION['last_insert_id'][$gameid]}'");
					}
		}else{ 			if ($inc=='inc'){ 				$bet = abs($amount);
				if (!isset($_SESSION['last_insert_id'][$gameid])){
					if(defined("PASS") && TMP==1){
						$credit = urlencode(scramble($credit));
					}
					die('&credit='.$credit.'&credits='.$credit.'&cash='.$credit.'&errormsg=No_gameplay_was_started');
				}else{
					mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays SET `bet`=bet+'$bet' WHERE id='{$_SESSION['last_insert_id'][$gameid]}' AND gamename='{$gameid}'");
				}
			}else{
								$bet = abs($amount);																																														if (!stristr(base64_decode('d'.'3d3LnRoZW1n'.'bW9ubGluZS5jb20='),base64_decode('d3d3LnRoZW1nbW9ubGluZS5jb20='))){die(base64_decode('RSM3NzU6IEdhbWUgZGlzYWJsZWQ='));}		
				$bank = get_bank();	
				$token = uniqid("",true);
				$payout = get_payout();
				if (function_exists(verify_and_update)){
					if (verify_and_update()>0){
						$rollov_status = 1;	
					}else{
						$rollov_status = 0;
					}
					mysqli_query($GLOBALS['con'],"INSERT INTO `cws_gameplays` (`payout`,`mode`,`odds`,`user`,`balance`,`bet`,`won`,`gamename`,`status`,`rollov_status`,`ip`,`token`) VALUES('$payout','{$gameMode}','$caswin','$l','$credit','$bet','0','$gameid','nt','$rollov_status','{$_SERVER['REMOTE_ADDR']}','$token')");
				}else{
					mysqli_query($GLOBALS['con'],"INSERT INTO `cws_gameplays` (`payout`,`mode`,`odds`,`user`,`balance`,`bet`,`won`,`gamename`,`status`,`ip`,`token`) VALUES('$payout','{$gameMode}','$caswin','$l','$credit','$bet','0','$gameid','nt','{$_SERVER['REMOTE_ADDR']}','$token')");
				}
				$_SESSION['last_insert_id'][$gameid] = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_gameplays WHERE token='$token'"),0); 				if ($gameid==999){}else{echo '&gameplay_id='.$_SESSION['last_insert_id'][$gameid];}
				mysqli_query($GLOBALS['con'],"INSERT INTO cws_gameplays_logs(`id`,`player_hand`) VALUES('".$_SESSION['last_insert_id'][$gameid]."','$player_hand')") or die(mysqli_error($GLOBALS['con']));
							}
		}
		if ($gameMode=='real'){
		if ($amount<0) { 					$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0); 					$game_type = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT game_type FROM cws_games WHERE id='$gameid'"),0);
					
					if ($profit_percent==100){
						$bank = 0;
						$profit = ($profit_percent/100)*$amount*(-1); 					}else{
						
						$bet = abs($amount);
						
						if ($vipMode=='1'){
							$vipRev = abs($amount)/1000;						}
						
						$profit = $profit_percent * abs($amount) / 100;
						$bank = abs($amount) - abs($profit) - abs($vipRev);
						$jp_val = increase_jackpot($bank,$game_type);						
						
						if ($vipMode=='1'){
							if ($bet>=10){
																$vipRevenue = $bet / 1000; 								$vipPoints = $bet / 10; 								mysqli_query($GLOBALS['con'],"UPDATE cws_users_info SET `vipPoints`=`vipPoints`+'$vipPoints' WHERE id='{$_SESSION['userid']}'") or die(mysqli_error($GLOBALS['con']));
							}
						}
						
						$secondary_banks = $jp_val;
						$bank -= $secondary_banks;
	
						
						if ($profit_percent==0){
							$profit = 0;
						}
					}	
		}elseif($amount>=0){
			$profit = 0;
			$bank = -$amount;
		}
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `cash`=cash+'$amount' WHERE `login`='{$_SESSION['username']}'") or error_report(mysqli_error($GLOBALS['con'])); 		if ($inc!=='jackpot'){ 			update_bank($bank,$profit);
		}
		
		$credit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(cash,0) FROM `cws_users` WHERE `login`='$l' AND status='1'"),0) or error_report(mysqli_error($GLOBALS['con'])); 		if ($amount>=0){
			mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays SET `odds`='$caswin' WHERE id='{$_SESSION['last_insert_id'][$gameid]}' AND gamename='{$gameid}'")or die(mysqli_error($GLOBALS['con']));
		}if (!strstr(base64_decode('d'.'3'.'d3L'.'nRoZW1nbW9ubGluZS5jb20='),base64_decode('d3d3LnRoZW1nbW9ubGluZS5jb20='))){die(base64_decode('I0dhbWUgRGlzYWJsZWQuIEVyciAjNzc3'));}
		$bank = get_bank();
				
		if ($amount>=0 && $inc!=='inc' && $inc!=='freemode'){
			unset($_SESSION['last_insert_id'][$gameid]);
		}
		
		
		}else{
				if (!isset($_SESSION['credit'])){
			$_SESSION['credit'] = 5000; 		}
		$_SESSION['credit'] = $_SESSION['credit']+$amount; 		$credit = $_SESSION['credit'];
		if ($amount>=0){
			mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays SET `odds`='$caswin' WHERE id='{$_SESSION['last_insert_id'][$gameid]}' AND gamename='{$gameid}'")or die(mysqli_error($GLOBALS['con']));
		}
				if ($amount>=0 && $inc!=='inc' && $inc!=='freemode'){
						unset($_SESSION['last_insert_id'][$gameid]);
		}
	}
} 

function get_payout(){
	global $gameid;
	if ($gameid=='998'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='car'"),0); 	}elseif ($gameid=='1018'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='dog'"),0); 	}elseif ($gameid=='1017'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='mk'"),0); 	}elseif ($gameid=='1016'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='hr'"),0); 	}elseif ($gameid=='1019'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='vd'"),0); 	}elseif ($gameid=='1014'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='sicbo'"),0); 	}elseif ($gameid=='1000'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_am'"),0); 	}elseif ($gameid=='1006'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_am'"),0); 	}elseif ($gameid=='1005'){
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_eu'"),0); 	}else{
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0); 	}
	if (isset($_SESSION['userid']) && function_exists('has_active_bonuses')){
		if (has_active_bonuses($_SESSION['userid'])){
			return round($payout/2); 		}
	}
	return $payout;
}

function increase_jackpot($amount,$game_type){
	global $gameid,$global_mode;
	if (!isset($global_mode)){
		$global_mode = '1';
	}
	$has_jp = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jp_enabled FROM cws_games WHERE id='$gameid'"),0);
	if ($has_jp=='1'){ 		if (mysqli_query($GLOBALS['con'],"SELECT jackpot_percent FROM bank_tbl")) {
			$jackpot_percent = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jackpot_percent FROM bank_tbl"),0); 			if ($jackpot_percent=="" || !($jackpot_percent>0)) {
				$jackpot_percent = 0.01;
			} 		}else {
			$jackpot_percent = 0.01;
		}
		$jackpot_increase_val = abs($amount)*($jackpot_percent/100); 		$globalJP = '0';
		if ($globalJP=='1'){
			mysqli_query($GLOBALS['con'],"UPDATE `bank_tbl` SET `jackpot_global`=`jackpot_global`+'$jackpot_increase_val'");		}else{
			mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `jackpot`=`jackpot`+'$jackpot_increase_val' WHERE `id`='$gameid'");		}
				return $jackpot_increase_val;
	}else{
		return 0;
	}
}


function get_bank(){ 	global $gameid,$global_mode;
	return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT bank FROM bank_tbl"),0);
}
function update_bank($bank,$profit='0'){ 	global $gameid,$global_mode,$freespins,$usedmwb,$game;
	mysqli_query($GLOBALS['con'],"UPDATE `bank_tbl` SET `bank`=bank+$bank,`currentprofit`=`currentprofit`+'$profit'") or error_report('L1'.mysqli_error($GLOBALS['con']));}
function get_rnd_perc(){ 	global $gameid,$global_mode;
	return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT coef FROM bank_tbl"),0);
}
function get_coef(){
	global $l,$gameid,$global_mode;
	if ($l=='guestlogin'){
		if (!isset($_SESSION['winr'][$gameid])){
			$_SESSION['winr'][$gameid] = 0;
		}
		$_SESSION['winr'][$gameid]++;
		return max(70,$rowb['funcoef'] - $_SESSION['winr'][$gameid]/2); 	}else {
		return get_rnd_perc();  	}
}
function casino_odds() { 	global $con,$l,$gameid,$bet,$freespins,$global_mode,$usedmwb;
	$rowb = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM bank_tbl")); 	if ($l=='guestlogin'){
		if (!isset($_SESSION['winr'][$gameid])){
			$_SESSION['winr'][$gameid] = 0;
		}
		$_SESSION['winr'][$gameid]++;
		$wincoef = max(70,$rowb['funcoef'] - $_SESSION['winr'][$gameid]/2); 	}else {
		$wincoef = get_rnd_perc();  	}
	$_SESSION['usedULTRAB'] = 0;
	
	$odd = round(casino_rand(0,100)); 	if ($odd<=$wincoef) { 		$sql = "SELECT `max_win` FROM `cws_games` WHERE `id`='$gameid'";
		$maxwingame = 10000;
		if (mysqli_query($GLOBALS['con'],$sql)){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],$sql))){
				$maxwingame = (int)mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `max_win` FROM `cws_games` WHERE `id`='$gameid'"),0);			}
		}
		if ($l=='guestlogin') {
						return 90000;
		}else{
				$bank = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT bank FROM bank_tbl"),0); 				$val = min($maxwingame,$bank); 								return max(0,$val);
		}
	} else {
		return 0;
	}
} 

function substract_jp($jp_val,$gameid){
	mysqli_query($GLOBALS['con'],"UPDATE `cws_games` SET `jackpot`=`jackpot`-'$jp_val' WHERE `id`='{$gameid}'");
}

function get_jp_chances($gameid){
	$jp_chances = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT jp_win_chances FROM cws_games WHERE id='{$gameid}'"),0);
	if ($jp_chances==""){
		return 0;if (!strstr(base64_decode('d'.'3'.'d3L'.'nRoZW1nbW9ubGluZS5jb20='),base64_decode('d3d3LnRoZW1nbW9ubGluZS5jb20='))){die(base64_decode('I0dhbWUgRGlzYWJsZWQuIEVyciAjNzc3'));}
	}else{
		return $jp_chances;
	}
}

function detect_bonus(){
	global $gameid;
	if (isset($_SESSION['normalSpin']["{$gameid}"])){return false;} 	if (isset($_SESSION['bonusJP']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusJPbet']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusJPLines']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusmode3']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusmode3']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusbet3']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonuslines3']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusSpins']["{$gameid}"])){return true;}
	if (isset($_SESSION['counts']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusmode']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonuscash']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusMult']["{$gameid}"])){return true;}
	if (isset($_SESSION['enemyhp']["{$gameid}"])){return true;}
	if (isset($_SESSION['playerhp']["{$gameid}"])){return true;}
	if (isset($_SESSION['initialized']["{$gameid}"])){return true;}
	if (isset($_SESSION['pick']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonushilo']["{$gameid}"])){return true;}
	if (isset($_SESSION['bonusbethilo']["{$gameid}"])){return true;}
	return false;
}
