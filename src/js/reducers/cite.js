import { BEGIN_FETCH_STYLE, COMPLETE_FETCH_STYLE, ERROR_FETCH_STYLE } from '../constants/actions';

const defaultState = {
	itemKeys: [],
	styleName: null, // style currently loaded or being fetched, may differ from the preference when falling back
	styleXml: null,
	styleProperties: null,
	isFetchingStyle: false,
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case BEGIN_FETCH_STYLE:
			return {
				...state,
				styleName: action.styleName,
				styleXml: null,
				styleProperties: null,
				isFetchingStyle: true,
			};
		case COMPLETE_FETCH_STYLE:
			return {
				...state,
				styleName: action.styleName,
				styleXml: action.styleXml,
				styleProperties: action.styleProperties,
				isFetchingStyle: false,
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
