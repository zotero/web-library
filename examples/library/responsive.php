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
        <link rel="stylesheet" media="screen" href="<?=$staticPath?>/bootstrap/css/custom-bootstrap.min.css">
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
        <span class="zotero-library"
              data-library='<?=$libraryString?>'
              data-loadconfig='<?=json_encode($libraryConfig)?>'
              data-widget="libraryPreloader">
        </span>
        <!-- Header -->
        <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
            <!--
            <div class="navbar-header">
                <a class="navbar-brand" href="#">Zotero</a>
            </div>
            -->
            <div class="eventfulwidget" id="control-panel"
                    data-widget='controlPanel' data-library='<?=$libraryString?>'>
                <div class="btn-toolbar pull-left">
                    <div class="btn-group">
                        <button class="btn btn-default navbar-btn dropdown-toggle" data-toggle="dropdown" href="#" title="Settings">
                            <span class="glyphicon glyphicon-cog"></span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <!-- dropdown menu links -->
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="librarySettingsDialog">Library Settings</a></li>
                            <li><a href="#" class="cite-button eventfultrigger" data-library='<?=$libraryString?>' data-triggers="citeItems">Cite</a></li>
                            <li><a href="#" class="export-button eventfultrigger" data-library='<?=$libraryString?>' data-triggers="exportItemsDialog">Export</a></li>
                            <li class="divider"></li>
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="syncLibary">Sync</a></li>
                        </ul>
                    </div>
                    
                    <div class="btn-group create-item-dropdown">
                        <button type="button" class="create-item-button btn btn-default navbar-btn dropdown-toggle eventfultrigger" data-toggle="dropdown" data-library='<?=$libraryString?>' data-triggers="createItem" title="New Item"><span class="icon-item-add glyphicon"></span></button>
                        <ul class="dropdown-menu" role="menu" style="max-height:300px; overflow:auto;">
                            <!-- dropdown menu links -->
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="artwork">Artwork</a></li>
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="attachment">Attachment</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="audioRecording">Audio Recording</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="bill">Bill</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="blogPost">Blog Post</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="book">Book</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="bookSection">Book Section</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="case">Case</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="computerProgram">Computer Program</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="conferencePaper">Conference Paper</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="dictionaryEntry">Dictionary Entry</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="document">Document</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="email">E-mail</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="encyclopediaArticle">Encyclopedia Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="film">Film</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="forumPost">Forum Post</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="hearing">Hearing</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="instantMessage">Instant Message</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="interview">Interview</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="journalArticle">Journal Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="letter">Letter</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="magazineArticle">Magazine Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="manuscript">Manuscript</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="map">Map</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="newspaperArticle">Newspaper Article</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="note">Note</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="patent">Patent</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="podcast">Podcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="presentation">Presentation</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="radioBroadcast">Radio Broadcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="report">Report</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="statute">Statute</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="thesis">Thesis</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="tvBroadcast">TV Broadcast</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="videoRecording">Video Recording</a></li>          
                            <li><a href="#" class="eventfultrigger" data-library='<?=$libraryString?>' data-triggers="newItem" data-itemtype="webpage">Web Page</a></li>      
                        </ul>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-default navbar-btn eventfultrigger add-to-collection-button" data-library='<?=$libraryString?>' data-triggers="addToCollectionDialog" title="Add to Collection"><span class="glyphicon icon-folder_add_to"></span></button>
                        <button class="remove-from-collection-button btn btn-default navbar-btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="removeFromCollection" title="Remove from Collection"><span class="glyphicon icon-folder_remove_from"></span></button>
                        <button class="move-to-trash-button btn btn-default navbar-btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="moveToTrash" title="Move to Trash"><span class="glyphicon icon-trash"></span></button>
                        <button class="remove-from-trash-button btn btn-default navbar-btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="removeFromTrash" title="Remove from Trash"><span class="glyphicon icon-trash_remove"></span></button>
                    </div>
                    <div class="btn-group" data-toggle="button">
                        <checkbox type="button" class="toggle-edit-button btn btn-default navbar-btn eventfultrigger" data-library='<?=$libraryString?>' data-triggers="toggleEdit" title="Edit"><span class="glyphicon glyphicon-edit"></span></button>
                    </div>
                </div>
            </div><!--/controlPanel -->
            <div class="eventfulwidget btn-toolbar hidden-xs pull-right" id="search-box"
                data-widget='searchbox' data-library='<?=$libraryString?>' style="max-width:350px;">
                <form action="/search/" class="navbar-form zsearch library-search" role="search">
                    <div class="input-group">
                        <div class="input-group-btn">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
                            <ul class="dropdown-menu">
                                <li><a href="#" class="library-search-type-link selected" data-searchtype="simple">Title, Creator, Year</a></li>
                                <li><a href="#" class="library-search-type-link" data-searchtype="everything">Full Text</a></li>
                            </ul>
                        </div><!-- /btn-group -->
                        <input type="text" name="q" id="header-search-query" class="search-query form-control" placeholder="Search Title, Creator, Year"/>
                        <span class="input-group-btn">
                            <button class="btn btn-default clear-field-button eventfultrigger" data-triggers="clearLibraryQuery" type="button"><span class="glyphicon glyphicon-remove"></span></button>
                        </span>
                    </div>
                </form>
            </div>
            
        </div><!-- /Header -->
        <!-- Main Content -->
        <div id="library" class="row">
            <!-- Output content -->
            <div class="eventfulwidget" id="panel-container" data-widget="panelContainer" data-library='<?=$libraryString?>'>
            <div class="row">
                <div class="col-12">
                    <!-- hidden area for possible JS messages -->
                    <div id="js-message">
                        <ul id="js-message-list">
                        </ul>
                    </div>
                </div>
            </div>
            
            <div id="left-panel" class="panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3">
            <div id="collections-panel" class="panelcontainer-panel col-12">
                <div id="collection-list-div" class="collection-list eventfulwidget" 
                    data-widget="collections" data-library='<?=$libraryString?>'>
                    <div id="collection-edit-div" class="collection-edit-div">
                        <span class="ui-button sprite-placeholder"></span>
                        <div id="edit-collections-buttons-div" class="edit-collections-buttons-div left">
                            <div class="btn-group">
                                <button type="button" class="create-collection-button btn btn-default eventfultrigger" data-library='<?=$libraryString?>' data-triggers="createCollectionDialog" title="New Collection"><span class="glyphicon icon-toolbar-collection-add"></span></button>
                                <button type="button" class="update-collection-button btn btn-default eventfultrigger" data-library='<?=$libraryString?>' data-triggers="updateCollectionDialog" title="Change Collection"><span class="glyphicon icon-toolbar-collection-edit"></span></button>
                                <button type="button" class="delete-collection-button btn btn-default eventfultrigger" data-library='<?=$libraryString?>' data-triggers="deleteCollectionDialog" title="Delete Collection"><span class="glyphicon icon-toolbar-collection-delete"></span></button>
                            </div>
                        </div>
                    </div>
                    <div id="collection-list-container" class="collection-list-container">
                    </div>
                </div><!-- collection list div -->
            </div><!-- /collections panel -->
            <div id="tags-panel" class="panelcontainer-panel col-12">
                <!-- tags browser section -->
                <div id="tags-list-div" class="tags-list-div eventfulwidget" 
                    data-widget="tags"
                    data-library='<?=$libraryString?>'>
                    <h3 id="tags-list-label">Tags</h3>
                      <input type="text" id="tag-filter-input" class="tag-filter-input form-control" placeholder="Filter Tags" />
                      <div id="tag-lists-container" class="tag-lists-container">
                        <ul id="colored-tags-list" class="colored-tags-list">
                        </ul>
                        <ul id="selected-tags-list" class="selected-tags-list">
                        </ul>
                        <ul id="tags-list" class="tags-list">
                        </ul>
                        <div class="loading"></div>
                      </div>
                      <div id="more-tags-links" class="more-tags-links">
                        <button class="btn btn-default eventfultrigger" data-library='<?=$libraryString?>' data-triggers="showMoreTags" id='show-more-tags-link' >More</a>
                        <button class="btn btn-default eventfultrigger" data-library='<?=$libraryString?>' data-triggers="showFewerTags" id='show-fewer-tags-link'>Fewer</a>
                      </div>
                </div>
                <!-- Library Links -->
                <div id="feed-link-div" class="feed-link-div eventfulwidget" 
                    data-widget="feedlink"
                    data-library='<?=$libraryString?>'>
                    <a href="" type="application/atom+xml" rel="alternate" class="feed-link"><span class="sprite-icon sprite-feed"></span>Subscribe to this feed</a><br />
                </div>
                <div class="export-list" ></div>
                <div id="send-to-library-dialog" class="eventfulwidget" 
                    data-widget="sendToLibraryDialog"
                    data-library='<?=$libraryString?>'>
                </div>
            </div><!-- /tags panel -->
            </div><!-- /left-panel -->
            
            
            <div id="right-panel" class="panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9">
            <div id="items-panel" class="panelcontainer-panel col-sm-12 col-md-7">
                <div class="eventfulwidget btn-toolbar row visible-xs" id="search-box"
                    data-widget='searchbox' data-library='<?=$libraryString?>' style="max-width:350px;">
                    <form action="/search/" class="navbar-form zsearch library-search" role="search">
                        <div class="input-group">
                            <div class="input-group-btn">
                                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
                                <ul class="dropdown-menu">
                                    <li><a href="#" class="library-search-type-link selected" data-searchtype="simple">Title, Creator, Year</a></li>
                                    <li><a href="#" class="library-search-type-link" data-searchtype="everything">Full Text</a></li>
                                </ul>
                            </div><!-- /btn-group -->
                            <input type="text" name="q" id="header-search-query" class="search-query form-control" placeholder="Search Title, Creator, Year"/>
                            <span class="input-group-btn">
                                <button class="btn btn-default clear-field-button eventfultrigger" data-triggers="clearLibraryQuery" type="button"><span class="glyphicon glyphicon-remove"></span></button>
                            </span>
                        </div>
                    </form>
                </div>
                <div class="row">
                    <div class="eventfulwidget col-12" id="filter-guide"
                        data-widget="filterGuide"
                        data-library='<?=$libraryString?>'>
                    </div>
                </div>
                <div id="library-items-div" class="library-items-div eventfulwidget row"
                    data-widget="items"
                    data-library='<?=$libraryString?>'>
                </div> <!--library items div -->
            </div><!-- /items panel -->
            
            <div id="item-panel" class="panelcontainer-panel col-sm-12 col-md-5">
                <div id="item-details-div" class="item-details-div eventfulwidget row"
                    data-widget="item"
                    data-library='<?=$libraryString?>'>
                </div> <!-- items pane row -->
            </div><!-- /item panel -->
            </div><!-- /right-panel -->
            <!-- panelContainer nav footer -->
            <nav id="panelcontainer-nav" class="navbar navbar-inverse navbar-fixed-bottom visible-xs" role="navigation">
                <ul class="nav navbar-nav">
                    <li class="eventfultrigger collections-nav" data-library='<?=$libraryString?>' data-triggers="showCollectionsPanel"><a href="#">Collections</a></li>
                    <li class="eventfultrigger tags-nav" data-library='<?=$libraryString?>' data-triggers="showTagsPanel"><a href="#">Tags</a></li>
                    <li class="eventfultrigger items-nav" data-library='<?=$libraryString?>' data-triggers="showItemsPanel"><a href="#">Items</a></li>
                </ul>
            </nav>

            <div id="create-collection-dialog"
                 class="eventfulwidget"
                 data-widget="createCollectionDialog"
                 data-library='<?=$libraryString?>'
                 title="Create Collection">
            </div>
            <div id="update-collection-dialog"
                 class="eventfulwidget"
                 data-widget="updateCollectionDialog"
                 data-library='<?=$libraryString?>'
                 title="Edit Collection">
            </div>
            <div id="delete-collection-dialog"
                 class="eventfulwidget"
                 data-widget="deleteCollectionDialog"
                 data-library='<?=$libraryString?>'
                 title="Delete Collection">
            </div>
            <div id="add-to-collection-dialog"
                 class="eventfulwidget"
                 data-widget="addToCollectionDialog"
                 data-library='<?=$libraryString?>'
                 title="Add to Collection">
            </div>
            <div id="cite-item-dialog"
                 class="eventfulwidget"
                 data-widget="citeItemDialog"
                 data-library='<?=$libraryString?>'
                 title="Cite Items">
            </div>
            <div id="upload-dialog"
                 class="eventfulwidget"
                 data-widget="uploadDialog"
                 data-library='<?=$libraryString?>'
                 title="Upload Attachment">
            </div>
            <div id="export-dialog"
                 class="eventfulwidget"
                 data-widget="exportItemsDialog"
                 data-library='<?=$libraryString?>'
                 title="Export">
            </div>
            <div id="library-settings-dialog"
                 class="eventfulwidget"
                 data-widget="librarysettingsdialog"
                 data-library='<?=$libraryString?>'
                 title="Library Settings">
            </div>
            <div id="progress-modal-dialog"
                 class="eventfulwidget"
                 data-widget="progressModal"
                 data-library='<?=$libraryString?>'
                 title="Progress">
            </div>
            <div id="choose-sorting-dialog"
                 class="eventfulwidget"
                 data-widget="chooseSortingDialog"
                 data-library='<?=$libraryString?>'
                 title="Sort Items By">
            </div>
            <?$locales = array('en');// array_keys(Zend_Locale::getOrder());?>
            <?include '../../jstemplates/tagrow.jqt';?>
            <?include '../../jstemplates/tagslist.jqt';?>
            <?include '../../jstemplates/collectionlist.jqt';?>
            <?include '../../jstemplates/collectionrow.jqt';?>
            <?include '../../jstemplates/itemrow.jqt';?>
            <?include '../../jstemplates/singlecellitemrow.jqt';?>
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
            <?include '../../jstemplates/filterguide.jqt';?>
            <?include '../../jstemplates/progressmodal.jqt';?>
            <?include '../../jstemplates/groupsList.jqt';?>
            <?include '../../jstemplates/coloredTag.jqt';?>
            <?include '../../jstemplates/coloredtaglist.jqt';?>
            <?include '../../jstemplates/sendToLibraryDialog.jqt';?>
            <?include '../../jstemplates/choosesortingdialog.jqt';?>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/globalize.js"></script>
            <?foreach($locales as $localeStr):?>
                <?if($localeStr != 'en'):?>
                <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/globalize/cultures/globalize.culture.<?=str_replace('_', '-', $localeStr)?>.js"></script>
                <?endif;?>
            <?endforeach;?>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/js/compiled/_zoterowwwAll.bugly.js"></script>
            <script type="text/javascript" charset="utf-8">
                Zotero.config = <?include "zoteroconfig.js";?>
            </script>
            <script type="text/javascript" charset="utf-8">
                if(!Zotero) Zotero = {};
                if(!Zotero.config) Zotero.config = {};
                
                if(typeof zoteroData == 'undefined'){
                    var zoteroData = {};
                }
                var baseURL = "";
                var baseDomain = "";
                var staticPath = "<?=$staticPath?>";
                
                var zoterojsClass = "user_library";
                Zotero.config.pageClass = "user_library";
                Zotero.config.librarySettings.libraryPathString = "<?=$libraryPathString?>";
                Zotero.config.librarySettings.libraryType = "<?=$libraryType?>";
                Zotero.config.librarySettings.libraryID = "<?=$libraryID?>";
                Zotero.config.librarySettings.publish = 1;
                Zotero.config.librarySettings.allowEdit = <?=$allowEdit?>;
                Zotero.config.local = "<?=$locales[0]?>";
                
                Zotero.config.nonparsedBaseUrl = Zotero.config.librarySettings.libraryPathString;
                
                Zotero.config.loggedInUserID = 0;
                Zotero.config.loggedIn = false;
                Zotero.config.javascriptEnabled = 1;
                
                var zoterojsSearchContext = "library";
            </script>
            
            <script type="text/javascript" charset="utf-8" src="<?=$staticPath?>/library/ckeditor/ckeditor.js"></script>
            <span id="eventful"></span>
        </div><!--/library -->
    </body>
</html>
