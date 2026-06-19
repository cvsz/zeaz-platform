<?php
@session_start();
define('BASE_PATH',$_SERVER['DOCUMENT_ROOT']);
require_once(BASE_PATH.'/includes/fb-sdk/facebook.php');
require_once(BASE_PATH.'/includes/functions.inc.php');
require_once(BASE_PATH.'/includes/fb-sdk/fb-data.php');

// Get User ID
$user = $facebook->getUser();
$location = "". $facebook->getLoginUrl(array('scope' => 'publish_stream, email'));
// We may or may not have this data based on whether the user is logged in.
//
// If we have a $user id here, it means we know the user is logged into
// Facebook, but we don't know if the access token is valid. An access
// token is invalid if the user logged out of Facebook.

// get user UID
$user = $facebook->getUser();

    // get the url where to redirect the user
$location = "". $facebook->getLoginUrl(array('scope' => 'email'));

// check if we have valid user
if ($user) {
    try {
        // Proceed knowing you have a logged in user who's authenticated.
        $user_profile = $facebook->api('/me');   

    } catch (FacebookApiException $e) {
        $user = NULL;
        // seems we don't have enough permissions
        // we use javascript to redirect user instead of header() due to Facebook bug
        print '<script language="javascript" type="text/javascript"> top.location.href="'. $location .'"; </script>';

        // kill the code so nothing else will happen before user gives us permissions
        die();
    }

} else {
    // seems our user hasn't logged in, redirect him to a FB login page
	if(isset($_SESSION['signed_request'])) {
   		print '<script language="javascript" type="text/javascript"> top.location.href="'. $location .'"; </script>';
		// kill the code so nothing else will happen before user gives us permissions
    	die();
	}
    
}

// at this point we have an logged in user who has given permissions to our APP


// Login or logout url will be needed depending on current user state.
if ($user) {
  $logoutUrl = $facebook->getLogoutUrl();
} else {
	$loginUrl = $facebook->getLoginUrl();
}

// This call will always work since we are fetching public data.
$naitik = $facebook->api('/naitik');
if (!isset($_REQUEST['load'])){
   echo '<script type="text/javascript">window.location=\''.get_protocol().$_SERVER['SERVER_NAME'].'\'</script>';
   exit;
}
?>

<?php if ($user) { ?>
    <a href="<?=$logoutUrl?>">
      <img src="<?=get_protocol().$_SERVER['SERVER_NAME']?>/includes//fb-sdk/Facebook-Logout.gif" border="0">
    </a>
<?php } else{ 
    
?>
    <a href="<?=$loginUrl?>">
      <img src="<?=get_protocol().$_SERVER['SERVER_NAME']?>/includes/fb-sdk/Facebook-Login.gif" border="0">
    </a>
<?php } ?>