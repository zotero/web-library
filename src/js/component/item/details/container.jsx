'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../details');
const ItemBox = require('../box/container');
const { connect } = require('react-redux');
const { itemProp } = require('../../../constants/item');

class ItemDetailsContainer extends React.Component {
	render() {
		return <ItemDetails
			injectItemBox = { ItemBox }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	var items, item;
	let selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	let selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;

	if(selectedCollectionKey && state.items[selectedCollectionKey]) {
		items = state.items[selectedCollectionKey].items;
	}

	if(items && selectedItemKey) {
		item = items.find(i => i.key === selectedItemKey);
	}

	return {
		item
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: itemProp
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemDetailsContainer);