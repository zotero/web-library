import { useSelector } from 'react-redux';

const useMetaState = () => {
	const itemKey = useSelector(state => state.current.itemKey);
	const libraryKey = useSelector(state => state.current.libraryKey);

	if(!libraryKey || !itemKey) {
		return {
			isMetaAvailable: false,
			isMetaFetching: false
		}
	}
	const { itemType } = useSelector(state => state.libraries[libraryKey].items[itemKey]);

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
