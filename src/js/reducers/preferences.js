const defaults = require('../constants/defaults');

const { PREFERENCE_CHANGE } = require('../constants/actions.js');

const preferences = (state = { ...defaults.preferences }, action) => {
	switch(action.type) {
		case PREFERENCE_CHANGE:
			return { [action.name]: action.value }
		default:
			return state;
	}
}

module.exports = preferences;
