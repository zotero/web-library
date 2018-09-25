/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemBox = require('../component/item/box');
const { connect } = require('react-redux');
const {	updateItem, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../actions');
const { itemProp, hideFields, noEditFields, baseMappings } = require('../constants/item');
const { get, reverseMap } = require('../utils');
const withDevice = require('../enhancers/with-device');
const withEditMode = require('../enhancers/with-edit-mode');

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
		const { isLoading, device, item, isEditing, itemTypeFields, itemTypes, itemTypeCreatorTypes, pendingChanges } = this.props;
		if(isLoading) {
			return <ItemBox isLoading />;
		}
		const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';
		const isForm = !!(device.shouldUseEditMode && isEditing && item);
		const isReadOnlyMode = !!(device.shouldUseEditMode && !isEditing);
		const aggregatedPatch = pendingChanges.reduce(
			(aggr, { patch }) => ({...aggr, ...patch}), {}
		);
		const itemWithPendingChnages = { ...item, ...aggregatedPatch};

		const fields = [
			{ field: 'itemType', localized: 'Item Type' },
			itemTypeFields[item.itemType].find(itf => itf.field === titleField),
			{ field: 'creators', localized: 'Creators' },
			...itemTypeFields[item.itemType].filter(itf => itf.field !== titleField)
		].filter(e => e)
		.map(f => ({
			options: f.field === 'itemType' ? itemTypes : null,
			key: f.field,
			label: f.localized,
			readOnly: isReadOnlyMode ? true : noEditFields.includes(f),
			processing: pendingChanges.some(({ patch }) => f.field in patch),
			value: itemWithPendingChnages[f.field] || null,
		})).filter(f => !hideFields.includes(f.key)); //filter out undefined

		const props = {
			...this.props,
			fields,
			onSave: this.handleItemUpdated.bind(this, item),
			item: item || undefined,
			creatorTypes: itemTypeCreatorTypes,
			isEditing,
			isForm,
		};

		return <ItemBox { ... props } />;
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

	const itemTypeFields = state.meta.itemTypeFields;

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

	const pendingChanges = state.libraries[libraryKey].updating.items[itemKey] || [];

	return {
		item, itemTypeFields, itemTypes, itemTypeCreatorTypes, pendingChanges
	}
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

ItemBoxContainer.defaultProps = {
	pendingChanges: []
}

module.exports = withDevice(withEditMode(connect(mapStateToProps)(ItemBoxContainer)));
