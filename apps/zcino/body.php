<?php
require_once('includes/connection.inc.php');
$q = mysqli_query($GLOBALS['con'],"SELECT id FROM cws_templates WHERE selected='1'");
if ($q){
	if (mysqli_num_rows($q)>0){
		$t = @mysqli_result($q,0);

	}else{
		$t='1';
	}
}else{
	$t='1';
}
include('template_files'.$t.'/template'.$t.'_body.php');
exit;
?>