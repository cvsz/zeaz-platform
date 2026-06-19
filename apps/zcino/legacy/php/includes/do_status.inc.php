<?php
#developed by www.zcino
@require_once('config.inc.php');
if (isset($_SESSION['username'])){
	$loggedin = checkloggedin($_SESSION['username']); //check if user is logged in for further use
}else {
	$loggedin = 'no';
}
if ($loggedin == 'yes'){
	echo $lang['My+account']; 	
}else {
	echo $lang['Log+In'].' | '.$lang['Register'];                                   
}

?>
								