Zotero.ui.widgets.reactitem = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.reactitem.init = function(el){
	var library = Zotero.ui.getAssociatedLibrary(el);
	
	var reactInstance = ReactDOM.render(
		<ItemDetails library={library} />,
		document.getElementById('item-widget-div')
	);
	Zotero.ui.widgets.reactitem.reactInstance = reactInstance;
};

Zotero.ui.editMatches = function(props, edit) {
	//Z.debug("Zotero.ui.editMatches");
	//Z.debug(props);
	//Z.debug(edit);
	if(props === null || edit === null){
		return false;
	}
	if(edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if(edit.creatorIndex != props.creatorIndex) {
		//Z.debug("creatorIndex mismatch");
		return false;
	}
	if(props.tagIndex != edit.tagIndex) {
		//Z.debug("tagIndex mismatch");
		return false;
	}
	return true;
};

Zotero.ui.genericDisplayedFields = function(item) {
	var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function(field){
		if(item.hideFields.indexOf(field) != -1) {
			return false;
		}
		if(!item.fieldMap.hasOwnProperty(field)){
			return false;
		}
		if(field == "title" || field == "creators" || field == "itemType"){
			return false;
		}
		return true;
	});
	return genericDisplayedFields;
};

Zotero.ui.widgets.reactitem.editFields = function(item) {
	var fields = [
		{field:"itemType"},
		{field:"title"}
	];
	var creators = item.get('creators');
	creators.forEach(function(k, i) {
		fields.push({field:"creatorType", creatorIndex:i});
		if(k.name){
			fields.push({field:"name", creatorIndex:i});
		} else {
			fields.push({field:"lastName", creatorIndex:i});
			fields.push({field:"firstName", creatorIndex:i});
		}
	});
	
	var genericFields = Zotero.ui.genericDisplayedFields(item);
	genericFields.forEach(function(k, i){
		fields.push({field:k});
	});
	return fields;
};

//take an edit object and return the edit object selecting the next field of the item
Zotero.ui.widgets.reactitem.nextEditField = function(item, edit) {
	if(!edit || !edit.field){
		return null;
	}
	var editFields = Zotero.ui.widgets.reactitem.editFields(item);
	var curFieldIndex;
	for(var i = 0; i < editFields.length; i++){
		if(editFields[i].field == edit.field){
			if(editFields[i].creatorIndex == edit.creatorIndex){
				curFieldIndex = i;
			}
		}
	}
	if(curFieldIndex == editFields.length){
		return editFields[0];
	} else {
		return editFields[i+1];
	}
	/*
	//special case if editing a creator
	switch(edit.field) {
		case "title":
			return {
				creatorIndex: 0,
				field: "creatorType"
			};
			break;
		case "creatorType":
			var creators = item.get('creators');
			var creator = creators[edit.creatorIndex];
			if(creator.name){
				return {
					creatorIndex: edit.creatorIndex,
					field: "name"
				};
			} else {
				return {
					creatorIndex: edit.creatorIndex,
					field: "lastName"
				};
			}
			break;
		case "lastName":
			return {
				creatorIndex: edit.creatorIndex + 1,
				field: "firstName"
			};
			break;
		case "name":
		case "firstName":
			//move to next creator, or fields after creators
			if(edit.creatorIndex < creators.length){
				return {
					creatorIndex: edit.creatorIndex + 1,
					field:"creatorType"
				}
			} else {
				//move to first field after creators
				var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
				return {
					field: genericDisplayedFields[0]
				}
			}
			break;
		default:
			var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
			//if currently at the last field, go back up to title
			if(genericDisplayedFields[genericDisplayedFields.length - 1] == edit.field){
				return {
					field:"title"
				};
			}
			//otherwise, return the field at current edit field + 1
			for(var i = 0; i < genericDisplayedFields.length; i++){
				if(edit.field == genericDisplayedFields[i]){
					return {
						field:genericDisplayedFields[i + 1]
					};
				}
			}
	}
	*/
};

var CreatorRow = React.createClass({
	getDefaultProps: function() {
		return {
			item:null,
			library:null,
			creatorIndex: 0,
			edit: null,
		};
	},
	render: function() {
		//Z.debug("CreatorRow render");
		if(this.props.item == null){
			return null;
		}
		var item = this.props.item;
		var creator = item.get('creators')[this.props.creatorIndex];
		var edit = this.props.edit;
		var nameSpans = null;
		if(creator.name && creator.name != "") {
			nameSpans = (
				<ItemField {... this.props} key="name" field="name" />
			);
		} else {
			nameSpans = [
				(<ItemField {... this.props} key="lastName" field="lastName" />),
				", ",
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
		//Z.debug("ToggleCreatorFieldButton render");
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
		//Z.debug("CreatorRow switchCreatorFields");
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
			if(creator.firstName === "" && creator.lastName === "") {
				creator.name = "";
			} else {
				creator.name = creator.firstName + ' ' + creator.lastName;
			}
			delete creator.firstName;
			delete creator.lastName;
		}

		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:item});
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	render: function() {
		//Z.debug("AddRemoveCreatorFieldButtons render");
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
		Z.debug("addCreator");
		var item = this.props.item;
		var creatorIndex = this.props.creatorIndex;
		var creators = item.get('creators');
		var newCreator = {creatorType:"author", firstName:"", lastName:""};
		creators.splice(creatorIndex + 1, 0, newCreator);
		Zotero.ui.widgets.reactitem.reactInstance.setState({
			item:item,
			edit: {
				field:"lastName",
				creatorIndex:creatorIndex+1
			}
		});
	},
	removeCreator: function(evt) {
		Z.debug("removeCreator");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		creators.splice(creatorIndex, 1);
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:item});
	}
});

var ItemNavTabs = React.createClass({
	getDefaultProps: function() {
		return {
			item: null
		}
	},
	render: function() {
		Z.debug("ItemNavTabs render");
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
		//Z.debug("ItemFieldRow render");
		var item = this.props.item;
		var field = this.props.field;
		var placeholderOrValue = (
			<ItemField item={item} field={field} edit={this.props.edit} />
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
		Z.debug("change on ItemField");
		Z.debug(evt);
		//set field to new value
		var item = this.props.item;
		switch(this.props.field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			case "tag":
				var tags = item.get('tags');
				var tag = tags[this.props.tagIndex];
				tag.tag = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:item});
	},
	handleBlur: function(evt) {
		Z.debug("blur on ItemField");
		//save item, move edit to next field
		Z.debug("handleBlur");
		this.handleChange(evt);
		Zotero.ui.widgets.reactitem.reactInstance.setState({edit:null});
		Zotero.ui.saveItem(this.props.item);
	},
	handleFocus: function(evt) {
		Z.debug("focus on ItemField");
		var field = J(evt.target).data('field');
		var creatorIndex = J(evt.target).data('creatorindex');
		var tagIndex = J(evt.target).data('tagindex');
		var edit = {
			field: field,
			creatorIndex: creatorIndex,
			tagIndex: tagIndex
		};
		Z.debug(edit);
		Zotero.ui.widgets.reactitem.reactInstance.setState({
			edit: edit
		});
	},
	checkKey: function(evt) {
		Z.debug("ItemField checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			Z.debug("ItemField checkKey enter");
			Z.debug(evt);
			//var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			J(evt.target).blur();
			//Zotero.ui.widgets.reactitem.reactInstance.setState({edit:nextEdit});
		}
	},
	render: function(){
		//Z.debug("ItemField render");
		var item = this.props.item;
		var field = this.props.field;
		var creatorField = false;
		var tagField = false;
		var value;
		switch(field){
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
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
			case "tag":
				tagField = true;
				var tagIndex = this.props.tagIndex;
				var tag = item.get('tags')[tagIndex];
				value = tag.tag;
				break;
			default:
				value = item.get(field);
		}

		var editThisField = Zotero.ui.editMatches(this.props, this.props.edit);
		if(!editThisField){
			var spanProps = {
				className: "editable-item-field",
				tabIndex: 0,
				"data-field": field,
				onFocus: this.handleFocus
			};

			if(creatorField){
				spanProps['data-creatorindex'] = this.props.creatorIndex;
				var p = value == "" ? creatorPlaceHolders[field] : value;
			} else if(tagField){
				spanProps['data-tagindex'] = this.props.tagIndex;
				var p = value;
			} else {
				var p = value == "" ? (<div className="empty-field-placeholder"></div>) : Zotero.ui.formatItemField(field, item);
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
			className: ("form-control item-field-control " + this.props.field),
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
		Z.debug("ItemInfoPanel render");
		var reactInstance = this;
		var library = this.props.library;
		var item = this.props.item;
		Z.debug("ItemInfoPanel render: items.totalResults: " + library.items.totalResults);
		var itemCountP = (
			<p className='item-count' hidden={!this.props.libraryItemsLoaded}>
				{library.items.totalResults + " items in this view"}
			</p>
		);
		
		var edit = this.props.edit;
		
		if(item == null){
			return (
				<div id="item-info-panel" role="tabpanel" className="item-details-div tab-pane active">
					<LoadingSpinner loading={this.props.loading} />
					{itemCountP}
				</div>
			)
		}
		
		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;
		var parentUrl = false;
		if(item.get("parentItem")) {
			parentUrl = library.websiteUrl({itemKey:item.get("parentItem")});
		}
		
		var parentLink = parentUrl ? <a href={parentUrl} className="item-select-link" data-itemkey={item.get('parentItem')}>Parent Item</a> : null;
		var libraryIDSpan;
		if(libraryType == "user") {
			libraryIDSpan = <span id="libraryUserID" title={item.apiObj.library.id}></span>;
		} else {
			libraryIDSpan = <span id="libraryGroupID" title={item.apiObj.library.id}></span>
		}
		
		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if(libraryType == "group") {
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
				lastName: "",
				firstName: ""
			});
		}
		
		if(item.isSupplementaryItem()){
			creatorRows = null;
		} else {
			creatorRows = item.get('creators').map(function(creator, ind) {
				return (
					<CreatorRow key={ind} library={library} creatorIndex={ind} item={item} edit={edit} />
				);
			});
		}
		
		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
		genericDisplayedFields.forEach(function(key) {
			genericFieldRows.push(<ItemFieldRow key={key} {...reactInstance.props} field={key} />);
		});

		var typeAndTitle = ["itemType", "title"].map(function(key){
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
			tag:{tag:""},
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
		Zotero.ui.widgets.reactitem.reactInstance.setState({item:item});
	},
	render: function() {
		//Z.debug("TagListRow render");
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
			newTagString: ""
		};
	},
	newTagChange: function(evt) {
		this.setState({newTagString: evt.target.value});
	},
	//add the new tag to the item and save if keydown is ENTER
	checkKey: function(evt) {
		Z.debug("New tag checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER){
			Z.debug(evt);
			var item = this.props.item;
			var tags = item.get('tags');
			tags.push({
				tag: evt.target.value
			});
			Zotero.ui.saveItem(item);
			this.setState({newTagString:""});
			Zotero.ui.widgets.reactitem.reactInstance.setState({item:item});
		}
	},
	render: function() {
		Z.debug("ItemTagsPanel render");
		var reactInstance = this;
		var item = this.props.item;
		var library = this.props.library;
		if(item == null) {
			return (
				<div id="item-tags-panel" role="tabpanel" className="item-tags-div tab-pane">
				</div>
			);
		}
		var tagRows = [];
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
		}
	},
	triggerUpload: function() {
		this.props.library.trigger("uploadAttachment");
	},
	render: function() {
		Z.debug("ItemChildrenPanel render");
		var childListEntries = this.props.childItems.map(function(item, ind){
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			var key = item.get('key');
			if(item.itemType == "note"){
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
		}
	},
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemChanged modeChanged", reactInstance.loadItem, {});
		//library.listen("itemTypeChanged", Zotero.ui.widgets.reactitem.itemTypeChanged, {widgetEl:el});
		library.listen("uploadSuccessful", reactInstance.refreshChildren, {});
		
		library.listen("tagsChanged", reactInstance.updateTypeahead, {});

		library.listen("showChildren", reactInstance.refreshChildren, {});
		
		library.trigger("displayedItemChanged");
	},
	componentDidMount: function() {
		return;
		var reactInstance = this;
		var library = this.props.library;
		
		//add typeahead if there is a tag input
		var addTagInput = J("input.add-tag-input");
		var editTagInput = J("input.item-field-control.tag");
		
		var typeaheadSource = library.tags.plainList;
		if(!typeaheadSource){
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
		});
		ttEngine.initialize();
		addTagInput.typeahead('destroy');
		editTagInput.typeahead('destroy');

		addTagInput.typeahead(
			{
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'tags',
				displayKey: 'value',
				source: ttEngine.ttAdapter()
				//local: library.tags.plainList
			}
		);
		editTagInput.typeahead(
			{
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'tags',
				displayKey: 'value',
				source: ttEngine.ttAdapter()
				//local: library.tags.plainList
			}
		);
	},
	loadItem: function() {
		Z.debug('Zotero eventful loadItem', 3);
		var reactInstance = this;
		var library = this.props.library;
		
		//clean up RTEs before we end up removing their dom elements out from under them
		//Zotero.ui.cleanUpRte(widgetEl);
		
		//get the key of the item we need to display, or display library stats
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if(!itemKey){
			Z.debug("No itemKey - " + itemKey, 3);
			reactInstance.setState({item:null});
			return Promise.reject(new Error("No itemkey - " + itemKey));
		}
		
		//if we are showing an item, load it from local library of API
		//then display it
		var loadedItem = library.items.getItem(itemKey);
		if(loadedItem){
			Z.debug("have item locally, loading details into ui", 3);
			loadingPromise = Promise.resolve(loadedItem);
		} else{
			Z.debug("must fetch item from server", 3);
			var config = {
				'target':'item',
				'libraryType':library.type,
				'libraryID':library.libraryID,
				'itemKey':itemKey
			};
			reactInstance.setState({itemLoading:true});
			loadingPromise = library.loadItem(itemKey);
		}
		
		loadingPromise.then(function(item){
			loadedItem = item;
		}).then(function(){
			return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
		}).then(function(creatorTypes){
			Z.debug("done loading necessary data; displaying item");
			reactInstance.setState({item:loadedItem, itemLoading:false});
			library.trigger('showChildren');
			//Zotero.eventful.initTriggers(widgetEl);
			try{
				//trigger event for Zotero translator detection
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent('ZoteroItemUpdated', true, true);
				document.dispatchEvent(ev);
			} catch(e){
				Zotero.error("Error triggering ZoteroItemUpdated event");
			}
		});
		loadingPromise.catch(function(err){
			Z.error("loadItem promise failed");
			Z.error(err);
		}).then(function(){
			reactInstance.setState({itemLoading: false});
		}).catch(Zotero.catchPromiseError);
		
		return loadingPromise;
	},
	refreshChildren: function() {
		Z.debug('reactitem.refreshChildren', 3);
		var reactInstance = this;
		var library = this.props.library;
		
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if(!itemKey){
			Z.debug("No itemKey - " + itemKey, 3);
			return Promise.reject(new Error("No itemkey - " + itemKey));
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
		Z.debug("updateTypeahead", 3);
		return;
		var reactInstance = this;
		var library = this.props.library;
		if(library){
			reactInstance.addTagTypeahead();
		}
	},
	addTagTypeahead: function() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;

		var typeaheadSource = library.tags.plainList;
		if(!typeaheadSource){
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
		});
		ttEngine.initialize();
		widgetEl.find("input.taginput").typeahead('destroy');
		widgetEl.find("input.taginput").typeahead(
			{
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'tags',
				displayKey: 'value',
				source: ttEngine.ttAdapter()
				//local: library.tags.plainList
			}
		);

	},
	addTagTypeaheadToInput: function() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;
		var typeaheadSource = library.tags.plainList;
		if(!typeaheadSource){
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function(typeaheadSource) { return { value: typeaheadSource }; })
		});
		ttEngine.initialize();
		J(element).typeahead('destroy');
		J(element).typeahead(
			{
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'tags',
				displayKey: 'value',
				source: ttEngine.ttAdapter()
				//local: library.tags.plainList
			}
		);
	},
	addNote: function() {
		//TODO: reactify
		Z.debug("Zotero.ui.addNote", 3);
		var button = J(e.currentTarget);
		var container = button.closest("form");
		//var itemKey = J(button).data('itemkey');
		var notenum = 0;
		var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
		if(lastNoteIndex){
			notenum = parseInt(lastNoteIndex, 10);
		}
		
		var newindex = notenum + 1;
		var newNoteID = "note_" + newindex;
		var jel;
		jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" className="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
		Zotero.ui.init.rte('default', true, newNoteID);

	},
	addTag: function() {
		//TODO: reactify
		Z.debug("Zotero.ui.widgets.reactitem.addTag", 3);
		var triggeringElement = J(e.triggeringElement);
		var widgetEl = J(e.data.widgetEl);
		widgetEl.find(".add-tag-form").show().find(".add-tag-input").focus();
	},
	render: function() {
		Z.debug("ItemDetails render");
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
					/>
					<ItemChildrenPanel library={library} childItems={childItems} loading={this.state.childrenLoading} />
					<ItemTagsPanel library={library} item={item} edit={this.state.edit} />
				</div>
			</div>
		);
	}
});
