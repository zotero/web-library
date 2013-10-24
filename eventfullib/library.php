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
        
        <link rel="shortcut icon" type="image/png" sizes="16x16" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_16.png" />
        <link rel="shortcut icon" type="image/png" sizes="48x48" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        <link rel="apple-touch-icon-precomposed" type="image/png" href="<?=$staticPath?>/images/theme/zotero_theme/zotero_48.png" />
        
        <!-- css -->
        <link rel=stylesheet href="<?=$staticPath?>/bootstrap/css/bootstrap.min.css">
        <link rel=stylesheet href="<?=$staticPath?>/bootstrap/css/bootstrap-responsive.min.css">
        <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/jquery/jquery-all.js"></script>
        <script src="<?=$staticPath?>/bootstrap/js/bootstrap.min.js"></script>
        
        <link rel="stylesheet" href="<?=$staticPath?>/css/theme_style3.css" 
            type="text/css" media="screen" charset="utf-8"/>
        <!--<link rel="stylesheet" href="<?=$staticPath?>/css/library_style.css" 
            type="text/css" media="screen" charset="utf-8"/>
        -->
        <!--
        <link rel="stylesheet" href="<?=$staticPath?>/css/bootstrap_specific.css" 
            type="text/css" media="screen" charset="utf-8"/>
        -->
        <link rel="stylesheet" href="<?=$staticPath?>/css/bootstrap_library_style.css" 
            type="text/css" media="screen" charset="utf-8"/>
        
        <!--
        <link rel="stylesheet" href="<?=$staticPath?>/css/jquery-ui-1.10.1.custom.css"
            type="text/css" media="screen" charset="utf-8"/>
        <link rel="stylesheet" href="<?=$staticPath?>/css/jquery-ui-overrides.css"
            type="text/css" media="screen" charset="utf-8"/>
        -->
        <link rel="stylesheet" href="<?=$staticPath?>/css/zotero_icons_sprite.css"
            type="text/css" media="screen" charset="utf-8"/>
        <script src="<?=$staticPath?>/library/modernizr/modernizr-1.7.min.js"></script>
        
        <style type="text/css">
            .btn-toolbar {
                margin-top:3px;
                margin-bottom:3px;
            }
        </style>
    </head>
    <!-- library class on body necessary for zotero www init -->
    <body class="library">
        <!--Libraries to initialize for this page -->
        <?$libraryConfig = array('libraryID'=>$libraryID,
                                   'libraryType'=>$libraryType,
                                   'libraryUrlIdentifier'=>$librarySlug,
                                   'libraryLabel'=>$displayName,
                                   'libraryString'=>$libraryString
                                   );
                                   ?>
        <span class="zotero-library"
            data-loadconfig='<?=json_encode($libraryConfig)?>'>
        </span>
        <!-- Header -->
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div id="control-panel" class='container-fluid eventfulwidget'
                    data-widget='controlPanel'
                    data-function='controlPanel'
                    data-loadconfig='<?=json_encode($libraryConfig)?>'>
                    <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="brand" href="#">Zotero</a>
                    <div class="nav-collapse collapse">
                        <div class="btn-toolbar pull-left">
                            <div class="btn-group create-item-dropdown eventfulwidget"
                                    data-function="createItemDropdown">
                                <button class="create-item-button btn dropdown-toggle eventfultrigger" data-toggle="dropdown" data-library='<?=$libraryString?>' data-triggers="createItem" title="New Item"><i class="icon-item-add"></i></button>
                                <ul class="dropdown-menu" role="menu" style="max-height:300px; overflow:auto;">
                                    <!-- dropdown menu links -->
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="artwork">Artwork</a></li>
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="attachment">Attachment</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="audioRecording">Audio Recording</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="bill">Bill</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="blogPost">Blog Post</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="book">Book</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="bookSection">Book Section</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="case">Case</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="computerProgram">Computer Program</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="conferencePaper">Conference Paper</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="dictionaryEntry">Dictionary Entry</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="document">Document</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="email">E-mail</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="encyclopediaArticle">Encyclopedia Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="film">Film</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="forumPost">Forum Post</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="hearing">Hearing</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="instantMessage">Instant Message</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="interview">Interview</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="journalArticle">Journal Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="letter">Letter</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="magazineArticle">Magazine Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="manuscript">Manuscript</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="map">Map</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="newspaperArticle">Newspaper Article</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="note">Note</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="patent">Patent</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="podcast">Podcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="presentation">Presentation</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="radioBroadcast">Radio Broadcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="report">Report</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="statute">Statute</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="thesis">Thesis</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="tvBroadcast">TV Broadcast</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="videoRecording">Video Recording</a></li>          
                                    <li><a href="#" class="eventfultrigger" data-triggers="newItem" data-itemtype="webpage">Web Page</a></li>      
                                </ul>
                            </div>
                            <div class="btn-group">
                                <button class="btn eventfultrigger add-to-collection-button" data-library='<?=$libraryString?>' data-triggers="addToCollection" title="Add to Collection"><i class="icon-folder_add_to"></i></button>
                                <button class="remove-from-collection-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="removeFromCollection" title="Remove from Collection"><i class="icon-folder_remove_from"></i></button>
                                <button class="move-to-trash-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="moveToTrash" title="Move to Trash"><i class="icon-trash"></i></button>
                                <button class="remove-from-trash-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="removeFromTrash" title="Remove from Trash"><i class="icon-trash_remove"></i></button>
                            </div>
                            <div class="btn-group">
                                <button type="button" class="toggle-edit-button btn eventfultrigger" data-library='<?=$libraryString?>' data-toggle="button" data-triggers="toggleEdit" title="Edit"><i class="icon-page_edit"></i></button>
                            </div>
                        </div>
                        <form action="/search/" class="navbar-search pull-right zform zsearch" id="library-search">
                            <input type="text" name="q" size="20" id="header-search-query" class="search-query" placeholder="Search Library"/>
                        </form>
                        <div class="btn-toolbar pull-right">
                            <div class="btn-group">
                                <button class="btn dropdown-toggle" data-toggle="dropdown" href="#">
                                    Settings
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <!-- dropdown menu links -->
                                    <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="librarySettings">Library Settings</a></li>
                                    <li><a href="#" class="cite-button eventfultrigger" data-library='<?=$libraryString?>' data-triggers="citeItems">Cite</a></li>
                                    <li><a href="#" class="export-button eventfultrigger" data-library='<?=$libraryString?>' data-triggers="exportItems">Export</a></li>
                                    <li class="divider"></li>
                                    <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="syncLibary">Sync</a></li>
                                </ul>
                            </div>
                        </div>
                    </div><!--/.nav-collapse -->
                </div>
            </div>
        </div>
        
        <div id="library">
            <!-- Output content -->
            <div class="left-drawer left-drawer-flex-container left-drawer-show" id="left-drawer">
                <div class="left-drawer-flex-content left-drawer-flex-item">
                    <div id="collection-list-div" class="collection-list eventfulwidget" 
                        data-widget="collections"
                        data-function='syncCollections'
                        data-loadconfig='<?=json_encode($libraryConfig);?>'
                        >
                        <div id="collection-edit-div" class="collection-edit-div">
                            <span class="ui-button sprite-placeholder"></span>
                            <div id="edit-collections-buttons-div" class="edit-collections-buttons-div left">
                                <div class="btn-group">
                                    <button class="create-collection-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="createCollection" title="New Collection"><i class="icon-toolbar-collection-add"></i></button>
                                    <button class="update-collection-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="updateCollection" title="Change Collection"><i class="icon-toolbar-collection-edit"></i></button>
                                    <button class="delete-collection-button btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="deleteCollection" title="Delete Collection"><i class="icon-toolbar-collection-delete"></i></button>
                                </div>
                            </div>
                            <div id="create-collection-dialog" class="eventfulwidget" data-widget="createCollectionDialog" title="Create Collection">
                            </div>
                            <div id="update-collection-dialog" class="eventfulwidget" data-widget="updateCollectionDialog" title="Edit Collection">
                            </div>
                            <div id="delete-collection-dialog" class="eventfulwidget" data-widget="deleteCollectionDialog" title="Delete Collection">
                            </div>
                            <div id="add-to-collection-dialog" class="eventfulwidget" data-widget="addToCollectionDialog" title="Add to Collection" role="dialog">
                            </div>
                            <div id="cite-item-dialog" class="eventfulwidget" data-widget="citeItemDialog" title="Cite Items">
                            </div>
                            <div id="upload-dialog" class="eventfulwidget" data-widget="uploadDialog" title="Upload Attachment">
                            </div>
                            <div id="export-dialog" class="eventfulwidget" data-widget="exportItemsDialog" title="Export" title="Export">
                                <div class="export-formats-div" style="display:none;">
                                  <div class="export-list">
                                  </div>
                                </div>
                            </div>
                            <div id="library-settings-dialog" class="eventfulwidget" data-widget="librarysettingsdialog" title="Library Settings" title="Library Settings">
                            </div>
                        </div>
                        <div id="collection-list-container" class="collection-list-container">
                        </div>
                    </div><!-- collection list div -->
                    
                    <!-- tags browser section -->
                    <h3 id="tags-list-label">Tags</h3>
                    <div id="tags-list-div" class="tags-list-div eventfulwidget" 
                        data-widget="tags"
                        data-prefunction="showSpinnerSection"
                        data-function="syncTags"
                        data-loadconfig='<?=json_encode($libraryConfig);?>'
                        >
                          <input type="text" id="tag-filter-input" class="tag-filter-input" placeholder="Filter Tags" />
                          <div id="tag-lists-container" class="tag-lists-container">
                            <ul id="selected-tags-list" class="selected-tags-list">
                            </ul>
                            <ul id="tags-list" class="tags-list">
                            </ul>
                            <div class="loading"></div>
                          </div>
                          <div id="more-tags-links" class="more-tags-links">
                            <button class="btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="showMoreTags" id='show-more-tags-link' >More</a>
                            <button class="btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="showFewerTags" id='show-fewer-tags-link'>Fewer</a>
                            <button class="btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="tagsDirty" id='refresh-tags-link'>Refresh</a>
                          </div>
                    </div>
                    <!-- Library Links -->
                    <div id="feed-link-div" class="feed-link-div eventfulwidget" 
                        data-widget="feedlink"
                        data-function="loadFeedLink"
                        data-loadconfig='<?=json_encode($libraryConfig);?>'>
                        <a href="" type="application/atom+xml" rel="alternate" class="feed-link"><span class="sprite-icon sprite-feed"></span>Subscribe to this feed</a><br />
                    </div>
                </div><!-- /left-drawer-flex-content left-drawer-flex-item -->
                <div id="left-drawer-flex-grabber" class="left-drawer-flex-grabber left-drawer-flex-item">
                    
                </div>
            </div>
            
            
            <div id="library-panel" class="left-drawer-shown">
                <!-- hidden area for possible JS messages -->
                <div id="js-message">
                    <ul id="js-message-list">
                    </ul>
                </div>
                <div id="items-pane" class="items-pane eventfulwidget">
                    <div id="library-items-div" class="library-items-div eventfulwidget"
                        data-widget="items"
                        data-function="loadItems"
                        data-loadconfig='<?=json_encode($libraryConfig);?>'
                        >
                    </div> <!--library items div -->
                    <div id="item-details-div" class="item-details-div eventfulwidget"
                        data-widget="item"
                        data-function="loadItem"
                        data-loadconfig='<?=json_encode($libraryConfig)?>'
                        >
                    </div>
                    <div class="new-item-widget eventfulwidget"
                        data-widget="newItem"
                        data-loadconfig='<?=json_encode($libraryConfig)?>'
                        >
                    </div>

                </div> <!-- items pane -->
            </div>
            
            <?$locales = array('en');// array_keys(Zend_Locale::getOrder());?>
            <script type="text/javascript" charset="utf-8">
                var zoterojsClass = "user_library";
                var zoteroData = {itemsPathString: "<?=$itemsPathString?>",
                                  libraryUserID: "<?=$libraryID?>",
                                  libraryPublish: 1,
                                  locale: "<?=$locales[0]?>",
                                  allowEdit: <?=$allowEdit?>,
                                  javascriptEnabled: 1,
                                  library_showAllTags: 1
                                  };
                var zoterojsSearchContext = "library";
            </script>
            <?include '../jquerytemplatesbootstrap/tagrow.jqt';?>
            <?include '../jquerytemplatesbootstrap/tagslist.jqt';?>
            <?include '../jquerytemplatesbootstrap/collectionlist.jqt';?>
            <?include '../jquerytemplatesbootstrap/collectionrow.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemrow.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemstable.jqt';?>
            <?include '../jquerytemplatesbootstrap/itempagination.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemdetails.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemnotedetails.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemform.jqt';?>
            <?include '../jquerytemplatesbootstrap/citeitemdialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/attachmentform.jqt';?>
            <?include '../jquerytemplatesbootstrap/attachmentupload.jqt';?>
            <?include '../jquerytemplatesbootstrap/datafield.jqt';?>
            <?include '../jquerytemplatesbootstrap/editnoteform.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemtag.jqt';?>
            <?include '../jquerytemplatesbootstrap/itemtypeselect.jqt';?>
            <?include '../jquerytemplatesbootstrap/authorelementssingle.jqt';?>
            <?include '../jquerytemplatesbootstrap/authorelementsdouble.jqt';?>
            <?include '../jquerytemplatesbootstrap/childitems.jqt';?>
            <?include '../jquerytemplatesbootstrap/editcollectionbuttons.jqt';?>
            <?include '../jquerytemplatesbootstrap/choosecollectionform.jqt';?>
            <?include '../jquerytemplatesbootstrap/breadcrumbs.jqt';?>
            <?include '../jquerytemplatesbootstrap/breadcrumbstitle.jqt';?>
            <?include '../jquerytemplatesbootstrap/newcollectiondialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/updatecollectiondialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/deletecollectiondialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/exportitemsdialog.jqt';?>
            <?include '../jquerytemplatesbootstrap/tagunorderedlist.jqt';?>
            <?include '../jquerytemplatesbootstrap/librarysettingsdialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/addtocollectiondialogbootstrap.jqt';?>
            <?include '../jquerytemplatesbootstrap/exportformats.jqt';?>
            <?include '../jquerytemplatesbootstrap/newitemdropdown.jqt';?>
            
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
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/_zoterowwwAll.bugly.js"></script>
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/libraryUi/bootstrapdialogs.js"></script>
            <script type="text/javascript" charset="utf-8">
                J("#left-drawer").css("height", J(window).height() - 50);
                J(".left-drawer-flex-content").css("height", J("#left-drawer").height());
                J("#library-panel").css("height", J(window).height() - 50);
                J(".item-pane-flex-container").css("height", J(window).height() - 55);
                
                J(window).resize(function(){
                    J("#left-drawer").css("height", J(window).height() - 50);
                    J(".left-drawer-flex-content").css("height", J("#left-drawer").height());
                    J(".item-pane-flex-container").css("height", J(window).height() - 55);
                    J("#library-panel").css("height", J(window).height() - 50);
                });
                
                J("#left-drawer-flex-grabber").on('click', function(e){
                    J("#left-drawer").toggleClass('left-drawer-show').toggleClass('left-drawer-hide');
                    J("#library-panel").toggleClass('left-drawer-shown');
                });
                
            </script>
            <script type="text/javascript" charset="utf-8">
                Zotero.prefs.server_javascript_enabled = true;
                Zotero.prefs.debug_level = 1;
                
                Zotero.config = <?include "zoteroconfig.js";?>
            </script>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/tinymce3.5.5/tiny_mce/tiny_mce.js"></script>
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/ckeditor/ckeditor.js"></script>
            <span id="eventful"></span>
        </div><!--/content -->
    </body>
</html>
