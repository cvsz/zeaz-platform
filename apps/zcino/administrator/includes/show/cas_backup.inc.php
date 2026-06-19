<?php
//this php file manages the database backup
//powered by zcino
require_once('../config.inc.php');
//check if the current logged in staff has enough permissions to perform the DB backup
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
<?php
if ($_POST['del']==1){
	@mysqli_query($GLOBALS['con'],"UPDATE cws_gameplays_logs SET player_hand=''");
	@mysqli_query($GLOBALS['con'],"UPDATE cws_race_logs SET race_string=''");
	
	echo 'Completed successfuly';
}
if ($_GET['bk']=='1'){ // if the staff confirmed the db backup, then serve him the file
	if ($demoMode==1){
		echo '<div class="nNote nFailure hideit">
            <p><strong>'.$lang['Restricted+access'].'</strong> : '.$lang['Insufficient+privileges'].'</p>
        </div>';
	}elseif($_SESSION['adminlvl']=='admin' && !stristr('www.zcino.zeaz.dev',$_SERVER['SERVER_NAME'])){
		mysqli_query($GLOBALS['con'],'SET NAMES utf8');
		mysqli_query($GLOBALS['con'],'SET CHARACTER SET utf8');
	   $tables = '*';
	  //get all of the tables
	  if($tables == '*')
	  {
		$tables = array();
		$result = mysqli_query($GLOBALS['con'],'SHOW TABLES') or error_report(mysqli_error($GLOBALS['con']));
		while($row = mysqli_fetch_row($result))
		{
		  $tables[] = $row[0];
		}
	  }
	  else
	  {
		$tables = is_array($tables) ? $tables : explode(',',$tables);
	  }
	  
	  //cycle through
	  foreach($tables as $table)
	  {
		$result = mysqli_query($GLOBALS['con'],'SELECT * FROM '.$table);
		$num_fields = mysqli_num_fields($result);
		
		$return.= 'DROP TABLE '.$table.';';
		$row2 = mysqli_fetch_row(mysqli_query($GLOBALS['con'],'SHOW CREATE TABLE '.$table));
		$return.= "\n\n".$row2[1].";\n\n";
		
		for ($i = 0; $i < $num_fields; $i++) 
		{
		  while($row = mysqli_fetch_row($result))
		  {
			$return.= 'INSERT INTO '.$table.' VALUES(';
			$columns = count($row);
			for($j=0; $j<$columns; $j++)
			{
			  $row[$j] = addslashes($row[$j]);
			  $row[$j] = @ereg_replace("\n","\\n",$row[$j]);
			  if (isset($row[$j])) { $return.= '"'.$row[$j].'"' ; } else { $return.= '""'; }
			  if ($j<($num_fields-1)) { $return.= ','; }
			}
			$return.= ");\n";
		  }
		}
		$return.="\n\n\n";
	  }
	  
	  //save file
	  $handle = fopen('db-backup-'.date("m-d-y").'.sql','w+');
	  fwrite($handle,$return);
	  fclose($handle);
	  function send_file($name) {
		 ob_end_clean();
		 $path = $name;
		 if (!is_file($path) or connection_status()!=0) return(FALSE);
		 header("Cache-Control: no-store, no-cache, must-revalidate");
		 header("Cache-Control: post-check=0, pre-check=0", false);
		 header("Pragma: no-cache");
		 header("Expires: ".gmdate("D, d M Y H:i:s", mktime(date("H")+2, date("i"), date("s"), date("m"), date("d"), date("Y")))." GMT");
		 header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
		 header("Content-Type: application/octet-stream");
		 header("Content-Length: ".(string)(filesize($path)));
		 header("Content-Disposition: inline; filename=$name");
		 header("Content-Transfer-Encoding: binary\n");
		 if ($file = fopen($path, 'rb')) {
			 while(!feof($file) and (connection_status()==0)) {
				 print(fread($file, 1024*8));
				 flush();
			 }
			 fclose($file);
		 } 
		 return((connection_status()==0) and !connection_aborted());
	 }
	 
		if(!send_file("db-backup.sql")) {
			 die ($lang['File+transfer+failed']);
		 } else {
			 //Log the download
			 unlink('db-backup.sql');
		 }
	}
}else{
	?>
<div id="linkheader"><?=ucfirst($lang[str_replace(' ','+',$page_cat)])?><span style="color:#000">&gt;&gt;&gt;</span> <?php if ($page_menu=='1'){echo '<a href="#" onclick="showparam(\''.str_replace('.inc.php','',$page_sname).'\')">'.ucfirst($lang[str_replace(' ','+',$page_name)]).'</a>';}else{ echo $page_name;}?></div><br /><br /><br /><br /><br /> 
	<?=$lang['Backup+MySql+Database+and+save+the+file+to+your+PC']?> !
	<br /><br /><br />
    STEP1: <a style="margin: 5px;" class="button dblueB" title="<?=$lang['Backup']?> <?=$lang['NOW']?> !" href="#" onclick="backup()"><span><?=$lang['Backup']?> <?=$lang['NOW']?> !</span></a>
    <br /><br />
    
    STEP2: (<?=$lang['not+required']?>)<a style="margin: 5px;" class="button dblueB" title="Delete player data!" href="#" onclick="backup_maint()"><span><?=$lang['Delete+player+hand+data']?>!</span></a>
    
<?php }?>
<script type="text/javascript">
function backup() {
	if (confirm("<?=$lang['Are+you+sure+you+want+to+backup+your+database']?> ?")) {
				 mywindow = window.open("includes/show/cas_backup.inc.php?bk=1", "<?=$lang['Download+backup']?>", "location=1,status=1,scrollbars=1,  width=500,height=500");
	}
};


function backup_maint() {
	if (confirm("<?=$lang['This+action+will+keep+win+bet+profit+statistics+and+gameplay+ID+data']?>, <?=$lang['but+will+delete+the+details+that+show+what+cards+or+what+symbols+the+player+has+drawn']?>!")) {
		showparam('cas_backup','del=1');
	}
};
</script>