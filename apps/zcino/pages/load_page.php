<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
if(empty($_REQUEST['page']) || $_REQUEST['page']=='' || strlen($_REQUEST['page'])<='1') die("Page not available");
$pagecode = antisqli($_REQUEST['page']);
if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT content FROM cws_pages WHERE pagecode='$pagecode' AND status='1'"))>0){
	$contents = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT content FROM cws_pages WHERE pagecode='$pagecode'"),0);
}else{
	$contents = "Page not available";
}
echo $contents;
?>
