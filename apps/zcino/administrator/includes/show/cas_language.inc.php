<?php
//this php this file lets you change only language
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
<div id="linkheader"><?=$lang["Casino+Settings"]?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.$lang["Admin+Language"].'</a>';}else{ echo $lang[str_replace(' ','',$page_cat)];}?></div><br /><br /><br /> 



<?php
if (isset($_POST['update'])) { 
			$language = antisqli($_POST['language']);
			if (strlen($language)>3){
					$language = substr($language,0,3);
				}
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT code FROM cws_languages WHERE status='1' AND code='$language'"))>0){
				?>
                <div class="nNote nInformation hideit">
				<p><strong><?=$lang['SUCCESS']?>: </strong>
                <?php
				echo $lang['Updated+successfully'];
				?>
                </p>
				</div>
                <?php
				$_SESSION['adminlanguage'] = antisqli($_POST['language']);
				echo '<script type="text/javascript">window.location = "index.php"</script>';
				exit;
			}else{
				?>
                <div class="nNote nFailure hideit">
				<p><strong><?=$lang['FAILURE']?>: </strong>
                <?php
				echo $lang['Updated+failed'];
				?>
                </p>
				</div>
                <?php
			}
			
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM bank_tbl"));
?>
<div class="widget">
<div class="formRow">
<label><?=$lang['Administrator+panel+language']?>:</label>
<select onchange="updatec()" id="language">
<?php
$language = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_languages` WHERE status='1'");
while ($row = mysqli_fetch_array($language)) {
?>
<option value="<?=$row['code']?>" <?php if ($_SESSION['adminlanguage'] == $row['code']) {echo 'selected';}?> ><?=strtoupper($row['name'])?></option>
<?php
}
?>
</select><br /><br /><br />
<label>
<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" onclick="updatec()"><span><?=$lang['Update']?></span></a>
</label>
</div>             
<div class="clear"></div>
</div>
<script type="text/javascript">
$(function(){
	$("select").uniform();
});
function updatec() {
				var language = $("#language").val();
				showparam('cas_language','update=1&'+'language='+language);
				};
</script>
</div>
