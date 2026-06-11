<?php
#developed by www.zcino
@require_once('config.inc.php');
// this file manages the HTML output of the casino PRODUCTS ( for point system )
 //check if user is logged in for further use
if (isset($_SESSION['username'])){
	$loggedin = checkloggedin($_SESSION['username']);
}else {
	$loggedin = 'no';
	echo 'You are not logged in !';
	exit;
}
$status = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT status FROM cws_users WHERE id='{$_SESSION['userid']}'"),0);
if ($status!=='1') {echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['Your+account+is+not+in+an+eligible+state+yet'].'</p>\').fadeOut(2000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("includes/finances.inc.php").fadeIn(\'slow\');
			});
</script>';
	exit;}	
//check if game category to display was set
$cat = validateInput($_GET['page']);
if (!isset($_GET['page'])) {
	$cat = '0';
	}
$result = mysqli_query($GLOBALS['con'],"SELECT * from cws_shop_products WHERE `status`='1' ORDER BY `name`") or error_report(mysqli_error($GLOBALS['con']));
if (mysqli_num_rows($result)==0){echo 'No products available';exit;} // display message and abort execution if the category has no games
$fun = 0;
if ($loggedin == 'no') {$notloggedin = 'style="height:260px;" ';$fun =1;}
$i=0;
while($detail = mysqli_fetch_array($result)) // fetch all SQL data and display the games
{
$i++;
echo '
<div class="gamelist" style="min-height:180px">
<div class="gameName">'.$detail['name'].'</div>
<div style="background-image:url(\''.str_replace('preview.gif','game.gif',$detail['preview_pic']).'\');background-repeat:no-repeat"  onmouseover="ShowContent(\'descimage'.$detail['id'].'\')" onmouseout="HideContent(\'descimage'.$detail['id'].'\')" >
<img src="'.$detail['image_url'].'" style="border:0px solid #666;" id="image'.$detail['id'].'" width="184" height="156" alt="'.$detail['name'].'" />
<div style="color:white;font-size:12px;height:10px;padding-top:5px;">'.substr($detail['description'],0,55).' ... </div>
</div>
<div style="display:none;" class="hidd" id="descimage'.$detail['id'].'">'.$detail['description'].'</div>
<br /><br />';
//
// build the HTML for the games ( see if play for real is available )
$playdiv = "<div style=\"margin-top:-8px\">
<div style=\"text-align:center;\">
<a onclick=\"askAddress('".$detail['id']."')\" href=\"#centermenu\">{$lang['Buy']} {$lang['for']} <span style='color:#09C'>".$detail['points_price']."</span> {$lang['Points']} {$lang['and']} <br /> <span class='cash'>".$detail['shipping_price']." &euro;/$(shipping)</span></a>
</div></div></div>
";
echo $playdiv; // output image+text of each game
if ($i == 3) {$i=0;echo '<br />';}
} 
?>
