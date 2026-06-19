<?php
function bonus_active($userid){ // check if an user has active bonus,
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='$userid' AND status='1'"))>0){
		return true;
	}else{
		return false;
	}
}
function has_active_bonuses($userid){
	if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='$userid' AND status='1'"))>0){
		return true;
	}else{
		return false;
	}
}
function check_bonus_played($userid){//verify if bonus rollover limit was reached
	//get date of first activated bonus
	$data = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='$userid' AND status='1' ORDER BY date ASC"));
	$start_date = $data['date'];
	
	//get user login name
	$ulogin = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT login FROM cws_users WHERE id='$userid'"),0);
	//calculate total bet
	$total_bet = get_total_bets($ulogin,$start_date);
	$limit = get_rollover_limit($userid);
	// if the total bets of the player, exceed the total rollover required, then his bonus status is finished
	if ($total_bet>=$limit){ 
		return true;
	}else{ // if bet did not exceed limit, then player is under BONUS STATUS
		return false;
	}
}
function get_banned_games(){
	$pq = mysqli_query($GLOBALS['con'],"SELECT banned_games FROM cws_settings") or die(mysqli_error($GLOBALS['con']));
	$banned_games = '99999,'.mysqli_result($pq,0);
	$banned_games = trim($banned_games,',');
	return $banned_games;
}
function get_total_bets($username,$start_date){//return total amount of bets, since BONUS was activated
	//get banned_games
	
	$banned_games = get_banned_games();
	return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='$username' AND mode='real' AND date>='$start_date' AND id NOT in ($banned_games)"),0);
}

function bet_interval($username,$start_date,$end_date){//return total amount of bets, since BONUS was activated
	//get banned_games
	
	$banned_games = get_banned_games();
	return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='$username' AND mode='real' AND date>='$start_date' AND date<='$end_date' AND id NOT in ($banned_games)"),0);
}

function get_total_bets_admin($username,$start_date){//return total amount of bets, since BONUS was activated
	//get banned_games
	$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$username'"),0);
	$banned_games = get_banned_games();
	
	$bonuses_after = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='$userid' AND status='1' AND date>'$start_date' ORDER BY date ASC");
	$total_bonuses_before = 0;
	$st_date = $start_date;
	$total_bet = 0;
	while ($row = mysqli_fetch_array($bonuses_after)){
		$total_bonuses_before = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_bonuses_instant WHERE userid='$userid' AND status='1' AND date<'{$row['date']}' ORDER BY date ASC"),0);		
		$tbet = bet_interval($username,$st_date,$row['date']); // get total bets between the date of previous bonus and next bonus
		$st_date = $row['date'];
		$total_bet += $tbet / $total_bonuses_before;
		//echo '&FORMULA='.$tbet.'/'.$total_bonuses_before.'||||';
	}
	
	$total_bonuses = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_bonuses_instant WHERE userid='$userid' AND date<='$st_date' AND status='1'"),0);
	//echo '&TBON='.$total_bonuses;
	$total_bet_after = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='$username' AND mode='real' AND date>='$st_date' AND id NOT in ($banned_games)"),0);
	//echo '&TBET='.$total_bet_after;
	if ($total_bonuses==0){
		$total_bet += $total_bet_after;
	}else{
		$total_bet += $total_bet_after / $total_bonuses;
	}
	
	return number_format($total_bet,2,'.','');
}

function get_total_bets_admin1($username,$start_date){//return total amount of bets, since BONUS was activated
	//get banned_games
	$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$username'"),0);
	$banned_games = get_banned_games();
	
	$tbet = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet),0) FROM cws_gameplays WHERE user='$username' AND mode='real' AND date>='$start_date' AND id NOT in ($banned_games)"),0);

	$nr_active = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COUNT(*) FROM cws_bonuses_instant WHERE userid='$userid' AND status='1' AND date<='$start_date'"),0);
	if ($nr_active==0){
		return $tbet;
	}
	return $tbet/$nr_active;
}

function get_rollover_limit($userid){//calculate rollover limit that must be met to give bonus
	//return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT (deposit+bonus)*rollover FROM cws_bonuses_instant WHERE id='$bonusid'"),0);
	return mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM((deposit+bonus)*rollover),0) FROM cws_bonuses_instant WHERE userid='$userid' AND status='1'"),0);
}

function credit_just_bonus($type,$userid,$deposit,$bonus,$rollover){// INCOMPLETE
	global $bonuscode;
	//insert bonus to table
	mysqli_query($GLOBALS['con'],"INSERT INTO cws_bonuses_instant (`type`,`userid`,`deposit`,`bonus`,`rollover`,`status`) VALUES ('$type','$userid','$deposit','$bonus','$rollover','1')");
	//give bonus to the player
	mysqli_query($GLOBALS['con'],"UPDATE cws_users SET cash=cash+'$bonus' WHERE id='$userid'");
	
	//give code bonus to who created the bonus code
	if (ENABLE_BONUSPL==1 && stristr($type,'depbn') && isset($bonuscode) && strlen($bonuscode)>2){
		$codeOwner = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT created_by FROM cws_codes_bonus WHERE code='$bonuscode' AND status='1' AND ctype='p'"),0);
		if ($codeOwner==""){}else{
			$userid = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_users WHERE login='$codeOwner'"),0);
			$depositid = str_replace('depbn-','',$type);
			credit_just_bonus('AffDepID-'.$depositid,$userid,0,$bonus/10,10);//give 10%bonus to the bonus owner
		}
	}
}
function set_bonus_eligible($bonusid){//set bonus as completed
	mysqli_query($GLOBALS['con'],"UPDATE cws_bonuses_instant SET status='2' WHERE id='$bonusid'");
}

function check_validity($bonuscode,$username){//check if the user already used this bonus code and if he is allowed to use it once more
	$q4 = mysqli_query($GLOBALS['con'],"SELECT limit_per_account FROM cws_codes_bonus WHERE code='$bonuscode' AND status='1'") or die(mysqli_error($GLOBALS['con']));
	$limit = mysqli_result($q4,0);
	if ($limit==""){
		//it means the bonus code was not found
		return false;
	}
	//if FIRST DEPOSIT BONUS and if it was already given, return false
	if ($limit>0){
		if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE user='$username' AND details='BONUSCODE=$bonuscode'"))>=$limit){
			//bonus already given
			//echo 'LIMIT='.$limit;
			//echo 'USAGES='.mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_deposits WHERE user='$username' AND details='BONUSCODE=$bonuscode'"));
			return false;
		}
	}
	return true;
}

function verify_and_update(){
	$tq = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1' ORDER BY date ASC");
	if (mysqli_num_rows($tq)==0){
		return 0;
	}
	$temp_percent = 0;
	$p = 0;
	while ($tbon = mysqli_fetch_array($tq)){
		$start_date = $tbon['date'];// get first player bonus
		$total_bets = get_total_bets($_SESSION['username'],$start_date);//get total bets since that date
		$ulimit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM((deposit+bonus)*rollover),0) FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND id='{$tbon['id']}' AND status='1'"),0);
		$temp_percent = number_format(min($total_bets*100/$ulimit,100),2);
		if ($temp_percent==100 || $ulimit==0 || $tbon['rollover']==0){
			set_bonus_eligible($tbon['id']);	
		}
	}
	$tactive = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bonus),0) FROM cws_bonuses_instant WHERE userid='{$_SESSION['userid']}' AND status='1'"),0); 
	return $tactive;
}
?>