import React from 'react';
import { connect } from 'react-redux';

import Info from '../../component/item-details/info';
import { get } from '../../utils';
import { fetchItemTypeCreatorTypes, fetchItemTypeFields, updateItemWithMapping } from '../../actions';

const InfoContainer = props => <Info { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, itemKey } = state.current;
	const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
	const { itemType = null } = item || {};
	const pendingChanges = get(state, ['libraries', libraryKey, 'updating', 'items', itemKey], []);
	const isLibraryReadOnly = (state.config.libraries.find(l => l.key === libraryKey) || {}).isReadOnly;

	const isMetaAvailable = itemType in state.meta.itemTypeCreatorTypes &&
		itemType in state.meta.itemTypeFields;
	const shouldFetchMeta = !isMetaAvailable
		&& !state.fetching.itemTypeCreatorTypes.includes(itemType)
		&& !state.fetching.itemTypeFields.includes(itemType);
	const isLoadingMeta = !isMetaAvailable;

	if(!isMetaAvailable) {
		return { item, shouldFetchMeta, isLoadingMeta };
	}

	const creatorTypes = state.meta.itemTypeCreatorTypes[itemType];
	const itemTypeFields = state.meta.itemTypeFields;
	const itemTypes = state.meta.itemTypes;

	return { creatorTypes, isLibraryReadOnly, isLoadingMeta, item, itemTypeFields, itemTypes,
		pendingChanges, shouldFetchMeta };
}

export default connect(
	mapStateToProps,
	{ fetchItemTypeCreatorTypes, fetchItemTypeFields, updateItemWithMapping }
)(InfoContainer)
