'use strict';

const { get, indexByGeneratedKey } = require('../../utils');
const {
	RECEIVE_LIBRARY_SETTINGS,
	RECEIVE_TAGS_IN_COLLECTION,
	RECEIVE_TAGS_IN_LIBRARY,
	RECEIVE_TAGS_FOR_ITEM,
} = require('../../constants/actions');

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				...state,
				...indexByGeneratedKey(
					get(action.settings, 'tagColors.value', []),
					({ name }) => `${name}-0`,
					({ name, ...values }) => ({ tag: name, ...values })
				)
			};
		case RECEIVE_TAGS_IN_LIBRARY:
		case RECEIVE_TAGS_IN_COLLECTION:
		case RECEIVE_TAGS_FOR_ITEM:
			return {
				...state,
				...indexByGeneratedKey(action.tags,
					tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`,
					tag => ({
					...state[`${tag.tag}-${tag[Symbol.for('meta')].type}`],
					...tag
				}))
			}
		default:
			return state;
	}
};

module.exports = tags;
