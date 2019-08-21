'use strict';

import baseMappings from 'zotero-base-mappings';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import ItemDetails from '../component/item/details';
import Types from '../types';
import { makePath } from '../common/navigation';

import {
    updateItem,
    fetchChildItems,
    fetchItemTypeCreatorTypes,
    fetchItemTypeFields,
    navigate,
    sourceFile,
} from '../actions';

import { hideFields, noEditFields, extraFields } from '../constants/item';

import {
    get,
    deduplicateByKey,
    reverseMap,
} from '../utils';

import { getFieldDisplayValue } from '../common/item';
import withEditMode from '../enhancers/with-edit-mode';
import withDevice from '../enhancers/with-device';
const PAGE_SIZE = 100;

class ItemDetailsContainer extends React.PureComponent {
	async componentDidUpdate() {
		const { childItems, device, fetchChildItems, item, isFetched, isFetching,
			shouldFetchMeta, totalChildItems, dispatch, isTinymceFetched, isTinymceFetching, sourceFile } = this.props;


		if(item && item.key) {
			if(!isTinymceFetched && !isTinymceFetching) {
				sourceFile('tinymce');
			}

			if(!isFetching && !isFetched && !['attachment', 'note'].includes(item.itemType)) {
				const start = childItems.length;
				const limit = PAGE_SIZE;
				fetchChildItems(item.key, { start, limit })
			}

			if(shouldFetchMeta) {
				dispatch(fetchItemTypeCreatorTypes(item.itemType));
				dispatch(fetchItemTypeFields(item.itemType));
			}
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

	async handleAddTag(tag) {
		let tags = deduplicateByKey([...this.props.item.tags, { tag }], 'tag');
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
		let tags = deduplicateByKey([
			...this.props.item.tags.filter(t => t.tag != tag), {
			tag: newTag
		}], 'tag');
		let patch = { tags };
		await this.props.dispatch(updateItem(this.props.item.key, patch));
	}

	render() {
		const { isEditing, device, item, isLoadingMeta, isLibraryReadOnly, itemTypeFields,
			itemTypes, pendingChanges } = this.props;
		const isForm = !!(device.shouldUseEditMode && isEditing && item);
		const isReadOnly = isLibraryReadOnly || !!(device.shouldUseEditMode && !isEditing);
		const extraProps = { isForm, isReadOnly };

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
				...itemTypeFields[item.itemType].filter(itf => itf.field !== titleField),
				...extraFields
			]
			.filter(e => e)
			.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				isReadOnly: isReadOnly ? true : noEditFields.includes(f),
				processing: pendingChanges.some(({ patch }) => f.field in patch),
				display: getFieldDisplayValue(itemWithPendingChnages, f.field),
				value: itemWithPendingChnages[f.field] || null
			})).filter(f => !hideFields.includes(f.key)); //filter out undefined
			extraProps['fields'] = fields;
		}

		return <ItemDetails
				onAddTag = { this.handleAddTag.bind(this) }
				onDeleteTag = { this.handleDeleteTag.bind(this) }
				onUpdateTag = { this.handleUpdateTag.bind(this) }
				onSave = { this.handleItemUpdated.bind(this) }
				{ ...this.props }
				{ ...this.state }
				{ ...extraProps }
			/>;
	}
}

const mapStateToProps = state => {
	const {
		collectionKey,
		isSelectMode,
		itemKey,
		itemKeys,
		itemsSource,
		libraryKey,
		noteKey,
	} = state.current;
	const { isLibraryReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
	const itemType = item ? item.itemType : null;
	const childItemsData = get(state, ['libraries', libraryKey, 'itemsByParent', itemKey], {});
	const { isFetching, pointer, keys, totalResults } = childItemsData;
	const childItems = (keys || []).map(key => get(state, ['libraries', libraryKey, 'items', key], {}));
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const isFetched = !isFetching && !hasMoreItems;

	const isTinymceFetched = state.sources.fetched.includes('tinymce');
	const isTinymceFetching = state.sources.fetching.includes('tinymce');

	const isProcessingTags = get(state,
		['libraries', libraryKey, 'updating', 'items', itemKey], []
	).some(({ patch }) => 'tags' in patch);

	const isMetaAvailable = itemType in state.meta.itemTypeCreatorTypes &&
		itemType in state.meta.itemTypeFields;
	const shouldFetchMeta = !isMetaAvailable
		&& !state.fetching.itemTypeCreatorTypes.includes(itemType)
		&& !state.fetching.itemTypeFields.includes(itemType);
	const isLoadingMeta = !isMetaAvailable;

	const tagColors = get(state, ['libraries', libraryKey, 'tagColors']);

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
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTop', 'totalResults'], null);
		break;
		case 'trash':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsTrash', 'totalResults'], null);
		break;
		case 'collection':
			itemsCount = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey, 'totalResults'], null)
		break;
	}

	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey]) || [];

	return {
		childItems,
		collection: get(state, 'libraries', libraryKey, 'collections', collectionKey),
		isFetched,
		isFetching,
		isLibraryReadOnly,
		isLoadingMeta,
		isProcessingTags,
		isSelectMode,
		isTinymceFetched,
		isTinymceFetching,
		item,
		itemsCount,
		libraryKey,
		makePath: makePath.bind(null, state.config),
		noteKey,
		pendingChanges,
		pointer,
		selectedItemKeys: itemKeys, //@TODO: rename
		shouldFetchMeta,
		tagColors,
		totalResults,
		...extraProps
	};
};


ItemDetailsContainer.propTypes = {
	fields: PropTypes.array,
	item: Types.item,
	dispatch: PropTypes.func.isRequired,
	makePath: PropTypes.func.isRequired,
};

export default withDevice(withEditMode(connect(
	mapStateToProps, { push, fetchChildItems, updateItem, navigate, sourceFile })(ItemDetailsContainer)));
