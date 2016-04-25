'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:controlpanel');

var React = require('react');

var GroupsButton = React.createClass({
	render: function(){
		var groupsUrl = "/groups";
		return (
			<a className="btn btn-default navbar-btn navbar-left" href={groupsUrl} title="Groups">
				<span className="glyphicons fonticon glyphicons-group"></span>
			</a>
		);
	}
});

var LibraryDropdown = React.createClass({
	getDefaultProps: function() {
		return {
			library: null,
			user:false
		};
	},
	getInitialState: function() {
		return {
			accessibleLibraries: [],
			loading:false,
			loaded:false
		};
	},
	populateDropdown: function() {
		log.debug("populateDropdown");
		var reactInstance = this;
		if(this.state.loading || this.state.loaded){
			return;
		}

		var library = this.props.library;
		if(library == null){
			return;
		}
		if(!Zotero.config.loggedIn){
			throw new Error("no logged in userID. Required for libraryDropdown widget");
		}
		
		var user = Zotero.config.loggedInUser;
		var personalLibraryString = 'u' + user.userID;
		var personalLibraryUrl = Zotero.url.userWebLibrary(user.slug);
		var currentLibraryName = Zotero.config.librarySettings.name;
		
		this.setState({loading: true});

		var memberGroups = library.groups.fetchUserGroups(user.userID)
		.then(function(response){
			log.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var accessibleLibraries = [];
			if(!(Zotero.config.librarySettings.libraryType == 'user' && Zotero.config.librarySettings.libraryID == user.userID)){
				accessibleLibraries.push({
					name:'My Library',
					libraryString:personalLibraryString,
					webUrl:personalLibraryUrl
				});
			}
				
			for(var i = 0; i < memberGroups.length; i++){
				if(Zotero.config.librarySettings.libraryType == 'group' && memberGroups[i].get('id') == Zotero.config.librarySettings.libraryID){
					continue;
				}
				var libraryString = 'g' + memberGroups[i].get('id');
				accessibleLibraries.push({
					name: memberGroups[i].get('name'),
					libraryString: libraryString,
					webUrl: Zotero.url.groupWebLibrary(memberGroups[i])
				});
			}
			
			reactInstance.setState({accessibleLibraries: accessibleLibraries, loading:false, loaded:true});
		}).catch(function(err){
			log.error(err);
			log.error(err.message);
		});
	},
	render: function() {
		if(this.props.user == false){
			return null;
		}
		
		var currentLibraryName = Zotero.config.librarySettings.name;

		var accessibleLibraries = this.state.accessibleLibraries;
		var libraryEntries = accessibleLibraries.map(function(lib){
			return (
				<li key={lib.libraryString}><a role="menuitem" href={lib.webUrl}>{lib.name}</a></li>
			);
		});
		
		return (
			<div id="library-dropdown" className="btn-group"
				data-widget='libraryDropdown' data-library={this.props.library.libraryString}>
				<button className="btn btn-default navbar-btn dropdown-toggle" onClick={this.populateDropdown} data-toggle="dropdown" href="#" title="Libraries">
					<span className="glyphicons fonticon glyphicons-inbox"></span>
					<span className="current-library-name">{currentLibraryName}</span>
					<span className="caret"></span>
				</button>
				<ul className="library-dropdown-list dropdown-menu actions-menu">
					<li hidden={!this.state.loading}><a role="menuitem" className="clickable">Loading...</a></li>
					{libraryEntries}
				</ul>
			</div>
		);
	}
});

var ActionsDropdown = React.createClass({
	getDefaultProps: function() {
		return {
			itemSelected: false,
			selectedCollection: null,
			library: null,
			editable:false
		};
	},
	trashOrDeleteItems: function(evt){
		//move currently displayed item or list of selected items to trash
		//or permanently delete items if already in trash
		evt.preventDefault();
		log.debug('move-to-trash clicked', 3);
		
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var response;
		var trashingItems = library.items.getItems(itemKeys);
		var deletingItems = []; //potentially deleting instead of trashing
		
		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));
		
		if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
			//items already in trash. delete them
			var i;
			for(i = 0; i < trashingItems.length; i++ ){
				var item = trashingItems[i];
				if(item.get('deleted')){
					//item is already in trash, schedule for actual deletion
					deletingItems.push(item);
				}
			}
			
			//make request to permanently delete items
			response = library.items.deleteItems(deletingItems);
		}
		else{
			//items are not in trash already so just add them to it
			response = library.items.trashItems(trashingItems);
		}
		
		library.dirty = true;
		response.catch(function(){
			log.error("Error trashing items");
		}).then(function(){
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);
		
		return false; //stop event bubbling
	},
	removeFromTrash: function(evt){
		//Remove currently displayed single item or checked list of items from trash
		//when remove-from-trash link clicked
		log.debug('remove-from-trash clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		
		var untrashingItems = library.items.getItems(itemKeys);
		
		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));
		
		var response = library.items.untrashItems(untrashingItems);
		
		library.dirty = true;
		response.catch(function(){
			
		}).then(function(){
			log.debug("post-removeFromTrash always execute: clearUrlVars", 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState();
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);
		
		return false;
	},
	removeFromCollection: function(evt) {
		//Remove currently displayed single item or checked list of items from
		//currently selected collection
		log.debug('remove-from-collection clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = Zotero.state.getUrlVar('collectionKey');
		
		var modifiedItems = [];
		var responses = [];
		itemKeys.forEach(function(itemKey, index){
			var item = library.items.getItem(itemKey);
			item.removeFromCollection(collectionKey);
			modifiedItems.push(item);
		});
		
		library.dirty = true;
		
		library.items.writeItems(modifiedItems)
		.then(function(){
			log.debug('removal responses finished. forcing reload', 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);
		
		return false;
	},
	triggerLibraryEvent: function(evt) {
		var eventType = J(evt.target).data('triggers');
		this.props.library.trigger(eventType);
	},
	triggerSync: function() {
		this.props.library.trigger("syncLibary");
	},
	triggerDeleteIdb: function() {
		this.props.library.trigger("deleteIdb");
	},
	render: function() {
		var library = this.props.library;
		var editable = this.props.editable;
		var itemSelected = this.props.itemSelected;
		var selectedCollection = this.props.selectedCollection;
		var collectionSelected = (selectedCollection != null);

		var showTrashActions = (editable && itemSelected && (selectedCollection == "trash"));
		var showNonTrashActions = (editable && itemSelected && (selectedCollection != "trash"));
		var showItemAction = editable && itemSelected;
		var showCollectionAction = editable && collectionSelected;

		return (
			<div className="btn-group">
				<button className="btn btn-default navbar-btn dropdown-toggle" data-toggle="dropdown" href="#" title="Actions">
					Actions
					<span className="caret"></span>
				</button>
				<ul className="dropdown-menu actions-menu">
					<li hidden={!showItemAction}><a href="#" role="menuitem" className="add-to-collection-button" onClick={this.triggerLibraryEvent} data-triggers="addToCollectionDialog" title="Add to Collection">Add to Collection</a></li>
					<li hidden={!(showItemAction && showCollectionAction)}><a onClick={this.removeFromCollection} href="#" className="remove-from-collection-button" title="Remove from Collection">Remove from Collection</a></li>
					<li hidden={!showNonTrashActions}><a onClick={this.trashOrDeleteItems} href="#" className="move-to-trash-button" title="Move to Trash">Move to Trash</a></li>
					<li hidden={!showTrashActions}><a onClick={this.trashOrDeleteItems} href="#" className="permanently-delete-button" title="Move to Trash">Permanently Delete</a></li>
					<li hidden={!showTrashActions}><a onClick={this.removeFromTrash} href="#" className="remove-from-trash-button" title="Remove from Trash">Remove from Trash</a></li>
					<li className="divider" hidden={!showItemAction}></li>
					<li><a className="create-collection-button" href="#" onClick={this.triggerLibraryEvent} data-triggers="createCollectionDialog" title="New Collection">Create Collection</a></li>
					<li hidden={!showCollectionAction}><a href="#" className="update-collection-button" onClick={this.triggerLibraryEvent} data-triggers="updateCollectionDialog" title="Change Collection">Rename Collection</a></li>
					<li hidden={!showCollectionAction}><a href="#" className="delete-collection-button" onClick={this.triggerLibraryEvent} data-triggers="deleteCollectionDialog" title="Delete Collection">Delete Collection</a></li>
					<li className="divider"></li>
					<li><a href="#" onClick={this.triggerLibraryEvent} data-triggers="librarySettingsDialog">Library Settings</a></li>
					<li><a href="#" className="cite-button" onClick={this.triggerLibraryEvent} data-triggers="citeItems">Cite</a></li>
					<li><a href="#" className="export-button" onClick={this.triggerLibraryEvent} data-triggers="exportItemsDialog">Export</a></li>
					<li className="divider selected-item-action"></li>
					<li className="selected-item-action" hidden={!showItemAction}><a href="#" className="send-to-library-button" onClick={this.triggerLibraryEvent} data-triggers="sendToLibraryDialog" title="Copy to Library">Copy to Library</a></li>
					<li className="divider" hidden={!showItemAction}></li>
					<li><a href="#" data-triggers="syncLibrary" onClick={this.triggerLibraryEvent} >Sync</a></li>
					<li><a href="#" data-triggers="deleteIdb" onClick={this.triggerLibraryEvent} >Delete IDB</a></li>
				</ul>
			</div>
		);
	}
});

var CreateItemDropdown = React.createClass({
	getDefaultProps: function() {
		return {
			editable: false
		};
	},
	createItem: function(evt){
		//clear path vars and send to new item page with current collection when create-item-link clicked
		log.debug("create-item-Link clicked", 3);
		evt.preventDefault();
		var library = this.props.library;
		var itemType = J(evt.target).data('itemtype');
		library.trigger("createItem", {itemType:itemType});
		return false;
	},
	render: function() {
		var reactInstance = this;
		var itemTypes = Object.keys(Zotero.Item.prototype.typeMap);
		itemTypes = itemTypes.sort();
		var nodes = itemTypes.map(function(itemType, ind){
			return (
				<li key={itemType}>
					<a onClick={reactInstance.createItem} href="#" data-itemtype={itemType}>
						{Zotero.Item.prototype.typeMap[itemType]}
					</a>
				</li>
			);
		});

		var buttonClass = "create-item-button btn btn-default navbar-btn dropdown-toggle";
		if(Zotero.state.getUrlVar('collectionKey') == 'trash'){
			buttonClass += " disabled";
		}

		return (
			<div className="btn-group create-item-dropdown" hidden={!this.props.editable}>
				<button type="button" className={buttonClass} data-toggle="dropdown" title="New Item"><span className="glyphicons fonticon glyphicons-plus"></span></button>
				<ul className="dropdown-menu" role="menu" style={{maxHeight:"300px", overflow:"auto"}}>
					{nodes}
				</ul>
			</div>
		);
	}
});

var ControlPanel = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;
		
		reactInstance.setState({user: Zotero.config.loggedInUser});
		
		library.listen("selectedItemsChanged", function(evt){
			log.debug("got selectedItemsChanged event in ControlPanel - setting selectedItems");
			log.debug(evt);
			var selectedItemKeys = evt.data.selectedItemKeys;
			reactInstance.setState({selectedItems: selectedItemKeys});
		}, {});
		
		library.listen("selectedCollectionChanged", function(evt){
			var selectedCollection = Zotero.state.getUrlVar('collectionKey');
			var selectedItemKeys = Zotero.state.getSelectedItemKeys();
			reactInstance.setState({
				selectedCollection: selectedCollection,
				selectedItems: selectedItemKeys
			});
		}, {});
	},
	getDefaultProps: function(){
		return {
			editable: false
		};
	},
	getInitialState: function() {
		var selectedItems = Zotero.state.getSelectedItemKeys();
		return {
			user: false,
			selectedItems: selectedItems,
			selectedCollection: null
		};
	},
	render: function(){
		return (
			<div id="control-panel" className="nav navbar-nav" role="navigation">
				<div className="btn-toolbar navbar-left">
					<GroupsButton library={this.props.library} />
					<LibraryDropdown user={this.state.user} library={this.props.library} />
					<ActionsDropdown library={this.props.library} itemSelected={this.state.selectedItems.length > 0} selectedCollection={this.state.selectedCollection} editable={this.props.editable} />
					<CreateItemDropdown library={this.props.library} editable={this.props.editable} />
				</div>
			</div>
		);
	}
});

module.exports = ControlPanel;
