<?php
/* Decide whether to use the mobile or full site layout
 * Ideally they would be the same responsive layout, probably without jqm
 * because it causes certain bugs that are hard to work around in a web app
 * with separate navigation/history management.
 * For now, we check for "mobile" in user agent string as google suggests
 * special casing a few common substrings (excluding ipad from mobile is most important)
 * and allow a cookie to be set to override the detected mode
 */
//default to normal site
$mobile = false;
//check for override in url
if(isset($_GET['mobile_site'])){
    if($_GET['mobile_site'] == '1'){
        $mobile = true;
    }
    elseif($_GET['mobile_site'] == '0'){
        $mobile = false;
    }
    //set override cookie when mobile_site is specified in url
    setcookie("mobile_site", $mobile);
}
elseif(isset($_COOKIE['mobile_site'])) {
    $mobile = $_COOKIE['mobile_site'];
}
else {
    //auto-detect
    if(isset($_SERVER['HTTP_USER_AGENT'])){
        $uagent = $_SERVER['HTTP_USER_AGENT'];
    }

    if(isset($uagent) && 
         (stripos($uagent, 'ipad') === false ) &&
         ((stripos($uagent, 'mobile') !== false) || 
            (stripos($uagent, 'fennec')) ||
            (stripos($uagent, 'opera', 1) &&
             (stripos($uagent, 'mobi') ||
              stripos($uagent, 'mini')) ) ) ) {
        $mobile = true;
    }
}

//buffer output from either full or mobile layout, then send response
if($mobile === true){
    include 'mobile_library.php';
}
else {
    include 'library.php';
}
