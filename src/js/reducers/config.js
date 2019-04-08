'use strict';

import { CONFIGURE_API, SORT_ITEMS, RECEIVE_GROUPS } from '../constants/actions.js';

const defaultState = {
	apiKey: null,
	apiConfig: {},
	userId: null,
	sortBy: 'title',
	sortDirection: 'asc',
	libraries: []
};

const determineIfGroupIsWriteable = (group, userId) => {
	const { libraryEditing, admins = [] } = group;
	if(libraryEditing === "members") {
		// you must be at least a member to have a group library listed
		return true;
	}
	if(libraryEditing === "admins") {
		// else check if admin
		return admins.includes(userId);
	}
	return false;
}

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE_API:
			return {
				...state,
				apiConfig: action.apiConfig,
				apiKey: action.apiKey,
				stylesSourceUrl: action.stylesSourceUrl,
				userId: action.userId,
				includeMyLibrary: action.libraries.includeMyLibrary,
				includeUserGroups: action.libraries.includeUserGroups,
				libraries: [
					action.libraries.includeMyLibrary && {
						key: `u${action.userId}`,
						isMyLibrary: true,
						isReadOnly: false,
						name: 'My Library'
					},
					...action.libraries.include.map(include => ({
						isReadOnly: true,
						...include
					}))
				].filter(Boolean)
			};
		case RECEIVE_GROUPS:
			return {
				...state,
				libraries: [
					...state.libraries.filter(l => !action.groups.some(g => l.key === `g${g.id}`)),
					...action.groups.map(group => ({
						key: `g${group.id}`,
						isGroupLibrary: true,
						name: group.name,
						isReadOnly: !determineIfGroupIsWriteable(group, state.userId)
					}))
				]
			}
		case SORT_ITEMS:
			return {
				...state,
				sortBy: action.sortBy,
				sortDirection: action.sortDirection
			};
		default:
			return state;
	}
};

export default config;
