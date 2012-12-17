<?php
require_once './config.php'; //library credentials

require_once './library/libZotero/libZoteroSingle.php';
$library = new Zotero_Library($libraryType, $libraryID, $librarySlug, $apiKey);
$library->setCacheTtl(0);

$itemKey = $_GET["itemkey"];

$item = $library->fetchItem($itemKey);
if($item === false){
    $lastResponse = $library->getLastResponse();
    http_response_code($lastResponse->getStatus());
    echo "Item Not Found";
    return;
}

if($item->attachmentIsSnapshot()){
    $library->setFollow(false);
    $fileSnapshotLink = $library->apiRequestUrl(array('target'=>'item', 'targetModifier'=>'fileview', 'itemKey'=>$itemKey)) . '?key=' . $apiKey;
    
    $itemDownloadResponse = $library->_request($fileSnapshotLink);
    $library->setFollow(true);
    
    if(($itemDownloadResponse instanceof libZotero_Http_Response) && ($itemDownloadResponse->getStatus() == 302)){
        $responseHeaders = $itemDownloadResponse->getHeaders();
        $framesrc = $responseHeaders['Location'];
    }
    else{
        http_response_code(404);
        return;
    }
}
elseif($item->hasFile()) {
    $library->setFollow(false);
    $itemDownloadUrl = $library->apiRequestUrl(array('target'=>'item', 'targetModifier'=>'file', 'itemKey'=>$itemKey)) . '?key=' . $apiKey;
    $itemDownloadResponse = $library->_request($itemDownloadUrl);
    
    if(($itemDownloadResponse instanceof libZotero_Http_Response) && ($itemDownloadResponse->getStatus() == 302)){
        $responseHeaders = $itemDownloadResponse->getHeaders();
        header('Location: ' . $responseHeaders['Location']);
        http_response_code($itemDownloadResponse->getStatus());
        return;
    }
    else{
        http_response_code(404);
        return;
    }
}

?>
<!DOCTYPE html>
<html lang="en" class="no-js" style="height:100%; margin:0; padding:0;"> 
    <head>
        <title>Zotero Snapshot</title>
         <style type="text/css">
            #zoterosnapshot-header {
                min-height: 25px;
                background-color: rgba(0, 0, 0, .1);
                box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                -webkit-box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                -moz-box-shadow: 0 3px 3px rgba(0, 0, 0, .4);
                position: relative;
                font-family: "Lucida Grande", sans-serif;
                font-size: 1em;
                padding: 10px;
                line-height: 25px;
            }

            #zoterosnapshot-header a {
                text-decoration: none;
                color: #38C;
            }
         </style>
    </head>
    <body style="height:100%; margin:0; overflow:hidden">
        <div id="zoterosnapshot-header">
            <div id='leave-frame-div' style="float:right;">
                <a id="leave-frame-link" href='#'>Leave Frame</a>
            </div>
            <img src="/static/images/theme/zotero_theme/zotero-z-24px.png" style="float:left">
            <div style="text-align:center;">
            You are viewing a Zotero snapshot. 
            <a href="<?=$returnLibraryUrl;?>">Return to Zotero Library</a>
            </div>
        </div>
        <div id="frame-container" style="height:95%">
        <iframe id="zoterosnapshotframe" name="zoterosnapshotframe" width='100%' marginwidth="0" marginheight="0" frameborder="0" scrolling='auto' sandbox='' style="width:100%; height:100%; padding:0; margin:0;" src="<?=$framesrc;?>">
            Frame not available. <a href="<?=$framesrc;?>">View without frame.</a>
        </iframe>
        </div>
        
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-1.7-ui-1.8.15-custom.min.js"></script>
        <script type="text/javascript" charset="utf-8">
            jQuery(document).ready(function() {
                jQuery('#leave-frame-link').on('click', function(e){
                    window.location = jQuery('#zoterosnapshotframe').prop('src');
                });
                jQuery(window).resize(function(){
                    var newFrameHeight = jQuery(window).height() - jQuery('#zoterosnapshot-header').height();
                    jQuery('#frame-container').css('height', '' + newFrameHeight + 'px');
                });
                var newFrameHeight = jQuery(window).height() - jQuery('#zoterosnapshot-header').height();
                jQuery('#frame-container').css('height', '' + newFrameHeight + 'px');
            });
        </script>
    </body>
</html>