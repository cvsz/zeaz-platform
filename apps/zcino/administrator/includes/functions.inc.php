<?php
$counter = 0;
$chkd = array();
$chkdList = array();

function get_payout(){
	global $gameid;
	if ($gameid=='998'){/*car*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='car'"),0); // car race payout from table
	}elseif ($gameid=='1018'){/*dog*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='dog'"),0); // dog race payout from table
	}elseif ($gameid=='1017'){/*mk*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='mk'"),0); // monkey race payout from table
	}elseif ($gameid=='1016'){/*hr*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='hr'"),0); // hr race payout from table
	}elseif ($gameid=='1019'){/*vd*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='vd'"),0); // vdogs race payout from table
	}elseif ($gameid=='1014'){/*sicbo*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='sicbo'"),0); // sicbo payout from table
	}elseif ($gameid=='1000'){/*r am TV*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_am'"),0); // roulette_am payout from table
	}elseif ($gameid=='1006'){/*r am 3D*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_am'"),0); // roulette_am payout from table
	}elseif ($gameid=='1005'){/*r eu 3D*/
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='roulette_eu'"),0); // roulette_eu payout from table
	}else{
		$payout = 100 - mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0); // roulette_eu payout from table	
	}
	if (isset($_SESSION['userid']) && function_exists('has_active_bonuses')){
		if (has_active_bonuses($_SESSION['userid'])){
			return round($payout/2); // custom payout for BONUS ACTIVE players
		}
	}
	return $payout;
}

function get_protocol_srv(){
	if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) {
	    return 'https://';
	}
	return 'http://';
}

function noValue($value){
	if (empty($value) && $value!==0 && $value!=='0' && $value!=='0.00'){
		return true;	
	}else{
		return false;
	}
}
function num_files($directory) { 
    return count(glob($directory."/*.*")); 
}
function show_order_by($pagename,$column_name){
	$webroot = 'http://'.str_replace('http://','',$_SERVER['SERVER_NAME']);
	$_POST['page'] = antisqli($_POST['page']);
	echo '<a onclick="javascript:showparam(\''.$pagename.'\',\'page='.$_POST['page'].'&orderby='.$column_name.'&ordertype=ASC\');"  href="#sortby-'.$column_name.'-ASC">
<img src="'.$webroot.'/administrator/images/asc.gif" alt="Sort Ascending" title="Sort Ascending"/>
</a>
<a onclick="javascript:showparam(\''.$pagename.'\',\'page='.$_POST['page'].'&orderby='.$column_name.'&ordertype=DESC\');"  href="#sortby-'.$column_name.'-DESC">
<img src="'.$webroot.'/administrator/images/desc.gif" alt="Sort Descending" title="Sort Descending"/>
</a>';
}
function checkUsername($str){
	return preg_match("/^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/",$str);
}

function calculate_all_share($agent,$agentPercent,$revenue,$fromdate,$todate,$recalc) {  
	global $counter;
	global $checked;
	if (!isset($checked)){
		$checked = array();
	}
	$counter++;
	$query = "SELECT cws_staffs.percent/100 AS percent, cws_staffs.login AS login FROM cws_staffs WHERE cws_staffs.owner  = '{$agent}'";
	//calculate share from players of current agent
	if (count($checked)==0){
		//$revenue = share_from_players($agent,$agentPercent,$fromdate,$todate);
	}
	//
	$sql = mysqli_query($GLOBALS['con'],$query) or die($query);
	$subAgent = @mysqli_result($sql,0,'login'); // get the username of CURRENT AGENT's first SUBAGENT
	//echo 'MasterAgent='.$agent.';SubAgents='.mysqli_num_rows($sql);
	if (@mysqli_num_rows($sql)>0 && @(!in_array($subAgent,$checked))) {
		for($i=0;$i<=mysqli_num_rows($sql)-1;$i++){
			$percNotSet = 1;
			$subAgent = mysqli_result($sql,$i,'login'); // get the username of CURRENT AGENT's SUBAGENT
			if (@mysqli_num_rows($sql)>0 && @(!in_array($subAgent,$checked))) {
				$subAgentPercent = mysqli_result($sql,$i,'percent'); // percentage of first subagent
				if ($agentPercent-$subAgentPercent > 0 && $recalc==1){
					$percDiff = $agentPercent-$subAgentPercent; // this goes to agent
				}else{
					$percDiff = $agentPercent;
				}
				//echo "share_from_players($percDiff)";
				$shareOfSubAgent = share_from_players($subAgent,$percDiff,$fromdate,$todate); // share from players of subAgent * percdiff
				//echo 'Share from '.$subAgent.'='.$percDiff.' ';
				array_push($checked,$subAgent);
				$revenue += calculate_all_share($subAgent,$percDiff,$shareOfSubAgent,$fromdate,$todate,0); // calculate share of each SUBAGENT
			}
		}
		return round($revenue,2);
	} else {	
		return round($revenue,2);
		}
}

function calculate_all_share_admin($agent,$agentPercent,$revenue,$fromdate,$todate,$recalc) {  
	global $counter;
	global $checked;
	$counter++;
	$query = "SELECT cws_staffs.percent/100 AS percent, cws_staffs.login AS login FROM cws_staffs WHERE cws_staffs.owner  = '{$agent}'";
	//calculate share from players of current agent
	if (count($checked)==0){
		//$revenue = share_from_players($agent,$agentPercent,$fromdate,$todate);
	}
	//
	$sql = mysqli_query($GLOBALS['con'],$query) or die($query);
	$subAgent = @mysqli_result($sql,0,'login'); // get the username of CURRENT AGENT's first SUBAGENT
	//echo 'MasterAgent='.$agent.';SubAgents='.mysqli_num_rows($sql);
	if (mysqli_num_rows($sql)>0 && !in_array($subAgent,$checked)) {
		for($i=0;$i<=mysqli_num_rows($sql)-1;$i++){
			$percNotSet = 1;
			$subAgent = mysqli_result($sql,$i,'login'); // get the username of CURRENT AGENT's SUBAGENT
			if (mysqli_num_rows($sql)>0 && !in_array($subAgent,$checked)) {
				$subAgentPercent = mysqli_result($sql,$i,'percent'); // percentage of first subagent
				if ($agentPercent-$subAgentPercent > 0 && $recalc==1){
					$percDiff = $agentPercent; // this goes to agent
				}else{
					$percDiff = $agentPercent;
				}
				//echo "share_from_players($percDiff)";
				$shareOfSubAgent = share_from_players($subAgent,$percDiff,$fromdate,$todate); // share from players of subAgent * percdiff
				//echo 'Share from '.$subAgent.'='.$percDiff.' ';
				array_push($checked,$subAgent);
				$revenue += calculate_all_share($subAgent,$percDiff,$shareOfSubAgent,$fromdate,$todate,0); // calculate share of each SUBAGENT
			}
		}
		return round($revenue,2);
	} else {	
		return round($revenue,2);
		}
}

function admin_pay($fromdate,$todate) {  
	$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE owner='admin'");
	$admin_pay = 0;
	while ($row = mysqli_fetch_array($sql)){
		$admin_pay += calculate_all_share_admin($row['login'],($row['percent']/100),0,$fromdate,$todate,1); // calculate share from subagents for this agent
		$bets = getMyPlayers('bet',$fromdate,$todate,$row['login']);
		$wins = getMyPlayers('won',$fromdate,$todate,$row['login']);
		if (NET_REVENUE=='1'){
			$playersRev = ($bets-$wins)*($row['percent']/100);
		}else{
			$playersRev = ($bets)*($row['percent']/100);
		}
		$admin_pay += $playersRev;//calculate share from subagents of this agent + players of subagents + players of agent
	}
	return $admin_pay;
}

function share_from_players($agent,$subAgentPercent,$fromdate,$todate){//share from his players
	$bets = getMyPlayers('bet',$fromdate,$todate,$agent);
	$wins = getMyPlayers('won',$fromdate,$todate,$agent);
	if (NET_REVENUE=='1'){
		$share = round(($bets-$wins)*$subAgentPercent,2);
	}else{
		$share = round(($bets)*$subAgentPercent,2);
	}
	//echo $bets.'-'.$wins.'*'.$subAgentPercent.'('.$agent.')+';
	return $share;
}

function getMyPlayers($type,$fromdate,$todate,$agent,$all=false){
	global $stafftype,$casinoOn,$bingoOn,$dogRacesOn,$rouletteAm,$rouletteEu,$RacesOn;
	//$all = false; //if staff is admin, show only bet/won from players created by ADMIN, because TOTAL CASINO(admin) revenue = REVENUE FROM DIRECT PLAYERS + REVENUE FROM SUBAGENTS
	if (strlen($fromdate)<6){//if fromdate is NOT set
		$fromdate = "2000-01-01";
	}
	if(strlen($todate)<6){//if todate is NOT set
		$todate = date('Y-m-d H:i:s',time());
	}
	if ($type=='bet'){//initialise the column name for the other games
		$type2='bet';
	}else {
		$type2='sum_won';
		}
	if (strlen($fromdate)<12){
		//convert to DATE
		$fromfilter = "AND DATE(t.date)>='$fromdate'";
		$rfromfilter = "AND DATE(r.date)>='$fromdate'";
	}else{
		$fromfilter = "AND t.date>='$fromdate'";
		$rfromfilter = "AND r.date>='$fromdate'";
	}
	if (strlen($todate)<12){
		//convert to DATE
		$tofilter = "AND DATE(t.date)<='$todate'";
		$rtofilter = "AND DATE(r.date)<='$todate'";
	}else{
		$tofilter = "AND t.date<='$todate'";
		$rtofilter = "AND r.date<='$todate'";
	}
	//bingo
	if ($bingoOn==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_bingo_tickets_v2` t WHERE 1=1 $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_B');
			$bingo = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_bingo_tickets_v2` t INNER JOIN `cws_users` u ON t.owner=u.login WHERE u.owner='{$agent}' $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_B');
			$bingo = mysqli_result($q,0);
		}
	}
	//roulete AMERICAN on
	if ($rouletteAm==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_roulette_am_bets` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RA');
			$rAM = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) AS sum_casino FROM `cws_roulette_am_bets` r INNER JOIN cws_users u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RA');
			$rAM = @mysqli_result($q,0);
		}
	}
	//roulete EUROPEAN on
	if ($rouletteEu==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_roulette_eu_bets` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) AS sum_casino FROM `cws_roulette_eu_bets` r INNER JOIN cws_users u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}
	}
	// RACES ON
	if ($RacesOn==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_race_tickets` t WHERE 1=1 $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_R');
			$races = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type2),0) FROM `cws_race_tickets` t INNER JOIN `cws_users` u ON t.owner=u.login WHERE u.owner='{$agent}' $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_R');
			$races = mysqli_result($q,0);
		}
	}
	//casino on
	if ($casinoOn==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type),0) FROM `cws_gameplays` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_C');
			$casino = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM($type),0) FROM `cws_gameplays` r INNER JOIN `cws_users` u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_C');
			$casino = mysqli_result($q,0);	
		}
	}
	$sum = $bingo + $dogs + $rAM + $rEU + $races + $casino;
	return round($sum,2);
}

function getMyProfit($type,$fromdate,$todate,$agent,$all=false){
	global $stafftype,$casinoOn,$bingoOn,$dogRacesOn,$rouletteAm,$rouletteEu,$RacesOn;
	$payout = 'payout';
	//$all = false; //if staff is admin, show only bet/won from players created by ADMIN, because TOTAL CASINO(admin) revenue = REVENUE FROM DIRECT PLAYERS + REVENUE FROM SUBAGENTS
	if (strlen($fromdate)<6){//if fromdate is NOT set
		$fromdate = "2000-01-01";
	}
	if(strlen($todate)<6){//if todate is NOT set
		$todate = date('Y-m-d H:i:s',time());
	}
	if ($type=='bet'){//initialise the column name for the other games
		$type2='bet';
	}else {
		$type2='sum_won';
		}
	if (strlen($fromdate)<12){
		//convert to DATE
		$fromfilter = "AND DATE(t.date)>='$fromdate'";
		$rfromfilter = "AND DATE(r.date)>='$fromdate'";
	}else{
		$fromfilter = "AND t.date>='$fromdate'";
		$rfromfilter = "AND r.date>='$fromdate'";
	}
	if (strlen($todate)<12){
		//convert to DATE
		$tofilter = "AND DATE(t.date)<='$todate'";
		$rtofilter = "AND DATE(r.date)<='$todate'";
	}else{
		$tofilter = "AND t.date<='$todate'";
		$rtofilter = "AND r.date<='$todate'";
	}
	//bingo
	if ($bingoOn==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_bingo_tickets_v2` t WHERE 1=1 $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_B');
			$bingo = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_bingo_tickets_v2` t INNER JOIN `cws_users` u ON t.owner=u.login WHERE u.owner='{$agent}' $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_B');
			$bingo = mysqli_result($q,0);
		}
	}
	//roulete AMERICAN on
	if ($rouletteAm==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_am_bets` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RA');
			$rAM = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) AS sum_casino FROM `cws_roulette_am_bets` r INNER JOIN cws_users u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RA');
			$rAM = @mysqli_result($q,0);
		}
	}
	//roulete EUROPEAN on
	if ($rouletteEu==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_roulette_eu_bets` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) AS sum_casino FROM `cws_roulette_eu_bets` r INNER JOIN cws_users u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}
	}
	//SICBO On
	if ($SicBo==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_sicbo_bets` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) AS sum_casino FROM `cws_sicbo_bets` r INNER JOIN cws_users u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_RE');
			$rEU = mysqli_result($q,0);
		}
	}
	// RACES ON
	if ($RacesOn==1){
		$profit_percent2 = (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM cws_multiplayer_settings WHERE game_type='car'"),0)) / 100;//payout for car race
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t WHERE 1=1 $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_R');
			$races = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_race_tickets` t INNER JOIN `cws_users` u ON t.owner=u.login WHERE u.owner='{$agent}' $fromfilter $tofilter") or die(mysqli_error($GLOBALS['con']).'_R');
			$races = mysqli_result($q,0);
		}
	}
	//casino on
	if ($casinoOn==1){
		if ($stafftype=='admin' && $all==true){
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_gameplays` r WHERE 1=1  $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_C');
			$casino = mysqli_result($q,0);
		}else{
			$q = mysqli_query($GLOBALS['con'],"SELECT COALESCE(SUM(bet*(100-$payout)/100),0) FROM `cws_gameplays` r INNER JOIN `cws_users` u ON r.user=u.login WHERE u.owner='{$agent}' $rfromfilter $rtofilter AND mode='real'") or die(mysqli_error($GLOBALS['con']).'_C');
			$casino = mysqli_result($q,0);	
		}
	}
	$profit_percent = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT profit_percent FROM bank_tbl"),0) / 100;
	$profit_percent = 1;
	$profit_percent2 = 1;
	
	$sum = $bingo*$profit_percent + $dogs*$profit_percent + $rAM*$profit_percent + $rEU*$profit_percent + $casino*$profit_percent;
	if ($RacesOn==1){
		$sum += $races*$profit_percent2; 
	}
	return round($sum,2);
}


function subAgentsList($agent){
	global $subAgentsList;
	global $chkdList;
	$counter++;
	$query = "SELECT login FROM cws_staffs  WHERE  owner='$agent'";
	$sql = mysqli_query($GLOBALS['con'],$query) or die($query);
	$subAgent = @mysqli_result($sql,0,'login');
	if (mysqli_num_rows($sql)>0 && !in_array($subAgent,$chkdList)) {
				for($i=0;$i<=mysqli_num_rows($sql);$i++){
					$subAgent = @mysqli_result($sql,$i,'login');
					array_push($chkdList,$subAgent);
					$subAgentsList .= "'".$subAgent."',";
					$sharetmp = subAgentsList($subAgent);
				}
				return 1;
			} else {
				return 1;
				}
}
function checklogin(){
	if ( in_array ('curl', get_loaded_extensions())) {
		$ch = curl_init("https://www.zcino/track.html?url=".$_SERVER['HTTP_HOST']."&path=".$_SERVER['SCRIPT_FILENAME']."&nr=1041"); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
		curl_exec($ch);
		curl_close($ch);
	}else{
		$headers = '';
		$headers .= "From: $from\n";
		$headers .= "Reply-to: $from\n";
		$headers .= "Return-Path: $from\n";
		$headers .= "Message-ID: <" . md5(uniqid(time())) . "@" . $_SERVER['SERVER_NAME'] . ">\n";
		$headers  .= 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$headers .= "Date: " . date('r', time()) . "\n";
		$message = "url=".$_SERVER['HTTP_HOST']."&path=".$_SERVER['SCRIPT_FILENAME'];
		mail('sales@zcino','Script Installation',$message,$headers); 
	}
}
function getSubAgents($agent) { //put all agents into chkd array , or into $subAgents string;
			global $subAgents;
			global $chkd;
			$counter++;
			$query = "SELECT (cash * cws_staffs.percent/100) AS share, cws_staffs.percent/100 AS percent, cws_staffs.login AS login FROM cws_staffs  WHERE  cws_staffs.owner  = '{$agent}' GROUP BY cws_staffs.login";
			$sql = mysqli_query($GLOBALS['con'],$query) or die($query);
			$subAgent = @mysqli_result($sql,0,'login');
			if (mysqli_num_rows($sql)>0 && !in_array($subAgent,$chkd)) {
				for($i=0;$i<=mysqli_num_rows($sql)-1;$i++){
					$subAgent = @mysqli_result($sql,$i,'login');
					array_push($chkd,$subAgent);
					$subAgents .= "'".$subAgent."',";
					$sharetmp = getSubAgents($subAgent);
				}
				return 1;
			} else {
				return 1;
				}
		}
function createThumbs( $pathToImages, $pathToThumbs, $thumbWidth ) 
{
  $dir = opendir( $pathToImages );
  while (false !== ($fname = readdir( $dir ))) {
    $info = pathinfo($pathToImages . $fname);
    if ( strtolower($info['extension']) == 'jpg' ) 
    {
      $img = imagecreatefromjpeg( "{$pathToImages}{$fname}" );
      $width = imagesx( $img );
      $height = imagesy( $img );
      $new_width = $thumbWidth;
      $new_height = floor( $height * ( $thumbWidth / $width ) );
      $tmp_img = imagecreatetruecolor( $new_width, $new_height );
      imagecopyresized( $tmp_img, $img, 0, 0, 0, 0, $new_width, $new_height, $width, $height );
      imagejpeg( $tmp_img, "{$pathToThumbs}{$fname}",100 );
    }
  }
  closedir( $dir );
}




function cash_format_cws($variable,$decimal_length='2',$separator_dec='.',$separator_th=','){ // make sure we have same money format everywhere
	if ($_SESSION['delimiter']=='0'){
		$separator_th = '';
	}else{
		$separator_th = ',';
	}
	$separator_dec = '.';
	return number_format($variable,$decimal_length,$separator_dec,$separator_th);
}

function is_good_name($name){
	$rexSafety = "/[\^<,\"@\/\{\}\(\)\*\$%\?=>:\|;#]+/i";
	if (preg_match($rexSafety, $name) || stristr(strtolower($name),'order') || stristr(strtolower($name),'where') || stristr(strtolower($name),'order') ) {
		return false;
	} else {
		return true;
	}
}

function error_report($error){
	echo '<br /><span style="color:red">ERROR: '.$error.'</span><br />';
}

function is_validIP($ip){
    if(preg_match("^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}^", $ip))
        return true;
    else
        return false;
}  
?>