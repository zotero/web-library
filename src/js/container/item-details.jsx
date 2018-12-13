'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemDetails = require('../component/item/details');
const { push } = require('connected-react-router');
const { connect } = require('react-redux');
const { createItem, updateItem, deleteItem, fetchItemTemplate, fetchChildItems, uploadAttachment, fetchItems, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../actions');
const { itemProp, baseMappings } = require('../constants/item');
const { get, deduplicateByKey, mapRelationsToItemKeys, removeRelationByItemKey, reverseMap } = require('../utils');
const { makePath } = require('../common/navigation');
const { hideFields, noEditFields } = require('../constants/item');
const { getCurrent } = require('../common/state');
const withEditMode = require('../enhancers/with-edit-mode');
const withDevice = require('../enhancers/with-device');

class ItemDetailsContainer extends React.PureComponent {
	async componentDidUpdate() {
		const { item, shouldFetchMeta, dispatch } = this.props;
		if(item && item.key && shouldFetchMeta === true) {
			this.props.dispatch(fetchItemTypeCreatorTypes(item.itemType));
			this.props.dispatch(fetchItemTypeFields(item.itemType));
		}
	}

	async handleItemUpdated(fieldKey, newValue) {
		const item = this.props.item;
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

	async handleNoteChange(key, note) {
		await this.props.dispatch(updateItem(key, { note }));
	}

	async handleAddNote(note = '') {
		const noteTemplate = await this.props.dispatch(fetchItemTemplate('note'));
		const item = {
			...noteTemplate,
			parentItem: this.props.item.key,
			note
		};
		await this.props.dispatch(createItem(item, this.props.libraryKey));
	}

	async handleDeleteNote(note) {
		await this.props.dispatch(deleteItem(note));
	}

	async handleAddTag(tag) {
		let tags = [...this.props.item.tags, { tag }];
		deduplicateByKey(tags, 'tag');
		let patch = { tags };

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleDeleteTag(tag) {
		let patch = {
			tags: [...this.props.item.tags.filter(t => t.tag != tag)]
		};

		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleUpdateTag(tag, newTag) {
		let tags = [
			...this.props.item.tags.filter(t => t.tag != tag), {
			tag: newTag
		}];
		deduplicateByKey(tags, 'tag');
		let patch = { tags };
		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	async handleAddAttachment(fileData) {
		const attachmentTemplate = await this.props.dispatch(fetchItemTemplate('attachment', { linkMode: 'imported_file' }));
		const attachment = {
			...attachmentTemplate,
			parentItem: this.props.item.key,
			filename: fileData.fileName,
			contentType: fileData.contentType
		};
		let item = await this.props.dispatch(createItem(attachment, this.props.libraryKey));
		await this.props.dispatch(uploadAttachment(item.key, fileData));
	}

	async handleDeleteAttachment(attachment) {
		await this.props.dispatch(deleteItem(attachment));
	}

	handleRelatedItemSelect(item) {
		const { push, collection, libraryKey: library } = this.props;
		let isSameCollection = item.collections.includes(collection.key);
		if(isSameCollection) {
			push(makePath({ library, collection: collection.key, items: item.key }));
		} else {
			push(makePath({ library, items: item.key }));
		}
	}

	async handleRelatedItemDelete(relatedItem) {
		let patch1 = {
			relations: removeRelationByItemKey(
				relatedItem.key,
				this.props.item.relations,
				this.props.config.userId
			)
		};

		let patch2 = {
			relations: removeRelationByItemKey(
				this.props.item.key,
				relatedItem.relations,
				this.props.config.userId
			)
		};

		await Promise.all([
			this.props.dispatch(updateItem(this.props.item.key, patch1)),
			this.props.dispatch(updateItem(relatedItem.key, patch2)),
		]);
	}

	render() {
		const { isEditing, device, item, isLoadingMeta, itemTypeFields,
			itemTypes, pendingChanges, childItems, config } = this.props;
		const isForm = !!(device.shouldUseEditMode && isEditing && item);
		const isReadOnlyMode = !!(device.shouldUseEditMode && !isEditing);
		const extraProps = { isForm, isReadOnlyMode };

		if(!isLoadingMeta) {
			const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';
			const aggregatedPatch = pendingChanges.reduce(
				(aggr, { patch }) => ({...aggr, ...patch}), {}
			);
			const itemWithPendingChnages = { ...item, ...aggregatedPatch};
			const fields = [
				{ field: 'itemType', localized: 'Item Type' },
				itemTypeFields[item.itemType].find(itf => itf.field === titleField),
				{ field: 'creators', localized: 'Creators' },
				...itemTypeFields[item.itemType].filter(itf => itf.field !== titleField)
			]
			.filter(e => e)
			.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				readOnly: isReadOnlyMode ? true : noEditFields.includes(f),
				processing: pendingChanges.some(({ patch }) => f.field in patch),
				value: itemWithPendingChnages[f.field] || null,
			})).filter(f => !hideFields.includes(f.key)); //filter out undefined
			extraProps['fields'] = fields;
		}

		return <ItemDetails
				onNoteChange={ this.handleNoteChange.bind(this) }
				onAddNote={ this.handleAddNote.bind(this) }
				onDeleteNote = { this.handleDeleteNote.bind(this) }
				onAddTag = { this.handleAddTag.bind(this) }
				onDeleteTag = { this.handleDeleteTag.bind(this) }
				onUpdateTag = { this.handleUpdateTag.bind(this) }
				onAddAttachment = { this.handleAddAttachment.bind(this) }
				onDeleteAttachment = { this.handleDeleteAttachment.bind(this) }
				onRelatedItemSelect = { this.handleRelatedItemSelect.bind(this) }
				onRelatedItemDelete = { this.handleRelatedItemDelete.bind(this) }
				onSave = { this.handleItemUpdated.bind(this) }
				{ ...this.props }
				{ ...this.state }
				{ ...extraProps }
			/>;
	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		itemsSource,
		collectionKey,
		itemKey,
	} = getCurrent(state);
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
	const itemType = item ? item.itemType : null;
	const childItems = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], [])
			.map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const isProcessingTags = get(state,
		['libraries', libraryKey, 'updating', 'items', itemKey], []
	).some(({ patch }) => 'tagd' in patch);
	const isMetaAvailable = itemType in state.meta.itemTypeCreatorTypes &&
		itemType in state.meta.itemTypeFields;
	const shouldFetchMeta = !isMetaAvailable
		&& !state.fetching.itemTypeCreatorTypes.includes(itemType)
		&& !state.fetching.itemTypeFields.includes(itemType);
	const isLoadingMeta = !isMetaAvailable;
	const isLoadingChildItems = get(
		state, ['libraries', libraryKey, 'fetching', 'childItems'], [])
	.includes(itemKey);


	const relatedItemsKeys = item ? mapRelationsToItemKeys(item.relations || {}, state.config.userId)
		.filter(String) : [];
	const relatedItems = relatedItemsKeys
			.map(key => get(state, ['libraries', libraryKey, 'items', key]))
			.filter(Boolean);
	const isLoadingRelatedItems = get(
		state, ['libraries', libraryKey, 'fetching', 'items'], [])
	.some(loadedItemKey => relatedItemsKeys.includes(loadedItemKey));

	const extraProps = [];

	if(isMetaAvailable) {
		extraProps['itemTypeFields'] = state.meta.itemTypeFields;
		extraProps['itemTypes'] = state.meta.itemTypes
			.map(it => ({
				value: it.itemType,
				label: it.localized
			}))
			.filter(it => it.value !== 'note');
		extraProps['creatorTypes'] = state.meta.itemTypeCreatorTypes[itemType]
			.map(ct => ({
				value: ct.creatorType,
				label: ct.localized
			}));
	}

	var itemsCount;

	switch(itemsSource) {
		case 'query':
			itemsCount = state.query.totalResults;
		break;
		case 'top':
			itemsCount = get(state, ['itemCountTopByLibrary', libraryKey], null);
		break;
		case 'trash':
			itemsCount = get(state, ['itemCountTrashByLibrary', libraryKey], null);
		break;
		case 'collection':
			itemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey], null)
		break;
	}

	const selectedItemKeys = get(state, 'router.params.items');
	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey]) || [];

	return {
		childItems,
		collection: get(state, 'libraries', libraryKey, 'collections', collectionKey),
		isLoadingChildItems,
		isLoadingMeta,
		isProcessingTags,
		item,
		itemsCount,
		libraryKey,
		pendingChanges,
		relatedItems,
		relatedItemsKeys,
		selectedItemKeys: selectedItemKeys ? selectedItemKeys.split(',') : [],
		isLoadingRelatedItems,
		shouldFetchMeta,
		...extraProps
	};
};


ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: itemProp,
	dispatch: PropTypes.func.isRequired
};

module.exports = withDevice(withEditMode(connect(
	mapStateToProps, { push, fetchItems, fetchChildItems })(ItemDetailsContainer)));
