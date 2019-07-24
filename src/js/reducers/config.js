'use strict';

import { CONFIGURE, SORT_ITEMS, RECEIVE_GROUPS } from '../constants/actions.js';
import { sortByKey } from '../utils';
import { pick } from '../common/immutable';

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

const slugify = name => {
	let slug = name.trim();
	slug = slug.toLowerCase();
	slug = slug.replace( /[^a-z0-9 ._-]/g , '');
	slug = slug.replace(/\s/g, '_');
	return slug;
}

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE:
			return {
				...state,
				...pick(action, ['apiConfig', 'apiKey', 'menus', 'stylesSourceUrl',
					'translateUrl', 'userId', 'userSlug', 'tinymceRoot']),
				defaultLibraryKey: determineDefaultLibraryKey(action),
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
						slug: slugify(include.name),
						isGroupLibrary: include.key[0] === 'g',
						id: include.key.slice(1),
						...include,
					}))
				].filter(Boolean),
			};
		case RECEIVE_GROUPS:
			var libraries = [
				...state.libraries.filter(l => !action.groups.some(g => l.key === `g${g.id}`)),
				...action.groups.map((group, _index) => ({
					id: group.id,
					key: `g${group.id}`,
					isGroupLibrary: true,
					name: group.name,
					slug: slugify(group.name),
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
