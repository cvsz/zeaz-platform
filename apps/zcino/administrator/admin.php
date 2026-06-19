<?php
@session_start();
ini_set("max_execution_time","600");
ini_set("memory_limit","256M");
require_once('includes/config.inc.php');
$sitename = 'zCino';
$sql = "SELECT `code` FROM `cws_currencies` WHERE `current`=1";
$currencyP = @mysqli_result(mysqli_query($GLOBALS['con'],$sql),0);
$dmname = $_SERVER['SERVER_NAME'];
if (!stristr($_SERVER['SERVER_NAME'],$dmname)){
	//checklogin();
}
if (!isset($_SESSION['currency'])) {
	switch ($currencyP) {
	case 'EUR' : $_SESSION['currency'] = '&euro;';break;
	case 'GBP' : $_SESSION['currency'] = '&pound;';break;
	case 'USD' : $_SESSION['currency'] = '$';break;
	case 'Points' : $_SESSION['currency'] = 'Points';break;
	default : $_SESSION['currency'] = '$';
	}
}
$currency = $_SESSION['currency'];
if ($_SESSION['adminlvl']!=='admin'){
	$filter = "AND `{$_SESSION['adminlvl']}`='1'";
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
<title><?=$sitename?> Administrator Panel</title>
<link href="css/main.css" rel="stylesheet" type="text/css" />
<link href="css/calendar.css" rel="stylesheet" type="text/css" />
<link href="css/uniform.aristo.css" rel="stylesheet" type="text/css" />
<!-- load jquery and jquery UI -->
<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/jquery-1.7.js"></script>
<script type="text/javascript" src="http://<?=$_SERVER['SERVER_NAME']?>/administrator/jscript/jqueryui-1.8.js"></script>

<!-- load plugin for IE and custom functions -->
<script type="text/javascript" src="jscript/functions.js"></script>

<script type="text/javascript" src="js/plugins/charts/excanvas.min.js"></script>
<script type="text/javascript" src="js/plugins/charts/jquery.sparkline.min.js"></script>

<script type="text/javascript" src="js/plugins/forms/uniform.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.cleditor.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.validationEngine-en.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.validationEngine.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.tagsinput.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/autogrowtextarea.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.maskedinput.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.dualListBox.js"></script>
<script type="text/javascript" src="js/plugins/forms/jquery.inputlimiter.min.js"></script>
<script type="text/javascript" src="js/plugins/forms/chosen.jquery.min.js"></script>

<script type="text/javascript" src="js/plugins/wizard/jquery.form.js"></script>
<script type="text/javascript" src="js/plugins/wizard/jquery.validate.min.js"></script>
<script type="text/javascript" src="js/plugins/wizard/jquery.form.wizard.js"></script>

<script type="text/javascript" src="js/plugins/uploader/plupload.js"></script>
<script type="text/javascript" src="js/plugins/uploader/plupload.html5.js"></script>
<script type="text/javascript" src="js/plugins/uploader/plupload.html4.js"></script>
<script type="text/javascript" src="js/plugins/uploader/jquery.plupload.queue.js"></script>

<script type="text/javascript" src="js/plugins/tables/datatable.js"></script>
<script type="text/javascript" src="js/plugins/tables/tablesort.min.js"></script>
<script type="text/javascript" src="js/plugins/tables/resizable.min.js"></script>

<script type="text/javascript" src="js/plugins/ui/jquery.tipsy.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.collapsible.min.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.prettyPhoto.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.progress.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.timeentry.min.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.colorpicker.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.jgrowl.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.breadcrumbs.js"></script>
<script type="text/javascript" src="js/plugins/ui/jquery.sourcerer.js"></script>

<script type="text/javascript" src="jscript/calendar.js"></script>
<script type="text/javascript" src="js/plugins/elfinder.min.js"></script>
<link href="css/countdown.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="jscript/jquery.countdown.min.js"></script>

<script type="text/javascript">
$(function() {
		var availableTags = [<?php
		$permissions = mysqli_query($GLOBALS['con'],"SELECT name,shortname FROM cws_permissions WHERE status='1' AND menu='1' $filter")or die(mysqli_error($GLOBALS['con']));
		$t=0;
		while ($row = mysqli_fetch_array($permissions)){
			$t++;
			if ($t!==1){echo ',';}
			?>{label:"<?=$row['name']?>",value:"<?=$row['name']?>",chk:"<?=str_replace('.php','',str_replace('.inc','',$row['shortname']))?>"} <?php } ?>];
		$("#ac").autocomplete({
			source: availableTags,
			select: function( event, ui ) {
                show(ui.item.chk);
            }
		});	
});
if ($.browser.msie){
	alert('<?=$lang['You+are+using+Internet+Exploder+browser']?>. <?=$lang['Please+use+Google+Chrome+Safari+or+Mozilla+Firefox+to+have+available+all+the+features+of+this+page']?>');
}
$(document).ready(function() {
	update_dep_wt_us();
	update_bet_won_pf();
	setInterval(update_dep_wt_us,1000*30);
	setInterval(update_bet_won_pf,1000*60);
});
</script>
<script type="text/javascript" src="js/custom.js"></script>

</head>

<body>

<!-- Left side content -->
<div id="leftSide">
    <div class="logo"><a href="index.php"><img src="images/logo.png" alt="" /></a></div>
    
    <div class="sidebarSep mt0"></div>
    
    <!-- Search widget -->
    <form action="" class="sidebarSearch">
        <input type="text" name="search" placeholder="search..." id="ac" />
    </form>
    
    <div class="sidebarSep"></div>

    <!-- General balance widget -->
    <div class="genBalance">
        <a href="#" title="" class="amount">
            <span><?=$lang['Available+credit+balance']?> - <?=$lang['refresh']?>:</span>
            <span class="balanceAmount" id="cashUpdate" onclick="update_bet_won_pf()">
            <?php
			$cash = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT cash FROM cws_staffs WHERE login='{$_SESSION['admin']}'"),0);
			echo cash_format_cws($cash,0).' '.$_SESSION['currency'];
			?>
            </span>
    </a></div>
    <div class="sidebarSep"></div>
    <!-- Next update progress widget -->
    <div class="sRoundStats" style="width:205px;overflow:hidden">
    	<ul>
        	<li><span style="width:65px;height:25px;overflow:hidden"><?=$lang['Today+Bet']?></span><a href="#" title="" onclick="update_bet_won_pf()"><span class="roundZero" id="betUpdate" style="font-size:10px">0%</span></a></li>
            <li><span style="width:65px;height:25px;overflow:hidden"><?=$lang['Today+Won']?></span><a href="#" title="" onclick="update_bet_won_pf()"><span class="roundZero" id="wonUpdate" style="font-size:10px">0%</span></a></li>
            <li><span style="width:65px;height:25px;overflow:hidden"><?=$lang['Today+Profit']?></span><a href="#" title="" onclick="update_bet_won_pf()"><span class="roundZero" id="pfUpdate" style="font-size:10px">0%</span></a></li>
        </ul>
        <div class="clear"></div>
    </div>
    
    <div class="sidebarSep"></div>

	<!-- Left navigation -->
    <ul id="menu" class="nav">
    <?php
	//get all categories
	$q = mysqli_query($GLOBALS['con'],"SELECT DISTINCT(category) FROM cws_permissions WHERE status='1' AND menu='1' $filter ORDER BY FIELD(category,'Other'),category ASC") or die(mysqli_error($GLOBALS['con']));
	$classes = array('Casino+Settings'=>'settings','Persons+Management'=>'ui','Content+Management'=>'typo','Games+Management'=>'games','Finances'=>'finances','Statistics'=>'charts','Security'=>'security','Point+based+system'=>'point','Multiplayer+Bingo+Live'=>'bingo','Other'=>'others','Multiplayer+Dog+Races'=>'dogs','Multiplayer+Roulette'=>'roulette','Multiplayer+Sicbo'=>'sicbo','Multiplayer+Races'=>'car');
	while($header = mysqli_fetch_array($q)){
		$q2 = mysqli_query($GLOBALS['con'],"SELECT name,shortname FROM cws_permissions WHERE status='1' AND menu='1' AND category='{$header['category']}' $filter ORDER BY name") or die(mysqli_error($GLOBALS['con'])); 
		$nr = mysqli_num_rows($q2);
		$ok = false;
		if ($nr>0){$ok = true;}
		if ($header['category']=='Multiplayer+Dog+Races'){
			if ($dogRacesOn!==1){
				$ok = false;
				//echo '&f=1';
			}
		}elseif($header['category']=='Multiplayer+Bingo+Live'){
			if ($bingoOn!==1){
				$ok = false;
				//echo '&f=2';
			}	
		}elseif($header['category']=='Multiplayer+Roulette'){
			if ($rouletteAm!==1 && $rouletteEu!==1){
				$ok = false;
				//echo '&f=2';
			}				
		}elseif($header['category']=='Multiplayer+Races'){
			if ($RacesOn!==1){
				$ok = false;
				//echo '&f=2';
			}				
		}elseif($header['category']=='Multiplayer+Sicbo'){
			if ($SicBoOn!==1){
				$ok = false;
				//echo '&f=2';
			}				
		}elseif($header['category']=='Point+based+system'){
			if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_settings WHERE points_shop='1'"))==0){
				$ok = false;
				//echo '&f=3';
			}	
		}elseif($casinoOn!==1){
			$ok = false;
			//echo '&f=4';
		}
		if ($ok==true){
		?>
    	<li class="<?=$classes[$header['category']]?>">
        <a href="#" title="" class="exp">
        <span><?php if(!isset($lang[$header['category']])){echo str_replace('+',' ',$header['category']);}else{echo $lang[$header['category']];}?></span>
        <strong><?=$nr?></strong>
        </a>
            <ul class="sub">
            	<?php 
				$r=0;
				while($submenu = mysqli_fetch_array($q2)){
					$r++;
					?> 
                <li <?php if ($r==$nr){echo 'class="last"';}?>>
                <a href="#show" onclick="javascript:show('<?=str_replace('.inc.php','',$submenu['shortname'])?>');">
                <?php 
				$lngword = ucfirst($lang[str_replace(' ','+',$submenu['name'])]);
				if ($lngword==""){
					echo $submenu['name'];
				}else{
					echo $lngword;
				}
				?>
                </a>
                </li>
                <?php }//end of submenu listing row?>
                <?php if ($header['category']=='Other'){?>
                <li <?php if ($r==$nr){echo 'class="last"';}?>>
                <a href="http://<?=$_SERVER['SERVER_NAME']?>/administrator/backend.pdf" target="_blank">
                Administrator Panel Guide
                </a>
                </li>
                <?php }?>
            </ul>
        </li>
    <?php }//end if that checks if we have any available submenus in this category, otherwise don't show the category at all
	}//end WHILE of categories?>        
    </ul>
</div>


<!-- Right side -->
<div id="rightSide">

    <!-- Top fixed navigation -->
    <div class="topNav">
        <div class="wrapper">
            <div class="welcome" style="width:420px">
            <a href="#" onclick="javascript:show('mydetails');" title=""><img src="images/userPic.png" alt="" /></a>
            <?php switch($_SESSION['adminlvl']) {
			case 'admin' : $lvl = 'Master';break;
			case 'operator' : $lvl = 'Operator';break;
			case 'agent' : $lvl = 'Agent';break;
			default : $lvl = 'Visitor';break;
			}?>
            <ul>
            <li class="dd"><span><?=ucfirst($lang['Welcome'])?>, <b><?=$_SESSION['admin']?></b> (<?=$lvl?> - <?php if ($demoMode==1){echo '<font style="color:red">Demo Mode</font>';}?>) </span>
            	<span><a href="#" style="color:#0CF" title="<?=$lang['Click+to+change+language']?>"><img src="images/lang/<?=$_SESSION['adminlanguage']?>.png" style="vertical-align:middle;margin:0;height:20px"/>&nbsp;&nbsp;(<?=$lang['click+to+change']?>)</a></span>
                <ul class="userDropdown" style="margin-left:150px">
					<?php
                    $language = mysqli_query($GLOBALS['con'],"SELECT * FROM `cws_languages` WHERE status='1' ORDER BY name") or die(mysqli_error($GLOBALS['con']));
                    while ($row = mysqli_fetch_array($language)) {
                    ?>
                    <li style="padding:7px;padding-left:10px"><a href="#" style="color:#0CF" onclick="javascript:showparam('cas_language','update=1&language=<?=$row['code']?>');" title="" class="sFlag"><?=ucfirst(strtolower($row['name']))?></a></li>
                    <?php 
                    }
                    ?>
                </ul>
                </li>
            </ul>

                   
            </div><span>
            <ul></ul>
            <div class="userNav">
                <ul>
                	<li><a href="http://<?=$_SERVER['SERVER_NAME']?>" title=""><img src="images/icons/topnav/mainWebsite.png" alt="" /><span><?=$lang['Main+website']?></span></a></li>
                    <li><a href="#" onclick="javascript:show('mydetails');" title=""><img src="images/icons/topnav/profile.png" alt="" /><span><?=ucfirst($lang['Profile'])?></span></a></li> 
                    <li><a href="logout.php" title=""><img src="images/icons/topnav/logout.png" alt="" /><span><?=$lang['Log+out']?></span></a></li>
                </ul>
            </div>
            <div class="clear"></div>
        </span></div>
    </div><span>
    
    <!-- Responsive header -->
    <div class="resp">
        <div class="respHead">
            <a href="index.html" title=""><img src="images/loginLogo.png" alt="" /></a>
        </div>
        
        <div class="cLine"></div>
    </div>
    
    <!-- Title area -->
    <div class="titleArea">
        <div class="wrapper">
          <div class="controlB" style="float:right">
            	<ul>
                <li>
                <a href="http://<?=$_SERVER['SERVER_NAME']?>/administrator/backend.pdf" target="_blank">
                <img height="45" width="50" src="images/icons/control/blue/help.png" alt="" style="vertical-align:middle"/>
                <span><?=ucfirst($lang['How+to+use+this+page'])?>?</span>
                </a>
                </li>
                
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='cas_general.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('cas_general');" title=""><img src="images/icons/control/blue/settings.png" alt="" /><span><?=ucfirst($lang['Casino+Settings'])?></span></a></li>
                <?php }?>
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='um_create_u.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('um_create_u');" title=""><img src="images/icons/control/blue/add.png" alt="" /><span><?=ucfirst($lang['Create+User'])?></span></a></li>
                <?php }?>
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='transfer_funds_u.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('transfer_funds_u');" title=""><img src="images/icons/control/blue/transfer.png" alt="" /><span><?=ucfirst($lang['Transfer+funds'])?></span></a></li>
                <?php }?>
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='um_list_u.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('um_list_u');" title=""><img src="images/icons/control/blue/look.png" alt="" /><span><?=ucfirst($lang['Check'])?> <?=ucfirst($lang['users'])?></span></a></li>
                <?php }?>
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='earnings.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('earnings');" title=""><img src="images/icons/control/blue/earnings.png" alt="" /><span><?=ucfirst($lang['Check+earnings'])?></span></a></li>
                <?php } ?>
                <?php if (mysqli_num_rows(mysqli_query($GLOBALS['con'],"SELECT * FROM cws_permissions WHERE status='1' AND shortname='fn_deposits.inc.php' $filter"))>0){?>
                <li><a href="#" onclick="javascript:show('fn_deposits');" title=""><img src="images/icons/control/blue/deposits.png" alt="" /><span><?=ucfirst($lang['Check+deposits'])?></span></a></li>
                <?php }?>
                <li><a href="logout.php" title=""><img src="images/icons/control/blue/logout.png" alt="" /><span><?=ucfirst($lang['Log+out'])?></span></a></li>
                </ul>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    
    <div class="line"></div>
    
    <!-- Page statistics and control buttons area -->
  <div class="wrapper statsItems">
        
        	<!-- Stats item -->
            <div class="sItem ticketsStats">
              <h2 style="padding-bottom:0px"><a title="<?=$lang['Total']?> <?=$lang['deposits']?>" class="value"><ul><li id="dtotal">0</li></ul><span><?=$lang['deposits']?></span></a></h2>
                <div class="statsDetailed" id="s1">
                    <div class="statsContent">
                        <div class="sElements">
                            <div class="sDisplay"><h4 id="dapproved">0</h4><span><?=$lang['approved']?></span></div>
                            <div class="sDisplay"><h4 id="dpending">0</h4><span><?=$lang['pending']?></span></div>
                            <div class="sDisplay"><h4 id="ddeclined">0</h4><span><?=$lang['declined']?></span></div>
                        </div>
                        <span class="line"></span>
                    </div>
                </div>
              <span class="changes" style="height:40px">
              		<span><?=$lang['Today']?></span>
                    <span class="<?=($deposit['today']=='0')?'zero':'positive'?>" id="dtoday">+0</span>
                </span>
            </div>
        
        	<!-- Stats item -->
            <div class="sItem visitsStats">
              <h2 style="padding-bottom:0px"><a title="<?=$lang['Total']?> <?=$lang['withdrawals']?>" class="value"><ul><li id="wtotal">0</li></ul><span><?=$lang['withdrawals']?></span></a></h2>
                <div class="statsDetailed" id="s2">
                    <div class="statsContent">
                        <div class="sElements">
                            <div class="sDisplay"><h4 id="wapproved">0</h4><span><?=$lang['approved']?></span></div>
                            <div class="sDisplay"><h4 id="wpending">0</h4><span><?=$lang['pending']?></span></div>
                            <div class="sDisplay"><h4 id="wdeclined">0</h4><span><?=$lang['declined']?></span></div>
                        </div>
                        <span class="line"></span>
                    </div>
                </div>
              <span class="changes" style="height:40px">
              		<span><?=$lang['Today']?></span>
                    <span class="<?=($withdrawals['today']=='0')?'zero':'positive'?>" id="wtoday">+0</span>
                </span>
            </div>
        
        	<!-- Stats item -->
            <div class="sItem usersStats">
              <h2 style="padding-bottom:0px"><a title="<?=$lang['Total']?> <?=$lang['users']?>" class="value"><ul><li id="utotal">0</li></ul><span><?=$lang['users']?></span></a></h2>
                <div class="statsDetailed" id="s3">
                    <div class="statsContent">
                        <div class="sElements">
                            <div class="sDisplay"><h4 id="uapproved">0</h4><span><?=$lang['approved']?></span></div>
                            <div class="sDisplay"><h4 id="upending">0</h4><span><?=$lang['pending']?></span></div>
                            <div class="sDisplay"><h4 id="udeclined">0</h4><span><?=$lang['declined']?></span></div>
                        </div>
                        <span class="line"></span>
                    </div>
                </div>
              <span class="changes" style="height:40px">
              		<span><?=$lang['Today']?></span>
               		<span class="<?=($users['today']=='0')?'zero':'positive'?>" id="utoday">+0</span>
                </span>
            </div>
  </div>
  <?php if (stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){ ?>
  <div style="width:100%;text-align:center">
    	<span style="color:red">Because this website is for presentation purposes only, all records including gameplays data, financial data and usernames will reset or be deleted in <span style="color:blue;font-weight:bold"><?=(15-date('j')%15)?></span> days, in order to decrease server usage.</span>
  </div>
  <?php }?>
    
    <div class="line"></div>
    
    <!-- Main content wrapper -->
    <div class="contentbox" >
    	<div id="show" style="text-align:center">
			<script type="text/javascript">
            	show('earnings');
            </script> 
        </div>
    </div>
    <div class="line"></div>
    <!-- Footer line -->
    <div id="footer">
    <?php if (stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){?>
    <div class="wrapper">&copy; Copyright <?=date('Y')?> zcino - Administrator Panel. All rights reserved.</div>
    <?php }else{?>
    <div class="wrapper">&copy; Copyright <?=date('Y')?> <?=$sitename?> - Administrator Panel. All rights reserved.</div>
    <?php }?>
        
    </div>

</span></div><span>

<div class="clear"></div>

</span></body>
</html>