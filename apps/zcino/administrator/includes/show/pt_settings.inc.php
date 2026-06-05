<?php
//this php file lets you adjust the settings for the points shop
//powered by zcino
require_once('../config.inc.php');
if (PERMISSIONS=='1' && $_SESSION['adminlvl']!=='admin'){ // if the user is not master admin, and the privileges system is on, check his privileges
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE ".$_SESSION['adminlvl']."='1' AND status='1' AND shortname='$filename'");
	if (mysqli_num_rows($q)==0){
		die('<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>');	
	}else{
		$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
		$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
		$page_menu = mysqli_result($q,0,'menu');
		$page_sname = mysqli_result($q,0,'shortname');
	}
}else{
	$tmp = explode('/',$_SERVER['SCRIPT_NAME']);
	$filename = $tmp[count($tmp)-1]; // get the current php filename , then search in the permissions table for the permissions that we gave to the staff to use this file
	$q = mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE shortname='$filename'") or error_report(mysqli_error($GLOBALS['con']));
	$page_cat = str_replace('+',' ',mysqli_result($q,0,'category'));
	$page_name = str_replace('+',' ',mysqli_result($q,0,'name'));
	$page_menu = mysqli_result($q,0,'menu');
	$page_sname = mysqli_result($q,0,'shortname');
}
?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 


<form name="ff1" onsubmit="return false">
<h3 style="margin-left:10px;"><?=$lang['Casino+General+Settings']?> - <?=$lang['Point']?> <?=$lang['based']?> <?=$lang['system']?><span style="color:red">
<?php
$profit = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `bank`,`coef` FROM `bank_tbl`"),0);
if (isset($_POST['update'])) { 
			if (strlen($_POST['currency'])>1){
				$points_shop = antisqli($_POST['points_shop']);
				mysqli_query($GLOBALS['con'],"UPDATE cws_settings SET points_shop='$points_shop' ");
				}
			echo $lang['Updated+successfully'];
			if ($_SESSION['adminlanguage']!==$_POST['language']){
				echo '<script type="text/javascript">window.location = "index.php"</script>';
				}
			$_SESSION['adminlanguage'] = antisqli($_POST['language']);
			
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM bank_tbl"));
?>
</span>
</h3>
<div style="text-align:left;padding-left:25px;"> 
<?php
if ($_SESSION['adminlvl']=='admin'){
	?>

<h5><?=$lang['Activate+point+shop+instead+of+money+withdraw+system']?> (<?=$lang['setting+recommended+for+casinos+without+licence']?>)  <input type="checkbox" name="points_shop" <?php if (mysqli_result(mysqli_query($GLOBALS['con'],"SELECT points_shop FROM cws_settings"),0)=='1') {echo 'checked';}?> id="points_shop" value="1" onchange="updatec()"/></h5>
</form>
<script type="text/javascript">
function updatec() {
				var points_shop = $("#points_shop").val();
				if(document.ff1.points_shop.checked == true) { var points_shop = 'points_shop=1';}else {points_shop = 'points_shop=0';}
				showparam('cas_general','update=1&'+points_shop);
				};
</script>
</div>
<?php
}
?>