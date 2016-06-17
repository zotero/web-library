'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:items');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');
var LoadingError = require('./LoadingError.js');

Zotero.ui.getItemsConfig = function(library){
	var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
	var urlConfigVals = {};
	effectiveUrlVars.forEach((value) => {
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
	var newConfig = Z.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
	
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
		var library = this.props.library;

		let displayFields = library.preferences.getPref('listDisplayedFields');
		this.setState({displayFields: displayFields});
	},
	getDefaultProps: function() {
		return {
			narrow: false
		};
	},
	getInitialState: function() {
		let selected = Zotero.state.getSelectedItemKeys();
		return {
			moreloading:false,
			allItemsLoaded:false,
			errorLoading:false,
			items:[],
			selectedItemKeys:selected,
			allSelected:false,
			displayFields: ['title', 'creator', 'dateModified'],
			order: 'title',
			sort: 'asc',
		};
	},
	handleShortcuts: function(evt) {
		if(evt.key == 'a'){
			if(evt.ctrlKey){
				evt.preventDefault();
				evt.stopPropagation();
				let nowselected = [];
				//select all items
				this.state.items.forEach(function(item){
					nowselected.push(item.get('key'));
				});
				
				Zotero.state.selectedItemKeys = nowselected;
				this.setState({selectedItemKeys:nowselected, allSelected:true});
				Zotero.trigger('selectedItemsChanged', {selectedItemKeys: nowselected});
			}
		}
	},
	loadItems: function() {
		log.debug('Items.loadItems', 2);
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
			Zotero.trigger('totalResultsLoaded');
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
		if(evt){
			log.debug('.field-table-header clicked', 3);
			evt.preventDefault();
		}
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;
		
		var newSortField = evt.target.getAttribute('data-columnfield');
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
	itemClickHandler: function(evt){
		evt.preventDefault();
		let reactInstance = this;
		let library = reactInstance.props.library;
		let itemKey = evt.currentTarget.getAttribute('data-itemkey');
		let selected;
		if(evt.ctrlKey) {
			//add item to selected, but don't deselect others
			Zotero.state.toggleItemSelected(itemKey);
			selected = Zotero.state.getSelectedItemKeys();
		} else {
			Zotero.state.pathVars.itemKey = itemKey;
			Zotero.state.pushState();
			selected = [itemKey];
			Zotero.state.selectedItemKeys = selected;
		}
		
		Zotero.trigger('selectedItemsChanged', {selectedItemKeys: selected});
	},
	//select and highlight in the itemlist the item  that is displayed
	//in the item details widget
	selectDisplayed: function() {
		log.debug('widgets.items.selectDisplayed', 3);
		Zotero.state.selectedItemKeys = [];
		this.setState({selectedItemKeys: Zotero.state.getSelectedItemKeys(), allSelected:false});
	},
	render: function() {
		log.debug('Items.render', 3);
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
		
		let displayFields = this.state.displayFields;
		let itemClickHandler = this.itemClickHandler;
		let headerClickHandler = this.resortItems;
		
		return (
			<div id="library-items-div" className="library-items-div row" ref="topdiv" onKeyDown={this.handleShortcuts} tabIndex='0'>
				<WideItemsTable 
					items={this.state.items} 
					selectedItemKeys={selectedItemKeys} 
					sort={sort} 
					order={order} 
					rowClickHandler={itemClickHandler} 
					headerClickHandler={headerClickHandler}
					displayFields={displayFields}
					/>
				<LoadingError errorLoading={this.state.errorLoading} />
				<LoadingSpinner loading={this.state.moreloading} />
				<div hidden={this.state.allItemsLoaded} id="load-more-items-div" className="row">
					<button onClick={this.loadMoreItems} type="button" id="load-more-items-button" className="btn btn-default">
						Load More Items
					</button>
				</div>
			</div>
		);
		
	}
});

var WideItemsTable = React.createClass({
	getDefaultProps: function() {
		return {
			displayFields: ['title', 'creatorSummary', 'dateModified'],
			sort: '',
			order: '',
			selectedItemKeys: [],
			items: [],
			rowClickHandler:function(){},
			headerClickHandler: function(){}
		};
	},
	componentDidMount: function() {
		this.fixTableHeaders();
	},
	fixTableHeaders: function() {
		var tableEl = J(this.refs.itemsTable);
		tableEl.floatThead({
			top: function() {
				var searchContainerEl = J('.library-search-box-container:visible');
				var primaryNavEl = J('#primarynav');
				return searchContainerEl.height() ? primaryNavEl.height() + searchContainerEl.height() + 'px' : 0;
			}
		});
	},
	render: function() {
		log.debug('WideItemsTable.render', 3);
		let reactInstance = this;
		let order = this.props.order;
		let sort = this.props.sort;
		let selectedItemKeys = this.props.selectedItemKeys;
		let selectedItemKeyMap = {};
		selectedItemKeys.forEach(function(itemKey) {
			selectedItemKeyMap[itemKey] = true;
		});

		let sortIcon;
		if(sort == 'desc'){
			sortIcon = (<span className="glyphicon fonticon glyphicon-chevron-down pull-right"></span>);
		} else {
			sortIcon = (<span className="glyphicon fonticon glyphicon-chevron-up pull-right"></span>);
		}
		
		let headers = this.props.displayFields.map(function(header){
			var sortable = Zotero.Library.prototype.sortableColumns.indexOf(header) != -1;
			var selectedClass = ((header == order) ? 'selected-order sort-' + sort + ' ' : '');
			var sortspan = null;
			if(header == order) {
				sortspan = sortIcon;
			}
			return (<th 
				key={header}
				onClick={reactInstance.props.headerClickHandler}
				className={'field-table-header ' + selectedClass + (sortable ? 'clickable ' : '')}
				data-columnfield={header} >
					{Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header}
					{sortspan}
				</th>
			);
		});
	
		let displayFields = this.props.displayFields;
		let itemRows = this.props.items.map(function(item){
			let itemKey = item.get('key');
			let selected = selectedItemKeyMap.hasOwnProperty(item.get('key')) ? true : false;
			let fieldValues = displayFields.map((field) => {
				if(field == 'title') {
					//TODO: add colored tags, and itemtype icon
					return (
						<span>
							<ColoredTags item={item} />
							{Zotero.format.itemField(field, item, true)}
						</span>
					);
				} else {
					return Zotero.format.itemField(field, item, true);
				}
			});
			let tds = fieldValues.map((fieldValue,i) => {
				return (
					<td onClick={reactInstance.props.rowClickHandler} key={i} data-itemkey={itemKey}>
						{fieldValue}
					</td>
				);
			});
			return (
				<tr className={selected ? 'highlighed' : ''} key={itemKey}>
					{tds}
				</tr>
			);
		});

		return (
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
		);
	}
});

var NarrowItemsTable = React.createClass({
	render: function() {

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
