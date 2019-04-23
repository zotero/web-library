'use strict';

import { CONFIGURE_API, SORT_ITEMS, RECEIVE_GROUPS } from '../constants/actions.js';
import { sortByKey } from '../utils';

const defaultState = {
	apiKey: null,
	apiConfig: {},
	defaultLibraryKey: null,
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

const determineDefaultLibraryKey = action => {
	if(action.userId) {
		return `u${action.userId}`;
	}
	if(action.libraries.include.length) {
		return action.libraries.include[0].key
	}
	throw "Invalid configuration";
}

const parseSlug = url => {
	const match = url.match(/https?:\/\/(www\.)?zotero\.org\/groups\/(.*?)($|\/)/i)
	return match ? match[2] : null;
}

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE_API:
			return {
				...state,
				apiConfig: action.apiConfig,
				apiKey: action.apiKey,
				defaultLibraryKey:determineDefaultLibraryKey(action),
				stylesSourceUrl: action.stylesSourceUrl,
				userSlug: action.userSlug,
				userId: action.userId,
				includeMyLibrary: action.libraries.includeMyLibrary,
				includeUserGroups: action.libraries.includeUserGroups,
				libraries: [
					action.libraries.includeMyLibrary && {
						id: action.userId,
						key: `u${action.userId}`,
						isMyLibrary: true,
						isReadOnly: false,
						name: 'My Library',
						slug: action.userSlug
					},
					...action.libraries.include.map(include => ({
						isReadOnly: true,
						slug: include.name.toLowerCase(),
						isGroupLibrary: include.key[0] === 'g',
						id: include.key.slice(1),
						...include,
					}))
				].filter(Boolean)
			};
		case RECEIVE_GROUPS:
			var libraries = [
				...state.libraries.filter(l => !action.groups.some(g => l.key === `g${g.id}`)),
				...action.groups.map((group, index) => ({
					id: group.id,
					key: `g${group.id}`,
					isGroupLibrary: true,
					name: group.name,
					slug: parseSlug(action.response.getLinks()[index].alternate.href),
					isReadOnly: !determineIfGroupIsWriteable(group, state.userId)
				}))
			];
			sortByKey(libraries, 'name');
			return { ...state, libraries }
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
