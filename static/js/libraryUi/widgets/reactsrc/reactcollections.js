Zotero.ui.widgets.reactcollections = {};

Zotero.ui.widgets.reactcollections.init = function(el){
	Z.debug("collections widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var initialCollectionKey = Zotero.state.getUrlVar('collectionKey');
	var reactInstance = ReactDOM.render(
		<Collections library={library} initialCollectionKey={initialCollectionKey} />,
		document.getElementById('collection-list-div')
	);
	Zotero.ui.widgets.reactcollections.reactInstance = reactInstance;
	
	library.listen("collectionsDirty", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	//library.listen("syncCollections", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	//library.listen("syncLibrary", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	library.listen("cachedDataLoaded", Zotero.ui.widgets.reactcollections.syncCollections, {widgetEl: el});
	
	library.listen("libraryCollectionsUpdated", function(){
		reactInstance.setState({collections:library.collections});
	} );
	//library.listen("selectCollection", Zotero.ui.widgets.reactcollections.selectCollection, {widgetEl: el});
	//library.listen("selectedCollectionChanged", Zotero.ui.widgets.reactcollections.updateSelectedCollection, {widgetEl: el});
	
	//Zotero.ui.widgets.reactcollections.bindCollectionLinks(el);
};

Zotero.ui.widgets.reactcollections.syncCollections = function(evt) {
	Zotero.debug("Zotero eventful syncCollectionsCallback", 3);
	var widgetEl = J(evt.data.widgetEl);
	//Zotero.ui.showSpinner(J(widgetEl).find("#collection-list-container") );
	var loadingPromise = widgetEl.data('loadingPromise');
	if(loadingPromise){
		var p = widgetEl.data('loadingPromise');
		return p.then(function(){
			return Zotero.ui.widgets.reactcollections.syncCollections(evt);
		});
	}
	
	//get Zotero.Library object if already bound to element
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	//update the widget as soon as we have the cached collections
	Zotero.ui.widgets.reactcollections.reactInstance.setState({collections:library.collections});
	
	//sync collections if loaded from cache but not synced
	return library.loadUpdatedCollections()
	.then(function(){
		library.trigger("libraryCollectionsUpdated");
	},
	function(err){
		//sync failed, but we already had some data, so show that
		Z.error("Error syncing collections");
		Z.error(err);
		library.trigger("libraryCollectionsUpdated");
		Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", 'error');
	}).then(function(){
		widgetEl.removeData('loadingPromise');
	});
};


Zotero.ui.widgets.reactcollections.rerenderCollections = function(evt){
	Zotero.debug("Zotero.ui.widgets.reactcollections.rerenderCollections", 3);
	var widgetEl = J(evt.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	Zotero.ui.widgets.reactcollections.reactInstance.setState({collections:library.collections});
	return;
};


var CollectionRow = React.createClass({
	getDefaultProps: function(){
		return {
			collection:null,
			selectedCollection:"",
			depth:0,
			expandedCollections: {}
		};
	},
	handleCollectionClick: function(evt){
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		//if current collect
		Zotero.ui.widgets.reactcollections.reactInstance.setState({currentCollectionKey:collectionKey});
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		Zotero.state.pushState();
	},
	handleTwistyClick: function(evt){
		Z.debug("handleTwistyClick");
		//toggle expanded state for this collection
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		var exp = this.props.expandedCollections;
		if(exp[collectionKey]) {
			delete exp[collectionKey];
		} else {
			exp[collectionKey] = true;
		}
		Zotero.ui.widgets.reactcollections.reactInstance.setState({expandedCollections:exp});
		
	},
	render: function() {
		Z.debug("CollectionRow render");
		if(this.props.collection == null){
			return null;
		}
		var collection = this.props.collection;
		var collectionKey = collection.get('key');
		var selectedCollection = this.props.selectedCollection;
		var expandedCollections = this.props.expandedCollections;
		var expanded = expandedCollections[collectionKey] === true;
		var isSelectedCollection = (this.props.selectedCollection == collectionKey);
		
		var childRows = [];
		collection.children.forEach(function(collection, ind) {
			childRows.push(
				<CollectionRow 
					key={collection.get('key')}
					collection={collection}
					selectedCollection={selectedCollection}
					expandedCollections={expandedCollections} />
			);
		});
		var childrenList = null;
		if(collection.hasChildren){
			childrenList = (
				<ul hidden={!expanded}>
					{childRows}
				</ul>
			);
		}
		
		var placeholderClasses = "placeholder small-icon light-icon pull-left";
		if(expandedCollections[collectionKey] === true) {
			placeholderClasses += " glyphicon glyphicon-chevron-down clickable";
		} else if(childRows.length > 0) {
			placeholderClasses += " glyphicon glyphicon-chevron-right clickable";
		}

		return (
			<li className="collection-row">
				<div className="folder-toggle">
					<span className={placeholderClasses} onClick={this.handleTwistyClick}></span>
					<span className="fonticon glyphicons glyphicons-folder-open barefonticon"></span>
				</div>
				<a href={collection.websiteCollectionLink} className={isSelectedCollection ? "current-collection" : ""} onClick={this.handleCollectionClick}>
					{collection.get('name')}
				</a>
				{childrenList}
			</li>
		);
	}
});

var TrashRow = React.createClass({
	getDefaultProps: function(){
		return {
			collectionKey:"trash",
			selectedCollection:""
		};
	},
	handleClick: function() {
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = this.props.collectionKey;
		Zotero.state.pushState();
	},
	render: function() {
		Z.debug("TrashRow render");
		var className = (this.props.selectedCollection == this.props.collectionKey ? "collection-row current-collection" : "collection-row" );
		
		return (
			<li className={className}>
				<div className="folder-toggle">
					<span className="sprite-placeholder sprite-icon-16 pull-left dui-icon"></span>
					<span className="glyphicons fonticon glyphicons-bin barefonticon"></span>
				</div>
				Trash
			</li>
		);
	}
});

var Collections = React.createClass({
	getDefaultProps: function() {
		return{
			initialCollectionKey: null
		}
	},
	getInitialState: function() {
		return {
			collections: null,
			currentCollectionKey:this.props.initialCollectionKey,
			expandedCollections: {}
		};
	},
	render: function() {
		Z.debug("Collections render");
		Z.debug(this.state);
		var collections = this.state.collections;
		if(collections == null){
			return null;
		}
		
		var collectionsArray = this.state.collections.collectionsArray;
		var currentCollectionKey = this.state.currentCollectionKey;
		var libraryUrlIdentifier = "";
		//var libraryUrlIdentifier = (collections == null ? "" : collections.libraryUrlIdentifier);
		
		//Set of collections in an expanded state
		var expandedCollections = this.state.expandedCollections;

		//path from top level collection to currently selected collection, to ensure that we expand
		//them all and the current collection is visible
		var currentCollectionPath = [];
		if(currentCollectionKey !== null){
			var currentCollection = collections.getCollection(currentCollectionKey);
			var c = currentCollection;
			while(true){
				if(c && !c.topLevel){
					var parentCollectionKey = c.get('parentCollection');
					c = collections.getCollection(parentCollectionKey);
					currentCollectionPath.push(parentCollectionKey);
					expandedCollections[parentCollectionKey] = true;
				} else {
					break;
				}
			}
		}
		Z.debug("currentCollectionPath : expandedCollections");
		Z.debug(currentCollectionPath);
		Z.debug(expandedCollections);

		var collectionRows = [];
		collectionsArray.forEach(function(collection, ind){
			if(collection.topLevel){
				collectionRows.push(<CollectionRow
					key={collection.get('key')}
					collection={collection}
					selectedCollection={currentCollectionKey}
					expandedCollections={expandedCollections} />
				);
			}
		});
		
		return (
			<div id="collection-list-container" className="collection-list-container">
				<ul id="collection-list">
					<li>
						<span className="glyphicons fonticon glyphicons-inbox barefonticon"></span>
						<a className="my-library" href={"/" + libraryUrlIdentifier + "/items"}>Library</a>
					</li>
					{collectionRows}
					
				</ul>
			</div>
		);
	}
});
