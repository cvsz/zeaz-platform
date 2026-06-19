<?php
session_start();
include('../includes/connection.inc.php');
unset($_SESSION['admin']);
mysqli_query($GLOBALS['con'],"UPDATE `cws_users` SET `logged_in`='0' WHERE `id`='{$_SESSION['userid']}'") or die(mysqli_error($GLOBALS['con']));
session_destroy();
header("Location:index.php");
?>