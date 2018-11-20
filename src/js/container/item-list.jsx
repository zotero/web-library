/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { baseMappings } = require('../constants/item');
const { connect } = require('react-redux');
const { noteAsTitle, itemTypeLocalized } = require('../common/format');
const { saveAs } = require('file-saver');
const ItemList = require('../component/item/list');
const {
	addToCollection,
	createItem,
	deleteItems,
	exportItems,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchItemTemplate,
	fetchPublicationsItems,
	fetchTopItems,
	fetchTrashItems,
	moveToTrash,
	preferenceChange,
	recoverFromTrash,
	removeFromCollection,
	sortItems,
	toggleModal,
} = require('../actions');
const { get, sortByKey, resizeVisibleColumns } = require('../utils');
const { getSerializedQuery } = require('../common/state');
const { makePath } = require('../common/navigation');
const exportFormats = require('../constants/export-formats');

const processItems = (items, state) => {
	return items.map(item => {
		const { meta: { itemTypes }} = state;
		const { itemType, note, publisher, publication, dateAdded, dateModified, extra } = item;
		const title = itemType === 'note' ?
			noteAsTitle(note) :
			item[itemType in baseMappings && baseMappings[itemType]['title'] || 'title'] || '';
		const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
			item[Symbol.for('meta')].creatorSummary :
			'';
		const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
			item[Symbol.for('meta')].parsedDate :
			'';
		const coloredTags = item.tags
			.map(tag => get(state, ['libraries', state.current.library, 'tags', `${tag.tag}-0`]))
			.filter(tag => tag && tag.color);
		// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
		const year = date.substr(0, 4);

		return {
			coloredTags,
			creator,
			date,
			dateAdded,
			dateModified,
			extra,
			itemType: itemTypeLocalized(item, itemTypes),
			key: item.key,
			publication,
			publisher,
			title,
			year,
		}
	});
};

class ItemListContainer extends React.PureComponent {
	handleItemsSelect(items = []) {
		const { history, collectionKey: collection, libraryKey: library,
			itemsSource, tags, search } = this.props;
		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';

		switch(itemsSource) {
			case 'trash':
			case 'top':
			case 'query':
			case 'collection':
			case 'publications':
				history.push(makePath({ library, search, tags, trash, publications, collection, items }));
			break;
		}
	}

	async handleDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(moveToTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handlePermanentlyDelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(deleteItems(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleUndelete() {
		const { dispatch, selectedItemKeys } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(recoverFromTrash(itemKeys));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	async handleRemove() {
		const { dispatch, selectedItemKeys, collectionKey } = this.props;

		do {
			const itemKeys = selectedItemKeys.splice(0, 50);
			await dispatch(removeFromCollection(itemKeys, collectionKey));
		} while (selectedItemKeys.length > 50);
		this.handleItemsSelect();
	}

	handleColumnVisibilityChange(field, isVisible) {
		const { preferences, dispatch } = this.props;
		const columnIndex = preferences.columns.findIndex(c => c.field === field);
		const newColumns = [ ...preferences.columns ];

		var fractionBias;
		if(!newColumns[columnIndex].isVisible && isVisible) {
			fractionBias = newColumns[columnIndex].fraction * -1;
		} else if(newColumns[columnIndex].isVisible && !isVisible) {
			fractionBias = newColumns[columnIndex].fraction;
		}

		resizeVisibleColumns(newColumns, fractionBias);
		newColumns[columnIndex].isVisible = isVisible;
		return dispatch(preferenceChange('columns', newColumns));
	}

	handleColumnReorder(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	handleColumnResize(columns) {
		const { dispatch } = this.props;
		return dispatch(preferenceChange('columns', columns));
	}

	async handleLoadMore({ startIndex, stopIndex }) {
		let start = startIndex;
		let limit = (stopIndex - startIndex) + 1;
		let sort = this.props.sortBy;
		let direction = this.props.sortDirection.toLowerCase();
		let tag = this.props.tags || [];
		const { itemsSource, dispatch, collectionKey, search: q } = this.props;
		const sortAndDirection = { start, limit, sort, direction };

		switch(itemsSource) {
			case 'query':
				return await dispatch(fetchItemsQuery({ collection: collectionKey, tag, q }, sortAndDirection));
			case 'top':
				return await dispatch(fetchTopItems(sortAndDirection));
			case 'trash':
				return await dispatch(fetchTrashItems(sortAndDirection));
			case 'publications':
				return await dispatch(fetchPublicationsItems(sortAndDirection));
			case 'collection':
				return await dispatch(fetchItemsInCollection(collectionKey, sortAndDirection));
		}
	}

	async handleNewItemCreate(itemType) {
		const { itemsSource, dispatch, collectionKey, libraryKey } = this.props;
		const template = await dispatch(fetchItemTemplate(itemType));
		const newItem = {
			...template,
			collections: itemsSource === 'collection' ? [collectionKey] : []
		};
		const item = await dispatch(createItem(newItem, libraryKey));
		this.handleItemsSelect([item.key]);
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		const { dispatch } = this.props;
		sortDirection = sortDirection.toLowerCase(); // react-virtualised uses ASC/DESC, zotero asc/desc
		await dispatch(sortItems(sortBy, sortDirection));
		return await this.handleLoadMore({ startIndex: 0, stopIndex });
	}

	async handleDrag({ itemKeys, targetType, collectionKey, libraryKey }) {
		const { dispatch } = this.props;
		if(targetType === 'collection') {
			return await dispatch(addToCollection(itemKeys, collectionKey, libraryKey));
		}
	}

	async handleExport(format) {
		const { dispatch, selectedItemKeys } = this.props;
		const exportData = await dispatch(exportItems(selectedItemKeys, format));

		const fileName = ['export-data', exportFormats.find(f => f.key === format).extension]
			.filter(Boolean).join('.');
		saveAs(exportData, fileName);
	}

	handleBibliographyOpen() {
		const { dispatch } = this.props;
		dispatch(toggleModal('BIBLIOGRAPHY', true));
	}

	render() {
		let { libraryKey, collectionKey = '', itemsSource, search, tags } = this.props;
		var key;
		if(itemsSource == 'collection') {
			key = `${libraryKey}-${collectionKey}`;
		} else if(itemsSource == 'query') {
			key = `${libraryKey}-query-${getSerializedQuery({ collection: collectionKey, tag: tags, q: search })}`;
		} else {
			key = `${libraryKey}-${itemsSource}`;
		}

		return <ItemList
			key = { key }
			{ ...this.props }
			onColumnReorder={ this.handleColumnReorder.bind(this) }
			onColumnResize={ this.handleColumnResize.bind(this) }
			onColumnVisibilityChange={ this.handleColumnVisibilityChange.bind(this) }
			onDelete={ this.handleDelete.bind(this) }
			onExport={ this.handleExport.bind(this )}
			onItemDrag={ this.handleDrag.bind(this) }
			onItemsSelect={ this.handleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onNewItemCreate={ this.handleNewItemCreate.bind(this) }
			onPermanentlyDelete={ this.handlePermanentlyDelete.bind(this) }
			onSort={ this.handleSort.bind(this) }
			onUndelete={ this.handleUndelete.bind(this) }
			onRemove={ this.handleRemove.bind(this) }
			onBibliographyOpen={ this.handleBibliographyOpen.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const itemsSource = state.current.itemsSource;
	const collectionKey = state.current.collection;
	const tags = state.current.tags;
	const search = state.current.search;
	const itemKey = state.current.item;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
	const isMetaAvailable = !state.fetching.meta;
	const { sortBy, sortDirection } = state.config;
	const preferences = state.preferences;
	const itemFields = state.meta.itemFields;
	const itemTypes = state.meta.itemTypes;
	const isReady = libraryKey && ((!collectionKey && itemFields) || collection !== null);
	var items = [], totalItemsCount = 0;

	if(isMetaAvailable) {
		switch(itemsSource) {
			case 'query':
				items = state.queryItems;
				totalItemsCount = state.queryItemCount;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'top':
				items = get(state, ['libraries', libraryKey, 'itemsTop'], []);
				totalItemsCount = get(state, ['itemCountTopByLibrary', libraryKey], 50);
			break;
			case 'trash':
				items = get(state, ['libraries', libraryKey, 'itemsTrash'], []);
				totalItemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], 50);
			break;
			case 'publications':
				items = state.itemsPublications;
				totalItemsCount = state.itemCount.publications;
				totalItemsCount = totalItemsCount === null ? 50 : totalItemsCount;
			break;
			case 'collection':
				items = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], []);
				totalItemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], 0)
			break;
		}

		items = processItems(
			items.map(key => get(state, ['libraries', libraryKey, 'items', key])),
			state
		);
		sortByKey(items, sortBy, sortDirection);
	}

	const isDeleting = get(state, ['libraries', libraryKey, 'deleting'], [])
			.some(itemKey => items.filter(i => i.key === itemKey));

	return {
		collection,
		collectionKey,
		isDeleting,
		isReady,
		itemFields,
		items,
		itemsSource,
		itemTypes,
		libraryKey,
		preferences,
		search,
		selectedItemKeys: item ? [item.key] : state.current.itemKeys,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		tags,
		totalItemsCount,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemListContainer.propTypes = {
  collection: PropTypes.object,
  items: PropTypes.array.isRequired,
  selectedItemKey: PropTypes.string,
  dispatch: PropTypes.func.isRequired
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer));
