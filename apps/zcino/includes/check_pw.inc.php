<?php
#developed by www.zcino
@require_once('config.inc.php');
if (!isset($_SESSION['username'])) { 
		echo '<script type="text/JavaScript">
    $(\'#loginDiv\').html(\'<p>&nbsp;</p><p>&nbsp;</p><p class="updated" style="color:red;text-align:center">'.$lang['You+are+not+logged+in'].'</p>\').fadeOut(3000, function() {
				$(\'#loginDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_login.php").fadeIn(\'slow\');
				$(\'#registerDiv\').html(\'<div style="text-align:left;padding:80px 150px 90px 190px"><img src="images/loader_acc.gif" height="45" width="45"/></div>\').load("do_register.php").fadeIn(\'slow\');
			});
</script>';
		exit;
	}
$pw = validateInput($_REQUEST['newpw1']);
function passStrength($password){
	global $lang;
	$password = urldecode($password);
	if ( strlen( $password ) == 0 )
    {
        return '<span style="color:red">'.$lang['Please+enter+a+password'].'</span>';
    }
	elseif (strlen($password) >34) { return '<span style="color:red">'.$lang['Password+is+too+long'].'</span>'; }
	elseif (strlen($password)<8) { return '<span style="color:red">'.$lang['Password+is+too+short'].'</span>'; }
	elseif(!check_pw($password)) { return '<span style="color:red">'.$lang['Invalid+characters'].'</span>'; }
	
    $strength = 0;
    /*** get the length of the password ***/
    $length = strlen($password);
    /*** check if password is not all lower case ***/
    if(strtolower($password) == $password)
    {
        $strength -= 10;
    }
	if(strtolower($password) !== $password && strtoupper($password) !== $password) 
    {
        $strength += 20;
    }
    /*** check if password is not all upper case ***/
    if(strtoupper($password) == $password)
    {
        $strength -= 10;
    }
    /*** check string length is 8 - 14 chars ***/
    if($length >= 8 && $length < 15)
    {
        $strength += 15;
    }

    /*** get the numbers in the password ***/
    preg_match_all('/[0-9]/', $password, $numbers);
    $strength += count($numbers[0]) *2;
	/*** get the UPPER CASE LETTERS in the password ***/
    preg_match_all('/[A-Z]/', $password, $numbers);
    $strength += count($numbers[0]) *2;

    /*** get the number of unique chars ***/
    $chars = str_split($password);
    $num_unique_chars = sizeof( array_unique($chars) );
    $strength += $num_unique_chars * 4;

    /*** strength is a number 1-10; ***/
	if ($strength > 100 ) {$strength = 100;}
	if ($strength < 0 ) {$strength = 0;}
	if ($strength >=0 && $strength < 30) { $color = 'red';}
		if ($strength >=30 && $strength < 50) { $color = '#F0F';}
			if ($strength >=50 && $strength < 70) { $color = '#09C';}
				if ($strength >70 && $strength < 90) { $color = 'green';}
    return $lang['Pass+strength'].': <span style="color:'.$color.'">'.$strength.'</span>%';
}
echo passStrength($pw);
?>