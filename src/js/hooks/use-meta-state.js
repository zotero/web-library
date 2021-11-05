import { useSelector } from 'react-redux';
import { get } from '../utils';

const useMetaState = () => {
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
	const isMetaAvailable = isItemTypeCreatorTypesAvailable && isItemTypeFieldsAvailable;
	const isMetaFetching = isFetchingItemTypeCreatorTypes || isFetchingItemTypeFields;

	return { isItemTypeCreatorTypesAvailable, isItemTypeFieldsAvailable,
		isFetchingItemTypeCreatorTypes, isFetchingItemTypeFields, isMetaFetching, isMetaAvailable };
};

export { useMetaState };
