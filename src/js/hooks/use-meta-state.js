import { useSelector } from 'react-redux';
import { get } from '../utils';

const useMetaState = () => {
	const { itemType } = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey], {})
	);

	const isMetaAvailable = useSelector(state => (
		itemType in state.meta.itemTypeCreatorTypes &&
		itemType in state.meta.itemTypeFields
	));

	const isMetaFetching = useSelector(state =>
		state.fetching.itemTypeCreatorTypes.includes(itemType) ||
		state.fetching.itemTypeFields.includes(itemType)
	);

	return { isMetaFetching, isMetaAvailable };
};

export { useMetaState };
