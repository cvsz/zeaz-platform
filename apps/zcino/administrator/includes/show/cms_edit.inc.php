<?php 
//this php file lets you edit the selected website page that you created using our CMS
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
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> <br /><br /><br /> 

<?php
if (isset($_POST['update'])) { 
			echo '<script type="text/javascript">
					$("#name").css("border","");
					$("#pagecode").css("border","");
					$("#content").css("border","");
					$("#email").css("border","");
					</script>
					';  
			$ok = true;
			$id = antisqli($_POST['id']);
			if (!is_numeric($id) || $id<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
						<p><strong>FAILED: </strong>';
							echo $lang['Update+failed'];
							echo '</p></div>';
			}else{
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_pages` SET `name`='$name' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_pages` SET `pagecode`='$pagecode' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$content = validateInput(antisqli($_POST['content']));
				mysqli_query($GLOBALS['con'],"UPDATE `cws_pages` SET `content`='$content' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				
				$status = antisqli($_POST['status']);
				if ($status<0 || $status>1){
						$ok = false;
						echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
						echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_pages` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				if ($demoMode!==1){
					if ($ok!==false){
							echo '<div class="nNote nSuccess hideit">
					<p><strong>SUCCESS: </strong>';
							echo $lang['Updated+successfully'];
							echo '</p></div>';
						}else { 
							echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
							echo $lang['Update+Failed'];
							echo '</p></div>';
						}
				}else {
					echo '<div class="nNote nFailure hideit">
					<p><strong>FAILURE: </strong>';
					echo $lang['No+changes+allowed+in+demo'];
					echo '</p></div>';
				}
			}
}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_pages WHERE `id`='".antisqli($_POST['id'])."'"));
?>
<form class="form"  name="form" onsubmit="return false" style="text-align:left">
<fieldset>
    <div class="widget">
        <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=$lang['Edit']?> <?=$lang['Page']?> <span style="font-style:italic;color:#03C"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_pages` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?></span></h6></div>

<div class="formRow">    
    <label> <?=$lang['Name']?> </label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="name" value="<?=$row['name']?>" style="width:225px"/></div>
    <div class="clear"></div>
</div>

<div class="formRow"> 
    <label><?=$lang['Page']?> <?=$lang['short+name']?></label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="pagecode" value="<?=$row['pagecode']?>"  style="width:190px"/>(<?=$lang['only']?> a-z,0-9 <?=$lang['and']?> "_" <?=$lang['characters+are+allowed']?>)</div>
    <div class="clear"></div>
</div>

<div class="formRow"> 
    <label> <?=$lang['Content']?></label> 
    <div class="formRight"><textarea class="text small" name="smallfield" id="content" style="height:150px;width:500px"><?=htmlspecialchars($row['content'])?></textarea></div>
    <div class="clear"></div>
</div>

<div class="formRow"> 
    <label> <?=$lang['Status']?></label>
    <select id="status">
    <option value="1" <?php if ($row['status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
    <option value="0" <?php if ($row['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
    </select>
    <div class="clear"></div>
</div>
</fieldset>
</form>

<a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" id="update"><span><?=$lang['Update']?></span></a>
<script type="text/javascript">
$("#content").cleditor({
    width:"100%",
    height:"100%",
    bodyStyle: "margin: 10px; font: 12px Arial,Verdana; cursor:text"
});
$("#update").click(function() {
				var name = $("#name").val();
				var pagecode = $("#pagecode").val();
				var content = $("textarea#content").val();
				var status = $("#status option:selected").val();
				$.post("includes/show/cms_edit.inc.php", { update: "1", name: name, id: <?=antisqli($_POST['id'])?>, status: status, pagecode: pagecode, content: content},
   function(data){
     $("#show").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>
</div>