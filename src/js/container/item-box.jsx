'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemBox = require('../component/item/box');
const { connect } = require('react-redux');
const {	updateItem, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../actions');
const { itemProp, hideFields, noEditFields, baseMappings } = require('../constants/item');
const { get, reverseMap } = require('../utils');
const { 
	getItem,
	getItemFieldValue,
	isItemFieldBeingUpdated
} = require('../state-utils');

class ItemBoxContainer extends React.Component {
	componentWillReceiveProps(props) {
		let itemType = get(props, 'item.itemType');
		if(get(this.props, 'item.itemType') != itemType) {
			this.props.dispatch(fetchItemTypeCreatorTypes(itemType));
			this.props.dispatch(fetchItemTypeFields(itemType));
		}
	}

	async handleItemUpdated(item, fieldKey, newValue) {
		var patch = {
			[fieldKey]: newValue
		};

		// when changing itemType, map fields to base types and back to item-specific types
		if(fieldKey === 'itemType') {
			const baseValues = {};			
			if(item.itemType in baseMappings) {
				const namedToBaseMap = reverseMap(baseMappings[item.itemType]);
				Object.keys(item).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						if(item[fieldName].toString().length > 0) {
							baseValues[namedToBaseMap[fieldName]] = item[fieldName];
						}
					}
				});
			}

			patch = { ...patch, ...baseValues };

			if(newValue in baseMappings) {
				const namedToBaseMap = baseMappings[newValue];
				const itemWithBaseValues = { ...item, ...baseValues };
				Object.keys(itemWithBaseValues).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						patch[namedToBaseMap[fieldName]] = itemWithBaseValues[fieldName];
						patch[fieldName] = '';
					}
				});
			}
		}

		await this.props.dispatch(updateItem(item.key, patch));
	}

	render() {
		return <ItemBox 
			onSave={ this.handleItemUpdated.bind(this, this.props.item) }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	const item = getItem(state);

	if(!item) {
		return {};
	}

	if(!(item.itemType in state.meta.itemTypeCreatorTypes) || 
		!(item.itemType in state.meta.itemTypeFields)) {
		return {
			item,
			isLoading: true
		};
	}

	const itemTypes = state.meta.itemTypes
		.map(it => ({
			value: it.itemType,
			label: it.localized
		}))
		.filter(it => it.value !== 'note');

	const itemTypeCreatorTypes = state.meta.itemTypeCreatorTypes[item.itemType]
		.map(ct => ({
			value: ct.creatorType,
			label: ct.localized
		}));

	const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';

	const fields = [
		{ field: 'itemType', localized: 'Item Type' },
		state.meta.itemTypeFields[item.itemType].find(itf => itf.field === titleField),
		{ field: 'creators', localized: 'Creators' },
		...state.meta.itemTypeFields[item.itemType].filter(itf => itf.field !== titleField)
	].filter(e => e); //filter out undefined

	const isSmallScreen = 'lg' in state.viewport && !state.viewport.lg;
	const isEditingEnabled = !isSmallScreen || state.items.editing === item.key;

	//@TODO: Refactor
	return {
		fields: fields.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				readonly: isEditingEnabled ? noEditFields.includes(f) : true,
				processing: isItemFieldBeingUpdated(f.field, state),
				value: getItemFieldValue(f.field, state)
		})).filter(f => !hideFields.includes(f.key)),
		item: item || undefined,
		creatorTypes: itemTypeCreatorTypes,
		
		//@TODO: temporary, fix this together with selectLibrary events in actions
		libraryKey: state.library.libraryKey, 
		isEditing: item && state.items.editing === item.key
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemBoxContainer.propTypes = {
	creatorTypes: PropTypes.array,
	creatorTypesLoading: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
	fields: PropTypes.array,
	isEditing: PropTypes.bool,
	item: itemProp,
	libraryKey: PropTypes.string
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemBoxContainer);