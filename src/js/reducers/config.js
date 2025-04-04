import { CONFIGURE, RECEIVE_GROUPS, RECEIVE_SCHEMA } from '../constants/actions.js';
import { sortByKey } from '../utils';
import { pick } from 'web-common/utils';
import * as defaults from '../constants/defaults';

const defaultState = {
	apiConfig: {},
	apiKey: null,
	defaultLibraryKey: null,
	libraries: [],
	streamingApiUrl: '',
	userId: null,
	isEmbedded: false,
	containterClassName: ''
};

const determineIfWriteable = (userId, ownerId, writeability, admins) => {
	if(writeability === 'none') {
		return false;
	}
	if(userId === ownerId) {
		//owner always has access, but is not in members/admins arrays
		return true;
	}
	if(writeability === 'members') {
		// you must be at least a member to have a group library listed
		return true;
	}
	if(writeability === 'admins') {
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
	slug = slug.replace(/[^\p{L} ._-]/gu, '');
	slug = slug.replace(/\s/g, '_');
	return slug;
};

const config = (state = defaultState, action) => {
	switch(action.type) {
		case RECEIVE_SCHEMA:
			return {
				...state,
				apiConfig: {
					...state.apiConfig,
					zoteroSchemaVersion: action.schema.version
				}
			}
		case CONFIGURE:
			action.libraries = action.libraries || {};
			return {
				...state,
				...pick(action, Object.keys(defaults)),
				defaultLibraryKey: determineDefaultLibraryKey(action),
				includeMyLibrary: action.libraries.includeMyLibrary,
				includeUserGroups: action.libraries.includeUserGroups,
				libraries: [
					action.userId && action.libraries.includeMyLibrary && {
						id: action.userId,
						key: `u${action.userId}`,
						isMyLibrary: true,
						isReadOnly: action.apiKey ? false : true,
						isFileUploadAllowed: action.apiKey ? true : false,
						name: 'My Library',
						isExternal: false,
						isPublic: false,
						slug: action.userSlug
					},
					...(action.libraries.include || []).map(include => ({
						isReadOnly: true,
						isFileUploadAllowed: false,
						slug: slugify(include.name),
						isGroupLibrary: false,
						id: include.key.slice(1),
						isExternal: true,
						isPublic: true,
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
					isPublic: group.type && group.type.toLowerCase().startsWith('public')
				}))
			];
			sortByKey(libraries, 'name');
			return { ...state, libraries }
		default:
			return state;
	}
};

export default config;
