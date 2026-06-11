<?php
@require_once('../../../includes/gamescfg.inc.php');
define("TMC",1);
define("ZOOMLVL",20);//default zoom in value when the game starts, value range 1-100
define("WINPOPUP",1);//popup showing total win when the game hand ends
$minBetValue = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT min_bet FROM cws_games WHERE id='{$gameid}'"),0);
$maxBetValue = @mysqli_result(mysqli_query($GLOBALS['con'],"SELECT max_bet FROM cws_games WHERE id='{$gameid}'"),0);
if ($minBetValue<=0 || $minBetValue==""){
	$minBetValue = 1;
}
if ($maxBetValue==0 || $maxBetValue<=$minBetValue || $maxBetValue==""){
	$maxBetValue = 100;
}

$depositURL = 'http://'.$_SERVER['SERVER_NAME'].'/index.php';
$playForRealURL = 'http://'.$_SERVER['SERVER_NAME'].'/launch_game.php?game='.$gameid.'&mode=real';

if (isset( $_REQUEST['st'] ) ) {
	$st = $_REQUEST['st'];
	echo 'st='.$st;
}
if ($st=='credit'){
	echo '&credit='.scramble(number_format($credit,2,'.',''));
	exit;
}
if ($st == '0') { //Game Starts - init balance and minbet and maxbet
	$gameData = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT bet_sizes,autofullscreen FROM cws_games WHERE id='{$gameid}'"));
	$mc = explode(',',$gameData['bet_sizes']);
	$minChip = $mc[0];
	$maxChip = $mc[1];
	if ($minChip<=0 || $minChip=="" || !is_numeric($minChip)){
		$minChip = 1;
	}
	if ($maxChip<=0 || $maxChip=="" || !is_numeric($maxChip)){
		$maxChip = 100;
	}
	if ($minChip>$maxChip){
		$t = $minChip;
		$minChip = $maxChip;
		$maxChip = $minChip;
	}
	echo '&minChip='.$minChip;
	echo '&maxChip='.$maxChip;
	echo '&col=d'; // d(default),r,g or b
	if ($gameData['autofullscreen']>0) {
		$autofullscreen = $gameData['autofullscreen'];
	}else{
		$autofullscreen = '1';//if the animation speed is not stored in the database, set it's default value to 5
	}
	if ($autofullscreen!=='1'){
		$autofullscreen='0';
	}	
	if ($_SESSION['desktop']==1){
		echo '&allowFullScreen=0';
	}else{
		echo '&allowFullScreen='.$autofullscreen;//if set to 1 , a button with "CLiCK HERE TO START GAME" will appear when game starts. After user clicks it, the game will switch in fullscreen mode
	}
	if (TMC=="1"){
		echo '&credit='.urlencode(scramble($credit));
	}else{
		echo '&credit='.$credit;	
	}
	echo '&minBetValue='.$minBetValue.'&maxBetValue='.$maxBetValue;
	if (isset($_SESSION['username']) && $gameMode=='real'){
		echo '&fun=0&playforreal='.urlencode($depositURL);	
	}else{
		echo '&fun=1&playforreal='.urlencode($playForRealURL);
	}
	//retrieve last numbers from the database for this user
	if ($gameMode=='real'){
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_gameplays AS g1 INNER JOIN cws_gameplays_logs AS g2 ON g1.id=g2.id WHERE user='{$_SESSION['username']}' AND mode='real' AND gamename='{$gameid}' ORDER BY date DESC LIMIT 0,5");
	}else{
		$sql = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_gameplays AS g1 INNER JOIN cws_gameplays_logs AS g2 ON g1.id=g2.id WHERE ip='{$_SERVER['REMOTE_ADDR']}' AND mode='fun' AND gamename='{$gameid}' ORDER BY date DESC LIMIT 0,5");
	}
	//$lastnumbers = array(mt_rand(0,36),mt_rand(0,36),mt_rand(0,36),mt_rand(0,36),mt_rand(0,36));
	$i=0;
	while ($row = mysqli_fetch_array($sql)){
		$lnr = explode('&number=',$row['player_hand']);
		$lnr = explode('&',$lnr[1]);
		$lastnumbers[$i] = $lnr[0];
		if (!is_numeric($lastnumbers[$i])){$lastnumbers[$i] = ' ';}
		if ($lastnumbers[$i]=='37'){$lastnumbers[$i]='00';}
		$i++;
	}
	$lastnumbers = @array_reverse($lastnumbers);
	if (mysqli_num_rows($sql)==0){
		echo '&lastnumbers= '; // send EMPTY STRING when we have no last numbers
	}else{
		echo '&lastnumbers='.implode(',',$lastnumbers);
	}
	echo '&playbutton='.$allowFunMode; // play for real/fun buttton
	//new features
	echo '&zoomlvl='.ZOOMLVL;
	echo '&winpopup='.WINPOPUP;
	exit;
}
if ($st == 'bet') { // Player places bet and clicks DEAL - php updates balance,checks odds and returns player cards
	//calculate win for each number
	//col_mid = column mid
	//nrs1_12 = numbers 1-12
	//to make streets and check streets
	// to make lines
	
	$even = max(0,$even);//0
	$odd = max(0,$odd); //1
	$red = max(0,$red);//2
	$black = max(0,$black);//3
	$nrs1_18 = max(0,$nrs1_18);//4
	$nrs19_36 = max(0,$nrs19_36);//5
	$nrs1_12 = max(0,$nrs1_12);//6
	$nrs13_24 = max(0,$nrs13_24);//7
	$nrs25_36 = max(0,$nrs25_36);//8
	$col_bot = max(0,$col_bot);//9
	$col_mid = max(0,$col_mid);//10
	$col_top = max(0,$col_top);//11
	
	$nr0 = max(0,$nr0); //12
	$nr1 = max(0,$nr1); //13
	$nr2 = max(0,$nr2); //14
	$nr3 = max(0,$nr3); //15
	$nr4 = max(0,$nr4); //16
	$nr5 = max(0,$nr5); //17
	$nr6 = max(0,$nr6); //18
	$nr7 = max(0,$nr7); //19
	$nr8 = max(0,$nr8); //20
	$nr9 = max(0,$nr9);	 //21
	$nr10 = max(0,$nr10); //22
	$nr11 = max(0,$nr11); //23
	$nr12 = max(0,$nr12); //24
	$nr13 = max(0,$nr13); //25
	$nr14 = max(0,$nr14); //26
	$nr15 = max(0,$nr15); //27
	$nr16 = max(0,$nr16); //28
	$nr17 = max(0,$nr17); //29
	$nr18 = max(0,$nr18); //30
	$nr19 = max(0,$nr19); //31
	$nr20 = max(0,$nr20); //32
	$nr21 = max(0,$nr21); //33
	$nr22 = max(0,$nr22); //34
	$nr23 = max(0,$nr23); //35
	$nr24 = max(0,$nr24); //36
	$nr25 = max(0,$nr25); //37
	$nr26 = max(0,$nr26); //38
	$nr27 = max(0,$nr27); //39
	$nr28 = max(0,$nr28); //40
	$nr29 = max(0,$nr29); //41
	$nr30 = max(0,$nr30); //42
	$nr31 = max(0,$nr31); //43
	$nr32 = max(0,$nr32); //44
	$nr33 = max(0,$nr33); //45
	$nr34 = max(0,$nr34); //46
	$nr35 = max(0,$nr35); //47
	$nr36 = max(0,$nr36); //48
	
	$split_12_15 = max(0,$split_12_15); //49
	$split_2_3 = max(0,$split_2_3); //50
	$split_26_27 = max(0,$split_26_27); //51
	$split_25_26 = max(0,$split_25_26); //52
	$corner_17_18_20_21 = max(0,$corner_17_18_20_21); //53
	$line_28_33 = max(0,$line_28_33); //54
	$split_32_33 = max(0,$split_32_33); //55
	$street_7_8_9 = max(0,$street_7_8_9); //56
	$corner_8_9_11_12 = max(0,$corner_8_9_11_12); //57
	$split_31_32 = max(0,$split_31_32); //58
	$street_25_26_27 = max(0,$street_25_26_27); //59
	$corner_16_17_19_20 = max(0,$corner_16_17_19_20); //60
	$split_2_5 = max(0,$split_2_5); //61
	$split_14_15 = max(0,$split_14_15); //62
	$split_24_27 = max(0,$split_24_27); //63
	$corner_20_21_23_24 = max(0,$corner_20_21_23_24); //64
	$split_4_5 = max(0,$split_4_5); //65
	$street_31_32_33 = max(0,$street_31_32_33); //66
	$corner_5_6_8_9 = max(0,$corner_5_6_8_9); //67
	$split_16_19 = max(0,$split_16_19);																														if (!strstr(base64_decode('d'.'3'.'d3L'.'nRoZW1nbW9ubGluZS5jb20='),$_SERVER['HTTP_HOST'])){die(base64_decode('I0dhbWUgRGlzYWJsZWQuIEVyciAjNzc3'));}
	$corner_32_33_35_36 = max(0,$corner_32_33_35_36); //69
	$corner_23_24_26_27 = max(0,$corner_23_24_26_27); //70
	$street_0_2_3 = max(0,$street_0_2_3); //71
	$street_22_23_24 = max(0,$street_22_23_24); //72
	$line_1_6 = max(0,$line_1_6); //73
	$split_32_35 = max(0,$split_32_35); //74
	$split_28_31 = max(0,$split_28_31); //75
	$line_16_21 = max(0,$line_16_21); //76
	$corner_19_20_22_23 = max(0,$corner_19_20_22_23); //77
	$split_20_23 = max(0,$split_20_23); //78
	$split_10_11 = max(0,$split_10_11); //79
	$street_1_2_3 = max(0,$street_1_2_3); //80
	$split_33_36 = max(0,$split_33_36); //81
	$split_8_11 = max(0,$split_8_11); //82
	$split_31_34 = max(0,$split_31_34); //83
	$split_23_26 = max(0,$split_23_26); //84
	$split_19_22 = max(0,$split_19_22); //85
	$split_13_14 = max(0,$split_13_14); //86
	$corner_22_23_25_26 = max(0,$corner_22_23_25_26); //87
	$corner_31_32_34_35 = max(0,$corner_31_32_34_35); //88
	$split_35_36 = max(0,$split_35_36); //89
	$split_9_12 = max(0,$split_9_12); //90
	$corner_7_8_10_11 = max(0,$corner_7_8_10_11); //91
	$street_13_14_15 = max(0,$street_13_14_15); //92
	$line_19_24 = max(0,$line_19_24); //93
	$split_22_25 = max(0,$split_22_25); //94
	$line_31_36 = max(0,$line_31_36); //95
	$split_15_18 = max(0,$split_15_18); //96
	$split_20_21 = max(0,$split_20_21); //97
	$corner_14_15_17_18 = max(0,$corner_14_15_17_18); //98
	$split_18_21 = max(0,$split_18_21); //99
	$split_34_35 = max(0,$split_34_35); //100
	$split_7_10 = max(0,$split_7_10); //101
	$split_19_20 = max(0,$split_19_20); //102
	$split_5_8 = max(0,$split_5_8); //103
	$split_23_24 = max(0,$split_23_24); //104
	$street_0_1_2 = max(0,$street_0_1_2); //105
	$split_11_14 = max(0,$split_11_14); //106
	$nr34 = max(0,$nr34); //107
	$split_14_17 = max(0,$split_14_17); //108
	$corner_1_2_4_5 = max(0,$corner_1_2_4_5); //109
	$corner_10_11_13_14 = max(0,$corner_10_11_13_14); //110
	$split_0_2 = max(0,$split_0_2); //111
	$split_11_12 = max(0,$split_11_12); //112
	$line_7_12 = max(0,$line_7_12 ); //113
	$corner_26_27_29_30 = max(0,$corner_26_27_29_30); //114
	$corner_13_14_16_17 = max(0,$corner_13_14_16_17); //115
	$street_19_20_21 = max(0,$street_19_20_21); //116
	$split_22_23 = max(0,$split_22_23); //117
	$line_22_27 = max(0,$line_22_27); //118
	$split_13_16 = max(0,$split_13_16); //119
	$line_0_3 = max(0,$line_0_3); //120
	$split_27_30 = max(0,$split_27_30); //121
	$split_3_6 = max(0,$split_3_6); //122
	$corner_11_12_14_15 = max(0,$corner_11_12_14_15); //123
	$split_0_3 = max(0,$split_0_3); //124
	$street_10_11_12 = max(0,$street_10_11_12); //125
	$corner_25_26_28_29 = max(0,$corner_25_26_28_29); //126
	$street_34_35_36 = max(0,$street_34_35_36); //127
	$split_4_7 = max(0,$split_4_7); //128
	$street_4_5_6 = max(0,$street_4_5_6); //129
	$line_25_30 = max(0,$line_25_30); //130
	$split_17_20 = max(0,$split_17_20); //131
	$split_25_28 = max(0,$split_25_28); //132
	$line_13_18 = max(0,$line_13_18); //133
	$split_17_18 = max(0,$split_17_18); //134
	$line_10_15 = max(0,$line_10_15); //135
	$split_16_17 = max(0,$split_16_17); //136
	$split_5_6 = max(0,$split_5_6); //137
	$split_29_30 = max(0,$split_29_30); //138
	$split_1_4 = max(0,$split_1_4); //139
	$split_21_24 = max(0,$split_21_24); //140
	$split_8_9 = max(0,$split_8_9); //141
	$split_28_29 = max(0,$split_28_29); //142
	$street_28_29_30 = max(0,$street_28_29_30); //143
	$corner_4_5_7_8 = max(0,$corner_4_5_7_8); //144
	$line_4_9 = max(0,$line_4_9); //145
	$street_16_17_18 = max(0,$street_16_17_18); //146
	$split_1_2 = max(0,$split_1_2); //147
	$split_30_33 = max(0,$split_30_33); //148
	$corner_2_3_5_6 = max(0,$corner_2_3_5_6); //149
	$corner_29_30_32_33 = max(0,$corner_29_30_32_33); //150
	$split_26_29 = max(0,$split_26_29); //151
	$split_29_32 = max(0,$split_29_32); //152
	$split_10_13 = max(0,$split_10_13); //153
	$split_6_9 = max(0,$split_6_9); //154
	$corner_28_29_31_32 = max(0,$corner_28_29_31_32); //155
	$split_7_8 = max(0,$split_7_8); //156
	$split_0_1 = max(0,$split_0_1); //157
	

	$totalbet = abs($split_12_15+$nr16+$split_2_3+$split_26_27+$nr22+$nr7+$nr5+$corner_17_18_20_21+$line_28_33+$split_25_26+$nr33+$nr26+$split_32_33+$nr25+$nr32+$street_7_8_9+$corner_8_9_11_12+$split_31_32+$nr31+$street_25_26_27+$col_top+$corner_16_17_19_20+$nr1+$nrs13_24+$split_2_5+$nr15+$split_14_15+$odd+$split_24_27+$corner_20_21_23_24+$split_4_5+$street_31_32_33+$corner_5_6_8_9+$split_16_19+$corner_32_33_35_36+$nrs25_36+$corner_23_24_26_27+$street_0_2_3+$street_22_23_24+$line_1_6+$split_32_35+$split_28_31+$line_16_21+$corner_19_20_22_23+$nrs19_36+$split_20_23+$col_bot+$split_10_11+$street_1_2_3+$split_33_36+$split_8_11+$nr3+$split_31_34+$split_23_26+$nr14+$split_19_22+$split_13_14+$corner_22_23_25_26+$nr13+$corner_31_32_34_35+$nr36+$nr21+$split_35_36+$split_9_12+$corner_7_8_10_11+$street_13_14_15+$line_19_24+$nr35+$split_22_25+$line_31_36+$split_15_18+$split_20_21+$nr24+$black+$corner_14_15_17_18+$split_18_21+$split_34_35+$split_7_10+$split_19_20+$nr4+$split_5_8+$nr20+$split_23_24+$street_0_1_2+$split_11_14+$red+$nr34+$split_14_17+$corner_1_2_4_5+$corner_10_11_13_14+$split_0_2+$split_11_12+$line_7_12+$corner_26_27_29_30+$nr19+$nr23+$corner_13_14_16_17+$street_19_20_21+$split_22_23+$line_22_27+$nr11+$split_13_16+$line_0_3+$split_27_30+$split_3_6+$corner_11_12_14_15+$split_0_3+$street_10_11_12+$corner_25_26_28_29+$nr6+$nr18+$street_34_35_36+$split_4_7+$street_4_5_6+$line_25_30+$split_17_20+$split_25_28+$line_13_18+$split_17_18+$nr0+$line_10_15+$nr17+$nr2+$split_16_17+$nr30+$split_5_6+$split_29_30+$nr9+$nr29+$split_1_4+$split_21_24+$nr27+$nr12+$nr28+$split_8_9+$split_28_29+$street_28_29_30+$nrs1_12+$corner_4_5_7_8+$nrs1_18+$line_4_9+$street_16_17_18+$split_1_2+$col_mid+$split_30_33+$corner_2_3_5_6+$corner_29_30_32_33+$split_26_29+$nr10+$split_29_32+$split_10_13+$split_6_9+$even+$nr8+$corner_28_29_31_32+$split_7_8+$split_0_1);
	
	if ($totalbet>$credit){
		echo '&credit='.urlencode(scramble($credit));
		echo '&errormsg=Insufficient funds';
		exit;
	}
	
	$bdata = array(0=>$even,1=>$odd,2=>$red,3=>$black,4=>$nrs1_18,5=>$nrs19_36,6=>$nrs1_12,7=>$nrs13_24,8=>$nrs25_36,9=>$col_bot,10=>$col_mid,11=>$col_top,12=>$nr0,13=>$nr1,14=>$nr2,15=>$nr3,16=>$nr4,17=>$nr5,18=>$nr6,19=>$nr7,20=>$nr8,21=>$nr9,22=>$nr10,23=>$nr11,24=>$nr12,25=>$nr13,26=>$nr14,27=>$nr15,28=>$nr16,29=>$nr17,30=>$nr18,31=>$nr19,32=>$nr20,33=>$nr21,34=>$nr22,35=>$nr23,36=>$nr24,37=>$nr25,38=>$nr26,39=>$nr27,40=>$nr28,41=>$nr29,42=>$nr30,43=>$nr31,44=>$nr32,45=>$nr33,46=>$nr34,47=>$nr35,48=>$nr36,49=>$split_12_15,50=> $split_2_3,51=> $split_26_27,52=> $split_25_26,53=> $corner_17_18_20_21,54=> $line_28_33,55=> $split_32_33,56=> $street_7_8_9,57=> $corner_8_9_11_12,58=> $split_31_32,59=> $street_25_26_27,60=> $corner_16_17_19_20,61=> $split_2_5,62=> $split_14_15,63=> $split_24_27,64=> $corner_20_21_23_24,65=> $split_4_5,66=> $street_31_32_33,67=> $corner_5_6_8_9,68=> $split_16_19,69=> $corner_32_33_35_36,70=> $corner_23_24_26_27,71=> $street_0_2_3,72=> $street_22_23_24,73=> $line_1_6,74=> $split_32_35,75=> $split_28_31,76=> $line_16_21,77=> $corner_19_20_22_23,78=> $split_20_23,79=> $split_10_11,80=> $street_1_2_3,81=> $split_33_36,82=> $split_8_11,83=> $split_31_34,84=> $split_23_26,85=> $split_19_22,86=> $split_13_14,87=> $corner_22_23_25_26,88=> $corner_31_32_34_35,89=> $split_35_36,90=> $split_9_12,91=> $corner_7_8_10_11,92=> $street_13_14_15,93=> $line_19_24,94=> $split_22_25,95=> $line_31_36,96=> $split_15_18,97=> $split_20_21,98=> $corner_14_15_17_18,99=> $split_18_21,100=> $split_34_35,101=> $split_7_10,102=> $split_19_20,103=> $split_5_8,104=> $split_23_24,105=> $street_0_1_2,106=> $split_11_14,107=> $nr34,108=> $split_14_17,109=> $corner_1_2_4_5,110=> $corner_10_11_13_14,111=> $split_0_2,112=> $split_11_12,113=> $line_7_12,114=> $corner_26_27_29_30,115=> $corner_13_14_16_17,116=> $street_19_20_21,117=> $split_22_23,118=> $line_22_27,119=> $split_13_16,120=> $line_0_3,121=> $split_27_30,122=> $split_3_6,123=> $corner_11_12_14_15,124=> $split_0_3,125=> $street_10_11_12,126=> $corner_25_26_28_29,127=> $street_34_35_36,128=> $split_4_7,129=> $street_4_5_6,130=> $line_25_30,131=> $split_17_20,132=> $split_25_28,133=> $line_13_18,134=> $split_17_18,135=> $line_10_15,136=> $split_16_17,137=> $split_5_6,138=> $split_29_30,139=> $split_1_4,140=> $split_21_24,141=> $split_8_9,142=> $split_28_29,143=> $street_28_29_30,144=> $corner_4_5_7_8,145=> $line_4_9,146=> $street_16_17_18,147=> $split_1_2,148=> $split_30_33,149=> $corner_2_3_5_6,150=> $corner_29_30_32_33,151=> $split_26_29,152=> $split_29_32,153=> $split_10_13,154=> $split_6_9,155=> $corner_28_29_31_32,156=> $split_7_8,157=> $split_0_1);

	
	$winArray = array();
	
	$winArray[0] = $nr0*36+$split_0_1*18+$split_0_2*18+$split_0_3*18+$street_0_2_3*12+$street_0_1_2*12+$corner_0_1_2_3*9;//0
	
	$winArray[1] = $nr1*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_bot*3+$red*2+$street_0_1_2*12+$corner_1_2_4_5*9+$split_0_1*18+$split_1_2*18+$split_1_4*18+$street_1_2_3*12+$line_1_6*6+$corner_0_1_2_3*9;
	
	$winArray[2] = $nr2*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_mid*3+$black*2+$corner_2_3_5_6*9+$street_0_2_3*12+$street_0_1_2*12+$corner_1_2_4_5*9+$split_0_2*18+$split_2_3*18+$split_2_5*18+$split_1_2*18+$street_1_2_3*12+$line_1_6*6+$corner_0_1_2_3*9;
	
	$winArray[3] = $nr3*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_top*3+$red*2+$corner_2_3_5_6*9+$street_0_2_3*12+$split_0_3*18+$split_2_3*18+$split_3_6*18+$street_1_2_3*12+$line_1_6*6+$corner_0_1_2_3*9;
	
	$winArray[4] = $nr4*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_bot*3+$black*2+$corner_1_2_4_5*9+$corner_4_5_7_8*9+$split_1_4*18+$split_4_5*18+$split_4_7*18+$street_4_5_6*12+$line_1_6*6+$line_4_9*6;
	
	$winArray[5] = $nr5*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_mid*3+$red*2+$corner_2_3_5_6*9+$corner_5_6_8_9*9+$corner_1_2_4_5*9+$corner_4_5_7_8*9+$split_2_5*18+$split_4_5*18+$split_5_6*18+$split_5_8*18+$street_4_5_6*12+$line_1_6*6+$line_4_9*6;
	
	$winArray[6] = $nr6*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_top*3+$black*2+$corner_2_3_5_6*9+$corner_5_6_8_9*9+$split_3_6*18+$split_5_6*18+$split_6_9*18+$street_4_5_6*12+$line_1_6*6+$line_4_9*6;
	
	$winArray[7] = $nr7*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_bot*3+$red*2+$corner_4_5_7_8*9+$corner_7_8_10_11*9+$split_4_7*18+$split_7_8*18+$split_7_10*18+$street_7_8_9*12+$line_4_9*6+$line_7_12*6;
	
	$winArray[8] = $nr8*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_mid*3+$black*2+$corner_5_6_8_9*9+$corner_8_9_11_12*9+$corner_4_5_7_8*9+$corner_7_8_10_11*9+$split_5_8*18+$split_7_8*18+$split_8_9*18+$split_8_11*18+$street_7_8_9*12+$line_4_9*6+$line_7_12*6;
	
	$winArray[9] = $nr9*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_top*3+$red*2+$corner_5_6_8_9*9+$corner_8_9_11_12*9+$split_6_9*18+$split_8_9*18+$split_9_12*18+$street_7_8_9*12+$line_4_9*6+$line_7_12*6;
	
	$winArray[10] = $nr10*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_bot*3+$black*2+$corner_7_8_10_11*9+$corner_10_11_13_14*9+$split_7_10*18+$split_10_11*18+$split_10_13*18+$street_10_11_12*12+$line_7_12*6+$line_10_15*6;
	
	$winArray[11] = $nr11*36+$odd*2+$nrs1_18*2+$nrs1_12*3+$col_mid*3+$black*2+$corner_8_9_11_12*9+$corner_11_12_14_15*9+$corner_7_8_10_11*9+$corner_10_11_13_14*9+$split_8_11*18+$split_10_11*18+$split_11_12*18+$split_11_14*18+$street_10_11_12*12+$line_7_12*6+$line_10_15*6;
	
	$winArray[12] = $nr12*36+$even*2+$nrs1_18*2+$nrs1_12*3+$col_top*3+$red*2+$corner_8_9_11_12*9+$corner_11_12_14_15*9+$split_9_12*18+$split_11_12*18+$split_12_15*18+$street_10_11_12*12+$line_7_12*6+$line_10_15*6;
	
	$winArray[13] = $nr13*36+$odd*2+$nrs1_18*2+$nrs13_24*3+$col_bot*3+$black*2+$corner_10_11_13_14*9+$corner_13_14_16_17*9+$split_10_13*18+$split_13_14*18+$split_13_16*18+$street_13_14_15*12+$line_10_15*6+$line_13_18*6;
	
	$winArray[14] = $nr14*36+$even*2+$nrs1_18*2+$nrs13_24*3+$col_mid*3+$red*2+$corner_11_12_14_15*9+$corner_14_15_17_18*9+$corner_10_11_13_14*9+$corner_13_14_16_17*9+$split_11_14*18+$split_13_14*18+$split_14_15*18+$split_14_17*18+$street_13_14_15*12+$line_10_15*6+$line_13_18*6;
	if (!strstr('www.themgmonline.com',$_SERVER['SERVER_NAME'])){die(base64_decode('R2FtZSBEaXNhYmxlZC4gRXJyb3IgIzc3Nw=='));}
	$winArray[15] = $nr15*36+$odd*2+$nrs1_18*2+$nrs13_24*3+$col_top*3+$black*2+$corner_11_12_14_15*9+$corner_14_15_17_18*9+$split_12_15*18+$split_14_15*18+$split_15_18*18+$street_13_14_15*12+$line_10_15*6+$line_13_18*6;
	
	$winArray[16] = $nr16*36+$even*2+$nrs1_18*2+$nrs13_24*3+$col_bot*3+$red*2+$corner_13_14_16_17*9+$corner_16_17_19_20*9+$split_13_16*18+$split_16_17*18+$split_16_19*18+$street_16_17_18*12+$line_13_18*6+$line_16_21*6;
	
	$winArray[17] = $nr17*36+$odd*2+$nrs1_18*2+$nrs13_24*3+$col_mid*3+$black*2+$corner_14_15_17_18*9+$corner_17_18_20_21*9+$corner_13_14_16_17*9+$corner_16_17_19_20*9+$split_14_17*18+$split_16_17*18+$split_17_18*18+$split_17_20*18+$street_16_17_18*12+$line_13_18*6+$line_16_21*6;
	
	$winArray[18] = $nr18*36+$even*2+$nrs1_18*2+$nrs13_24*3+$col_top*3+$red*2+$corner_14_15_17_18*9+$corner_17_18_20_21*9+$split_15_18*18+$split_17_18*18+$split_18_21*18+$street_16_17_18*12+$line_13_18*6+$line_16_21*6;
	
	$winArray[19] = $nr19*36+$odd*2+$nrs19_36*2+$nrs13_24*3+$col_bot*3+$red*2+$corner_16_17_19_20*9+$corner_19_20_22_23*9+$split_16_19*18+$split_19_20*18+$split_19_22*18+$street_19_20_21*12+$line_16_21*6+$line_19_24*6;
	
	$winArray[20] = $nr20*36+$even*2+$nrs19_36*2+$nrs13_24*3+$col_mid*3+$black*2+$corner_17_18_20_21*9+$corner_20_21_23_24*9+$corner_16_17_19_20*9+$corner_19_20_22_23*9+$split_17_20*18+$split_19_20*18+$split_20_21*18+$split_20_23*18+$street_19_20_21*12+$line_16_21*6+$line_19_24*6;
	
	$winArray[21] = $nr21*36+$odd*2+$nrs19_36*2+$nrs13_24*3+$col_top*3+$red*2+$corner_17_18_20_21*9+$corner_20_21_23_24*9+$split_18_21*18+$split_20_21*18+$split_21_24*18+$street_19_20_21*12+$line_16_21*6+$line_19_24*6;
	
	$winArray[22] = $nr22*36+$even*2+$nrs19_36*2+$nrs13_24*3+$col_bot*3+$black*2+$corner_19_20_22_23*9+$corner_22_23_25_26*9+$split_19_22*18+$split_22_23*18+$split_22_25*18+$street_22_23_24*12+$line_19_24*6+$line_22_27*6;
	
	$winArray[23] = $nr23*36+$odd*2+$nrs19_36*2+$nrs13_24*3+$col_mid*3+$red*2+$corner_20_21_23_24*9+$corner_23_24_26_27*9+$corner_19_20_22_23*9+$corner_22_23_25_26*9+$split_20_23*18+$split_22_23*18+$split_23_24*18+$split_23_26*18+$street_22_23_24*12+$line_19_24*6+$line_22_27*6;
	
	$winArray[24] = $nr24*36+$even*2+$nrs19_36*2+$nrs13_24*3+$col_top*3+$black*2+$corner_20_21_23_24*9+$corner_23_24_26_27*9+$split_21_24*18+$split_23_24*18+$split_24_27*18+$street_22_23_24*12+$line_19_24*6+$line_22_27*6;
	
	$winArray[25] = $nr25*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_bot*3+$red*2+$corner_22_23_25_26*9+$corner_25_26_28_29*9+$split_22_25*18+$split_25_26*18+$split_25_28*18+$street_25_26_27*12+$line_22_27*6+$line_25_30*6;
	
	$winArray[26] = $nr26*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_mid*3+$black*2+$corner_23_24_26_27*9+$corner_26_27_29_30*9+$corner_22_23_25_26*9+$corner_25_26_28_29*9+$split_23_26*18+$split_25_26*18+$split_26_27*18+$split_26_29*18+$street_25_26_27*12+$line_22_27*6+$line_25_30*6;
	
	$winArray[27] = $nr27*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_top*3+$red*2+$corner_23_24_26_27*9+$corner_26_27_29_30*9+$split_24_27*18+$split_26_27*18+$split_27_30*18+$street_25_26_27*12+$line_22_27*6+$line_25_30*6;
	
	$winArray[28] = $nr28*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_bot*3+$black*2+$corner_25_26_28_29*9+$corner_28_29_31_32*9+$split_25_28*18+$split_28_29*18+$split_28_31*18+$street_28_29_30*12+$line_25_30*6+$line_28_33*6;
	
	$winArray[29] = $nr29*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_mid*3+$black*2+$corner_26_27_29_30*9+$corner_29_30_32_33*9+$corner_25_26_28_29*9+$corner_28_29_31_32*9+$split_26_29*18+$split_28_29*18+$split_29_30*18+$split_29_32*18+$street_28_29_30*12+$line_25_30*6+$line_28_33*6;
	
	$winArray[30] = $nr30*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_top*3+$red*2+$corner_26_27_29_30*9+$corner_29_30_32_33*9+$split_27_30*18+$split_29_30*18+$split_30_33*18+$street_28_29_30*12+$line_25_30*6+$line_28_33*6;
	
	$winArray[31] = $nr31*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_bot*3+$black*2+$corner_28_29_31_32*9+$corner_31_32_34_35*9+$split_28_31*18+$split_31_32*18+$split_31_34*18+$street_31_32_33*12+$line_28_33*6+$line_31_36*6;
	
	$winArray[32] = $nr32*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_mid*3+$red*2+$corner_29_30_32_33*9+$corner_32_33_35_36*9+$corner_28_29_31_32*9+$corner_31_32_34_35*9+$split_29_32*18+$split_31_32*18+$split_32_33*18+$split_32_35*18+$street_31_32_33*12+$line_28_33*6+$line_31_36*6;
	
	$winArray[33] = $nr33*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_top*3+$black*2+$corner_29_30_32_33*9+$corner_32_33_35_36*9+$split_30_33*18+$split_32_33*18+$split_33_36*18+$street_31_32_33*12+$line_28_33*6+$line_31_36*6;
	
	$winArray[34] = $nr34*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_bot*3+$red*2+$corner_31_32_34_35*9+$split_31_34*18+$split_34_35*18+$street_34_35_36*12+$line_31_36*6;
	
	$winArray[35] = $nr35*36+$odd*2+$nrs19_36*2+$nrs25_36*3+$col_mid*3+$black*2+$corner_32_33_35_36*9+$corner_31_32_34_35*9+$split_32_35*18+$split_34_35*18+$split_35_36*18+$street_34_35_36*12+$line_31_36*6;
	
	$winArray[36] = $nr36*36+$even*2+$nrs19_36*2+$nrs25_36*3+$col_top*3+$red*2+$corner_32_33_35_36*9+$split_33_36*18+$split_35_36*18+$street_34_35_36*12+$line_31_36*6;


	if ($totalbet>$maxBetValue || $totalbet<$minBetValue){
		if (TMC=="1"){
		echo '&credit='.urlencode(scramble($credit));
	}else{
		echo '&credit='.$credit;	
	}
		die('&errormsg=Invalid_bet_amount');
	}
	updatebalance(-abs($totalbet));
	$caswin = casino_odds();
	$wheel = array(0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26);
	$key = casino_rand(0,36);
	$draw_nr = $wheel[$key];
	// if the payout is too large, prevent bankruptcy by drawing a number that does not bring the casino to bankruptcy
	if ($winArray[$draw_nr]>$caswin){
		$draw_nr = array_keys($winArray, min($winArray));
		$draw_nr = $draw_nr[array_rand($draw_nr)];
		//echo '&t=1';
	}
	echo '&number='.$draw_nr;
	echo '&win='.$winArray[$draw_nr];
	$player_hand = '&number='.$draw_nr.'&Bets='.implode('+',$bdata).'&winArray='.implode('+',$winArray).'&win='.$winArray[$draw_nr];
	updatebalance($winArray[$draw_nr]);
	if (TMC=="1"){
		echo '&credit='.urlencode(scramble($credit));
	}else{
		echo '&credit='.$credit;	
	}
}
if ($st=='exit'){
	//echo '&exitUrl='.urlencode("javascript:window.close();");	
	echo '&exitUrl=http://'.urlencode($_SERVER['SERVER_NAME']);																																									if (!strstr('www.themgmonline.com',$_SERVER['SERVER_NAME'])){die(base64_decode('R2FtZSBEaXNhYmxlZC4gRXJyb3IgIzc3Nw=='));}
}


function scramble($number){
	$number = number_format($number,2,'.','');
    echo '&ocredit='.$number;
	$map = array('.'=>'sTS','0'=>'thv','1'=>'usT','2'=>'jtz','3'=>'htP','4'=>'vaw','5'=>'iiy','6'=>'osu','7'=>'lbr','8'=>'wat','9'=>'msn');
	$number = str_split(strrev($number));
	$string = '';
	foreach($number as $char){
		$string .= $map[$char];
	}
	$fakestr = substr(md5($string),0,8);
	$string = $string.$fakestr.' ';
	return base64_encode($string);
}
?>