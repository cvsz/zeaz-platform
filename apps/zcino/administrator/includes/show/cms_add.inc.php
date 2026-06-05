<?php
//this php file lets you add a website page ; please note that you must put a link towards this page in the following format : <a href="#showAffiliate" class="affiliate" onclick="showcontent('','affiliate');"> , where 'affiliate' is the pagecode
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
<?php
if (isset($_POST['add'])) { 
			echo '<script type="text/javascript">
					$("#name").css("border","");
					$("#pagecode").css("border","");
					$("#content").css("border","");
					$("#email").css("border","");
					</script>
					';  
			$ok = true;
			$name = antisqli($_POST['name']);
			if (strlen($name)>20 || !is_good_name($name)){
				$ok = false;
				if (!is_good_name($name)){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+name'].'</strong></p></div>';
						}elseif(strlen($name)>20){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Name+too+long'].'</strong></p></div>';
						}
				echo '<script type="text/javascript">$("#name").css("border","2px solid #F00");</script>';
			}
			
			$pagecode = antisqli($_POST['pagecode']);
			if (strlen($pagecode)>20 || !checkName($pagecode)){
				$ok = false;
				if (!checkName($pagecode)){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+pagecode'].'</strong></p></div>';
						}elseif(strlen($name)>20){
							echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Page+code+too+long'].'</strong></p></div>';
						}
				echo '<script type="text/javascript">$("#pagecode").css("border","2px solid #F00");</script>';
			}
				
			$content = validateInput(antisqli($_POST['content']));

			$status = antisqli($_POST['status']);
			if ($status<0 || $status>1){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
				echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
			}
			if ($demoMode!==1){
				if ($ok!==false){
					mysqli_query($GLOBALS['con'],"INSERT INTO `cws_pages` (`name`,`pagecode`,`content`,`status`) VALUES ('$name','$pagecode','$content','$status')") or error_report(mysqli_error($GLOBALS['con']));
						echo '<div class="nNote nSuccess hideit">
					<p><strong>SUCCESS: </strong>';
						echo $lang['Added+successfully'];
						echo '</p></div>';
					}else { 
					echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
						echo $lang['Failed'];
					echo '</p></div>';
					}
				}else {
					echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
					echo $lang['No+changes+allowed+in+demo'];
					echo '</p></div>';
				}
}
		
?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
<div class="widget">
<div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png" /><h6><?=$lang['Add']?> <?=$lang['Page']?></h6></div>
        
<div class="formRow">
    <label> <?=$lang['Name']?></label> 
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="name" value="<?=antisqli($_POST['name'])?>" style="width:225px"/></div>
    <div class="clear"></div>
</div>

<div class="formRow">
    <label><?=$lang['Page']?> <?=$lang['short+name']?></label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="pagecode" value="<?=antisqli($_POST['pagecode'])?>"  style="width:190px"/>(<?=$lang['only']?> a-z,0-9 <?=$lang['and']?> "_" <?=$lang['characters+are+allowed']?>)</div>
    <div class="clear"></div>
</div>

<div class="formRow">
    <label> <?=$lang['Content']?></label> 
    <div class="formRight"><textarea class="text small" name="smallfield" id="content" style="height:150px;width:500px"><?=antisqli($_POST['content'])?></textarea></div>
    <div class="clear"></div>
</div>

<div class="formRow">
    <label> <?=$lang['Status']?></label>
    <div class="formRight">
        <select id="status">
        <option value="1"><?=$lang['Enabled']?></option>
        <option value="0"><?=$lang['Disabled']?></option>
        </select>
    </div>
<div class="clear"></div>
</div>
</fieldset>
</form>

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Add'].$lang['Page']?>" href="#" id="add"><span><?=$lang['Add'].$lang['Page']?></span></a>
<script type="text/javascript">
$("#content").cleditor({
    width:"100%",
    height:"100%",
    bodyStyle: "margin: 10px; font: 12px Arial,Verdana; cursor:text"
});
$("#add").click(function() {
				var name = $("#name").val();
				var pagecode = $("#pagecode").val();
				var content = $("textarea#content").val();
				var status = $("#status option:selected").val();
				$.post("includes/show/cms_add.inc.php", { add: "1", name: name, status: status, pagecode: pagecode, content: content},
   function(data){
     $("#show").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>
</div>