/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const throttle = require('lodash.throttle');
const { withRouter } = require('react-router-dom');
const { baseMappings } = require('../constants/item');
const { connect } = require('react-redux');
const { noteAsTitle } = require('../common/format');
const ItemList = require('../component/item/list');
const { fetchItemsInCollection, fetchTopItems, sortItems } = require('../actions');
const {
	getCollection,
	getCollectionItemCount,
	getItem,
	getItems,
	getLibraryItemCount,
	getLibraryKey,
	isFetchingItems,
	isTopLevel,
} = require('../state-utils');
const { get, sortByKey } = require('../utils');

const processItems = items => {
	return items.map(item => {
		let { itemType, note } = item;
		let title = itemType === 'note' ?
			noteAsTitle(note) :
			item[itemType in baseMappings && baseMappings[itemType]['title'] || 'title'];
		let creator = Symbol.for('meta') in item ?
			item[Symbol.for('meta')].creatorSummary :
			'';
		let date = Symbol.for('meta') in item ?
			item[Symbol.for('meta')].parsedDate :
			'';

		return {
			key: item.key,
			title,
			creator,
			date
		}
	});
};

class ItemListContainer extends React.PureComponent {
	// componentDidUpdate({ sortBy, sortDirection, collection, isTopLevel }) {
	// 	var isFetchRequired = false;

	// 	if(sortBy !== this.props.sortBy || sortDirection !== this.props.sortDirection) {
	// 		console.log('sorting has changed');
	// 		isFetchRequired = true;
	// 	}

	// 	if(get(collection, 'key') !== get(this.props.collection, 'key')) {
	// 		console.log('collection has changed');
	// 		isFetchRequired = true;
	// 	}

	// 	if(isTopLevel && !this.props.isTopLevel) {
	// 		console.log('switched from collection to top-level');
	// 		isFetchRequired = true;
	// 	}

	// 	if(isFetchRequired) {
	// 		this.handleLoadMore({ startIndex: 0, stopIndex: 49 });
	// 	}
	// }

	handleItemSelect(itemKey) {
		if(this.props.isTopLevel) {
			this.props.history.push(`/item/${itemKey}`);
		} else {
			this.props.history.push(`/collection/${this.props.collection.key}/item/${itemKey}`);
		}
	}

	handleMultipleItemsSelect(keys) {
		if(this.props.isTopLevel) {
			this.props.history.push(`/items/${keys.join(',')}`);
		} else {
			this.props.history.push(`/collection/${this.props.collection.key}/items/${keys.join(',')}`);
		}
	}

	async handleLoadMore({ startIndex, stopIndex }) {
		let start = startIndex;
		let limit = (stopIndex - startIndex) + 1;
		let sort = this.props.sortBy;
		let direction = this.props.sortDirection.toLowerCase();
		const { isTopLevel, dispatch, collection } = this.props;

		console.log('handleLoadMore', { isTopLevel, collection, start, limit });

		return isTopLevel ?
			await dispatch(fetchTopItems({ start, limit, sort, direction })) :
			await dispatch(fetchItemsInCollection(collection.key, { start, limit, sort, direction }));
	}

	async handleSort({ sortBy, sortDirection, stopIndex }) {
		const { dispatch } = this.props;
		sortDirection = sortDirection.toLowerCase(); // react-virtualised uses ASC/DESC, zotero asc/desc
		await dispatch(sortItems(sortBy, sortDirection));
		return await this.handleLoadMore({ startIndex: 0, stopIndex });
	}

	render() {
		let { collection, isTopLevel } = this.props;
		var key;
		if(isTopLevel) {
			key = 'top-level';
		} else if(collection) {
			key = `collection-${collection.key}`;
		} else {
			key = 'empty-list';
		}

		return <ItemList
			key = { key }
			{ ...this.props }
			onItemSelect={ this.handleItemSelect.bind(this) }
			onMultipleItemsSelect={ this.handleMultipleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
			onSort={ this.handleSort.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const library = getLibraryKey(state);
	const collection = getCollection(state);
	const item = getItem(state);
	const items = processItems(getItems(state));
	const totalItemsCount = (isTopLevel(state) ? getLibraryItemCount(state) : getCollectionItemCount(state)) || 50;
	const isReady = (isTopLevel(state) && library) || collection !== null;
	const { sortBy, sortDirection } = state.config;

	sortByKey(items, sortBy, sortDirection);

	return {
		collection,
		items,
		isReady,
		totalItemsCount,
		sortBy,
		sortDirection: sortDirection.toUpperCase(),
		isTopLevel: isTopLevel(state),
		selectedItemKeys: item ? [item.key] : (state.router && 'items' in state.router.params && state.router.params.items.split(',')) || []
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
