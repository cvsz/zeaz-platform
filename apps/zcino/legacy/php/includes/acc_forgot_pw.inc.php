<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/includes/config.inc.php');
?>
<h2><?=$lang['Resend+Password']?></h2>
<table>
<tr style="height:35px">
<td class="grey" style="width:150px"><?=$lang['Username']?>:</td>
<td class="grey" style="width:90px"><input class="field" type="text" name="username" id="usernameF" value="" style="width:120px" /></td>
</tr>
<tr style="height:35px">
<td class="grey" style="width:150px"><?=$lang['Email']?>:</td>
<td class="grey" style="width:90px"><input class="field" type="text" name="email" id="emailF" value="" style="width:120px" /></td>
</tr>
<tr style="height:35px">
<td style="text-align:center">
<div id="errorMsg" style="color:red;text-align:center;width:150px"></div>
</td>
<td width="40">

<input type="submit" id="submitLogin" value="Submit" onclick="resend_pass();" class="bt_login"/>
<script type="text/javascript">
function resend_pass(){
	var username = $("#usernameF").val();
	var email = $("#emailF").val();
	$.post("http://<?=$_SERVER['SERVER_NAME']?>/includes/do_acc_forgot_pw.inc.php", { username: username, email: email }, function(welcome) { $("#errorMsg").html(welcome); } );
}
</script>
</td>
</tr>
</table>
</form>