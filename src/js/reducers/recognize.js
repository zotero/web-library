import { BEGIN_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENT, CLEAR_RECOGNIZE_DOCUMENTS, COMPLETE_RECOGNIZE_DOCUMENT,
	ERROR_RECOGNIZE_DOCUMENT, UPDATE_RECOGNIZE_DOCUMENT } from '../constants/actions';

const recognize = (state = [], action) => {
	switch (action.type) {
		case BEGIN_RECOGNIZE_DOCUMENT:
			return [
				...state,
				{
					itemKey: action.itemKey,
					libraryKey: action.libraryKey,
					stage: 0,
					error: null,
					completed: false,
				}
			];
		case UPDATE_RECOGNIZE_DOCUMENT:
			return state.map(recognize => {
				if (recognize.itemKey === action.itemKey && recognize.libraryKey === action.libraryKey) {
					return {
						...recognize,
						stage: action.stage,
					};
				}
				return recognize;
			});
		case COMPLETE_RECOGNIZE_DOCUMENT:
			return state.map(recognize => {
				if (recognize.itemKey === action.itemKey && recognize.libraryKey === action.libraryKey) {
					return {
						...recognize,
						parentItemKey: action.parentItemKey,
						completed: true,
					};
				}
				return recognize;
			});
		case ERROR_RECOGNIZE_DOCUMENT:
			return state.map(recognize => {
				if (recognize.itemKey === action.itemKey && recognize.libraryKey === action.libraryKey) {
					return {
						...recognize,
						stage: 3,
						error: action.error,
					};
				}
				return recognize;
			});
		case CLEAR_RECOGNIZE_DOCUMENT:
			return state.filter(recognize => recognize.itemKey !== action.itemKey);
		case CLEAR_RECOGNIZE_DOCUMENTS:
			return [];
		default:
			return state;
	}
};

export default recognize;
