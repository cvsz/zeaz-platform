<?php
@session_start();
require_once('config.inc.php');
$lang = antisqli($_POST['lang']);
if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_languages` WHERE `status`=1 AND code='$lang' ORDER BY `id`"))>0){
	$_SESSION['language'] = $lang;
}
//reload body
?>