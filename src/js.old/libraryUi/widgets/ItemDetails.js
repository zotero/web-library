'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemDetails');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');
var ItemAttachments = require('./ItemAttachments.js');
var ItemNotes = require('./ItemNotes.js');
var ItemTags = require('./ItemTags.js');
var ItemRelated = require('./ItemRelated.js');
var ItemField = require('./ItemField.js');

//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?

var genericDisplayedFields = function(item) {
	var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function(field){
		if(item.hideFields.indexOf(field) != -1) {
			return false;
		}
		if(!item.fieldMap.hasOwnProperty(field)){
			return false;
		}
		if(field == 'title' || field == 'creators' || field == 'itemType'){
			return false;
		}
		return true;
	});
	return genericDisplayedFields;
};

var CreatorRow = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
			library:null,
			creatorIndex: 0,
			edit: null
		};
	},
	render: function() {
		//log.debug("CreatorRow render");
		if(this.props.item == null){
			return null;
		}
		var item = this.props.item;
		var creator = item.get('creators')[this.props.creatorIndex];
		var nameSpans = null;
		if(creator.name && creator.name != '') {
			nameSpans = (
				<ItemField {... this.props} key="name" field="name" />
			);
		} else {
			nameSpans = [
				(<ItemField {... this.props} key="lastName" field="lastName" />),
				', ',
				(<ItemField {... this.props} key="firstName" field="firstName" />)
			];
		}
		return (
			<tr className="creator-row" >
				<th>
					<ItemField {... this.props} field="creatorType" />
				</th>
				<td>
					{nameSpans}
					<div className="btn-toolbar" role="toolbar">
						<ToggleCreatorFieldButton {...this.props} />
						<AddRemoveCreatorFieldButtons {...this.props} />
					</div>
				</td>
			</tr>
		);
	}
});

var ToggleCreatorFieldButton = React.createClass({
	render: function() {
		//log.debug("ToggleCreatorFieldButton render");
		return (
			<div className="btn-group">
				<button type="button"
					className="switch-two-field-creator-link btn btn-default"
					title="Toggle single field creator"
					data-itemkey={this.props.item.get('key')}
					data-creatorindex={this.props.creatorIndex}
					onClick={this.switchCreatorFields}>
					<span className="fonticon glyphicons glyphicons-unchecked"></span>
				</button>
			</div>
		);
	},
	switchCreatorFields: function(evt) {
		//log.debug("CreatorRow switchCreatorFields");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		var creator = creators[creatorIndex];

		//split a single name creator into first/last, or combine first/last
		//into a single name
		if(creator.name !== undefined){
			var split = creator.name.split(' ');
			if(split.length > 1){
				creator.lastName = split.splice(-1, 1)[0];
				creator.firstName = split.join(' ');
			}
			else{
				creator.lastName = creator.name;
				creator.firstName = '';
			}
			delete creator.name;
		} else {
			if(creator.firstName === '' && creator.lastName === '') {
				creator.name = '';
			} else {
				creator.name = creator.firstName + ' ' + creator.lastName;
			}
			delete creator.firstName;
			delete creator.lastName;
		}

		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({item:item});
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	render: function() {
		//log.debug("AddRemoveCreatorFieldButtons render");
		return (
			<div className="btn-group">
				<button type="button"
					className="btn btn-default"
					data-creatorindex={this.props.creatorIndex}
					onClick={this.removeCreator}>
					<span className="fonticon glyphicons glyphicons-minus"></span>
				</button>
				<button type="button"
					className="btn btn-default"
					data-creatorindex={this.props.creatorIndex}
					onClick={this.addCreator}>
					<span className="fonticon glyphicons glyphicons-plus"></span>
				</button>
			</div>
		);
	},
	addCreator: function(evt) {
		log.debug('addCreator', 3);
		var item = this.props.item;
		var creatorIndex = this.props.creatorIndex;
		var creators = item.get('creators');
		var newCreator = {creatorType:'author', firstName:'', lastName:''};
		creators.splice(creatorIndex + 1, 0, newCreator);
		this.props.parentItemDetailsInstance.setState({
			item:item,
			edit: {
				field:'lastName',
				creatorIndex:creatorIndex+1
			}
		});
	},
	removeCreator: function(evt) {
		log.debug('removeCreator', 3);
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		creators.splice(creatorIndex, 1);
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({item:item});
	}
});

var ItemNavTabs = React.createClass({
	getDefaultProps: function() {
		return {
			item: null
		};
	},
	render: function() {
		log.debug('ItemNavTabs render', 4);
		if(this.props.item == null){
			return null;
		}
		if(!this.props.item.isSupplementaryItem()){
			return (
				<ul className="nav nav-tabs" role="tablist">
					<li role="presentation" className="active"><a href="#item-info-panel" aria-controls="item-info-panel" role="tab" data-toggle="tab">Info</a></li>
					<li role="presentation"><a href="#item-notes" aria-controls="item-notes" role="tab" data-toggle="tab">Notes</a></li>
					<li role="presentation"><a href="#item-tags" aria-controls="item-tags" role="tab" data-toggle="tab">Tags</a></li>
					<li role="presentation"><a href="#item-attachments" aria-controls="item-attachments" role="tab" data-toggle="tab">Attachments</a></li>
					<li role="presentation"><a href="#item-related" aria-controls="item-related" role="tab" data-toggle="tab">Related</a></li>
				</ul>
			);
		}
		return null;
	}
});

var ItemFieldRow = React.createClass({
	getDefaultProps: function(){
		return {
			item:null,
			edit:null
		};
	},
	render: function() {
		//log.debug("ItemFieldRow render");
		var item = this.props.item;
		var field = this.props.field;
		var placeholderOrValue = (
			<ItemField item={item} field={field} edit={this.props.edit} parentItemDetailsInstance={this.props.parentItemDetailsInstance} />
		);
		
		if(field == 'url'){
			var url = item.get('url');
			return (
				<tr>
					<th><a rel='nofollow' href={url}>{item.fieldMap[field]}</a></th>
					<td className={field}>
						{placeholderOrValue}
					</td>
				</tr>
			);
		} else if(field == 'DOI') {
			var doi = item.get('DOI');
			return (
				<tr>
					<th><a rel='nofollow' href={'http://dx.doi.org/' + doi}>{item.fieldMap[field]}</a></th>
					<td className={field}>
						{placeholderOrValue}
					</td>
				</tr>
			);
		} else if(Zotero.config.richTextFields[field]) {
			return (
				<tr>
					<th>{item.fieldMap[field]}}</th>
					<td className={field}>
						{placeholderOrValue}
					</td>
				</tr>
			);
		} else {
			return (
				<tr>
					<th>{(item.fieldMap[field] || field)}</th>
					<td className={field}>
						{placeholderOrValue}
					</td>
				</tr>
			);
		}
	}
});


var ItemInfoPanel = React.createClass({
	componentWillMount: function() {
	},
	getDefaultProps: function() {
		return {
			item: null,
			loading: false,
			edit:null
		};
	},
	getInitialState:function() {
		return {libraryItemsLoaded: false};
	},
	render: function() {
		log.debug('ItemInfoPanel render', 3);
		var reactInstance = this;
		var library = this.props.library;
		var item = this.props.item;
		var itemCountP = (
			<p className='item-count' hidden={!this.state.libraryItemsLoaded}>
				{library.items.totalResults + ' items in this view'}
			</p>
		);
		
		var edit = this.props.edit;
		
		if(item == null){
			return (
				<div id="item-info-panel" role="tabpanel" className="item-details-div tab-pane active">
					<LoadingSpinner loading={this.props.loading} />
					{itemCountP}
				</div>
			);
		}
		
		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;
		var parentUrl = false;
		if(item.get('parentItem')) {
			parentUrl = library.websiteUrl({itemKey:item.get('parentItem')});
		}
		
		var parentLink = parentUrl ? <a href={parentUrl} className="item-select-link" data-itemkey={item.get('parentItem')}>Parent Item</a> : null;
		var libraryIDSpan;
		if(libraryType == 'user') {
			libraryIDSpan = <span id="libraryUserID" title={item.apiObj.library.id}></span>;
		} else {
			libraryIDSpan = <span id="libraryGroupID" title={item.apiObj.library.id}></span>;
		}
		
		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if(libraryType == 'group') {
			let createdByUser = item.get('createdByUser');
			if(createdByUser){
				zoteroItemCreatorRow = (
					<tr>
						<th>Added by</th>
						<td className="user-creator"><a href={createdByUser.links.alternate.href} className="user-link">{createdByUser.name}</a></td>
					</tr>
				);
			}
		}
		
		var creatorRows = [];
		var creators = item.get('creators');
		if(creators.length == 0){
			creators.push({
				lastName: '',
				firstName: ''
			});
		}
		
		if(item.isSupplementaryItem()){
			creatorRows = null;
		} else {
			creatorRows = item.get('creators').map(function(creator, ind) {
				return (
					<CreatorRow key={ind} library={library} creatorIndex={ind} item={item} edit={edit} parentItemDetailsInstance={reactInstance.props.parentItemDetailsInstance} />
				);
			});
		}
		
		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genDisplayedFields = genericDisplayedFields(item);
		genDisplayedFields.forEach(function(key) {
			genericFieldRows.push(<ItemFieldRow key={key} {...reactInstance.props} field={key} />);
		});

		var typeAndTitle = ['itemType', 'title'].map(function(key){
			return (
				<ItemFieldRow key={key} {...reactInstance.props} field={key} />
			);
		});


		return (
			<div id="item-info-panel" role="tabpanel" className="item-details-div tab-pane active">
				<LoadingSpinner loading={this.props.loading} />
				{parentLink}
				{libraryIDSpan}
				<table className="item-info-table table" data-itemkey={itemKey}>
					<tbody>
						{zoteroItemCreatorRow}
						{typeAndTitle}
						{creatorRows}
						{genericFieldRows}
					</tbody>
				</table>
			</div>
		);
	}
});

var ItemDetails = React.createClass({
	getInitialState: function() {
		return {
			item: null,
			childItems: [],
			itemLoading:false,
			childrenLoading:false,
			libraryItemsLoaded:false,
			edit: null
		};
	},
	componentWillMount: function() {
		
	},
	componentDidMount: function() {
	},
	loadItem: function() {
		log.debug('Zotero eventful loadItem', 3);
		var reactInstance = this;
		var library = this.props.library;
		
		//clean up RTEs before we end up removing their dom elements out from under them
		//Zotero.ui.cleanUpRte(widgetEl);
		
		//get the key of the item we need to display, or display library stats
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if(!itemKey){
			log.debug('No itemKey - ' + itemKey, 3);
			reactInstance.setState({item:null});
			return Promise.reject(new Error('No itemkey - ' + itemKey));
		}
		
		//if we are showing an item, load it from local library of API
		//then display it
		var loadedItem = library.items.getItem(itemKey);
		var loadingPromise;
		if(loadedItem){
			log.debug('have item locally, loading details into ui', 3);
			loadingPromise = Promise.resolve(loadedItem);
		} else{
			log.debug('must fetch item from server', 3);
			reactInstance.setState({itemLoading:true});
			loadingPromise = library.loadItem(itemKey);
		}
		
		loadingPromise.then(function(item){
			loadedItem = item;
		}).then(function(){
			return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
		}).then(function(creatorTypes){
			reactInstance.setState({item:loadedItem, itemLoading:false});
			library.trigger('showChildren');
			//Zotero.eventful.initTriggers(widgetEl);
			try{
				//trigger event for Zotero translator detection
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent('ZoteroItemUpdated', true, true);
				document.dispatchEvent(ev);
			} catch(e){
				log.error('Error triggering ZoteroItemUpdated event');
			}
		});
		loadingPromise.catch(function(err){
			log.error('loadItem promise failed');
			log.error(err);
		}).then(function(){
			reactInstance.setState({itemLoading: false});
		}).catch(Zotero.catchPromiseError);
		
		return loadingPromise;
	},
	refreshChildren: function() {
		log.debug('reactitem.refreshChildren', 3);
		var reactInstance = this;
		var library = this.props.library;
		
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if(!itemKey){
			log.debug('No itemKey - ' + itemKey, 3);
			return Promise.reject(new Error('No itemkey - ' + itemKey));
		}
		
		var item = library.items.getItem(itemKey);
		reactInstance.setState({loadingChildren:true});
		var p = item.getChildren(library)
		.then(function(childItems){
			let notes = [];
			let attachments = [];
			childItems.forEach((child) => {
				let type = child.get('itemType');
				if(type == 'note') {
					notes.push(child);
				} else if(type == 'attachment') {
					attachments.push(child);
				}
			});
			reactInstance.setState({notes:notes, attachments:attachments, loadingChildren:false});
		}).catch(Zotero.catchPromiseError);
		return p;
	},
	updateTypeahead: function() {
		log.debug('updateTypeahead', 3);
		return;
	},
	addTagTypeahead: function() {
		//TODO: reactify
	},
	addTagTypeaheadToInput: function() {
		//TODO: reactify
	},
	render: function() {
		log.debug('ItemDetails render', 3);
		let reactInstance = this;
		let library = this.props.library;
		let item = this.state.item;
		let notes = this.state.notes;
		let attachments = this.state.attachments;

		return (
			<div role="tabpanel">
				<ItemNavTabs library={library} item={item} />

				<div className="tab-content">
					<ItemInfoPanel library={library}
						item={item}
						loading={this.state.itemLoading}
						libraryItemsLoaded={this.state.libraryItemsLoaded} 
						edit={this.state.edit}
						parentItemDetailsInstance={reactInstance}
					/>
					<ItemNotes library={library} item={item} notes={notes} />
					<ItemTags library={library} item={item} />
					<ItemAttachments library={library} item={item} attachments={attachments} />
					<ItemRelated library={library} item={item} />
					{/*
					<ItemChildrenPanel parentItemDetailsInstance={reactInstance} library={library} childItems={childItems} loading={this.state.childrenLoading} />
					<ItemTags parentItemDetailsInstance={reactInstance} library={library} item={item} edit={this.state.edit} />
					*/}
				</div>
			</div>
		);
	}
});

module.exports = ItemDetails;
