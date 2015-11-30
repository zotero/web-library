Zotero.ui.widgets.reactcontrolPanel = {};

Zotero.ui.widgets.reactcontrolPanel.init = function(el){
	Z.debug("Zotero.eventful.init.controlPanel", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(
		<ControlPanel library={library} />,
		document.getElementById('control-panel')
	);
	Zotero.ui.widgets.reactcontrolPanel.reactInstance = reactInstance;
};

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
		}
	},
	populateDropdown: function() {
		Z.debug("populateDropdown");
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
	        Z.debug("got member groups", 3);
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
	        Z.error(err);
	        Z.error(err.message);
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
			<div id="library-dropdown" className="eventfulwidget btn-group"
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
			selectedCollection: false,
			library: null
		};
	},
	trashOrDeleteItems: function(evt){
		//move currently displayed item or list of selected items to trash
		//or permanently delete items if already in trash
		evt.preventDefault();
		Z.debug('move-to-trash clicked', 3);
		
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
			Z.error("Error trashing items");
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
		Z.debug('remove-from-trash clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		
		var untrashingItems = library.items.getItems(itemKeys);
		
		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));
		
		var response = library.items.untrashItems(untrashingItems);
		
		library.dirty = true;
		response.catch(function(){
			
		}).then(function(){
			Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState();
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);
		
		return false;
	},
	removeFromCollection: function(evt) {
		//Remove currently displayed single item or checked list of items from
		//currently selected collection
		Z.debug('remove-from-collection clicked', 3);
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
			Z.debug('removal responses finished. forcing reload', 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		}).catch(Zotero.catchPromiseError);
		
		return false;
	},
	render: function() {
		var library = this.props.library;
		var itemSelected = this.props.itemSelected;
		var selectedCollection = this.props.selectedCollection;
		var collectionSelected = (selectedCollection != false);

		var showTrashActions = (itemSelected && (selectedCollection == "trash"));
		var showNonTrashActions = (itemSelected && (selectedCollection != "trash"));

		return (
			<div className="btn-group">
				<button className="btn btn-default navbar-btn dropdown-toggle" data-toggle="dropdown" href="#" title="Actions">
					Actions
					<span className="caret"></span>
				</button>
				<ul className="dropdown-menu actions-menu">
					<li className="permission-edit selected-item-action" hidden={!itemSelected}><a role="menuitem" className="eventfultrigger add-to-collection-button clickable" data-library={library.libraryString} data-triggers="addToCollectionDialog" title="Add to Collection">Add to Collection</a></li>
					<li className="permission-edit selected-item-action selected-collection-action" hidden={!(itemSelected && collectionSelected)}><a onClick={this.removeFromCollection} className="remove-from-collection-button clickable" title="Remove from Collection">Remove from Collection</a></li>
					<li className="permission-edit selected-item-action" hidden={!showNonTrashActions}><a onClick={this.trashOrDeleteItems} className="move-to-trash-button clickable" title="Move to Trash">Move to Trash</a></li>
					<li className="permission-edit selected-item-action" hidden={!showTrashActions}><a onClick={this.trashOrDeleteItems} className="permanently-delete-button clickable" title="Move to Trash">Permanently Delete</a></li>
					<li className="permission-edit selected-item-action" hidden={!showTrashActions}><a onClick={this.removeFromTrash} className="remove-from-trash-button clickable" title="Remove from Trash">Remove from Trash</a></li>
					<li className="divider permission-edit selected-item-action"></li>
					<li className="permission-edit"><a className="create-collection-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="createCollectionDialog" title="New Collection">Create Collection</a></li>
					<li className="permission-edit" hidden={!collectionSelected}><a className="update-collection-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="updateCollectionDialog" title="Change Collection">Rename Collection</a></li>
					<li className="permission-edit" hidden={!collectionSelected}><a className="delete-collection-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="deleteCollectionDialog" title="Delete Collection">Delete Collection</a></li>
					<li className="divider permission-edit"></li>
					<li><a href="#" className="eventfultrigger clickable" data-library={library.libraryString} data-triggers="librarySettingsDialog">Library Settings</a></li>
					<li><a href="#" className="cite-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="citeItems">Cite</a></li>
					<li><a href="#" className="export-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="exportItemsDialog">Export</a></li>
					{/*<li><a href="#" className="share-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="shareToDocs">Share To Docs</a></li>*/}
					<li className="divider selected-item-action"></li>
					<li className="selected-item-action" hidden={!itemSelected}><a className="send-to-library-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="sendToLibraryDialog" title="Copy to Library">Copy to Library</a></li>
					<li className="divider"></li>
					<li><a href="#" className="eventfultrigger clickable" data-library={library.libraryString} data-triggers="syncLibary">Sync</a></li>
					<li><a href="#" className="eventfultrigger clickable" data-library={library.libraryString} data-triggers="deleteIdb">Delete IDB</a></li>
				</ul>
			</div>
		);
	}
});

var CreateItemDropdown = React.createClass({
	getDefaultProps: function() {
		return {
			
		};
	},
	createItem: function(evt){
		//clear path vars and send to new item page with current collection when create-item-link clicked
		Z.debug("create-item-Link clicked", 3);
		evt.preventDefault();
		var library = this.props.library;
		var itemType = J(evt.target).data('itemtype');
		library.trigger("createItem", {itemType:itemType});
		return false;
	},
	render: function() {
		var reactInstance = this;
		var libraryString = "";
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
			<div className="btn-group create-item-dropdown permission-edit">
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
			var selectedItemKeys = evt.selectedItemKeys;
			reactInstance.setState({selectedItems: selectedItemKeys});
		}, {});
		
		library.listen("selectedCollectionChanged", function(evt){
			var selectedCollection = Zotero.state.getUrlVar('collectionKey');
			reactInstance.setState({selectedCollection: selectedCollection});
		}, {});
	},
	getDefaultProps: function(){
		return {};
	},
	getInitialState: function() {
		return {
			user: false,
			canEdit: false,
			selectedItems: [],
			selectedCollection: null
		};
	},
	render: function(){
		return (
			<div id="control-panel" className="nav navbar-nav" role="navigation">
				<div className="btn-toolbar navbar-left">
					<GroupsButton library={this.props.library} />
					<LibraryDropdown user={this.state.user} library={this.props.library} />
					<ActionsDropdown library={this.props.library} itemSelected={this.state.selectedItems.length > 0} selectedCollection={this.state.selectedCollection} />
					<CreateItemDropdown library={this.props.library} />
				</div>
			</div>
		);
	}
});
