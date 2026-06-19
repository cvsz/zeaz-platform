<?php 
//this php file lists the profile details of the current logged in user
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
if (isset($_POST['update'])) {
			if ($demoMode==1){ echo('<div class="nNote nFailure hideit">
            <p><strong>FAILURE: '."Changes not allowed in demo mode".'</p></div>');}else{
			$pass = antisqli(urldecode($_POST['pass']));
			if (strlen($pass)<6){ $errormsg = 'Password is too short.Minimum 6 chars needed.';}
			if (!check_pw($pass)){ $errormsg = $lang['Invalid+password'].'.';}
			$name = antisqli($_POST['name']);
			if (!isset($errormsg)) {
					$sql="UPDATE `cws_staffs` SET `pass`='".pass_encode($pass)."',`name`='$name' WHERE `login`='".$_SESSION['admin']."'";
					if (@mysqli_query($GLOBALS['con'],$sql)) 
					{
							echo '<div class="nNote nSuccess hideit">
				<p><strong>SUCCESS: </strong>'.$lang['Updated+successfully'].'</p></div>';
						}else { 
							echo '<div class="nNote nFailure hideit">
            <p><strong>FAILURE: '.$lang['Update+Failed'].'</p></div>';
						}
			} else {echo '<div class="nNote nFailure hideit">
				<p><strong>FAILURE: </strong>'.$errormsg.'</p></div>';}
			}
		}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_staffs WHERE `login`='".antisqli($_SESSION['admin'])."'"));
?>

                         
<form name="ff1" class="form"  onsubmit="return false" style="text-align:left">
<fieldset>
    <div class="widget">
        <div class="title"><img class="titleIcon" alt="" src="images/icons/dark/list.png"><h6><?=ucfirst($lang['Profile'])?></h6></div>
        
    <div class="formRow">
    <label><?=$lang['Username']?></label>
    <div class="formRight"><?=$row['login']?></div>
    <div class="clear"></div>
    </div>

    <div class="formRow">
    <label><?=$lang['Password']?></label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="pass" value="<?php echo pass_decode($row['pass']);?>"  style="width:170px"/></div>
    <div class="clear"></div>
    </div>

    <div class="formRow">
    <label><?=$lang['Name']?></label>
    <div class="formRight"><input type="text" class="text small" name="smallfield" id="name" value="<?=$row['name']?>" style="width:170px"/></div>
    <div class="clear"></div>
    </div>


    <div class="formRow">
    <label><?=$lang['Credit']?></label>
    <div class="formRight cash"><?=$row['cash']?><?=$_SESSION['currency']?></div>
    <div class="clear"></div>
    </div>
    
    <div class="formRow">
    <label><?=$lang['Affiliate+code']?></label>
    <div class="formRight cash"><textarea id="affcode"><a href="<?=get_protocol_srv().$_SERVER['SERVER_NAME'].'/?reff='.mysqli_result(mysqli_query($GLOBALS['con'],"SELECT id FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);?>">Join <?=$_SERVER['SERVER_NAME']?></a></textarea></div>
    <div class="clear"></div>
    </div>
    <script type="text/javascript">
		$("#affcode").focus(function() {
		var $this = $(this);
		$this.select();
	
		// Work around Chrome's little problem
		$this.mouseup(function() {
			// Prevent further mouseup intervention
			$this.unbind("mouseup");
			return false;
		});
	});
</script>

    <div class="formRow">
    <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Update']?>" href="#" id="update" onclick="javascript:update_settings()"><span><?=$lang['Update']?></span></a>
    </div>
</div>
<script type="text/javascript">
$("#update").click(function() {
				var pass = encodeURIComponent($("#pass").val());
				var name = encodeURIComponent($("#name").val());
				showparam('mydetails','update=1&'+'pass='+pass+'&'+'name='+name);
							 });
</script>