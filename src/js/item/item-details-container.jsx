'use strict';

import Zotero from 'libzotero';
import React from 'react';
import ItemDetails from './item-details';
import { connect } from 'react-redux';
import Item from './item';

class ItemDetailsContainer extends React.Component {
	render() {
		return <ItemDetails
			fields = { this.props.fields }
			item = { this.props.item }
		/>;
	}
}

const mapStateToProps = state => {
	var items, item;
	let selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	let selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;
	let { fieldMap, hideFields, noEditFields } = Zotero.Item.prototype;
	let { CREATORS, READONLY, EDITABLE } = ItemDetails.fieldTypes;

	if(selectedCollectionKey && state.items[selectedCollectionKey]) {
		items = state.items[selectedCollectionKey].items;
	}

	if(items && selectedItemKey) {
		item = items.find(i => i.key === selectedItemKey);
	}

	return {
		fields: Object.keys(fieldMap).map(f => ({
			key: f,
			label: fieldMap[f],
			visible: !hideFields.includes(f),
			type: f === 'creators' ? CREATORS : noEditFields.includes(f) ? READONLY : EDITABLE,
			value: item ? item.data[f] : null
		})),
		item: item || undefined
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemDetailsContainer.propTypes = {
	fields: React.PropTypes.array
};

ItemDetailsContainer.propTypes.item = Item.propTypes.item;


export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemDetailsContainer);