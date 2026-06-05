<?php
if (isset($_SERVER['REDIRECT_URL'])) {
	header('Location: http://'.$_SERVER['SERVER_NAME']);
	exit;
}
if (isset($error)){
	switch ($error){
		case '404':header("HTTP/1.0 404 Not Found");break;
		case '500':header("HTTP/1.0 500 Internal Server Error");break;
	}
}
include('includes/config.inc.php');
$client_ip = $_SERVER['REMOTE_ADDR']; // client ip
$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bans_ip WHERE client_ip LIKE '$client_ip' AND DATE_ADD(ban_date,INTERVAL (SELECT duration_minutes FROM cws_bans_ip WHERE client_ip LIKE '$client_ip' ORDER BY ban_date DESC LIMIT 0,1) MINUTE)>=CURRENT_TIMESTAMP AND type='backend' ORDER BY ban_date DESC") or die(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($q)>0){
	// client is banned - display proper message
	die($lang['Your+access+to+this+website+has+been+restricted'].'! '.$lang['Please+contact+administrator'].'!');
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo $sitename; ?></title> 
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
<link href="template_files11/homepage.css" type="text/css" rel="stylesheet" media="screen"  />
<link href="template_files11/footer.css" rel="stylesheet" type="text/css"  />
<link href="css/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<link rel="stylesheet" type="text/css" href="css/advanced-slider.css" media="screen"/>
<link rel="shortcut icon" type="text/css" href="images/favicon.ico" />
<style type="text/css">
.loading {background: url('template_files11/spinner-img.gif') no-repeat center center;background-color:#990000;width:500px;height:200px}
</style>
<link rel="stylesheet" href="css/calendar.css" type="text/css"/>
<script type="text/javascript" src="jscript/jquery.js"></script>
<script type="text/javascript" src="jscript/jqueryui-1.8.js"></script>
<script type="text/javascript" src="jscript/functions.js" ></script>
<script type="text/javascript" src="jscript/facebox.js" ></script>
<script type="text/javascript" src="jscript/jackpot.js" ></script>
<script  src="jscript/calendar.js" type="text/javascript"></script>
<!--[if IE]><script type="text/javascript" src="jscript/excanvas.compiled.js"></script>
<![endif]-->
<script type="text/javascript" src="jscript/jquery.advancedSlider.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
<script type="text/javascript" src="jscript/web3_integration.js"></script>

<script type="text/javascript">
$(document).ready(function(){
	reinit();
});
</script>
<script type="text/javascript" language="javascript">
	$(function() {
		$(this).bind("contextmenu", function(e) {
			//e.preventDefault(); // disable right click
		});
	}); 
<?php
if ($_SESSION['desktop']!==1 && $_SESSION['showed_popup']!==1 && stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){ // if user did not see popup and if user is visiting zcino.zeaz.dev
	echo '$(document).ready(function() {
        $("#hidden_link").facebox().trigger(\'click\');
 });';
	$_SESSION['showed_popup'] = 1;	
}
?>

</script>
<!--[if lt IE 7]>
<link rel="stylesheet" type="text/css" media="screen,projection" href="/css/pngfix.css" />
<script src="/scripts/iepngfix_tilebg.js" type="text/javascript"></script>
<![endif]-->

</head>
<body>
		<?php
        require_once('body.php');
        ?>
</body>
</html>