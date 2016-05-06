'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:items');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');
var LoadingError = require('./LoadingError.js');

Zotero.ui.getItemsConfig = function(library){
	var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
	var urlConfigVals = {};
	J.each(effectiveUrlVars, function(index, value){
		var t = Zotero.state.getUrlVar(value);
		if(t){
			urlConfigVals[value] = t;
		}
	});
	
	var defaultConfig = {
		libraryID: library.libraryID,
		libraryType: library.libraryType,
		target:'items',
		targetModifier: 'top',
		limit: library.preferences.getPref('itemsPerPage')
	};

	var userPreferencesApiArgs = {
		order: Zotero.preferences.getPref('order'),
		sort: Zotero.preferences.getPref('sort'),
		limit: library.preferences.getPref('itemsPerPage')
	};
	
	//Build config object that should be displayed next and compare to currently displayed
	var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
	
	//don't allow ordering by group only columns if user library
	if((library.libraryType == 'user') && (Zotero.Library.prototype.groupOnlyColumns.indexOf(newConfig.order) != -1)) {
		newConfig.order = 'title';
	}
	
	if(!newConfig.sort){
		newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
	}
	
	//don't pass top if we are searching for tags (or query?)
	if(newConfig.tag || newConfig.q){
		delete newConfig.targetModifier;
	}
	
	return newConfig;
};

var Items = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen('changeItemSorting', reactInstance.resortTriggered);
		library.listen('displayedItemsChanged', reactInstance.loadItems, {});
		library.listen('displayedItemChanged', reactInstance.selectDisplayed);
		Zotero.listen('selectedItemsChanged', function(){
			reactInstance.setState({selectedItemKeys:Zotero.state.getSelectedItemKeys()});
		});
		library.listen('selectedItemsChanged', function(){
			reactInstance.setState({selectedItemKeys:Zotero.state.getSelectedItemKeys()});
		});
		
		library.listen('selectedCollectionChanged', function(){
			Zotero.state.selectedItemKeys = [];
			library.trigger('selectedItemsChanged', {selectedItemKeys:[]});
		});
		
		library.listen('loadMoreItems', reactInstance.loadMoreItems, {});
		library.trigger('displayedItemsChanged');

		let displayFields = library.preferences.getPref('listDisplayedFields');
		this.setState({displayFields: displayFields});
	},
	getDefaultProps: function() {
		return {
			narrow: false
		};
	},
	getInitialState: function() {
		return {
			moreloading:false,
			allItemsLoaded:false,
			errorLoading:false,
			items:[],
			selectedItemKeys:[],
			allSelected:false,
			displayFields: ['title', 'creator', 'dateModified'],
			order: 'title',
			sort: 'asc',
		};
	},
	loadItems: function() {
		log.debug('Items.loadItems', 3);
		var reactInstance = this;
		var library = this.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);
		
		//clear contents and show spinner while loading
		this.setState({items:[], moreloading:true});
		
		var p = library.loadItems(newConfig)
		.then(function(response){
			if(!response.loadedItems){
				log.error('expected loadedItems on response not present');
				throw('Expected response to have loadedItems');
			}
			library.items.totalResults = response.totalResults;
			library.trigger('totalResultsLoaded');
			var allLoaded = (response.totalResults == response.loadedItems.length);
			reactInstance.setState({
				items:response.loadedItems,
				moreloading:false,
				sort:newConfig.sort,
				order:newConfig.order,
				allItemsLoaded:allLoaded
			});
		}).catch(function(response){
			log.error(response);
			reactInstance.setState({
				errorLoading:true,
				moreloading:false,
				sort:newConfig.sort,
				order:newConfig.order
			});
		});
		return p;
	},
	loadMoreItems: function() {
		log.debug('Items.loadMoreItems', 3);
		var reactInstance = this;
		var library = this.props.library;
		
		//bail out if we're already fetching more items
		if(reactInstance.state.moreloading){
			return;
		}
		//bail out if we're done loading all items
		if(reactInstance.state.allItemsLoaded){
			return;
		}
		
		reactInstance.setState({moreloading:true});
		var library = reactInstance.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);
		var newStart = reactInstance.state.items.length;
		newConfig.start = newStart;

		var p = library.loadItems(newConfig)
		.then(function(response){
			if(!response.loadedItems){
				log.error('expected loadedItems on response not present');
				throw('Expected response to have loadedItems');
			}
			var allitems = reactInstance.state.items.concat(response.loadedItems);
			reactInstance.setState({items:allitems, moreloading:false});

			//see if we're displaying as many items as there are in results
			var itemsDisplayed = allitems.length;
			if(response.totalResults == itemsDisplayed) {
				reactInstance.setState({allItemsLoaded:true});
			}
		}).catch(function(response){
			log.error(response);
			reactInstance.setState({errorLoading:true, moreloading:false});
		});
		
	},
	resortItems: function(evt) {
		//handle click on the item table header to re-sort items
		//if it is the currently sorted field, simply flip the sort order
		//if it is not the currently sorted field, set it to be the currently sorted
		//field and set the default ordering for that field
		log.debug('.field-table-header clicked', 3);
		evt.preventDefault();
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;
		
		var newSortField = J(evt.target).data('columnfield');
		var newSortOrder;
		if(newSortField != currentSortField) {
			newSortOrder = Zotero.config.sortOrdering[newSortField]; //default for column
		} else {
			//swap sort order
			if(currentSortOrder == 'asc'){
				newSortOrder = 'desc';
			} else {
				newSortOrder = 'asc';
			}
		}

		//only allow ordering by the fields we have
		if(library.sortableColumns.indexOf(newSortField) == (-1)) {
			return false;
		}
		
		//problem if there was no sort column mapped to the header that got clicked
		if(!newSortField){
			Zotero.ui.jsNotificationMessage('no order field mapped to column');
			return false;
		}
		
		//update the url with the new values
		Zotero.state.pathVars['order'] = newSortField;
		Zotero.state.pathVars['sort'] = newSortOrder;
		Zotero.state.pushState();
		
		//set new order as preference and save it to use www prefs
		library.preferences.setPref('sortField', newSortField);
		library.preferences.setPref('sortOrder', newSortOrder);
		library.preferences.setPref('order', newSortField);
		library.preferences.setPref('sort', newSortOrder);
		Zotero.preferences.setPref('order', newSortField);
		Zotero.preferences.setPref('sort', newSortOrder);
	},
	resortTriggered: function(evt) {
		//re-sort triggered from another widget
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;
		
		var newSortField = evt.data.newSortField;
		var newSortOrder = evt.data.newSortOrder;
		
		//only allow ordering by the fields we have
		if(library.sortableColumns.indexOf(newSortField) == (-1)) {
			return false;
		}
		
		//problem if there was no sort column mapped to the header that got clicked
		if(!newSortField){
			Zotero.ui.jsNotificationMessage('no order field mapped to column');
			return false;
		}
		
		//update the url with the new values
		Zotero.state.pathVars['order'] = newSortField;
		Zotero.state.pathVars['sort'] = newSortOrder;
		Zotero.state.pushState();
		
		//set new order as preference and save it to use www prefs
		library.preferences.setPref('sortField', newSortField);
		library.preferences.setPref('sortOrder', newSortOrder);
		library.preferences.setPref('order', newSortField);
		library.preferences.setPref('sort', newSortOrder);
		Zotero.preferences.setPref('order', newSortField);
		Zotero.preferences.setPref('sort', newSortOrder);
	},
	//select and highlight in the itemlist the item  that is displayed
	//in the item details widget
	selectDisplayed: function() {
		log.debug('widgets.items.selectDisplayed', 3);
		Zotero.state.selectedItemKeys = [];
		this.setState({selectedItemKeys: Zotero.state.getSelectedItemKeys(), allSelected:false});
	},
	fixTableHeaders: function() {
		if(J('body').hasClass('lib-body')) {
			var tableEl = J(this.refs.itemsTable);
			tableEl.floatThead({
				top: function() {
					var searchContainerEl = J('.library-search-box-container:visible');
					var primaryNavEl = J('#primarynav');
					return searchContainerEl.height() ? primaryNavEl.height() + searchContainerEl.height() + 'px' : 0;
				}
			});
		}
	},
	handleSelectAllChange: function(evt) {
		var library = this.props.library;
		let nowselected = [];
		let allSelected = false;
		if(evt.target.checked){
			allSelected = true;
			//select all items
			this.state.items.forEach(function(item){
				nowselected.push(item.get('key'));
			});
		} else {
			let selectedItemKey = Zotero.state.getUrlVar('itemKey');
			if(selectedItemKey){
				nowselected.push(selectedItemKey);
			}
		}
		Zotero.state.selectedItemKeys = nowselected;
		this.setState({selectedItemKeys:nowselected, allSelected:allSelected});
		library.trigger('selectedItemsChanged', {selectedItemKeys: nowselected});

		//if deselected all, reselect displayed item row
		if(nowselected.length === 0){
			library.trigger('displayedItemChanged');
		}
	},
	openSortingDialog: function(evt) {
		var library = this.props.library;
		library.trigger('chooseSortingDialog');
	},
	nonreactBind: function() {
		this.fixTableHeaders();
	},
	componentDidMount: function() {
		var reactInstance = this;
		reactInstance.nonreactBind();
	},
	componentDidUpdate: function() {
		this.nonreactBind();
	},
	render: function() {
		var reactInstance = this;
		var library = this.props.library;
		var narrow = this.props.narrow;
		var order = this.state.order;
		var sort = this.state.sort;
		var selectedItemKeys = this.state.selectedItemKeys;
		var selectedItemKeyMap = {};
		selectedItemKeys.forEach(function(itemKey) {
			selectedItemKeyMap[itemKey] = true;
		});

		var sortIcon;
		if(sort == 'desc'){
			sortIcon = (<span className="glyphicon fonticon glyphicon-chevron-down pull-right"></span>);
		} else {
			sortIcon = (<span className="glyphicon fonticon glyphicon-chevron-up pull-right"></span>);
		}
		
		var headers = [(
			<th key="checkbox-header">
				<input type='checkbox'
				className='itemlist-editmode-checkbox all-checkbox'
				name='selectall'
				checked={this.state.allSelected}
				onChange={this.handleSelectAllChange} />
			</th>
		)];
		if(narrow){
			headers.push(
				<th key="single-cell-header" onClick={reactInstance.openSortingDialog} className="clickable">
					{Zotero.Item.prototype.fieldMap[order]}
					{sortIcon}
				</th>
			);
		} else {
			var fieldHeaders = this.state.displayFields.map(function(header, ind){
				var sortable = Zotero.Library.prototype.sortableColumns.indexOf(header) != -1;
				var selectedClass = ((header == order) ? 'selected-order sort-' + sort + ' ' : '');
				var sortspan = null;
				if(header == order) {
					sortspan = sortIcon;
				}
				return (<th 
					key={header}
					onClick={reactInstance.resortItems}
					className={'field-table-header ' + selectedClass + (sortable ? 'clickable ' : '')}
					data-columnfield={header} >
						{Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header}
						{sortspan}
					</th>
				);
			});
			headers = headers.concat(fieldHeaders);
		}

		let displayFields = this.state.displayFields;
		var itemRows = this.state.items.map(function(item){
			var selected = selectedItemKeyMap.hasOwnProperty(item.get('key')) ? true : false;
			var p = {
				itemsReactInstance: reactInstance,
				library:library,
				key: item.get('key'),
				item: item,
				selected: selected,
				narrow: narrow,
				displayFields: displayFields
			};
			return (
				<ItemRow {...p} />
			);
		});
		if(itemRows.length == 0){
			var tds = this.state.displayFields.map(function(header){
				return <td key={header}></td>;
			});
			tds = [<td key="check"></td>].concat(tds);
			itemRows = (
				<tr>
					{tds}
				</tr>
			);
		}
		return (
			<div id="library-items-div" className="library-items-div row" ref="topdiv">
				<form className="item-select-form" method='POST'>
					<table id='field-table' ref="itemsTable" className='wide-items-table table table-striped'>
						<thead>
							<tr>
								{headers}
							</tr>
						</thead>
						<tbody>
							{itemRows}
						</tbody>
					</table>
					<LoadingError errorLoading={this.state.errorLoading} />
					<LoadingSpinner loading={this.state.moreloading} />
					<div hidden={this.state.allItemsLoaded} id="load-more-items-div" className="row">
						<button onClick={this.loadMoreItems} type="button" id="load-more-items-button" className="btn btn-default">
							Load More Items
						</button>
					</div>
				</form>
			</div>
		);
		
	}
});

var ItemRow = React.createClass({
	getDefaultProps: function() {
		return {
			displayFields: ['title', 'creatorSummary', 'dateModified'],
			selected: false,
			item: {},
			narrow: false
		};
	},
	handleSelectChange: function(ev) {
		var reactInstance = this;
		var library = this.props.library;
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		var selected = Zotero.state.getSelectedItemKeys();
		library.trigger('selectedItemsChanged', {selectedItemKeys: selected});
	},
	handleItemLinkClick: function(evt) {
		evt.preventDefault();
		let itemKey = J(evt.target).data('itemkey');
		if(evt.ctrlKey) {
			//add item to selected, but don't deselect others
			Zotero.state.toggleItemSelected(itemKey);
			let selected = Zotero.state.getSelectedItemKeys();
			let library = this.props.library;
			library.trigger('selectedItemsChanged', {selectedItemKeys: selected});
			return;
		}
		Zotero.state.pathVars.itemKey = itemKey;
		Zotero.state.pushState();
	},
	render: function() {
		var reactInstance = this;
		var item = this.props.item;
		var selected = this.props.selected;
		if(!this.props.narrow){
			var fields = this.props.displayFields.map(function(field){
				var ctags = null;
				if(field == 'title'){
					ctags = <ColoredTags item={item} />;
				}
				return (
					<td onClick={reactInstance.handleItemLinkClick} key={field} className={field} data-itemkey={item.get('key')}>
						{ctags}
						<a onClick={reactInstance.handleItemLinkClick} className='item-select-link' data-itemkey={item.get('key')} href={Zotero.url.itemHref(item)} title={item.get(field)}>
							{Zotero.format.itemField(field, item, true)}
						</a>
					</td>
				);
			});
			return (
				<tr className={selected ? 'highlighed' : ''}>
					<td className="edit-checkbox-td" data-itemkey={item.get('key')}>
						<input type='checkbox' onChange={this.handleSelectChange} checked={selected} className='itemlist-editmode-checkbox itemKey-checkbox' name={'selectitem-' + item.get('key')} data-itemkey={item.get('key')} />
					</td>
					{fields}
				</tr>
			);
		} else {
			return (
				<tr className={selected ? 'highlighed' : ''} data-itemkey={item.get('key')}>
					<td className="edit-checkbox-td" data-itemkey={item.get('key')}>
						<input type='checkbox' className='itemlist-editmode-checkbox itemKey-checkbox' name={'selectitem-' + item.get('key')} data-itemkey={item.get('key')} />
					</td>
					
					<SingleCellItemField onClick={reactInstance.handleItemLinkClick} item={item} displayFields={this.props.displayFields} />
				</tr>
			);
		}
	}
});

var SingleCellItemField = React.createClass({
	render: function() {
		var item = this.props.item;
		var field = this.props.field;

		var pps = [];
		this.props.displayFields.forEach(function(field){
			var fieldDisplayName = Zotero.Item.prototype.fieldMap[field] ? Zotero.Item.prototype.fieldMap[field] + ':' : '';
			if(field == 'title'){
				pps.push(<span key="itemTypeIcon" className={'sprite-icon pull-left sprite-treeitem-' + item.itemTypeImageClass()}></span>);
				pps.push(<ColoredTags key="coloredTags" item={item} />);
				pps.push(<b key="title">{Zotero.format.itemField(field, item, true)}</b>);
			} else if((field === 'dateAdded') || (field === 'dateModified')) {
				pps.push(
					<p key={field} title={item.get(field)} dangerouslySetInnerHtml={{__html:fieldDisplayName + Zotero.format.itemDateField(field, item, true)}}>
						
					</p>
				);
			} else {
				pps.push(
					<p key={field} title={item.get(field)}>{fieldDisplayName}{Zotero.format.itemField(field, item, true)}</p>
				);
			}
		});
		return (
			<td onClick={this.props.onClick} className='single-cell-item' data-itemkey={item.get('key')}>
				<a className='item-select-link' data-itemkey={item.get('key')} href={Zotero.url.itemHref(item)}>
					{pps}
				</a>
			</td>
		);
	}
});

var ColoredTags = React.createClass({
	render: function() {
		var item = this.props.item;
		var library = item.owningLibrary;

		var coloredTags = library.matchColoredTags(item.apiObj._supplement.tagstrings);
		
		var ctags = coloredTags.map(function(color){
			return <ColoredTag key={color} color={color} />;
		});
		return (
			<span className="coloredTags">
				{ctags}
			</span>
		);
	}
});

var ColoredTag = React.createClass({
	render: function() {
		var styleObj = {color:this.props.color};
		//styleObj.color += " !important";
		return (
			<span style={styleObj}>
				<span style={styleObj} className="glyphicons fonticon glyphicons-tag"></span>
			</span>
		);
	}
});

module.exports = Items;
