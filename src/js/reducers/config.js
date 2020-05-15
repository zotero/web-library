'use strict';

import { CONFIGURE, SORT_ITEMS, RECEIVE_GROUPS } from '../constants/actions.js';
import { sortByKey } from '../utils';
import { pick } from '../common/immutable';

const defaultState = {
	apiConfig: {},
	apiKey: null,
	defaultLibraryKey: null,
	libraries: [],
	sortBy: 'title',
	sortDirection: 'asc',
	streamingApiUrl: '',
	userId: null,
};

const determineIfWriteable = (userId, ownerId, writeability, admins) => {
	if(userId === ownerId) {
		//owner always has access, but is not in members/admins arrays
		return true;
	}
	if(writeability === "members") {
		// you must be at least a member to have a group library listed
		return true;
	}
	if(writeability === "admins") {
		// else check if admin
		return admins.includes(userId);
	}
	return false;
};

const determineIfGroupIsWriteable = (group, userId) => {
	const { libraryEditing, owner, admins = [] } = group;
	return determineIfWriteable(userId, owner, libraryEditing, admins);
};

const determineIfGroupAllowsUploads = (group, userId) => {
	const { fileEditing, owner, admins = [] } = group;
	return determineIfWriteable(userId, owner, fileEditing, admins);
};

const determineDefaultLibraryKey = action => {
	if(action.userId) {
		return `u${action.userId}`;
	}
	if('libraries' in action && action.libraries.include.length) {
		return action.libraries.include[0].key;
	}
	throw new Error("Invalid configuration");
};

const slugify = name => {
	let slug = name.trim();
	slug = slug.toLowerCase();
	slug = slug.replace( /[^a-z0-9 ._-]/g , '');
	slug = slug.replace(/\s/g, '_');
	return slug;
};

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE:
			action.libraries = action.libraries || {};
			return {
				...state,
				...pick(action, ['apiConfig', 'apiKey', 'menus', 'stylesSourceUrl',
					'streamingApiUrl', 'translateUrl', 'userId', 'userSlug', 'tinymceRoot']),
				defaultLibraryKey: determineDefaultLibraryKey(action),
				includeMyLibrary: action.libraries.includeMyLibrary,
				includeUserGroups: action.libraries.includeUserGroups,
				libraries: [
					action.libraries.includeMyLibrary && {
						id: action.userId,
						key: `u${action.userId}`,
						isMyLibrary: true,
						isReadOnly: false,
						isFileUploadAllowed: true,
						name: 'My Library',
						isExternal: false,
						slug: action.userSlug
					},
					...(action.libraries.include || []).map(include => ({
						isReadOnly: true,
						isFileUploadAllowed: false,
						slug: slugify(include.name),
						isGroupLibrary: false,
						id: include.key.slice(1),
						isExternal: true,
						...include,
					}))
				].filter(Boolean),
			};
		case RECEIVE_GROUPS:
			var libraries = [
				...state.libraries.filter(l => !action.groups.some(g => l.key === `g${g.id}`)),
				...action.groups.map(group => ({
					id: group.id,
					key: `g${group.id}`,
					isGroupLibrary: true,
					name: group.name,
					slug: slugify(group.name),
					isReadOnly: !determineIfGroupIsWriteable(group, state.userId),
					isFileUploadAllowed: determineIfGroupAllowsUploads(group, state.userId),
					isExternal: false,
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
