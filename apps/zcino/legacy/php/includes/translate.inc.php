<?php
#developed by www.zcino
@require_once('config.inc.php');
$argument = urlencode($_GET['word']);
echo $lang[$argument];
?>