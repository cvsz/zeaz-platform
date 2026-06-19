<?php 
//this php file lets you edit the selected product from the POINTS SHOP
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

<h3 style="margin-left:10px;"><?=$lang['Edit']?> <span style="font-style:italic"><?php if (isset($_POST['id'])) { echo mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `name` FROM `cws_shop_products` WHERE `id`='".antisqli($_POST['id'])."'"),0);}?></span><span style="color:red" id="updated">
<?php
if (isset($_POST['update'])) { 
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
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `name`='$name' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$description = validateInput(antisqli($_POST['description']));
				mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `description`='$description' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));
				
				$image_url = antisqli($_POST['image_url']);
				if (strlen($image_url)<=4 || stristr($image_url,'<') || stristr($image_url,'>') || stristr($image_url,'{') || stristr($image_url,'}')){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Invalid Image URL</strong></p></div>';
					echo '<script type="text/javascript">$("#image_url").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `image_url`='$image_url' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$shipping_price = antisqli($_POST['shipping_price']);
				if (!is_numeric($shipping_price) || $shipping_price<=0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Shipping price must be 0 or larger value</strong></p></div>';
					echo '<script type="text/javascript">$("#shipping_price").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `shipping_price`='$shipping_price' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$points_price = antisqli($_POST['points_price']);
				if (!is_numeric($points_price) || $points_price<=0){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': Points price must be 0 or larger value</strong></p></div>';
					echo '<script type="text/javascript">$("#points_price").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `points_price`='$points_price' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				$status = antisqli($_POST['status']);
				if ($status!=='0' && $status!=='1'){
					$ok = false;
					echo '<div class="nNote nFailure hideit">
				<p><strong>'.$lang['Incorrect+value'].': '.$lang['Invalid+status'].'</strong></p></div>';
					echo '<script type="text/javascript">$("#status").css("border","2px solid #F00");</script>';
				}else{mysqli_query($GLOBALS['con'],"UPDATE `cws_shop_products` SET `status`='$status' WHERE `id`='$id'") or error_report(mysqli_error($GLOBALS['con']));}
				
				if ($demoMode==0){
				if ($ok!==false){
						echo $lang['Updated+successfully'];
					}else { 
						echo $lang['Update+Failed'];
					}
				}else{
					echo 'Editing products is disabled in DEMO';	
				}
			}
		}
if (isset($_POST['id'])) {$_POST['id'] = antisqli($_POST['id']);}
$row = mysqli_fetch_array(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_shop_products WHERE `id`='".antisqli($_POST['id'])."'"));
?>
</span>
</h3>
<div style="text-align:left;padding-left:25px;">
<h5> <?=$lang['Name']?> <input type="text" class="text small" name="smallfield" id="name" value="<?=$row['name']?>" style="width:225px"/></h5>
<h5> <?=$lang['Description']?> <input type="text" class="text small" name="smallfield" id="description" value="<?=htmlspecialchars($row['description'])?>"  style="width:190px"/></h5>
<h5> <?=$lang['Image+URL']?> <input type="text" class="text small" name="smallfield" id="image_url" value="<?=$row['image_url']?>"  style="width:290px"/></h5>
<h5> <?=$lang['Shipping+Price']?> <input type="text" class="text small" name="smallfield" id="shipping_price" value="<?=$row['shipping_price']?>"  style="width:100px"/> &euro;/$</h5>
<h5> <?=$lang['Points+Price']?> <input type="text" class="text small" name="smallfield" id="points_price" value="<?=$row['points_price']?>" style="width:100px"/><?=$_SESSION['currency']?> &euro;</h5>
<h5> <?=$lang['Status']?>
<select id="status">
<option value="1" <?php if ($row['status']==1){echo 'selected';}?>><?=$lang['Enabled']?></option>
<option value="0" <?php if ($row['status']==0){echo 'selected';}?>><?=$lang['Disabled']?></option>
</select>
</h5>
<a href="#updated" class="btn def" id="update" style="padding:5px 49px 10px 40px"><?=$lang['Update']?></a><br />
<script type="text/javascript">
$("#update").click(function() {
				var name = $("#name").val();
				var description = $("#description").val();
				var points_price = $("#points_price").val();
				var shipping_price = $("#shipping_price").val();
				var image_url = $("#image_url").val();
				var status = $("#status option:selected").val();
				$.post("includes/show/pt_edit.inc.php", { update: "1", name: name, id: <?=antisqli($_POST['id'])?>, status: status, description: description, points_price:points_price,shipping_price:shipping_price,image_url:image_url},
   function(data){
     $("#show").html(data);
	 $("#updated").fadeTo(5000,0);
   });
							 });
</script>
</div>