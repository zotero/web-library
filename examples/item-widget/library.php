<!DOCTYPE html>
<?error_reporting(E_ALL | E_STRICT);
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
?>
<?include "config.php";?>
<?

$messages = array();
?>
<html lang="en" class="no-js">
    <head>
        <title>Zotero Library</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="keywords" content="Zotero, research, tool, firefox, extension"/>
        <meta name="description" content="Zotero is a powerful, easy-to-use research tool that 
                                          helps you gather, organize, and analyze sources and then 
                                          share the results of your research."/>
        
        <link rel="shortcut icon" type="image/png" sizes="48x48" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon-precomposed" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        
        <!-- css -->
        <link rel="stylesheet" media="screen" href="<?=$staticPath?>/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" media="screen" href="<?=$staticPath?>/bootstrap/css/bootstrap-theme.min.css">
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-all.js"></script>
        <script src="<?=$staticPath?>/bootstrap/js/bootstrap.min.js"></script>
        <script src="<?=$staticPath?>/library/typeahead/typeahead.js"></script>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/theme_style3.css" 
            type="text/css" media="screen" charset="utf-8"/>
        <link rel="stylesheet" href="<?=$staticPath?>/css/bootstrap_library_style.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/zotero_icons_sprite.css"
            type="text/css" media="screen" charset="utf-8"/>
        <script src="<?=$staticPath?>/library/modernizr/modernizr-1.7.min.js"></script>
    </head>
    <!-- library class on body necessary for zotero www init -->
    <body class="library" style="padding:0 15px;">
        <!--Libraries to initialize for this page -->
        <?$libraryConfig = array('libraryID'=>$libraryID,
                                   'libraryType'=>$libraryType,
                                   'libraryUrlIdentifier'=>$librarySlug,
                                   'libraryLabel'=>$displayName,
                                   'libraryString'=>$libraryString
                                   );
                                   ?>
        <span class="zotero-library eventfulwidget"
            data-library='<?=$libraryString?>'
            data-loadconfig='<?=json_encode($libraryConfig)?>'
            data-widget="libraryPreloader">
        </span>
        <div id="library" class="row">
            <!-- Output content -->
            <div class="col-md-3">
                
            </div><!-- /collections column -->
            
            
            <div id="library-panel" class="left-drawer-shown col-md-9">
                <div class="row">
                    <div class="col-12">
                        <!-- hidden area for possible JS messages -->
                        <div id="js-message">
                            <ul id="js-message-list">
                            </ul>
                        </div>
                    </div>
                </div>
                <div id="items-pane" class="items-pane eventfulwidget row"
                    data-widget="itemContainer"
                    data-library='<?=$libraryString?>'>
                    <div id="library-items-div" class="library-items-div eventfulwidget col-md-6"
                        >
                    </div> <!--library items div -->
                    <div id="item-details-div" class="item-details-div eventfulwidget col-md-6"
                        data-widget="item"
                        data-function="loadItem"
                        data-library='<?=$libraryString?>'>
                    </div>
                    <div class="new-item-widget eventfulwidget col-md-6"
                        >
                    </div>
                </div> <!-- items pane row -->
            </div><!-- /library-panel row -->
            
            <?$locales = array('en');// array_keys(Zend_Locale::getOrder());?>
            <script type="text/javascript" charset="utf-8">
                var zoterojsClass = "user_library";
                var zoteroData = {libraryPathString: "<?=$libraryPathString?>",
                                  libraryUserID: "<?=$libraryID?>",
                                  libraryPublish: 1,
                                  locale: "<?=$locales[0]?>",
                                  allowEdit: <?=$allowEdit?>,
                                  javascriptEnabled: 1,
                                  library_showAllTags: 1
                                  };
                var zoterojsSearchContext = "library";
            </script>
            <?include '../../jstemplates/tagrow.jqt';?>
            <?include '../../jstemplates/tagslist.jqt';?>
            <?include '../../jstemplates/collectionlist.jqt';?>
            <?include '../../jstemplates/collectionrow.jqt';?>
            <?include '../../jstemplates/itemrow.jqt';?>
            <?include '../../jstemplates/itemstable.jqt';?>
            <?include '../../jstemplates/itempagination.jqt';?>
            <?include '../../jstemplates/itemdetails.jqt';?>
            <?include '../../jstemplates/itemnotedetails.jqt';?>
            <?include '../../jstemplates/itemform.jqt';?>
            <?include '../../jstemplates/citeitemdialog.jqt';?>
            <?include '../../jstemplates/attachmentform.jqt';?>
            <?include '../../jstemplates/attachmentupload.jqt';?>
            <?include '../../jstemplates/datafield.jqt';?>
            <?include '../../jstemplates/editnoteform.jqt';?>
            <?include '../../jstemplates/itemtag.jqt';?>
            <?include '../../jstemplates/itemtypeselect.jqt';?>
            <?include '../../jstemplates/authorelementssingle.jqt';?>
            <?include '../../jstemplates/authorelementsdouble.jqt';?>
            <?include '../../jstemplates/childitems.jqt';?>
            <?include '../../jstemplates/editcollectionbuttons.jqt';?>
            <?include '../../jstemplates/choosecollectionform.jqt';?>
            <?include '../../jstemplates/breadcrumbs.jqt';?>
            <?include '../../jstemplates/breadcrumbstitle.jqt';?>
            <?include '../../jstemplates/createcollectiondialog.jqt';?>
            <?include '../../jstemplates/updatecollectiondialog.jqt';?>
            <?include '../../jstemplates/deletecollectiondialog.jqt';?>
            <?include '../../jstemplates/exportitemsdialog.jqt';?>
            <?include '../../jstemplates/tagunorderedlist.jqt';?>
            <?include '../../jstemplates/librarysettingsdialog.jqt';?>
            <?include '../../jstemplates/addtocollectiondialog.jqt';?>
            <?include '../../jstemplates/exportformats.jqt';?>
            <?include '../../jstemplates/newitemdropdown.jqt';?>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/globalize.js"></script>
            <?foreach($locales as $localeStr):?>
                <?if($localeStr != 'en'):?>
                <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/cultures/globalize.culture.<?=str_replace('_', '-', $localeStr)?>.js"></script>
                <?endif;?>
            <?endforeach;?>
            <script type="text/javascript" charset="utf-8">
                if(typeof zoteroData == 'undefined'){
                    var zoteroData = {};
                }
                var baseURL = "";
                var baseDomain = "";
                var staticPath = "<?=$staticPath?>";
            </script>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/compiled/_zoterowwwAll.bugly.js"></script>
            <script type="text/javascript" charset="utf-8">
                Zotero.config = <?include "zoteroconfig.js";?>
            </script>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/ckeditor/ckeditor.js"></script>
            <span id="eventful"></span>
            <script type="text/javascript" charset="utf-8">
            /*
                Zotero.ui.eventful.listen('selectCollection', function(e){
                    var collectionKey = e['collectionKey'];
                    alert("New collection selected: " + collectionKey);
                });
*/
            </script>
        </div><!--/library -->
    </body>
</html>
