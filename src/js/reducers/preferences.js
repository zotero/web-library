const defaults = require('../constants/defaults');

const { PREFERENCE_CHANGE, PREFERENCES_LOAD } = require('../constants/actions.js');

const preferences = (state = { ...defaults.preferences }, action) => {
	switch(action.type) {
		case PREFERENCES_LOAD:
			return action.preferences;
		case PREFERENCE_CHANGE:
			return { [action.name]: action.value }
		default:
			return state;
	}
}

module.exports = preferences;
