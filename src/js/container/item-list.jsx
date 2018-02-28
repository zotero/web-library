'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const ItemList = require('../component/item/list');
const { fetchItemsInCollection, fetchTopItems } = require('../actions');
const { getCollection, getItems, getItem, isFetchingItems, isTopLevel } = require('../state-utils');
const { get } = require('../utils');

class ItemListContainer extends React.PureComponent {
	componentWillReceiveProps(props) {
		if(!props.isTopLevel && 
			get(this.props, 'collection.key') !== get(props, 'collection.key')) {
			this.props.dispatch(fetchItemsInCollection(props.collection.key));
		}

		if(props.isTopLevel && !this.props.isTopLevel) {
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

	render() {
		return <ItemList 
			isFetching={ this.props.isFetching }
			items={ this.props.items }
			selectedItemKeys={ this.props.selectedItemKeys }
			onItemSelect={ this.handleItemSelect.bind(this) }
			onMultipleItemsSelect={ this.handleMultipleItemsSelect.bind(this) }
			/>;
	}
}



const mapStateToProps = state => {
	const collection = getCollection(state);
	const item = getItem(state);
	const items = getItems(state).filter(i => !i.parentItem);
	const isFetching = isFetchingItems(state);

	return {
		collection,
		items,
		isFetching,
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
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer));