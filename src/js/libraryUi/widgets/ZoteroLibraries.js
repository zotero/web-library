'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ZoteroLibraries');

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

var UserLibraries = require('./LibrariesCollections.js');


Zotero.ui.widgets.libraries = {};

Zotero.ui.widgets.libraries.init = function(el){
	log.debug('Zotero.ui.widgets.library.init');
	let user = Zotero.config.loggedInUser;
	
	var reactInstance = ReactDOM.render(
		<ZoteroLibraries user={user} />,
		document.getElementById('library-widget')
	);
};

var ZoteroLibraries = React.createClass({
	componentWillMount: function() {
		//preload library
		log.debug('ZoteroLibraries componentWillMount');
		let reactInstance = this;
		Zotero.reactLibrariesInstance = reactInstance;
		
		window.addEventListener('resize', function(){
			if(!window.matchMedia('(min-width: 768px)').matches){
				if(reactInstance.state.narrow != true){
					reactInstance.setState({narrow:true});
				}
			} else {
				if(reactInstance.state.narrow != false){
					reactInstance.setState({narrow:false});
				}
			}
		});

		Zotero.listen('libraryChanged', () =>{
			log.debug('ZoteroLibraries responding to libraryChanged trigger');
			let nextLibrary = Zotero.state.library;
			reactInstance.setState({currentLibrary:nextLibrary}, () => {
				reactInstance.refs.itemsWidget.loadItems();
				reactInstance.refs.collectionsWidget.setState({currentLibrary:nextLibrary.libraryString});
			});
		});

		//tags events
		Zotero.listen('tagsChanged libraryTagsUpdated selectedTagsChanged', function(){
			reactInstance.refs.tagsWidget.setState({tags:reactInstance.state.currentLibrary.tags});
		});

		Zotero.listen('tagsDirty cachedDataLoaded', ()=>{
			reactInstance.refs.tagsWidget.syncTags({});
		});

		//events affecting widgets that should update regardless of library because the library may have changed
		Zotero.listen('changeItemSorting', ()=>{
			this.refs.itemsWidget.resortTriggered();
		});

		log.debug('Zotero.listening on displayedItemsChanged');
		Zotero.listen('displayedItemsChanged', ()=>{
			log.debug('ZoteroLibraries displayedItemsChanged response');
			this.refs.itemsWidget.loadItems();
		}, {});
		Zotero.listen('displayedItemChanged', ()=>{
			this.refs.itemsWidget.selectDisplayed();
		});
		Zotero.listen('selectedItemsChanged', ()=>{
			log.debug('responding to Zotero.selectedItemsChanged');
			this.refs.itemsWidget.setState({selectedItemKeys:Zotero.state.getSelectedItemKeys()});
		});
		
		Zotero.listen('selectedCollectionChanged', function(){
			log.debug('got selectedCollectionChanged, triggering displayedItemsChanged');
			Zotero.state.selectedItemKeys = [];
			Zotero.trigger('selectedItemsChanged', {selectedItemKeys:[]});
		});
		
		Zotero.listen('libraryCollectionsUpdated selectedCollectionChanged cachedDataLoaded', ()=>{
			this.refs.collectionsWidget.forceUpdate();	
		}, {});

		//Item Details Events
		Zotero.listen('displayedItemChanged', ()=>{
			reactInstance.refs.itemWidget.loadItem();
		}, {});

		Zotero.listen('uploadSuccessful showChildren', ()=>{
			reactInstance.refs.itemWidget.refreshChildren();
		}, {});
		
		Zotero.listen('tagsChanged', ()=>{
			reactInstance.refs.itemWidget.updateTypeahead();
		}, {});

		Zotero.listen('totalResultsLoaded', ()=>{
			reactInstance.refs.itemWidget.setState({libraryItemsLoaded:true});
		}, {});

		//Filter Guide Events
		Zotero.listen('displayedItemsChanged displayedItemChanged updateFilterGuide selectedCollectionChanged cachedDataLoaded libraryCollectionsUpdated', ()=>{
			reactInstance.refs.filterGuide.refreshFilters();
		}, {});

		//Dialog Events
		Zotero.listen('deleteCollectionDialog', ()=>{
			reactInstance.refs.deleteCollectionDialog.setState({collectionKey:Zotero.state.getUrlVar('collectionKey')});
			reactInstance.refs.deleteCollectionDialog.openDialog();
		});

		Zotero.listen('createCollectionDialog', ()=>{
			reactInstance.refs.createCollectionDialog.forceUpdate();
			reactInstance.refs.createCollectionDialog.openDialog();
		}, {});

		Zotero.listen('updateCollectionDialog', ()=>{
			reactInstance.refs.updateCollectionDialog.updateCollectionContext();
			reactInstance.refs.updateCollectionDialog.openDialog();
		}, {});

		Zotero.listen('uploadAttachment', ()=>{
			log.debug('got uploadAttachment event; opening upload dialog');
			reactInstance.refs.uploadAttachmentDialog.setState({itemKey: Zotero.state.getUrlVar('itemKey')});
			reactInstance.refs.uploadAttachmentDialog.openDialog();
		}, {});

		Zotero.listen('sendToLibraryDialog', ()=>{
			reactInstance.refs.sendToLibraryDialog.openDialog();
		}, {});

		Zotero.listen('settingsLoaded', ()=>{
			reactInstance.refs.librarySettingsDialog.updateStateFromLibrary();
		}, {});
		Zotero.listen('librarySettingsDialog', ()=>{
			reactInstance.refs.librarySettingsDialog.openDialog();
		}, {});

		Zotero.listen('citeItems', ()=>{
			reactInstance.refs.citeItemsDialog.openDialog();
		}, {});

		Zotero.listen('exportItemsDialog', ()=>{
			reactInstance.refs.exportItemsDialog.openDialog();
		}, {});
		Zotero.listen('displayedItemsChanged', ()=>{
			reactInstance.refs.exportItemsDialog.forceUpdate();
		}, {});

		Zotero.listen('chooseSortingDialog', ()=>{
			reactInstance.refs.chooseSortingDialog.openDialog();
		}, {});

		Zotero.listen('createItem', (evt)=>{
			let itemType = evt.data.itemType;
			reactInstance.refs.createItemDialog.setState({itemType: itemType});
			reactInstance.refs.createItemDialog.openDialog();
		}, {});

		Zotero.listen('exportItemsDialog', ()=>{
			log.debug('opening export dialog', 3);
			reactInstance.refs.exportItemsDialog.openDialog();
		}, {});
		Zotero.listen('displayedItemsChanged', ()=>{
			reactInstance.refs.exportItemsDialog.forceUpdate();
		}, {});

		Zotero.listen('addToCollectionDialog', ()=>{
			reactInstance.refs.addToCollectionDialog.forceUpdate();
			reactInstance.refs.addToCollectionDialog.openDialog();
		}, {});

		//control panel events
		Zotero.listen('selectedItemsChanged', (evt)=>{
			log.debug('got selectedItemsChanged event in ControlPanel - setting selectedItems');
			log.debug(evt);
			let selectedItemKeys = evt.data.selectedItemKeys;
			reactInstance.refs.controlPanel.setState({selectedItems: selectedItemKeys});
		}, {});
		
		Zotero.listen('selectedCollectionChanged', ()=>{
			let selectedCollection = Zotero.state.getUrlVar('collectionKey');
			let selectedItemKeys = Zotero.state.getSelectedItemKeys();
			reactInstance.refs.controlPanel.setState({
				selectedCollection: selectedCollection,
				selectedItems: selectedItemKeys
			});
		}, {});

		//Searchbox event
		Zotero.listen('clearLibraryQuery', ()=>{
			reactInstance.refs.librarySearchBox.clearLibraryQuery();
			reactInstance.refs.librarySearchBox2.clearLibraryQuery();
		});
	},
	componentDidMount: function() {
		log.debug('ZoteroLibraries didMount');
		let reactInstance = this;
		this.loadGroupLibraries();

		//trigger loading of more items on scroll reaching bottom
		reactInstance.refs.itemsPanel.addEventListener('scroll', ()=>{
			let el = reactInstance.refs.itemsPanel;
			if(el.scrollTop + el.clientHeight >= el.scrollHeight){
				reactInstance.refs.itemsWidget.loadMoreItems();
			}
		});

		Zotero.trigger('displayedItemsChanged');
		Zotero.trigger('displayedItemChanged');

		this.state.currentLibrary.cachedDataPromise.then(()=>{
			log.debug('loading updated collections in componentDidMount');
			//force render once before getting updated collections from api
			this.refs.collectionsWidget.forceUpdate();
			this.state.currentLibrary.loadUpdatedCollections().then(()=>{
				//forceUpdate instead of triggering libraryCollectionsUpdated
				log.debug('forcing update of collections widget');
				this.refs.collectionsWidget.forceUpdate();
			});
		});
	},
	loadGroupLibraries: function() {
		log.debug('loadGroupLibraries');
		let reactInstance = this;
		if(this.state.loading || this.state.loaded){
			return;
		}

		let user = this.props.user;
		let userLibrary = this.state.userLibrary;
		Z.state.libraries[userLibrary.libraryString] = userLibrary;
		if(userLibrary == null){
			return;
		}
		if(!Zotero.config.loggedIn){
			log.error('no logged in userID. Required for Zotero Libraries interface');
			throw new Error('no logged in userID. Required for Zotero Libraries interface');
		}
		userLibrary.groups.fetchUserGroups(user.userID)
		.then((response) => {
			log.debug('got member groups');
			let memberGroups = response.fetchedGroups;
			let libraries = this.state.libraries;
			let slibraries = Z.state.libraries;

			memberGroups.forEach((group)=>{
				let slug = Zotero.Utils.slugify(group.get('name'));
				//instantiate library
				let lib = new Zotero.Library('group', group.get('id'), slug, Zotero.config.apiKey);
				//store library instance where components will be able to get at it without creating a new one
				libraries[lib.libraryString] = lib;
				slibraries[lib.libraryString] = lib;

				//force collections to re-render after the cached data has been loaded
				lib.cachedDataPromise.then(()=>{
					log.debug('loading updated collections in loadGroupLibraries');
					//force render once before getting updated collections from api
					this.refs.collectionsWidget.forceUpdate();
					lib.loadUpdatedCollections().then(()=>{
						//forceUpdate instead of triggering libraryCollectionsUpdated
						log.debug('forcing update of collections widget');
						this.refs.collectionsWidget.forceUpdate();
					});
				});
			});
			log.debug(memberGroups);
			reactInstance.setState({groups: memberGroups, loading:false, loaded:true});
		}).catch(function(err){
			log.error(err);
			log.error(err.message);
		});
	},
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		var narrow;
		if(!window.matchMedia('(min-width: 768px)').matches){
			log.debug('Library set to narrow', 3);
			narrow = true;
		} else {
			narrow = false;
		}

		let user = this.props.user;
		let userLibrary = new Zotero.Library('user', user.userID, user.slug, Zotero.config.apiKey);
		let libraries = {};
		libraries[userLibrary.libraryString] = userLibrary;
		Zotero.state.library = userLibrary;

		return {
			userLibrary: userLibrary,
			narrow: narrow,
			activePanel: 'items',
			deviceSize: 'xs',
			libraries: libraries,
			currentLibrary: userLibrary
		};
	},
	switchLibrary: function(evt) {

	},
	showFiltersPanel: function(evt) {
		evt.preventDefault();
		this.setState({activePanel: 'filters'});
	},
	showItemsPanel: function(evt) {
		evt.preventDefault();
		this.setState({activePanel: 'items'});
	},
	reflowPanelContainer: function() {

	},
	render: function(){
		log.debug('ZoteroLibraries render');
		let reactInstance = this;
		let user = this.props.user;
		let library = this.state.currentLibrary;
		let userDisplayName = user.displayName;
		let base = Zotero.config.baseWebsiteUrl;
		let settingsUrl = base + '/settings';
		let inboxUrl = base + '/messages/inbox'; //TODO
		let downloadUrl = base + '/download';
		let documentationUrl = base + '/support';
		let forumsUrl = Zotero.config.baseForumsUrl; //TODO
		let logoutUrl = base + '/user/logout';
		let homeUrl = base;
		let staticUrl = function(path){
			return base + '/static' + path;
		};

		let inboxText = '';
		let siteActionsMenu;

		inboxText = user.unreadMessages > 0 ? (<strong>Inbox ({user.unreadMessages})</strong>) : 'Inbox';

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
	
		let leftPanelVisible = true;
		let rightPanelVisible = true;
		let itemsPanelVisible = true;
		let itemPanelVisible = true;
		let tagsPanelVisible = true;
		let collectionsPanelVisible = true;

		let narrow = this.state.narrow;
		
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
							<LibrarySearchBox ref="librarySearchBox" library={library} />
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
								{/*
								<Collections ref="collectionsWidget" library={library} />
								*/}
								<UserLibraries ref="collectionsWidget" libraries={this.state.libraries} groups={this.state.groups} currentLibrary={this.state.currentLibrary.libraryString} />
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
							<LibrarySearchBox ref="librarySearchBox2" library={library} />
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
				
				<UpdateCollectionDialog ref="updateCollectionDialog" library={library} />
				
				<DeleteCollectionDialog ref="deleteCollectionDialog" library={library} />
				
				<AddToCollectionDialog ref="addToCollectionDialog" library={library} />
				
				<CreateItemDialog ref="createItemDialog" library={library} />
				
				<CiteItemDialog ref="citeItemDialog" library={library} />
				
				<UploadAttachmentDialog ref="uploadAttachmentDialog" library={library} />
				
				<ExportItemsDialog ref="exportItemsDialog" library={library} />
				
				<LibrarySettingsDialog ref="librarySettingsDialog" library={library} />
				
				<ChooseSortingDialog ref="chooseSortingDialog" library={library} />
			</div>
			</div>
			</div>
		);
	}
});

module.exports = ZoteroLibraries;
