<?php
include('includes/config.inc.php');
$id = antisqli($_GET['game']);
$result = mysqli_result(mysqli_query($GLOBALS['con'],"SELECT `rules` FROM `cws_games` WHERE `id`='$id'"),0) or die(mysqli_error($GLOBALS['con']));
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Casino</title>
</head>
<body>

<?php echo '<div style="color:black;height:300px;width:800px;overflow:scroll">'.$result.'</div>';?>

</body>
</html>