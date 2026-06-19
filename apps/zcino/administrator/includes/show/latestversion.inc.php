<?php
//this php file connects to zcino and checks if you have the latest software version
//powered by zcino
require_once('../config.inc.php');
$latest = file_get_contents("http://www.zcino/latestversion.php");
$current = '4.00';
?><span style="font-weight:bold;font-size:14px;font-family:'Courier New', Courier, monospace"><?=$lang['Current+version']?> :
<span style="color:<?php if ($latest==$current){echo 'green';}else{echo 'red';}?>">
<?=$current?>
</span>
</span>
<br /><br />
<span style="font-weight:bold;font-size:14px;font-family:'Courier New', Courier, monospace">
&nbsp;<?=$lang['Latest+version']?> :
<span style="color:green">
<?=$latest?>
<br />
<?php if ($latest !== $current) { 
	echo '<div style="text-align:center"><a style="color:red" href="http://www.zcino/contact.html">'.$lang['Contact+Developers'].'</a></div>';
	} else {
?>
<span style="color:blue;font-weight:bold;font-size:14px;font-family:'Courier New', Courier, monospace"><?=$lang['You+have+the+latest+version']?></span>
<?php
		}
		?>
</span>
</span>