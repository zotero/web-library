'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:LibrariesCollections');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var CollectionRow = React.createClass({
	getDefaultProps: function(){
		return {
			collection:null,
			selectedCollection:'',
			depth:0,
			expandedCollections: {}
		};
	},
	selectLibrary: function(){
		let library = this.props.collection.owningLibrary;
		if(Zotero.state.library.libraryString == library.libraryString){
			return;
		}
		Zotero.state.library = library;
		Zotero.state.clearUrlVars();
		Zotero.state.pushState();
	},
	handleCollectionClick: function(evt){
		log.debug('handleCollectionClick');
		evt.preventDefault();
		this.selectLibrary();
		let collectionKey = this.props.collection.get('collectionKey');
		//if current collect
		Zotero.state.clearUrlVars();
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		Zotero.state.pushState();
	},
	handleTwistyClick: function(evt){
		log.debug('handleTwistyClick', 3);
		//toggle expanded state for this collection
		evt.preventDefault();
		let collectionKey = this.props.collection.get('collectionKey');
		let exp = this.props.expandedCollections;
		if(exp[collectionKey]) {
			delete exp[collectionKey];
		} else {
			exp[collectionKey] = true;
		}
		this.props.baseCollectionsInstance.setState({expandedCollections:exp});
		
	},
	render: function() {
		if(this.props.collection == null){
			return null;
		}
		let collection = this.props.collection;
		let collectionKey = collection.get('key');
		let selectedCollection = this.props.selectedCollection;
		let expandedCollections = this.props.expandedCollections;
		let expanded = expandedCollections[collectionKey] === true;
		let isSelectedCollection = (this.props.selectedCollection == collectionKey);
		
		let childrenList = null;
		if(collection.hasChildren && expanded){
			childrenList = collection.children.map((collection)=>{
				let key = collection.get('key');
				return (
					<ul key={key}>
						<CollectionRow 
							key={key}
							collection={collection}
							selectedCollection={selectedCollection}
							expandedCollections={expandedCollections}
							baseCollectionsInstance={this.props.baseCollectionsInstance} />
					</ul>
				);
			});
		}
		
		return (
			<li className="collection-row">
				<div className="folder-toggle">
					<Twisty hasChildren={collection.hasChildren} handleClick={this.handleTwistyClick} open={expanded} />
					<span className="fonticon glyphicons glyphicons-folder-open barefonticon"></span>
				</div>
				<span className={isSelectedCollection ? 'current-collection collection' : 'collection'} onClick={this.handleCollectionClick}>
					{collection.get('name')}
				</span>
				{childrenList}
			</li>
		);
	}
});

var Twisty = React.createClass({
	getDefaultProps: function(){
		return {
			hasChildren: false,
			open:false,
			handleClick: function(){}
		};
	},
	render: function(){
		let placeholderClasses = 'placeholder small-icon light-icon pull-left clickable';
		if(this.props.open){
			placeholderClasses += ' glyphicon glyphicon-chevron-down';
		} else if(this.props.hasChildren) {
			placeholderClasses += ' glyphicon glyphicon-chevron-right';
		} else {
			
		}

		return (<span className={placeholderClasses} onClick={this.props.handleClick}></span>);
	}
});

var TrashRow = React.createClass({
	getDefaultProps: function(){
		return {
			collectionKey:'trash',
			selectedCollection:''
		};
	},
	handleClick: function() {
		Zotero.state.clearUrlVars();
		Zotero.state.pathVars['collectionKey'] = this.props.collectionKey;
		Zotero.state.pushState();
	},
	render: function() {
		var className = (this.props.selectedCollection == this.props.collectionKey ? 'collection-row current-collection' : 'collection-row' );
		
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

var GroupLibraries = React.createClass({
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
	componentWillMount: function(){
		//this.loadLibraries();
	},
	render: function(){
		let libraryRows = this.state.accessibleLibraries.map((lib) => {
			return (
				<li key={lib.libraryString}>
					{lib.name}
				</li>
			);
		});
		return (
			<div id='group-libraries'>
				<ul>
					{libraryRows}
				</ul>
			</div>
		);
	}
});

var UserLibraries = React.createClass({
	componentWillMount: function(){
	},
	getDefaultProps: function() {
		return {
			libraries:{},
			groups: [],
			currentLibrary: '',
			expandedLibraries:{}
		};
	},
	getInitialState: function() {
		let expandedLibraries = this.props.expandedLibraries;
		expandedLibraries[this.props.currentLibrary] = true;

		return {
			expandedLibraries: expandedLibraries
		};
	},
	render: function(){
		log.debug('UserLibraries render');
		let user = Zotero.config.loggedInUser;
		let libraries = this.props.libraries;
		let userLibraryString = `u${user.userID}`;
		let userLibrary = libraries[userLibraryString];

		let userLibraryComponent = <LibraryCollections library={userLibrary} name='My Library' currentLibrary={userLibraryString == this.props.currentLibrary} />;
		
		log.debug(this.props.groups);
		let groupLibraryComponents = this.props.groups.map((group)=>{
			//log.debug(`group: ${group.get('name')}`);
			let libString = `g${group.get('id')}`;
			let groupLibrary = libraries[libString];
			
			return (
				<LibraryCollections 
					key={libString}
					library={groupLibrary}
					name={group.get('name')}
					currentLibrary={this.props.currentLibrary == groupLibrary.libraryString} 
				/>
			);
		});
		return (
			<div id="libraries">
				{userLibraryComponent}
				{groupLibraryComponents}
			</div>
		);
	}
});

var GroupLibraryRow = React.createClass({
	render: function(){

	}
});

var LibraryCollections = React.createClass({
	getDefaultProps: function() {
		return {
			startExpanded:false
		};
	},
	getInitialState: function() {
		let initialCollectionKey = Zotero.state.getUrlVar('collectionKey');
		let expanded = (this.props.startExpanded || this.props.currentLibrary);
		return {
			expanded: expanded,
			currentLibrary: this.props.currentLibrary,
			currentCollectionKey:initialCollectionKey,
			expandedCollections: {},
			loading:false
		};
	},
	componentWillMount: function() {
	},
	selectLibrary: function(evt) {
		//set the url to this library's base url
		let library = this.props.library;
		if(Zotero.state.library.libraryString == library.libraryString){
			return;
		}
		Zotero.state.library = library;
		Zotero.state.clearUrlVars();
		Zotero.state.pushState();
	},
	returnToLibrary: function(evt) {
		evt.preventDefault();
		let library = this.props.library;
		Zotero.state.library = library;
		Zotero.state.clearUrlVars();
        Zotero.state.pushState();
        Zotero.trigger('libraryChanged');
	},
	handleTwistyClick: function(){
		if(this.state.expanded){
			this.setState({expanded:false});
		} else {
			this.setState({expanded:true});
		}
	},
	render: function() {
		log.debug(`Collections render: ${this.props.name}`, 3);
		let reactInstance = this;
		let baseCollectionsInstance = this;
		let library = this.props.library;
		let collectionRows = null;
		let alldocsClassName = 'collection';
		let allDocsEntry = null;

		if(this.state.expanded){
			let collections = library.collections;
			if(collections == null){
				return null;
			}
			
			let collectionsArray = collections.collectionsArray;
			//let currentCollectionKey = this.state.currentCollectionKey;
			let currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
			
			//Set of collections in an expanded state
			let expandedCollections = this.state.expandedCollections;

			//path from top level collection to currently selected collection, to ensure that we expand
			//them all and the current collection is visible
			let currentCollectionPath = [];
			if(currentCollectionKey !== null){
				let currentCollection = collections.getCollection(currentCollectionKey);
				let c = currentCollection;
				while(true){
					if(c && !c.topLevel){
						let parentCollectionKey = c.get('parentCollection');
						c = collections.getCollection(parentCollectionKey);
						currentCollectionPath.push(parentCollectionKey);
						expandedCollections[parentCollectionKey] = true;
					} else {
						break;
					}
				}
			}
			
			collectionRows = collectionsArray.map((collection)=>{
				if(collection.topLevel){
					return (
						<CollectionRow
							key={collection.get('key')}
							collection={collection}
							selectedCollection={currentCollectionKey}
							expandedCollections={expandedCollections}
							baseCollectionsInstance={baseCollectionsInstance} />
					);
				}
			});
			
			if(currentCollectionKey == null && this.props.currentLibrary){
				alldocsClassName = 'current-collection collection';
			}

			allDocsEntry = (
				<li>
					<span className='collection placeholder small-icon light-icon pull-left'></span>
					<span className="glyphicons fonticon glyphicons-more-items barefonticon"></span>
					<span onClick={this.returnToLibrary} className={alldocsClassName}>All Documents</span>
				</li>
			);
		}

		return (
			<div className="collection-list-container">
				{/*<LoadingSpinner loading={this.state.loading} />*/}
				<ul id="collection-list">
					<li>
						<Twisty open={this.state.expanded} handleClick={this.handleTwistyClick} hasChildren={true} />
						<span className="glyphicons fonticon glyphicons-inbox barefonticon"></span>
						<span onClick={this.returnToLibrary} className='library clickable'>{this.props.name}</span>
					</li>
					{allDocsEntry}
					{collectionRows}
				</ul>
			</div>
		);
	}
});

module.exports = UserLibraries;
