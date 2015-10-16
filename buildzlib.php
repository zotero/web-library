#!/usr/bin/php
<?php

chdir(dirname(__FILE__));

//build libZotero submodule
echo shell_exec("./library/libZotero/build/build.php");

echo "building Zotero www\n";
echo getcwd() . "\n";

echo "converting reactitems:";
echo shell_exec("babel ./static/js/libraryUi/widgets/reactsrc --out-file ./static/js/libraryUi/widgets/reactbuild/reactwidgets.js");

//js path assuming execution from /config
$jsRelPath = './static/js/';
//concatenate php files into a single file to include
//list of files to include
$files = array(
"_zoterowwwInit.js",
"State.js",
"Delay.js",
"libraryUi/eventful.js",
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
"libraryUi/widgets/createItemDialog.js",
"libraryUi/widgets/exportitemsdialog.js",
"libraryUi/widgets/feedlink.js",
"libraryUi/widgets/groups.js",
"libraryUi/widgets/groupsList.js",
"libraryUi/widgets/inviteToGroup.js",
"libraryUi/widgets/item.js",
"libraryUi/widgets/items.js",
"libraryUi/widgets/recentItems.js",
"libraryUi/widgets/itemContainer.js",
"libraryUi/widgets/itemChildren.js",
"libraryUi/widgets/librarysettingsdialog.js",
"libraryUi/widgets/newitem.js",
"libraryUi/widgets/synceditems.js",
"libraryUi/widgets/tags.js",
"libraryUi/widgets/updatecollectiondialog.js",
"libraryUi/widgets/uploaddialog.js",
"libraryUi/widgets/libraryPreloader.js",
"libraryUi/widgets/filterGuide.js",
"libraryUi/widgets/progressModal.js",
"libraryUi/widgets/sendToLibraryDialog.js",
"libraryUi/widgets/searchbox.js",
"libraryUi/widgets/panelContainer.js",
"libraryUi/widgets/chooseSortingDialog.js",
"libraryUi/widgets/imagePreview.js",
"libraryUi/widgets/imageGrabber.js",
"libraryUi/widgets/localItems.js",
"libraryUi/widgets/siteSearch.js",
//"libraryUi/widgets/orcidProfile.js",
"libraryUi/widgets/libraryDropdown.js",
"libraryUi/widgets/publications.js",
"libraryUi/widgets/reactbuild/reactwidgets.js",
//"libraryUi/widgets/shareToDocs.js",
"_zoteroLibraryUrl.js",
"zoteroPages.js",
);

$fullText = "";

foreach($files as $file){
    $ftext = file_get_contents($jsRelPath . $file);
    $fullText .= "\n\n" . $ftext;
}

file_put_contents($jsRelPath . '/compiled/_zoterowwwAll.js', $fullText);

//replace strings in libZotero JS for zotero www
$lzSinglePath = './library/libZotero/build/libZoteroSingle.js';
$lzText = file_get_contents($lzSinglePath);

//prepend libZotero JS to the rest of zotero www JS
$allFullText = $lzText . "\n\n" . $fullText;
file_put_contents($jsRelPath . '/compiled/_zoterowwwAll.js', $allFullText);

//make beautiful uglified versions of JS
//shell_exec("uglifyjs -b -o ../public/static/library/libZotero/libZoteroSingle.bugly.js ../public/static/library/libZotero/libZoteroSingle.js");
shell_exec("uglifyjs -b -nm -ns -o {$jsRelPath}/compiled/_zoterowwwAll.bugly.js {$jsRelPath}/compiled/_zoterowwwAll.js");

?>