'use strict';

import collections from './collections';
import deleting from './deleting';
import fetching from './fetching';
import items from './items';
import itemsByCollection from './items-by-collection';
import itemsByParent from './items-by-parent';
import itemsTop from './items-top';
import itemsTrash from './items-trash';
import tags from './tags';
import tagsByCollection from './tags-by-collection';
import tagsByItem from './tags-by-item';
import tagsFromSettings from './tags-from-settings';
import tagsTop from './tags-top';
import tagsInTrashItems from './tags-in-trash-items';
import tagsInPublicationsItems from './tags-in-publications-items';
import updating from './updating';
import version from './version';
import { get } from '../../utils';
const actions = [
	'ERROR_CHILD_ITEMS',
	'ERROR_COLLECTIONS_IN_LIBRARY',
	'ERROR_CREATE_ITEM',
	'ERROR_CREATE_ITEMS',
	'ERROR_DELETE_COLLECTION',
	'ERROR_DELETE_ITEM',
	'ERROR_DELETE_ITEMS',
	'ERROR_FETCH_ITEMS',
	'ERROR_ITEMS_BY_QUERY',
	'ERROR_ITEMS_IN_COLLECTION',
	'ERROR_LIBRARY_SETTINGS',
	'ERROR_TAGS_FOR_ITEM',
	'ERROR_TAGS_IN_COLLECTION',
	'ERROR_TAGS_IN_LIBRARY',
	'ERROR_TOP_ITEMS',
	'ERROR_UPDATE_COLLECTION',
	'ERROR_UPDATE_ITEM',
	'PRE_UPDATE_COLLECTION',
	'PRE_UPDATE_ITEM',
	'RECEIVE_ADD_ITEMS_TO_COLLECTION',
	'RECEIVE_CHILD_ITEMS',
	'RECEIVE_COLLECTIONS_IN_LIBRARY',
	'RECEIVE_CREATE_COLLECTIONS',
	'RECEIVE_CREATE_ITEM',
	'RECEIVE_CREATE_ITEMS',
	'RECEIVE_DELETE_COLLECTION',
	'RECEIVE_DELETE_ITEM',
	'RECEIVE_DELETE_ITEMS',
	'RECEIVE_FETCH_ITEMS',
	'RECEIVE_ITEMS_BY_QUERY',
	'RECEIVE_ITEMS_IN_COLLECTION',
	'RECEIVE_LIBRARY_SETTINGS',
	'RECEIVE_MOVE_ITEMS_TRASH',
	'RECEIVE_PUBLICATIONS_ITEMS',
	'RECEIVE_RECOVER_ITEMS_TRASH',
	'RECEIVE_REMOVE_ITEMS_FROM_COLLECTION',
	'RECEIVE_TAGS_FOR_ITEM',
	'RECEIVE_TAGS_IN_COLLECTION',
	'RECEIVE_TAGS_IN_ITEMS_BY_QUERY',
	'RECEIVE_TAGS_IN_LIBRARY',
	'RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS',
	'RECEIVE_TAGS_IN_TRASH_ITEMS',
	'RECEIVE_TOP_ITEMS',
	'RECEIVE_TRASH_ITEMS',
	'RECEIVE_UPDATE_COLLECTION',
	'RECEIVE_UPDATE_ITEM',
	'REQUEST_CHILD_ITEMS',
	'REQUEST_COLLECTIONS_IN_LIBRARY',
	'REQUEST_CREATE_ITEM',
	'REQUEST_CREATE_ITEMS',
	'REQUEST_DELETE_COLLECTION',
	'REQUEST_DELETE_ITEM',
	'REQUEST_DELETE_ITEMS',
	'REQUEST_FETCH_ITEMS',
	'REQUEST_ITEMS_BY_QUERY',
	'REQUEST_ITEMS_IN_COLLECTION',
	'REQUEST_LIBRARY_SETTINGS',
	'REQUEST_TAGS_FOR_ITEM',
	'REQUEST_TAGS_IN_COLLECTION',
	'REQUEST_TAGS_IN_LIBRARY',
	'REQUEST_TOP_ITEMS',
	'REQUEST_UPDATE_COLLECTION',
	'REQUEST_UPDATE_ITEM',
	'REQUEST_TAGS_IN_TOP_ITEMS',
	'RECEIVE_TAGS_IN_TOP_ITEMS',
	'ERROR_TAGS_IN_TOP_ITEMS',
	'SORT_ITEMS',
	'TRIGGER_EDITING_ITEM',
];

const libraries = (state = {}, action) => {
	if(actions.includes(action.type)) {
		return {
			...state,
			[action.libraryKey]: {
				collections: collections(get(state, [action.libraryKey, 'collections']), action),
				deleting: deleting(get(state, [action.libraryKey, 'deleting']), action),
				fetching: fetching(get(state, [action.libraryKey, 'fetching']), action),
				items: items(get(state, [action.libraryKey, 'items']), action),
				itemsByCollection: itemsByCollection(get(state, [action.libraryKey, 'itemsByCollection']), action),
				itemsByParent: itemsByParent(get(state, [action.libraryKey, 'itemsByParent']), action),
				itemsTop: itemsTop(get(state, [action.libraryKey, 'itemsTop']), action),
				itemsTrash: itemsTrash(get(state, [action.libraryKey, 'itemsTrash']), action),
				tags: tags(get(state, [action.libraryKey, 'tags']), action),
				tagsByCollection: tagsByCollection(get(state, [action.libraryKey, 'tagsByCollection']), action),
				tagsByItem: tagsByItem(get(state, [action.libraryKey, 'tagsByItem']), action),
				tagsInTrashItems: tagsInTrashItems(get(state, [action.libraryKey, 'tagsInTrashItems']), action),
				tagsInPublicationsItems: tagsInPublicationsItems(get(state, [action.libraryKey, 'tagsInPublicationsItems']), action),
				tagsFromSettings: tagsFromSettings(get(state, [action.libraryKey, 'tagsFromSettings']), action),
				tagsTop: tagsTop(get(state, [action.libraryKey, 'tagsTop']), action),
				updating: updating(get(state, [action.libraryKey, 'updating']), action),
				version: version(get(state, [action.libraryKey, 'version']), action)
			}
		}
	} else { return state; }
}

export default libraries;
