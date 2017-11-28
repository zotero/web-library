'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const ItemList = require('../component/item/list');
const { fetchItems } = require('../actions');
const { getCollection, getItems, getItem, isCollectionFetching } = require('../state-utils');
const { get } = require('../utils');

class ItemListContainer extends React.Component {
	componentWillReceiveProps(props) {
		if(get(this.props, 'collection.key') !== get(props, 'collection.key')) {
			this.props.dispatch(fetchItems(props.collection.key));
		}
	}

	onItemSelected(itemKey) {
		this.props.history.push(`/collection/${this.props.collection.key}/item/${itemKey}`);
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
	const items = getItems(state).filter(i => !i.parentItem && i.itemType !== 'note');
	const isFetching = isCollectionFetching(state);

	return {
		collection,
		items,
		isFetching,
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

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemListContainer));