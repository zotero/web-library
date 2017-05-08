'use strict';

import Zotero from 'libzotero';
import React from 'react';

import ItemBox from '../box';
import { connect } from 'react-redux';
import { updateItem, fetchCreatorTypes } from '../../../actions';
import { itemProp } from '../../../constants';

const { typeMap, noEditFields, creatorMap } = Zotero.Item.prototype;
const itemTypes = Object.keys(typeMap).map(typeKey => ({
	value: typeKey,
	label: typeMap[typeKey]
}));
	
const fieldMap = {
	'creators': Zotero.Item.prototype.fieldMap['creator'],
	...Zotero.Item.prototype.fieldMap
};

const hideFields = ['creator', 'abstract', 'notes', ...Zotero.Item.prototype.hideFields];

class ItemBoxContainer extends React.Component {
	//@TODO: we should use itemKey here and everywhere in actions
	//		to avoid problems like this. When user navigates away
	//		from this view, we can no longer request item update
	//		since item is no longer set
	async itemUpdatedHandler(item, fieldKey, newValue) {
		try {
			item.set(fieldKey, newValue);
		} catch(c) {
			//@TODO: better handling for this case, see above
			throw c;
		}

		try {
			
			const updatedItem = await this.props.dispatch(
				updateItem(item, fieldKey)
			);
			return updatedItem.get(fieldKey) || '';
		} catch(c) {
			throw c;
		}
	}

	componentWillReceiveProps(nextProps) {
		if((!this.props.item && nextProps.item) || (this.props.item && nextProps.item && nextProps.item.get('itemType') != this.props.item.get('itemType'))) {
			this.props.dispatch(
				fetchCreatorTypes(nextProps.item.get('itemType'))
			);
		}
	}

	render() {
		return <ItemBox 
			onSave={ this.itemUpdatedHandler.bind(this, this.props.item) }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	let items, item, creatorTypes = [], creatorTypesLoading = false;
	const selectedCollectionKey = 'collection' in state.router.params ? state.router.params.collection : null;
	const selectedItemKey = 'item' in state.router.params ? state.router.params.item : null;
	
	if(selectedCollectionKey && state.items[selectedCollectionKey]) {
		items = state.items[selectedCollectionKey].items;
	}

	if(items && selectedItemKey) {
		item = items.find(i => i.key === selectedItemKey);
		if(item) {
			const itemType = item.get('itemType');

			if(itemType in state.creatorTypes) {
				creatorTypesLoading = state.creatorTypes[item.get('itemType')].isFetching;
				if('value' in state.creatorTypes[itemType]) {
					creatorTypes = state.creatorTypes[item.get('itemType')].value.map(ct => ({
						label: creatorMap[ct.creatorType],
						value: ct.creatorType
					}));
				}
			}
		}
	}

	const isSmallScreen = 'lg' in state.viewport && !state.viewport.lg;
	const editEnabled = !isSmallScreen || (item && state.items.editing === item.key);

	//@TODO: Refactor
	return {
		fields: Object.keys(fieldMap).map(f => ({
			options: f === 'itemType' ? itemTypes : null,
			key: f,
			label: fieldMap[f],
			readonly: editEnabled ? noEditFields.includes(f) : true,
			processing: item && state.items.updating && item.key in state.items.updating && state.items.updating[item.key].includes(f),
			value: item ? item.get(f) : null
		})).filter(f => !hideFields.includes(f.key)),
		item: item || undefined,
		creatorTypes,
		creatorTypesLoading
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemBoxContainer.propTypes = {
	creatorTypes: React.PropTypes.array,
	creatorTypesLoading: React.PropTypes.bool,
	dispatch: React.PropTypes.func.isRequired,
	fields: React.PropTypes.array,
	hiddenFields: React.PropTypes.array,
	item: itemProp
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemBoxContainer);