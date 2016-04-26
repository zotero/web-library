'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:ItemDetails');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?

var editMatches = function(props, edit) {
	if(props === null || edit === null){
		return false;
	}
	if(edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if(edit.creatorIndex != props.creatorIndex) {
		//log.debug("creatorIndex mismatch");
		return false;
	}
	if(props.tagIndex != edit.tagIndex) {
		//log.debug("tagIndex mismatch");
		return false;
	}
	return true;
};

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
					<li role="presentation"><a href="#item-children-panel" aria-controls="item-children-panel" role="tab" data-toggle="tab">Children</a></li>
					<li role="presentation"><a href="#item-tags-panel" aria-controls="item-tags-panel" role="tab" data-toggle="tab">Tags</a></li>
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

//set onChange
var ItemField = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
			field:null,
			edit:null,
			creatorIndex: null,
			tagIndex: null
		};
	},
	handleChange: function(evt) {
		//set field to new value
		var item = this.props.item;
		switch(this.props.field) {
			case 'creatorType':
			case 'name':
			case 'firstName':
			case 'lastName':
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			case 'tag':
				var tags = item.get('tags');
				var tag = tags[this.props.tagIndex];
				tag.tag = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		this.props.parentItemDetailsInstance.setState({item:item});
	},
	handleBlur: function(evt) {
		//save item, move edit to next field
		this.handleChange(evt);
		this.props.parentItemDetailsInstance.setState({edit:null});
		Zotero.ui.saveItem(this.props.item);
	},
	handleFocus: function(evt) {
		var field = J(evt.currentTarget).data('field');
		var creatorIndex = J(evt.target).data('creatorindex');
		var tagIndex = J(evt.target).data('tagindex');
		var edit = {
			field: field,
			creatorIndex: creatorIndex,
			tagIndex: tagIndex
		};
		this.props.parentItemDetailsInstance.setState({
			edit: edit
		});
	},
	checkKey: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			//var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			J(evt.target).blur();
		}
	},
	render: function(){
		var item = this.props.item;
		var field = this.props.field;
		var creatorField = false;
		var tagField = false;
		var value;
		switch(field){
			case 'creatorType':
			case 'name':
			case 'firstName':
			case 'lastName':
				creatorField = true;
				var creatorIndex = this.props.creatorIndex;
				var creator = item.get('creators')[creatorIndex];
				value = creator[field];
				var creatorPlaceHolders = {
					'name': '(name)',
					'lastName': '(Last Name)',
					'firstName': '(First Name)'
				};
				
				break;
			case 'tag':
				tagField = true;
				var tagIndex = this.props.tagIndex;
				var tag = item.get('tags')[tagIndex];
				value = tag.tag;
				break;
			default:
				value = item.get(field);
		}

		var editThisField = editMatches(this.props, this.props.edit);
		if(!editThisField){
			var spanProps = {
				className: 'editable-item-field',
				tabIndex: 0,
				'data-field': field,
				onFocus: this.handleFocus
			};

			var p = null;
			if(creatorField){
				spanProps.className += ' creator-field';
				spanProps['data-creatorindex'] = this.props.creatorIndex;
				p = value == '' ? creatorPlaceHolders[field] : value;
			} else if(tagField){
				spanProps.className += ' tag-field';
				spanProps['data-tagindex'] = this.props.tagIndex;
				p = value;
			} else {
				p = value == '' ? (<div className="empty-field-placeholder"></div>) : Zotero.format.itemField(field, item);
			}
			return (
				<span {...spanProps}>
					{p}
				</span>
			);
		}
		
		var focusEl = function(el) {
			if (el != null) {
				el.focus();
			}
		};

		var inputProps = {
			className: ('form-control item-field-control ' + this.props.field),
			name: field,
			defaultValue: value,
			//onChange: this.handleChange,
			onKeyDown: this.checkKey,
			onBlur: this.handleBlur,
			creatorindex: this.props.creatorIndex,
			tagindex: this.props.tagIndex,
			ref: focusEl
		};
		if(creatorField){
			inputProps.placeholder = creatorPlaceHolders[field];
		}

		switch(this.props.field) {
			case null:
				return null;
				break;
			case 'itemType':
				var itemTypeOptions = item.itemTypes.map(function(itemType){
					return (
						<option key={itemType.itemType}
							label={itemType.localized}
							value={itemType.itemType}>
							{itemType.localized}
						</option>
					);
				});
				return (
					<select {...inputProps}>
						{itemTypeOptions}
					</select>
				);
				break;
			case 'creatorType':
				var creatorTypeOptions = item.creatorTypes[item.get('itemType')].map(function(creatorType){
					return (
						<option key={creatorType.creatorType}
							label={creatorType.localized}
							value={creatorType.creatorType}
						>
							{creatorType.localized}
						</option>
					);
				});
				return (
					<select id="creatorType" {...inputProps} data-creatorindex={this.props.creatorIndex}>
						{creatorTypeOptions}
					</select>
				);
				break;
			default:
				if(Zotero.config.largeFields[this.props.field]) {
					return (
						<textarea {...inputProps}></textarea>
					);
				} else if (Zotero.config.richTextFields[this.props.field]) {
					return (
						<textarea {...inputProps} className="rte default"></textarea>
					);
				} else {
					//default single line input field
					return (
						<input type='text' {...inputProps} />
					);
				}
		}
	}
});

var ItemInfoPanel = React.createClass({
	getDefaultProps: function() {
		return {
			item: null,
			loading: false,
			edit:null
		};
	},
	render: function() {
		log.debug('ItemInfoPanel render', 3);
		var reactInstance = this;
		var library = this.props.library;
		var item = this.props.item;
		var itemCountP = (
			<p className='item-count' hidden={!this.props.libraryItemsLoaded}>
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
			zoteroItemCreatorRow = (
				<tr>
					<th>Added by</th>
					<td className="user-creator"><a href={item.apiObj.meta.createdByUser.links.alternate.href} className="user-link">{item.apiObj.meta.createdByUser.name}</a></td>
				</tr>
			);
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

var TagListRow = React.createClass({
	getDefaultProps: function(){
		return {
			tagIndex:0,
			tag:{tag:''},
			item:null,
			library:null,
			edit:null
		};
	},
	removeTag: function(evt) {
		var tag = this.props.tag.tag;
		var item = this.props.item;
		var tagIndex = this.props.tagIndex;

		var tags = item.get('tags');
		tags.splice(tagIndex, 1);
		Zotero.ui.saveItem(item);
		this.props.parentItemDetailsInstance.setState({item:item});
	},
	render: function() {
		return (
			<div className="row item-tag-row">
				<div className="col-xs-1">
					<span className="glyphicons fonticon glyphicons-tag"></span>
				</div>
				<div className="col-xs-9">
					<ItemField {... this.props} field="tag" />
				</div>
				<div className="col-xs-2">
					<button type="button" className="remove-tag-link btn btn-default" onClick={this.removeTag} >
						<span className="glyphicons fonticon glyphicons-minus"></span>
					</button>
				</div>
			</div>
		);
	}
});

var ItemTagsPanel = React.createClass({
	getInitialState: function() {
		return {
			newTagString: ''
		};
	},
	newTagChange: function(evt) {
		this.setState({newTagString: evt.target.value});
	},
	//add the new tag to the item and save if keydown is ENTER
	checkKey: function(evt) {
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			var item = this.props.item;
			var tags = item.get('tags');
			tags.push({
				tag: evt.target.value
			});
			Zotero.ui.saveItem(item);
			this.setState({newTagString:''});
			this.props.parentItemDetailsInstance.setState({item:item});
		}
	},
	render: function() {
		log.debug('ItemTagsPanel render', 3);
		var reactInstance = this;
		var item = this.props.item;
		var library = this.props.library;
		if(item == null) {
			return (
				<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
				</div>
			);
		}
		
		var tagRows = item.apiObj.data.tags.map(function(tag, ind){
			return (
				<TagListRow key={tag.tag} {...reactInstance.props} tag={tag} tagIndex={ind} />
			);
		});
		
		return (
			<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
				<p><span className="tag-count">{item.get('tags').length}</span> tags</p>
				<button className="add-tag-button btn btn-default">Add Tag</button>
				
				<div className="item-tags-list">
					{tagRows}
				</div>
				<div className="add-tag-form form-horizontal">
					<div className="form-group">
						<div className="col-xs-1">
							<label htmlFor="add-tag-input"><span className="glyphicons fonticon glyphicons-tag"></span></label>
						</div>
						<div className="col-xs-11">
							<input type="text" onKeyDown={this.checkKey} onChange={this.newTagChange} value={this.state.newTagString} id="add-tag-input" className="add-tag-input form-control" />
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var ItemChildrenPanel = React.createClass({
	getDefaultProps: function() {
		return {
			childItems: []
		};
	},
	triggerUpload: function() {
		this.props.library.trigger('uploadAttachment');
	},
	render: function() {
		log.debug('ItemChildrenPanel render', 3);
		var childListEntries = this.props.childItems.map(function(item){
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			var key = item.get('key');
			if(item.itemType == 'note'){
				return (
					<li key={key}>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>{title}</a>
					</li>
				);
			} else if(item.attachmentDownloadUrl == false) {
				return (
					<li key={key}>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						{title}
						(<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>Attachment Details</a>)
					</li>
				);
			} else {
				var attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
				return (
					<li key={key}>
						<span className={'fonticon barefonticon ' + iconClass}></span>
						<a className='itemdownloadlink' href={attachmentDownloadUrl}>{title} {Zotero.url.attachmentFileDetails(item)}</a>
						(<a className='item-select-link' data-itemkey={item.get('key')} href={href} title={title}>Attachment Details</a>)
					</li>
				);
			}
		});
		return (
			<div id="item-children-panel" role="tabpanel" className="item-children-div tab-pane">
				<ul id="notes-and-attachments">
					{childListEntries}
				</ul>
				<button type="button" onClick={this.triggerUpload} id="upload-attachment-link" className="btn btn-primary upload-attachment-button" hidden={!Zotero.config.librarySettings.allowUpload}>Upload File</button>
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
		var reactInstance = this;
		var library = this.props.library;
		library.listen('displayedItemChanged', reactInstance.loadItem, {});
		library.listen('uploadSuccessful', reactInstance.refreshChildren, {});
		
		library.listen('tagsChanged', reactInstance.updateTypeahead, {});

		library.listen('showChildren', reactInstance.refreshChildren, {});
		
		library.trigger('displayedItemChanged');
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
			reactInstance.setState({childItems: childItems, loadingChildren:false});
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
		var reactInstance = this;
		var library = this.props.library;
		var item = this.state.item;
		var childItems = this.state.childItems;

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
					<ItemChildrenPanel parentItemDetailsInstance={reactInstance} library={library} childItems={childItems} loading={this.state.childrenLoading} />
					<ItemTagsPanel parentItemDetailsInstance={reactInstance} library={library} item={item} edit={this.state.edit} />
				</div>
			</div>
		);
	}
});

module.exports = ItemDetails;
