/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const ItemList = require('../component/item/list');
const { fetchItemsInCollection, fetchTopItems } = require('../actions');
const {
	getCollection,
	getCollectionItemCount,
	getItem,
	getItems,
	getLibraryItemCount,
	isFetchingItems,
	isTopLevel
} = require('../state-utils');
const { get } = require('../utils');

class ItemListContainer extends React.PureComponent {
	componentWillReceiveProps(props) {
		if(!props.isTopLevel && !this.props.isTopLevel &&
			get(this.props, 'collection.key') !== get(props, 'collection.key')) {
			console.log('componentWillReceiveProps -> fetchItemsInCollection', props.collection.key);
			this.props.dispatch(fetchItemsInCollection(props.collection.key));
		}

		if(props.isTopLevel && !this.props.isTopLevel) {
			console.log('componentWillReceiveProps -> fetchTopItems');
			this.props.dispatch(fetchTopItems());
		}
	}

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
		console.log('fetch', start, limit);
		const { isTopLevel, dispatch, collection } = this.props;
		isTopLevel ?
			await dispatch(fetchTopItems(start, limit)) :
			await dispatch(fetchItemsInCollection(collection.key, start, limit));
	}

	render() {
		return <ItemList
			{ ...this.props }
			onItemSelect={ this.handleItemSelect.bind(this) }
			onMultipleItemsSelect={ this.handleMultipleItemsSelect.bind(this) }
			onLoadMore={ this.handleLoadMore.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const collection = getCollection(state);
	const item = getItem(state);
	const items = getItems(state);
	const totalItemsCount = (isTopLevel(state) ? getLibraryItemCount(state) : getCollectionItemCount(state)) || 0;
	const isReady = !(totalItemsCount === 0 && isFetchingItems(state));

	return {
		collection,
		items,
		isReady,
		totalItemsCount,
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
