'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('redux-router');
const ItemList = require('../component/item/list');
const { fetchItems } = require('../actions');
const { getCollection, getItems, getItem } = require('../state-utils');
const { get } = require('../utils');

class ItemListContainer extends React.Component {
	componentWillReceiveProps(props) {
		if(get(this.props, 'collection.key') !== get(props, 'collection.key')) {
			this.props.dispatch(fetchItems(props.collection.key));
		}
	}

	onItemSelected(itemKey) {
		this.props.dispatch(push(`/collection/${this.props.collection.key}/item/${itemKey}`));
	}

	render() {
		return <ItemList 
			isFetching={ this.props.isFetching }
			items={ this.props.items }
			selectedItemKey={ this.props.selectedItemKey }
			onItemSelected={ this.onItemSelected.bind(this) }
			/>;
	}
}



const mapStateToProps = state => {
	const collection = getCollection(state);
	const item = getItem(state);
	const items = getItems(state).filter(i => !i.parentItem);

	return {
		collection,
		items,
		isFetching: collection ? state.fetching.itemsInCollection.includes(collection.key) : false,
		selectedItemKey: item ? item.key : null
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

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer);