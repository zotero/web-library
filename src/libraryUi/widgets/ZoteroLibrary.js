'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:library');

var React = require('react');
var ReactDOM = require('react-dom');

var ControlPanel = require('./ControlPanel.js');
var FilterGuide = require('./FilterGuide.js');
var Collections = require('./Collections.js');
var Tags = require('./Tags.js');
var FeedLink = require('./FeedLink.js');
var LibrarySearchBox = require('./LibrarySearchBox.js');
var Items = require('./Items.js');
var ItemDetails = require('./ItemDetails.js');
var SendToLibraryDialog = require('./SendToLibraryDialog.js');
var CreateCollectionDialog = require('./CreateCollectionDialog.js');
var UpdateCollectionDialog = require('./UpdateCollectionDialog.js');
var DeleteCollectionDialog = require('./DeleteCollectionDialog.js');
var AddToCollectionDialog = require('./AddToCollectionDialog.js');
var CreateItemDialog = require('./CreateItemDialog.js');
var CiteItemDialog = require('./CiteItemDialog.js');
var UploadAttachmentDialog = require('./UploadAttachmentDialog.js');
var ExportItemsDialog = require('./ExportItemsDialog.js');
var LibrarySettingsDialog = require('./LibrarySettingsDialog.js');
var ChooseSortingDialog = require('./ChooseSortingDialog.js');



Zotero.ui.widgets.library = {};

Zotero.ui.widgets.library.init = function(el){
	log.debug("Zotero.ui.widgets.library.init");
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<ZoteroLibrary library={library} />,
		document.getElementById('library-widget')
	);
};

var ZoteroLibrary = React.createClass({
	componentWillMount: function() {
		//preload library
		log.debug("ZoteroLibrary componentWillMount", 3);
		var reactInstance = this;
		Zotero.reactLibraryInstance = reactInstance;
		var library = this.props.library;
		library.loadSettings();
		library.listen("deleteIdb", function(){
			library.idbLibrary.deleteDB();
		});
		library.listen("indexedDBError", function(){
			Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
		});
		library.listen("cachedDataLoaded", function() {

		});
		
		J(window).on('resize', function(){
			if(!window.matchMedia("(min-width: 768px)").matches){
				if(reactInstance.state.narrow != true){
					reactInstance.setState({narrow:true});
				}
			} else {
				if(reactInstance.state.narrow != false){
					reactInstance.setState({narrow:false});
				}
			}
		});
	},
	componentDidMount: function() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemsChanged", function() {
			log.debug("ZoteroLibrary displayedItemsChanged");
			reactInstance.refs.itemsWidget.loadItems();
		}, {});
	
		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function(){
			log.debug("setting tags on tagsWidget from Library");
			reactInstance.refs.tagsWidget.setState({tags:library.tags});
		});

		//trigger loading of more items on scroll reaching bottom
		J(reactInstance.refs.itemsPanel).on('scroll', function(){
			var jel = J(reactInstance.refs.itemsPanel);
			if(jel.scrollTop() + jel.innerHeight() >= jel[0].scrollHeight){
				reactInstance.refs.itemsWidget.loadMoreItems();
			}
		});
	},
	getInitialState: function() {
		var narrow;
		if(!window.matchMedia("(min-width: 768px)").matches){
			log.debug("Library set to narrow", 3);
			narrow = true;
		} else {
			narrow = false;
		}

		return {
			narrow: narrow,
			activePanel: "items",
			deviceSize: "xs"
		};
	},
	showFiltersPanel: function(evt) {
		evt.preventDefault();
		this.setState({activePanel: "filters"});
	},
	showItemsPanel: function(evt) {
		evt.preventDefault();
		this.setState({activePanel: "items"});
	},
	reflowPanelContainer: function() {

	},
	render: function(){
		log.debug("react library render");
		var reactInstance = this;
		var library = this.props.library;
		var user = Zotero.config.loggedInUser;
		var userDisplayName = user ? user.displayName : null;
		var base = Zotero.config.baseWebsiteUrl;
		var settingsUrl = base + "/settings";
		var inboxUrl = base + "/messages/inbox"; //TODO
		var downloadUrl = base + "/download";
		var documentationUrl = base + "/support";
		var forumsUrl = Zotero.config.baseForumsUrl; //TODO
		var logoutUrl = base + "/user/logout";
		var loginUrl = base + "/user/login";
		var homeUrl = base;
		var staticUrl = function(path){
			return base + "/static" + path;
		};

		var inboxText = user.unreadMessages > 0 ? (<strong>Inbox ({user.unreadMessages})</strong>) : "Inbox";
		var siteActionsMenu;

		if(user) {
			siteActionsMenu = [
				(<button key="button" type="button" href="#" className="btn btn-default navbar-btn dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
					{userDisplayName}
					<span className="caret"></span>
					<span className="sr-only">Toggle Dropdown</span>
				</button>),
				(<ul key="listEntries" className="dropdown-menu" role="menu">
					<li><a href={settingsUrl}>Settings</a></li>
					<li><a href={inboxUrl}>{inboxText}</a></li>
					<li><a href={downloadUrl}>Download</a></li>
					<li className="divider"></li>
					<li><a href={documentationUrl} className="documentation">Documentation</a></li>
					<li><a href={forumsUrl} className="forums">Forums</a></li>
					<li className="divider"></li>
					<li><a href={logoutUrl}>Log Out</a></li>
				</ul>)
			];
		} else {
			siteActionsMenu = (
				<div className="btn-group">
					<a href={loginUrl} className="btn btn-default navbar-btn" role="button">
						Log In
					</a>
					<button type="button" href="#" className="btn btn-default navbar-btn dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
						<span className="caret"></span>
						<span className="sr-only">Toggle Dropdown</span>
					</button>
					<ul className="dropdown-menu" role="menu">
						<li><a href={downloadUrl}>Download</a></li>
						<li><a href={documentationUrl} className="documentation">Documentation</a></li>
						<li><a href={forumsUrl} className="forums">Forums</a></li>
					</ul>
				</div>
			);
		}

		//figure out panel visibility based on state.activePanel
		var narrow = reactInstance.state.narrow;
		var leftPanelVisible = !narrow;
		var rightPanelVisible = !narrow;
		var itemsPanelVisible = !narrow;
		var itemPanelVisible = !narrow;
		var tagsPanelVisible = !narrow;
		var collectionsPanelVisible = !narrow;
		if(narrow){
			switch(reactInstance.state.activePanel){
				case "items":
					rightPanelVisible = true;
					itemsPanelVisible = true;
					break;
				case "item":
					rightPanelVisible = true;
					itemPanelVisible = true;
					break;
				case "tags":
					leftPanelVisible = true;
					tagsPanelVisible = true;
					break;
				case "collections":
					leftPanelVisible = true;
					collectionsPanelVisible = true;
					break;
				case "filters":
					leftPanelVisible = true;
					break;
			}
		}

		return (
			<div>
			<nav id="primarynav" className="navbar navbar-default" role="navigation">
				<div className="container-fluid">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#primary-nav-linklist">
							{userDisplayName}
							<span className="sr-only">Toggle navigation</span>
							<span className="glyphicons fonticon glyphicons-menu-hamburger"></span>
						</button>
						<a className="navbar-brand hidden-sm hidden-xs" href={homeUrl}><img src={staticUrl('/images/theme/zotero.png')} alt="Zotero" height="20px" /></a>
						<a className="navbar-brand visible-sm-block visible-xs-block" href={homeUrl}>
							<img src={staticUrl('/images/theme/zotero_theme/zotero_48.png')} alt="Zotero" height="24px" />
						</a>
					</div>

					<div className="collapse navbar-collapse" id="primary-nav-linklist">
						<ControlPanel library={library} editable={Zotero.config.librarySettings.allowEdit} ref="controlPanel" />
						
						<ul className="nav navbar-nav navbar-right">
							{siteActionsMenu}
						</ul>
						<div className="btn-toolbar hidden-xs navbar-right">
							<LibrarySearchBox library={library} />
						</div>
					</div>
				</div>
			</nav>

			<div id="js-message" >
				<ul id="js-message-list">
				</ul>
			</div>

			{/*<!-- Main Content -->*/}
			<div id="library" className="row">

			<div id="panel-container">
				<div id="left-panel" hidden={!leftPanelVisible} className="panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3">
					<FilterGuide ref="filterGuide" library={library} />
					
					<div role="tabpanel">
						{/*<!-- Nav tabs -->*/}
						<ul className="nav nav-tabs" role="tablist">
							<li role="presentation" className="active"><a href="#collections-panel" aria-controls="collections-panel" role="tab" data-toggle="tab">Collections</a></li>
							<li role="presentation"><a  href="#tags-panel" aria-controls="tags-panel" role="tab" data-toggle="tab">Tags</a></li>
						</ul>
						{/*<!-- Tab panes -->*/}
						<div className="tab-content">
							<div id="collections-panel" role="tabpanel" className="tab-pane active">
								<Collections ref="collectionsWidget" library={library} />
							</div>{/*<!-- /collections panel -->*/}
							
							<div id="tags-panel" role="tabpanel" className="tab-pane">
								{/*<!-- tags browser section -->*/}
								<Tags ref="tagsWidget" library={library} />
								<FeedLink ref="feedLinkWidget" library={library} />
							</div>{/*<!-- /tags panel -->*/}
						</div>{/*<!-- /tabcontent -->*/}
					</div>{/*<!-- /tab-panel -->*/}
				</div>{/*<!-- /left-panel -->*/}
				
				<div id="right-panel" hidden={!rightPanelVisible} className="panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9">
					<div hidden={!itemsPanelVisible} ref="itemsPanel" id="items-panel" className="panelcontainer-panel col-sm-12 col-md-7">
						<div className="visible-xs library-search-box-container">
							<LibrarySearchBox library={library} />
						</div>
						<Items ref="itemsWidget" library={library} narrow={narrow} />
					</div>{/*<!-- /items panel -->*/}
					
					<div hidden={!itemPanelVisible} id="item-panel" className="panelcontainer-panel col-sm-12 col-md-5">
						<div id="item-widget-div" className="item-details-div">
							<ItemDetails ref="itemWidget" library={library} />
						</div>{/*<!-- /item widget -->*/}
					</div>{/*<!-- /item panel -->*/}
				</div>{/*<!-- /right-panel -->*/}
				
				{/*<!-- panelContainer nav footer -->*/}
				<nav id="panelcontainer-nav" className="navbar navbar-default navbar-fixed-bottom visible-xs-block" role="navigation">
					<div className="container-fluid">
						<ul className="nav navbar-nav">
							<li onClick={reactInstance.showFiltersPanel} className="filters-nav"><a href="#">Filters</a></li>
							<li onClick={reactInstance.showItemsPanel} className="items-nav"><a href="#">Items</a></li>
						</ul>
					</div>
				</nav>
				<SendToLibraryDialog ref="sendToLibraryDialogWidget" library={library} />
				
				<CreateCollectionDialog ref="createCollectionDialogWidget" library={library} />
				
				<UpdateCollectionDialog library={library} />
				
				<DeleteCollectionDialog library={library} />
				
				<AddToCollectionDialog library={library} />
				
				<CreateItemDialog library={library} />
				
				<CiteItemDialog library={library} />
				
				<UploadAttachmentDialog library={library} />
				
				<ExportItemsDialog library={library} />
				
				<LibrarySettingsDialog library={library} />
				
				<ChooseSortingDialog library={library} />
			</div>
			</div>
			</div>
		);
	}
});

module.exports = ZoteroLibrary;
