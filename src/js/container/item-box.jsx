/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemBox = require('../component/item/box');
const { connect } = require('react-redux');
const {	updateItem, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../actions');
const { itemProp, hideFields, noEditFields, baseMappings } = require('../constants/item');
const { get, reverseMap } = require('../utils');
const { getItemFieldValue } = require('../common/state');

class ItemBoxContainer extends React.PureComponent {
	componentWillReceiveProps(props) {
		let itemType = get(props, 'item.itemType');
		if(props.shouldFetchMeta === true) {
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

			const targetTypeCreatorTypes = await this.props.dispatch(fetchItemTypeCreatorTypes(item.itemType));

			//convert item creators to match creators appropriate for this item type
			if(item.creators && Array.isArray(item.creators)) {
				for(var creator of item.creators) {
					if(typeof targetTypeCreatorTypes.find(c => c.creatorType === creator.creatorType) === 'undefined') {
						creator.creatorType = targetTypeCreatorTypes[0].creatorType;
					}
				}
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
	const libraryKey = state.current.library;
	const itemKey = state.current.item;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey]);

	if(!item) {
		return {};
	}

	let isMetaAvailable = item.itemType in state.meta.itemTypeCreatorTypes && item.itemType in state.meta.itemTypeFields;
	let shouldFetchMeta = !isMetaAvailable
		&& !state.fetching.itemTypeCreatorTypes.includes(item.itemType)
		&& !state.fetching.itemTypeFields.includes(item.itemType);

	if(!isMetaAvailable) {
		return {
			item,
			shouldFetchMeta,
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

	//@TODO: Refactor
	const isExpicitEdit = !!(state.viewport.xxs || state.viewport.xs || state.viewport.sm); //@TODO: also for userType == touch?
	const isEditing = !!(isExpicitEdit && state.current.editing === item.key);
	const isForm = !!(isExpicitEdit && isEditing && item);
	const isReadOnlyMode = !!(isExpicitEdit && !isEditing);

	//@TODO: Refactor
	return {
		fields: fields.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				readOnly: isReadOnlyMode ? true : noEditFields.includes(f),
				processing: get(
					state,
					['libraries', libraryKey, 'updating', 'items', item.key], []
				).some(({ patch }) => f.field in patch),
				value: getItemFieldValue(f.field, state)
		})).filter(f => !hideFields.includes(f.key)),
		item: item || undefined,
		creatorTypes: itemTypeCreatorTypes,
		isEditing,
		isForm,
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
