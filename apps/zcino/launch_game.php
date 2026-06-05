<?php
#developed by www.zcino
//make a loop AJAX request , every 15 seconds to update last activity while launch_game is open
//
include ("launch_game_chk.php");

?>
<?php	
$game = antisqli($_GET['game']);
$game = str_replace('game-', '', $game);
if ($game=='1016'){ // if we have horse race game
	header('Location: http://'.$_SERVER['SERVER_NAME'].'/resources/multiplayer/hrace/launch_game.php?mode=real');
	exit;	
}
if ($game=='1017'){ // if we have monkey race game
	header('Location: http://'.$_SERVER['SERVER_NAME'].'/resources/multiplayer/monkey/launch_game.php?mode=real');
	exit;	
}
if ($game=='999'){ // if we have car race single-player
	header('Location: http://'.$_SERVER['SERVER_NAME'].'/resources/games_flash/CWS_RACE_CAR/launch_game.php?mode='.$gameMode);
	exit;	
}
if ($game=='998'){ // if we have car race multiplayer
	header('Location: http://'.$_SERVER['SERVER_NAME'].'/resources/multiplayer/car_race/launch_game.php?mode='.$gameMode);
	exit;	
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
	"http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title><?php echo "$sitename - ".$game_name; ?></title>
	<style type="text/css">
	<!--
		html,
		body,
		div#content,
		div#content object {
			background-color:#000;
			width: <?php if (isset($_GET['width'])){ echo $_GET['width'].'px';}else{ echo '100%';}?>;
			height: <?php if (isset($_GET['height'])){ echo $_GET['height'].'px';}else{ echo '100%';}?>;
			
			color:white;
		}
		
		body {
			padding: 0;
			margin: 0;
		}
		
		div#content,
		div#content object {
			overflow: hidden;
			min-width: <?php if (isset($_GET['width'])){ echo $_GET['width'].'px';}else{ echo '800px';}?>;
			min-height: <?php if (isset($_GET['height'])){ echo $_GET['height'].'px';}else{ echo '600px';}?>;
		}
	-->
	</style>

    <!-- UPDATE GAME ACTIVITY START -->
    <script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/jscript/jquery.js"></script>
    <script type="text/javascript" language="javascript">
		$(function() {
			$(this).bind("contextmenu", function(e) {
				e.preventDefault();
			});
		}); 
	</script>
    <script type="text/javascript">
	function getParameter(name) {
		return decodeURI(
			(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
		);
	}
	function update_game_activity(){
			$.post('<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>/includes/update_game_activity.inc.php',{gameid:'<?=$gameid?>'},
			function(data){
				if (data.indexOf('&exit=1')>=0){
					alert('<?=$lang['Game+not+selected']?>! <?=$lang['Please+try+to+select+a+game+to+play']?>!');
					window.location = '<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>';
				}
				if (data.indexOf('&exit=2')>=0){ // if player has 0 credit
					alert('<?=$lang['Insufficient+funds']?>! <?=$lang['You+are+being+redirected+to+the+main+page']?>!');
					window.location = '<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>';
				}
				if (getParameter("mode")=='real' && data.indexOf('&mode=fun')>=0){/*if we entered the game in REAL mode, and then the software switched the player to REAL MODE, make sure the player knows and is redirected properly"*/
					alert('<?=$lang['You+switched+from+REAL+mode+to+FUN+mode']?>. <?=$lang['Game+will+refresh']?>');
					window.location = '<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>/launch_game.php?mode=fun&game='+getParameter("game");
				}
			}
			);
		}
		update_game_activity();
		setInterval(update_game_activity,1000*15);
	</script>
	<?php
	if ($mg==1){?>
	<script type="text/javascript">
	function update_activity(){
			$.get('<?=get_protocol()?><?=$_SERVER['SERVER_NAME']?>/includes/update_activity.inc.php');
		}
		update_activity();
		setInterval(update_activity,1000*15);
	</script>
	<?php }?>
    <!-- UPDATE GAME ACTIVITY END -->
    <script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/swfObj/swfobject.js"></script>
    <script type="text/javascript">
	<!--
		swfobject.registerObject("flash","9.0.0","swfObj/expressInstall.swf");
	//-->
	</script>
</head>
<body>
	<div id="content">
		<?php
		if ($game_status!=='1'){
			echo '<h1>'.$lang['Game+not+Available'].'</h1>';
		}else{?>
		<?php 
		if (strpos($game_location, '.swf') !== false) { 
		?>
		<!-- BEGIN: Flash Embed -->
		<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="flash">
			<param name="movie" value="<?=$game_location?>">
            <param name="base" value="<?=$game_basedir?>" />
			<param name="quality" value="high" />
            <?php if ($_SESSION['desktop']==1){?>
            <param name="allowFullScreen" value="false" />
            <param name="bgcolor" value="#000000" />
            <param name="wmode" value="direct" /> 
            <?php }else{?>
            <param name="wmode" value="direct" /> 
            <param name="bgcolor" value="#000000" />
            <param name="menu" value="false" />
            <param name="allowFullScreen" value="true" />
            <param name="scale" value="default">
            <?php }?>
			<!--[if !IE]>-->
			<object type="application/x-shockwave-flash" data="<?=$game_location?>">
				<param name="quality" value="high" />
                <param name="base" value="<?=$game_basedir?>" />
                <?php if ($_SESSION['desktop']==1){?>
                <param name="wmode" value="direct" /> 
				<param name="allowFullScreen" value="false" />
                <param name="bgcolor" value="#000000" />
				<?php }else{?>
                <param name="bgcolor" value="#000000" />
                <param name="wmode" value="direct" /> 
                <param name="menu" value="false" />
                <param name="allowFullScreen" value="true" />
				<param name="scale" value="default">
                <?php }?>
			<!--<![endif]-->
				
				<!-- BEGIN: Alternate Content -->
				<div>Adobe Flash is required to view this website. Please <a href="http://get.adobe.com/flashplayer/" onclick="window.open(this.href); return false;">install</a> it and reload this page.</div>
				<!-- END: Alternate Content -->
				
			<!--[if !IE]>-->
			</object>
			<!--<![endif]-->
		</object>
		<!-- End: Flash Embed -->
		<?php } else { ?>
		<!-- BEGIN: HTML5 Embed -->
		<iframe src="<?=$game_location?>" style="width:100%; height:100vh; border:none; margin:0; padding:0;" allowfullscreen></iframe>
		<!-- END: HTML5 Embed -->
		<?php } ?>
		<?php } ?>
	</div>
<!--[if lte IE 6]>
	<script src="swfObj/minsize.js" type="text/javascript"></script>
	<script type="text/javascript">
	<!--
		minsize('content',800,600);
	//-->
	</script>
<![endif]-->
</body>
</html>