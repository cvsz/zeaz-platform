<?php
session_start();
if (isset($_GET['s'])){
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
	require_once($_SERVER['DOCUMENT_ROOT'].'/includes/security.inc.php');
	$data = mdecrypt($_GET['s'],'sdjka828');	
	$userid = get_var($data,'userid');
	
	$expireDate = get_var($data,'date');
	$firstTime = strtotime($expireDate);
	$lastTime = strtotime(date('Y-m-d H:i:s'));
	// perform subtraction to get the difference (in seconds) between times
	$activity_diff = $lastTime-$firstTime;
	if ($activity_diff>1800){
		echo $lang['Token+expired'];
		exit;
	}
	if (is_numeric($userid)){
		mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `status`='1' WHERE id='$userid' AND status='5'");	
		echo $lang['Your+account+was+enabled+successfully'].'! '.$lang['Please+contact+us+if+you+still+require+assistance'].'!<br /><br />'; 	
		echo $lang['You+will+be+redirected+to+main+page+in+5+seconds'].'...';
		?>
		<script type="text/javascript">
			window.setTimeout(function() {
   			 window.location.href = '<?='http://'.$_SERVER['SERVER_NAME']?>';
}, 5000);</script>
		<?php
	}else{
		echo $lang['Invalid+token'].'. '.$lang['Please+contact+support+team'];
	}
}else{
	if (!isset($_SESSION['mkey']) || !isset($_GET['t'])){
		echo $lang['Your+validation+token+is+not+available+or+has+already+expired'].'. '.$lang['Please+open+this+link+in+same+browser+that+you+used+for+changing+the+details'].'!';
	}else{
		require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
		require_once($_SERVER['DOCUMENT_ROOT'].'/includes/security.inc.php');
		$data = mdecrypt($_GET['t'],$_SESSION['mkey']);	 
		//get userid
		$userid = get_var($data,'userid');
		//get old email
		$oldemail = get_var($data,'oemail');
		//get new email	
		$newemail = get_var($data,'nemail');
		
		$expireDate = get_var($data,'date');
		$firstTime = strtotime($expireDate);
		$lastTime = strtotime(date('Y-m-d H:i:s'));
		// perform subtraction to get the difference (in seconds) between times
		$activity_diff = $lastTime-$firstTime;
		if ($activity_diff>1800){
			echo $lang['Token+expired'];
			exit;
		}
	
		if (mysqli_query($GLOBALS['con'],"UPDATE cws_users_info SET email='$newemail' WHERE `email`='$oldemail' AND `id`='$userid'")){
			echo $lang['Your+email+has+been+updated+successfully'].'! '.$lang['Your+new+email+address+is'].': <b>'.$newemail.'</b>! '.$lang['Please+contact+us+if+anything+went+wrong+with+your+account'].'!<br /><br />'; 	
			unset($_SESSION['mkey']);
			echo $lang['You+will+be+redirected+to+main+page+in+5+seconds'].'...';
			?>
			<script type="text/javascript">
			window.setTimeout(function() {
   			 window.location.href = '<?='http://'.$_SERVER['SERVER_NAME']?>';
}, 5000);</script>
			<?php
		}else{
			echo $lang['Failed+to+update+your+email'].'. '.$lang['Invalid+token+id'].'. '.$lang['Please+contact+support+team'].'!';
		}
	}
}

function get_var($string,$var){
		$var = $var.'=';
		if (strpos($string,$var)){
			$p1 = strpos($string,$var)+strlen($var);
			$var_p1 = substr($string,$p1);
			//substract this in another string
			$tmp = explode('&',$var_p1);
			return $tmp[0];
		}else{
			return '-';
		}
	}
?>