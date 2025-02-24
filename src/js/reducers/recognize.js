import { getBaseMappedValue } from '../common/item';
import { omit, pick } from 'web-common/utils';
import { BEGIN_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENTS, COMPLETE_RECOGNIZE_DOCUMENT,
	ERROR_RECOGNIZE_DOCUMENT, UPDATE_RECOGNIZE_DOCUMENT, COMPLETE_UNRECOGNIZE_DOCUMENT, ERROR_UNRECOGNIZE_DOCUMENT } from '../constants/actions';

const TOTALSTAGES = 4; // 3 progress update stages + 1 for completion

const updateProgressInState = (state) => {
	const progress = state.entries.reduce(
		(acc, { stage, completed, error }) => (completed || error) ? (acc + TOTALSTAGES) : (acc + stage), 0
	);
	const total = state.entries.length * TOTALSTAGES;

	return {
		...state,
		progress: total === 0 ? 0 : progress / total,
	};
}

const getDefaultState = () => ({
	backgroundTaskId: null, // id of the background task for all recognition processes, can only be updated by BEGIN_RECOGNIZE_DOCUMENT action
	progress: 0,
	entries: [], // items being recognized: { itemKey, itemTitle, libraryKey, stage, error, completed },
	lookup: {}, // items previously recognized: { libraryKey-itemKey: { originalItemKey, originalTitle, originalFilename }
});

const recognize = (state = getDefaultState(), action, globalState) => {
	switch (action.type) {
		case BEGIN_RECOGNIZE_DOCUMENT:
			return updateProgressInState({
				...state,
				backgroundTaskId: action.backgroundTaskId,
				entries: [
					...state.entries.filter(entry => !(entry.itemKey === action.itemKey && entry.libraryKey === action.libraryKey)),
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
				}),
				lookup: {
					...state.lookup,
					[`${action.libraryKey}-${action.parentItemKey}`]: { originalItemKey: action.itemKey, ...pick(action, ['originalTitle', 'originalFilename']) },
				}
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
			// action.itemKey is the key of the attachment item to be recognized.
			return updateProgressInState({
				...state,
				entries: state.entries.filter(entry => !(entry.itemKey === action.itemKey && entry.libraryKey === action.libraryKey)),
				lookup: state.lookup.reduce((acc, key) => {
					if (state.lookup[key] !== action.itemKey) {
						acc[key] = state.lookup[key];
					}
					return acc;
				}, {}),
			});
		case COMPLETE_UNRECOGNIZE_DOCUMENT:
		case ERROR_UNRECOGNIZE_DOCUMENT:
			// action.itemKey is the key of the parent item that was created.
			// action.originalItemKey is the key of the attachment item that was recognized.
			return updateProgressInState({
				...state,
				entries: state.entries.filter(entry => !(entry.itemKey === action.originalItemKey && entry.libraryKey === action.libraryKey)),
				lookup: omit(state.lookup, `${action.libraryKey}-${action.itemKey}`),
			});
		case CLEAR_RECOGNIZE_DOCUMENTS:
			return getDefaultState();
		default:
			return state;
	}
};

export default recognize;
