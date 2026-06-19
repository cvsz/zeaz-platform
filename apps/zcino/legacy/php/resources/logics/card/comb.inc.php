<?php
//royal flush
function is_royal_flush($cards) {
	global $held;
	$t = 0;
	for ($i=0;$i<=3;$i++) {
		$chk =array(0+13*$i,12+13*$i,11+13*$i,10+13*$i,9+13*$i);
		if (count(array_diff($cards,$chk))==0){
			$held = '11111';
			$t = 9;
			}
	}
	return $t;
}
//straight flush
function is_straight_flush($cards) {
	global $held;
	if (is_flush($cards) && is_straight($cards)){
		$held = '11111';
		return 8;
	}else{
		return 0;
	}
}
// 5 of a kind
function is_5_kind($cards) {
	global $held,$joker,$countJokers,$diamonds,$clubs,$spades,$hearts,$tempcards;	
	$tempcards2 = $tempcards;
	rsort($tempcards2);
	$counts = array_count_values($tempcards2);
	if ($countJokers==3){
		if (in_array(0,$tempcards2)){
			$paircard = 0;
		}else{
			$paircard = $tempcards2[array_search(max($tempcards2),$tempcards2)];
		}
	}elseif($countJokers==2){
		$paircard = array_search(3,$counts); 
	}
	if (strlen($paircard)>0){
		$held = '';
		for ($i=1;$i<=5;$i++) {
			if ($tempcards[$i] == $paircard || $cards[$i]==$joker) {
					$held .= '1';
				}else{
					$held .= '0';
				}
		}
		checkjokerpos($cards);
		return true;
	}else {
		return false;
	}
}
// 4 of a kind
function is_4_kind($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards;	
	$counts = array_count_values($tempcards);
	//print_r($tempcards);
	if (in_array(4,$counts)) {
		$paircard = array_search(4,$counts);
		$held = '';
		for ($i=1;$i<=5;$i++) {
			if ($tempcards[$i] == $paircard) {
				$held .= '1';
			} else {
				$held .= '0';
			}
		}
		return 7;
	}else {return 0;}
}
//full house
function is_full_house($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards;
	$counts = array_count_values($tempcards);	
	if (in_array(2,$counts) && in_array(3,$counts)) {// full house
				$held = '11111';
				return 6;	
	}else {return 0;}
}
//flush
function is_flush($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards,$jokers;
	if (count(array_diff($hearts, $cards))==8 ||count(array_diff($diamonds, $cards))==8 ||count(array_diff($clubs, $cards))==8 ||count(array_diff($spades, $cards))==8) {
		$held = '11111';
		
		return 5;
	}else {return 0;}
}
//straight
function is_straight($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards,$jokers;	
	$chkstraight = array_unique($tempcards);

	sort($chkstraight);	
	if (count(array_diff($chkstraight,array(0,12,11,10,9)))==0 && count($chkstraight)==5){
		$held = '11111';
		return 4;
	}
	if($chkstraight[0]+4==$chkstraight[4] && ($chkstraight[0]==$chkstraight[1]-1&&$chkstraight[1]==$chkstraight[2]-1&&$chkstraight[2]==$chkstraight[3]-1&&$chkstraight[3]==$chkstraight[4]-1))	{// straight
				$held = '11111';
				return 4;
	}else {
		return 0;
		}
}
//3 of a kind
function is_3_kind($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards;	
	$counts = array_count_values($tempcards);
	
	if (in_array(3,$counts)) {// 3 of a kind
				$paircard = array_search(3,$counts);
				$held = '';
				for ($i=1;$i<=5;$i++) {
					if ($tempcards[$i] == $paircard) {
						$held .= '1';
					} else {
						$held .= '0';
					}
				}
				return 3;
			}else {return 0;}
}
//2 pairs
function is_2pairs($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards;	
	$counts = array_count_values($tempcards);
	if (count(array_keys($counts,2))==2) {//2 pairs
				$pairc = array_keys($counts,2);
				$t=1;
				foreach ($pairc as $paircard) {
					${'paircard'.$t} = $paircard;
					$t++;
				}
				$held = '';
				for ($i=1;$i<=5;$i++) {
					if ($tempcards[$i] == $paircard1 || $tempcards[$i] == $paircard2) {
						$held .= '1';
					} else {
						$held .= '0';
					}
				}
				return 2;
			}else {
				return 0;
				}
}
//Jacks or better
function is_1pair($cards) {
	global $held,$diamonds,$clubs,$spades,$hearts,$tempcards;	
	$counts = array_count_values($tempcards);
	$paircard = array_keys($counts,2); 
	if (count($paircard)>0) {
		$held = '';
		for ($i=1;$i<=5;$i++) {
		if ($tempcards[$i] == $paircard[0]) {
				$held .= '1';
			} else {
				$held .= '0';
			}
		}
		return 1;
	}else {
		return 0;
		}
}
?>