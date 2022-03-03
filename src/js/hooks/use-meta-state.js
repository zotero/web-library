import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get } from '../utils';
import { apiResetAllCacheOnce } from '../actions';

const useMetaState = () => {
	const dispatch = useDispatch();
	const { itemType } = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey], {})
	);

	const isItemTypeCreatorTypesAvailable = useSelector(
		state => itemType && itemType in state.meta.itemTypeCreatorTypes
	);
	const isItemTypeFieldsAvailable = useSelector(
		state => itemType && itemType in state.meta.itemTypeFields
	);
	const isFetchingItemTypeCreatorTypes = useSelector(
		state => state.fetching.itemTypeCreatorTypes.includes(itemType)
	);
	const isFetchingItemTypeFields = useSelector(
		state => state.fetching.itemTypeFields.includes(itemType)
	);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const cacheInvalidated = useSelector(state => state.meta.invalidated);

	const isKnownItemType = itemTypes.some(it => it.itemType === itemType);

	const isMetaAvailable = isItemTypeCreatorTypesAvailable && isItemTypeFieldsAvailable &&
		(isKnownItemType || cacheInvalidated);
	const isMetaFetching = isFetchingItemTypeCreatorTypes || isFetchingItemTypeFields;

	useEffect(() => {
		if(!isKnownItemType) {
			dispatch(apiResetAllCacheOnce());
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return { isItemTypeCreatorTypesAvailable, isItemTypeFieldsAvailable,
		isFetchingItemTypeCreatorTypes, isFetchingItemTypeFields, isMetaFetching, isMetaAvailable };
};

export { useMetaState };
