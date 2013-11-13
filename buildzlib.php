#!/usr/bin/php
<?php

$target = 'local';


chdir(dirname(__FILE__));
echo "building Zotero www\n";
echo getcwd() . "\n";
//setup defaults and parse arguments
if(in_array('staging', $argv)){
    echo "building for staging\n";
    $target = 'staging';
}
elseif(in_array('local', $argv)){
    echo "building for local\n";
    $target = 'local';
}
elseif(in_array('production', $argv)){
    echo "building for production\n";
    $target = 'production';
}

//replace strings for production in zoteroLibrary.js
$replaceStrings = array();
if($target == 'production'){
    $replaceStrings = array(
        "baseApiUrl: 'https://staging.zotero.net/api'" => "baseApiUrl: 'https://www.zotero.org/api'",
        "baseWebsiteUrl: 'http://test.zotero.net'" => "baseWebsiteUrl: 'http://www.zotero.org'",
        "proxy: true" => "proxy: false",
        "debug_level: 3" => "debug_level: 1", 
        "debug_log: true" => "debug_log: false"
    );
}
elseif($target == 'staging'){
    $replaceStrings = array(
        "baseWebsiteUrl: 'http://test.zotero.net'" => "baseWebsiteUrl: 'http://staging.zotero.net'"
    );
}
elseif($target == 'local'){
    $replaceStrings = array(
        "baseApiUrl: 'https://api.zotero.org'" => "baseApiUrl: 'https://apidev.zotero.org'",
        "baseWebsiteUrl: 'http://zotero.org'" => "baseWebsiteUrl: 'http://test.zotero.net'",
        "baseWebsiteUrl: 'https://zotero.org'" => "baseWebsiteUrl: 'https://test.zotero.net'",
        "baseFeedUrl: 'https://api.zotero.org'" => "baseFeedUrl: 'https://apidev.zotero.org'",
        "const ZOTERO_URI = 'https://api.zotero.org';" => "const ZOTERO_URI = 'https://apidev.zotero.org';",
        "const ZOTERO_WWW_API_URI = 'http://www.zotero.org/api';" => "const ZOTERO_WWW_API_URI = 'http://test.zotero.net/api';"
    );
}

//js path assuming execution from /config
$jsRelPath = './static/js/';
//concatenate php files into a single file to include
//list of files to include
$files = array(
//"zoteroCommon.js",
"_zoterowwwInit.js",
//"_zoteroLibraryAjax.js",
"_zoteroNav.js",
//"zoteroPages.js",
//"zoteroLibrary.js",
//"_zoteroLibraryCache.js",
"_zoteroLibraryCallbacks.js",
"libraryUi/eventful.js",
"libraryUi/bind.js",
"libraryUi/clickcallbacks.js",
"libraryUi/compat.js",
"libraryUi/format.js",
"libraryUi/init.js",
"libraryUi/misc.js",
"libraryUi/readstate.js",
"libraryUi/render.js",
"libraryUi/updatestate.js",
"libraryUi/bootstrapdialogs.js",
"libraryUi/widgets/addtocollectiondialog.js",
"libraryUi/widgets/breadcrumbs.js",
"libraryUi/widgets/chooselibrarydialog.js",
"libraryUi/widgets/citeitemdialog.js",
"libraryUi/widgets/collections.js",
"libraryUi/widgets/controlpanel.js",
"libraryUi/widgets/createcollectiondialog.js",
"libraryUi/widgets/deletecollectiondialog.js",
"libraryUi/widgets/exportitemsdialog.js",
"libraryUi/widgets/feedlink.js",
"libraryUi/widgets/group.js",
"libraryUi/widgets/item.js",
"libraryUi/widgets/items.js",
"libraryUi/widgets/itemContainer.js",
"libraryUi/widgets/librarysettingsdialog.js",
"libraryUi/widgets/newitem.js",
"libraryUi/widgets/synceditems.js",
"libraryUi/widgets/tags.js",
"libraryUi/widgets/updatecollectiondialog.js",
"libraryUi/widgets/uploaddialog.js",

//"_zoteroLibraryUi.js",
//"_zoteroLibraryUiInit.js",
//"_zoteroLibraryUiCallbacks.js",
"_zoteroLibraryUrl.js",
"_zoteroLibraryOffline.js"
);

$fullText = "";

foreach($files as $file){
    $ftext = file_get_contents($jsRelPath . $file);
    if($file == "zoteroCommon.js"){
        foreach($replaceStrings as $from=>$to){
            $ftext = str_replace($from, $to, $ftext);
        }
    }
    $fullText .= "\n\n";
    $fullText .= $ftext;
}

file_put_contents($jsRelPath . '_zoterowwwAll.js', $fullText);


//replace strings in libZotero.php for zotero www
$lzSinglePath = './library/libZotero/libZoteroSingle.php';
$lzText = file_get_contents($lzSinglePath);
foreach($replaceStrings as $from=>$to){
    $lzText = str_replace($from, $to, $lzText);
}
file_put_contents($lzSinglePath, $lzText);


//replace strings in libZotero JS for zotero www
$lzSinglePath = './library/libZotero/libZoteroSingle.js';
$lzText = file_get_contents($lzSinglePath);
foreach($replaceStrings as $from=>$to){
    $lzText = str_replace($from, $to, $lzText);
}
file_put_contents($lzSinglePath, $lzText);


//prepend libZotero JS to the rest of zotero www JS
$allFullText = $lzText . "\n\n" . $fullText;
file_put_contents($jsRelPath . '_zoterowwwAll.js', $allFullText);

//make beautiful uglified versions of JS
//shell_exec("uglifyjs -b -o ../public/static/library/libZotero/libZoteroSingle.bugly.js ../public/static/library/libZotero/libZoteroSingle.js");
shell_exec("uglifyjs -b -nm -ns -o {$jsRelPath}_zoterowwwAll.bugly.js {$jsRelPath}_zoterowwwAll.js");

//rewrite manifest file with random string in comment so it registers as modified
//date_default_timezone_set('EST');
//$manifestPath = '../public/static/manifest/mylibrary.appcache';
//$manifestcontent = file_get_contents($manifestPath);
//$manifestcontent = preg_replace('/# randstring: .*/', '# randstring: ' . date('Y-m-d G:i:s'), $manifestcontent);
//file_put_contents($manifestPath, $manifestcontent);

?>