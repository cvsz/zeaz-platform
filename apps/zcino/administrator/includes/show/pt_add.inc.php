<?php 
//this php file lets you add a product to the POINTS SHOP
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
<h3 style="margin-left:10px;"><?=$lang['Add+Product']?> <span style="color:red" id="updated">
<?php
if (isset($_POST['add'])) { 
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
			
			$description = antisqli($_POST['description']);
			$image_url = antisqli($_POST['image_url']);
			if (strlen($image_url)<=4 || stristr($image_url,'<') || stristr($image_url,'>') || stristr($image_url,'{') || stristr($image_url,'}')){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid Image URL</strong></p></div>';
					echo '<script type="text/javascript">$("#image_url").css("border","2px solid #F00");</script>';
				}
				
			$points_price = antisqli($_POST['points_price']);

			if (!is_numeric($points_price) || $points_price<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Points price must be 0 or larger value</strong></p></div>';
				echo '<script type="text/javascript">$("#points_price").css("border","2px solid #F00");</script>';
			}
			
			$shipping_price = antisqli($_POST['shipping_price']);

			if (!is_numeric($shipping_price) || $shipping_price<0){
				$ok = false;
				echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Shipping price must be 0 or larger value</strong></p></div>';
				echo '<script type="text/javascript">$("#shipping_price").css("border","2px solid #F00");</script>';
			}
			$status = antisqli($_POST['status']);
			if ($status!=='0'){
				$status = 1;
			}
			if ($demoMode==1){
				die('You are not allowed to insert products in demo mode');
			}
			if ($ok!==false){
					mysqli_query($GLOBALS['con'],"INSERT INTO `cws_shop_products` (`name`,`description`,`image_url`,`points_price`,`shipping_price`,`status`) VALUES ('$name','$description','$image_url','$points_price','$shipping_price','$status')") or error_report(mysqli_error($GLOBALS['con']));
					echo $lang['Product+added+successfully'];
				}else { 
					echo $lang['Failed'];
				}
		}
?>
</span>
</h3>
<div style="text-align:left;padding-left:25px;">
<h5> <?=$lang['Name']?> <input type="text" class="text small" name="smallfield" id="name" value="<?=$name?>" style="width:225px"/></h5>
<h5> <?=$lang['Description']?> <input type="text" class="text small" name="smallfield" id="description" value="<?=$description?>"  style="width:190px"/></h5>
<h5> <?=$lang['Image+URL']?> <input type="text" class="text small" name="smallfield" id="image_url" value="<?=$image_url?>"  style="width:290px"/></h5>
<h5> <?=$lang['Shipping+Price']?> <input type="text" class="text small" name="smallfield" id="shipping_price" value="<?=$shipping_price?>"  style="width:100px"/>&euro;/$</h5>
<h5> <?=$lang['Points+Price']?> <input type="text" class="text small" name="smallfield" id="points_price" value="<?=$points_price?>" style="width:100px"/><?=$_SESSION['currency']?></h5>
<h5> <?=$lang['Status']?><br />
<select id="status">
<option value="1"><?=$lang['Enabled']?></option>
<option value="0"><?=$lang['Disabled']?></option>
</select>
</h5>
<a href="#add" class="btn def" id="add" style="padding:5px 49px 10px 30px"><?=$lang['Add+product']?></a><br />
<script type="text/javascript">
$("#add").click(function() {
				var name = $("#name").val();
				var description = $("#description").val();
				var shipping_price = $("#shipping_price").val();
				var points_price = $("#points_price").val();
				var image_url = $("#image_url").val();
				var status = $("#status option:selected").val();
				$.post("includes/show/pt_add.inc.php", { add: "1", name: name, status: status, description: description, shipping_price:shipping_price,points_price:points_price,image_url:image_url },
   function(data){
     $("#show").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>
</div>