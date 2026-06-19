<div class="dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_full_numbers">
<?php    
require_once('../config.inc.php');
$_POST['page'] = antisqli($_POST['page']);
if (!isset($_POST['page']) || $_POST['page']<=0){
	$_POST['page'] = 10;	
}
if (!isset($perpage) || $perpage<=0){
	$perpage = 1;
}
//make sure pages is valid, and tell PHP how to build the page listing   
if (!isset($pquery)){
	$pages = 1;
}else{
	$pages = @ceil(mysqli_num_rows(mysqli_query($GLOBALS['con'],$pquery))/$perpage);
}
if ($_POST['page']>$pages ||!is_numeric($_POST['page']) ||$_POST['page']<=0){
	$_POST['page'] = 1;
	$pages = 1;
}
if ($pages<=5){
	$start = 1;
	$end = $pages;
}else{
	if (!isset($_POST['page']) ||$_POST['page']==1 ||$_POST['page']==2){
		$start = 1;
		$end = 5;	
	}elseif ($_POST['page']>2 && $_POST['page']<=$pages-2){
		$start = $_POST['page']-2;
		$end = $_POST['page']+2;	
	}elseif ($_POST['page']==$pages-1){
		$start = $_POST['page']-1;
		$end = $_POST['page']+3;
	}elseif ($_POST['page']==$pages){
		$start = $_POST['page']-4;
		$end = $_POST['page'];
	}
}
?>
<?php
	// FIRST and PREV buttons
?> 
    <a title="Page 1" class="toFirst ui-corner-tl ui-corner-bl fg-button ui-button" onclick="switch_page('1')"><?=$lang['First']?></a>
    
    <?php
    if ($_POST['page']>1){
		?>
	<a title="<?=($_POST['page']-1)?>" class="previous fg-button ui-button" onclick="switch_page('<?=($_POST['page']-1)?>')"><?=$lang['Previous']?></a>
    <?php }else{?>
    <a title="No previous pages" class="previous fg-button ui-button ui-state-disabled"><?=$lang['Previous']?></a>
    <?php }?>
<?php
//show the numeric page listing
for ($i=$start;$i<=$end;$i++) {
    ?>
    <span>
        <span class="fg-button ui-button <?php if ($_POST['page']==$i){?>ui-state-disabled<?php }?>" <?php if ($_POST['page']!==$i){?>onclick="switch_page('<?=$i?>')<?php }?>"><?=$i?></span>
    </span>
    <?php
} 
?>
<?php
	//NEXT and LAST buttons
    if ($_POST['page']==$pages || $pages==1){
		?>
    <a title="No more pages" class="next fg-button ui-button ui-state-disabled"><?=$lang['Next']?></a>
    <?php }else{?>
    <a title="<?=($_POST['page']+1)?>" class="next fg-button ui-button" onclick="switch_page('<?=($_POST['page']+1)?>')"><?=$lang['Next']?></a>
    <?php }?>
    <a title="Page <?=$pages?>" class="last ui-corner-tr ui-corner-br fg-button ui-button" onclick="switch_page('<?=$pages?>')"><?=$lang['Last']?></a>
</div>
<?php
foreach($_POST as $key=>$value){
	if ($key!=='page' && $key!=='perpage' && strlen($value)>0){
		$string .= '&'.$key.'='.antisqli($value);
	}
}
?>
<script type="text/javascript">
	function switch_page(page){
		var perpage = $("#tableFilter option:selected").val();
		showparam('<?=str_replace('.inc.php','',$page_sname)?>','&perpage='+perpage+'&page='+page+'<?=$string?>');
	}
</script>                            
</div>