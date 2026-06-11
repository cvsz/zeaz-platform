<?php
@session_start();
require_once('includes/config.inc.php');
$language = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_languages` WHERE `status`=1 ORDER BY `id`");
while ($row = mysqli_fetch_array($language)) {
?>
<div style="float:left;width:30px"><a href="#<?=$row['code']?>" title="<?=$row['name']?>"><img src="images/lang/<?=$row['code']?>.png" width="20" height="20" title="<?=$row['name']?>" alt="<?=$row['code']?>" onclick="changelang('<?=$row['code']?>')" /></a></div>
<?php
}
?>
