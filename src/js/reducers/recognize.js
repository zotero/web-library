import { getBaseMappedValue } from '../common/item';
import { BEGIN_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENTS, COMPLETE_RECOGNIZE_DOCUMENT,
	ERROR_RECOGNIZE_DOCUMENT, UPDATE_RECOGNIZE_DOCUMENT } from '../constants/actions';

const TOTALSTAGES = 4; // 3 progress update stages + 1 for completion

const updateProgressInState = (state) => {
	const progress = state.entries.reduce(
		(acc, { stage, completed, error }) => (completed || error) ? (acc + TOTALSTAGES) : (acc + stage), 0
	);
	const total = state.entries.length * TOTALSTAGES;

	return {
		...state,
		progress: progress / total,
	};
}


const recognize = (state = { progress: 0, entries: [] }, action, globalState) => {
	switch (action.type) {
		case BEGIN_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				entries: [
					...state.entries,
					{
						itemKey: action.itemKey,
						itemTitle: getBaseMappedValue(
							globalState?.meta?.mappings, globalState.libraries[globalState.current.libraryKey]?.items?.[action.itemKey], 'title'
						),
						libraryKey: action.libraryKey,
						stage: 0,
						error: null,
						completed: false,
					}
				]
			});
		case UPDATE_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				entries: state.entries.map(entry => {
					if (entry.itemKey === action.itemKey && entry.libraryKey === action.libraryKey) {
						return {
							...entry,
							stage: action.stage,
						};
					}
					return entry;
				})
			});
		case COMPLETE_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				entries: state.entries.map(entry => {
					if (entry.itemKey === action.itemKey && entry.libraryKey === action.libraryKey) {
						return {
							...entry,
							parentItemKey: action.parentItemKey,
							parentItemTitle: getBaseMappedValue(
								globalState?.meta?.mappings, globalState.libraries[globalState.current.libraryKey]?.items?.[action.parentItemKey], 'title'
							),
							completed: true,
						};
					}
					return entry;
				})
			});
		case ERROR_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				entries: state.entries.map(entry => {
					if (entry.itemKey === action.itemKey && entry.libraryKey === action.libraryKey) {
						return {
							...entry,
							error: action.error,
						};
					}
					return entry;
				})
			});
		case CLEAR_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				entries: state.entries.filter(entry => entry.itemKey !== action.itemKey)
			});
		case CLEAR_RECOGNIZE_DOCUMENTS:
			return {
				...state,
				progress: 0,
				entries: []
			}
		default:
			return state;
	}
};

export default recognize;
