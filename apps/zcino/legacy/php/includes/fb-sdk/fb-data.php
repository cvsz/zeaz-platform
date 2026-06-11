<?php

// Create our Application instance from environment variables.
// IMPORTANT: The previous Facebook app secret (15ff13f3ec4b6c5ebfedca7db677ba18)
// was committed in source — rotate it immediately and set FACEBOOK_APP_SECRET in your env.
$facebook = new Facebook(array(
  'appId'  => getenv('FACEBOOK_APP_ID') ?: '',
  'secret' => getenv('FACEBOOK_APP_SECRET') ?: '',
));

?>