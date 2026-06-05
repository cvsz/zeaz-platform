<?php
@session_start();
require_once('functions.inc.php');
require_once('connection.inc.php'); // load the file that manages the MySQL Database Connection
$checkLoggedin = (isset($_SESSION['username']))?checkloggedin($_SESSION['username']):'no';//check if the user is logged in
if ($checkLoggedin=='yes'){
	mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `last_activity`=NOW() WHERE `login`='{$_SESSION['username']}'");
}
?>