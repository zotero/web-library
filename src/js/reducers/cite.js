import { BEGIN_FETCH_STYLE, COMPLETE_FETCH_STYLE, ERROR_FETCH_STYLE } from '../constants/actions';

const defaultState = {
	itemKeys: [],
	styleXml: null,
	styleProperties: null,
	isFetchingStyle: false,
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case BEGIN_FETCH_STYLE:
			return {
				...state,
				styleXml: null,
				styleProperties: null,
				isFetchingStyle: true,
			};
		case COMPLETE_FETCH_STYLE:
			return {
				...state,
				styleXml: action.styleXml,
				styleProperties: action.styleProperties,
				isFetchingStyle: false
			};
		case ERROR_FETCH_STYLE:
			return {
				...state,
				styleXml: null,
				styleProperties: null,
				isFetchingStyle: false,
			};
		default:
			return state;
	}
};
