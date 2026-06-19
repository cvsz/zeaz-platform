<?php
//this file will generate the listing of the casino games 
?>
<div id="categories">
<?php
//generate the categories
require_once('list_games_cat.inc.php');
?>
</div>

<div id="games">
<?php
//generate the games from category1
require_once('list_games.inc.php');

?>
</div>

<div id="currentgame" style="background-image:url('images/game_loading.gif');text-align:center">
<a id="imglaunch" href="#" <?php if ($popup==1){?> rel="cws_popup" <?php } else{ ?> target="_self" <?php } ?> onmouseout="previewsrc()" onmouseover="gamesrc()" title="<?php if (isset($_SESSION['username'])){echo $lang['Play+for+Real'];}else{ echo $lang['Play+for+Fun'];}?>">
<img src="images/logo.png" id="gamebg" width="270" height="240" style="z-index:0;position:absolute;"/>
<img src="images/logo.png" id="gamepic" width="270" height="240" style="z-index:1;position:absolute;"/>
</a>
<br />
<div style="position: absolute; width: 250px; top: 240px;">
<span id="launchergame" style="text-align:center;">
<a title="<?php echo $lang['Play+for+Fun']?>"  <?php if ($popup==1){?> rel="cws_popup" <?php } else{ ?> target="_self" <?php } ?> href="#" id="launchgamef" class="launchgame"><?php echo $lang['Play+for+Fun']?></a>
<?php
if (isset($_SESSION['username'])){
	?>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    
<a title="<?php echo $lang['Play+for+Real']?>"  <?php if ($popup==1){?> rel="cws_popup" <?php } else{ ?> target="_self" <?php } ?> href="#" id="launchgamer" class="launchgame"><?php echo $lang['Play+for+Real']?></a>
<?php
}
?>
</span>
</div>
</div>
