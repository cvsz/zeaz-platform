<?php
@session_start();
$sitename = 'zCino';
if (isset($_SESSION['admin'])){
	header('Location:index.php');	
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
<title><?php echo $sitename ;?> Administrator Panel Login</title>
<link href="css/main.css" rel="stylesheet" type="text/css" />
<link href="cb/colorbox.css" rel="stylesheet" type="text/css" />
<!-- load jquery and jquery UI -->
<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/jquery-1.7.js"></script>

<script type="text/javascript" src="js/plugins/spinner/ui.spinner.js"></script>
<script type="text/javascript" src="js/plugins/spinner/jquery.mousewheel.js"></script>

<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/jqueryui-1.8.js"></script>

<!-- load plugin for IE and custom functions -->
<script type="text/javascript" src="jscript/functions.js"></script>
<script type="text/javascript" src="jscript/visualize.jQuery.js"></script>

<script type="text/javascript" src="js/plugins/charts/excanvas.min.js"></script>
<script type="text/javascript" src="js/plugins/charts/jquery.sparkline.min.js"></script>

<script type="text/javascript" src="js/plugins/charts/excanvas.min.js"></script>
<script type="text/javascript" src="js/plugins/charts/jquery.sparkline.min.js"></script>

<script type="text/javascript" src="js/plugins/forms/uniform.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.cleditor.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.validationEngine-en.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.validationEngine.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.tagsinput.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/autogrowtextarea.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.maskedinput.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.dualListBox.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.inputlimiter.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/chosen.jquery.min.js"></script>

<script type="text/javascript" src="cb/jquery.colorbox-min.js"></script>

<script type="text/javascript" src="js/plugins/wizard/jquery.form.js"></script>
<script type="text/javascript" src="js/plugins/wizard/jquery.validate.min.js"></script>
<script type="text/javascript" src="js/plugins/wizard/jquery.form.wizard.js"></script>

<script type="text/javascript" src="js/plugins/ui/jquery.tipsy.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.collapsible.min.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.prettyPhoto.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.progress.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.timeentry.min.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.colorpicker.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.jgrowl.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.breadcrumbs.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.sourcerer.js"></script>

<script type="text/javascript" src="js/plugins/elfinder.min.js"></script>

<script type="text/javascript" src="js/custom.js"></script>

</head>

<body class="nobg loginPage">

<!-- Top fixed navigation -->
<div class="topNav">
    <div class="wrapper">
        <div class="userNav">
            <ul>
                <li><a href="http://<?=$_SERVER['SERVER_NAME']?>" title=""><img src="images/icons/topnav/mainWebsite.png" alt="" /><span>Main website</span></a></li>
            </ul>
        </div>
        <div class="clear"></div>
    </div>
</div>

<?php
require_once('../includes/connection.inc.php');
require_once('../includes/functions.inc.php');				
$client_ip = $_SERVER['REMOTE_ADDR']; // client ip				
if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_bans_ip WHERE client_ip LIKE '$client_ip' AND DATE_ADD(ban_date,INTERVAL (SELECT duration_minutes FROM cws_bans_ip WHERE client_ip LIKE '$client_ip' ORDER BY ban_date DESC LIMIT 0,1) MINUTE)>=CURRENT_TIMESTAMP AND type='backend' ORDER BY ban_date DESC"))>0){
	// client is banned - display proper message
	$errormsg = ' - you have been banned for performing invalid actions.<br /> Ban expires in '.mysqli_result(mysqli_query($GLOBALS['con'],"SELECT duration_minutes FROM cws_bans_ip WHERE client_ip LIKE '$client_ip'  AND type='backend' ORDER BY ban_date DESC"),0).' minutes';
}elseif (isset($_POST['username'])&&isset($_POST['password'])&&isset($_POST['vercode'])) {
	// check if client has IP on ban list
	$pw = antisqli($_POST['password']); // add security filter to data sent by user
	$admin = antisqli($_POST['username']); // add security filter to data sent by user
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_staffs` WHERE (`login`='$admin' AND `pass`='".pass_encode($pw)."')"); // check if the data matches the DB
	
	if (mysqli_num_rows($q)>0 && $_SESSION['vercode']==$_POST['vercode']) {
			if (mysqli_result($q,0,'status')!=='1'){
            	$errormsg = ' - you have been suspended';
				$err = 'nFailure';
				$txt = 'FAILURE';
            }else{ // user has status 0 and is suspended
                $_SESSION['admin'] = $admin; // store in admin session the username of the logged in admin
                $_SESSION['adminlvl'] = mysqli_result($q,0,'staff_type');// store in admin session the level of the logged in admin
                if (isset($_POST['remember_me'])) {
                    @setcookie("admin", $user, time()+3600*24); // store the username in "admin" cookie 
                } else {
                    @setcookie("admin", '', time()+3600*24); // store an empty value in "admin" cookie
                } /* expire in 24 hours */
                mysqli_query($GLOBALS['con'],"UPDATE cws_staffs SET ip_last='{$_SERVER['REMOTE_ADDR']}',last_activity=NOW() WHERE login='$admin'");
                $errormsg = ' - please wait while you are logged in ...';
                $errormsg .= '<script type="text/javascript">window.location = \'index.php\'</script>';
				$err = 'nSuccess';
				$txt = 'SUCCESS';
				if (stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){ 
					echo '<script type="text/javascript">alert("IMPORTANT: You have accessed the administrator panel for the software developed by www.zcino! All the information from this page is private! Accepting to proceed further on this page means that you accept to keep PRIVATE all the data from this administrator panel and you will not make any print screens or publish any text from what you have seen here!");</script>';
				}
			}
		}else{
			if (!isset($_SESSION['invalid_login'])){
				$_SESSION['invalid_login'] = 1;
			}else{
				$_SESSION['invalid_login'] +=1;
				if ($_SESSION['invalid_login']>=5){
					$duration = 2*@mysqli_result(mysqli_query($GLOBALS['con'],"SELECT duration_minutes FROM cws_bans_ip WHERE client_ip LIKE '$client_ip' AND type='backend' ORDER BY ban_date DESC"),0);
					if ($duration=="" || empty($duration)){
						$duration = 5;
					}
					mysqli_query($GLOBALS['con'],"INSERT INTO cws_bans_ip (client_ip, duration_minutes,type) VALUES ('{$_SERVER['REMOTE_ADDR']}','$duration','backend')") or die(mysqli_error($GLOBALS['con']));	
				}
				//if it's equal to 5 record the ban to DB
			}
			if ( $_SESSION['vercode']!==$_POST['vercode'] ){
				$errormsg = ' - invalid captcha code; '.(5-$_SESSION['invalid_login']).'/5 attempts left <br />';
				$err = 'nWarning';
				$txt = 'WARNING';
			}elseif (mysqli_num_rows($q)==0){
				$errormsg = ' - incorrect login details; '.(5-$_SESSION['invalid_login']).'/5 attempts left <br />';
				$err = 'nWarning';
				$txt = 'WARNING';
			}
		}
	}
 ?> 
<!-- Main content wrapper -->

<div class="loginWrapper">
<?php if (stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){ ?>
<script type="text/javascript">
$(document).ready(function(){
	$(".iframe").colorbox({iframe:true, width:"720px", height:"780px"});
});
</script>
<div class="nNote nInformation" style="text-align:center;width:300px;padding-left:40px;margin-top:60px;">
	<a href="https://www.zcino/contactform.php?r=a" class="iframe">Contact www.zcino to request login details for the administrator panel!</a>
</div>
<?php }?>
	<div>
    <?php 
		if (isset($errormsg)){
			echo '<div class="nNote '.$err.' hideit"><p><strong>'.$txt.': </strong>'.$errormsg.'</p></div>';
			}
		?>
    </div>
    <div class="loginLogo"><img src="images/loginLogo.png" alt="" /></div>
    <div class="widget">
        <div class="title"><img src="images/icons/dark/files.png" alt="" class="titleIcon" /><h6>Login panel</h6></div>
        <form action="login.php" method="post" id="validate" class="form">
            <fieldset>
                <div class="formRow">
                    <label for="login">Username:</label>
                    <div class="loginInput"><input type="text" name="username" class="validate[required]" id="login" style="width:100%;" value="admin" onclick="this.value=''" /></div>
                    <div class="clear"></div>
                </div>
                
                <div class="formRow">
                    <label for="pass">Password:</label>
                    <div class="loginInput"><input type="password" name="password" onclick="this.value=''" class="validate[required]" id="pass" value=""/></div>
                    <div class="clear"></div>
                </div>
                
                <div class="formRow">
                    <label for="pass">Captcha:</label>
                    <div class="loginInput"><img src="includes/captcha.php" style="margin-top:0px;vertical-align:middle;float:left" />
                    <input type="text" name="vercode" class="validate[required]" id="vercode" style="width:132px;float:right"/></div>
                    <div class="clear"></div>
                </div>
                
                <div class="loginControl">
                    <div class="rememberMe"><input type="checkbox" id="remMe" name="remMe" /><label for="remMe">Remember me</label></div>
                    <input type="submit" value="Log me in" class="dredB logMeIn" />
                    <div class="clear"></div>
                </div>
            </fieldset>
        </form>
    </div>
</div>    
<!-- Footer line -->

</body>
</html>