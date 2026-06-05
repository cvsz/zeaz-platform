<?php
//this php file lets you write the newsletter and send it
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
<h3 style="margin-left:10px;"><?=$lang['Send+Newsletter']?><br />
<span style="color:red" id="updated">
</span>
</h3>
<form action="index.php" method="post">
<strong><?=$lang['Email+Subject']?></strong><br />
<input name="emailSubject" id="emailSubject" type="text" size="38" />
<br /><br />
<?=$lang['Email+text']?><br />
<textarea name="emailBody" id="emailBody" cols="80" rows="8"></textarea>
<br />
<a href="#send" class="btn def" id="send" style="padding:5px 49px 10px 40px">Send</a>
</form>
<script type="text/javascript">
$("#send").click(function() {
				var emailSubject = $("#emailSubject").val();
				var emailBody = $("#emailBody").val();
				$.post("includes/show/newsletter_do.inc.php", { update: "1", emailSubject:emailSubject,emailBody:emailBody },
   function(data){
     $("#updated").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>