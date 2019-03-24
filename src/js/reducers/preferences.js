import { preferences as defaultPreferences } from '../constants/defaults';
import { PREFERENCE_CHANGE, PREFERENCES_LOAD } from '../constants/actions.js';

const preferences = (state = { defaultPreferences }, action) => {
	switch(action.type) {
		case PREFERENCES_LOAD:
			return action.preferences;
		case PREFERENCE_CHANGE:
			return { ...state, [action.name]: action.value }
		default:
			return state;
	}
}

export default preferences;
