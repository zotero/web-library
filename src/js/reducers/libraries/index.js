import { omit } from 'web-common/utils';

import attachmentsExportPDF from './attachments-export-pdf';
import attachmentsUrl from './attachments-url';
import collections from './collections';
import deleting from './deleting';
import items from './items';
import creating from './creating';
import itemsByCollection from './items-by-collection';
import itemsByParent from './items-by-parent';
import itemsRelated from './items-related';
import itemsTop from './items-top';
import itemsTrash from './items-trash';
import settings from './settings';
import sync from './sync';
import tagColors from './tag-colors';
import tagsByCollection from './tags-by-collection';
import tagsInLibrary from './tags-in-library';
import tagsInPublicationsItems from './tags-in-publications-items';
import tagsInTrashItems from './tags-in-trash-items';
import tagsTop from './tags-top';
import updating from './updating';
import { get } from '../../utils';

const libraries = (state = {}, action, { itemsPublications, meta } = {})  => {
	if(action.type === 'RESET_LIBRARY') {
		return omit(state, action.libraryKey);
	} else if(action.libraryKey) {
		return {
			...state,
			[action.libraryKey]: {
				attachmentsExportPDF: attachmentsExportPDF(state[action.libraryKey]?.attachmentsExportPDF, action),
				attachmentsUrl: attachmentsUrl(get(state, [action.libraryKey, 'attachmentsUrl']), action),
				collections: collections(get(state, [action.libraryKey, 'collections']), action),
				creating: creating(state[action.libraryKey]?.creating, action),
				deleting: deleting(get(state, [action.libraryKey, 'deleting']), action),
				items: items(get(state, [action.libraryKey, 'items']), action, {
					tagColors: (state[action.libraryKey]?.tagColors || {}), meta
				} ),
				itemsByCollection: itemsByCollection(get(state, [action.libraryKey, 'itemsByCollection']), action, {
					items: (state[action.libraryKey] || {}).items, meta
				}),
				itemsByParent: itemsByParent(get(state, [action.libraryKey, 'itemsByParent']), action, {
					items: (state[action.libraryKey] || {}).items, meta
				}),
				itemsRelated: itemsRelated(get(state, [action.libraryKey, 'itemsRelated']), action),
				itemsTop: itemsTop(get(state, [action.libraryKey, 'itemsTop']), action, {
					items: (state[action.libraryKey] || {}).items, meta
				}),
				itemsTrash: itemsTrash(get(state, [action.libraryKey, 'itemsTrash']), action, {
					items: (state[action.libraryKey] || {}).items, meta
				}),
				settings: settings(get(state, [action.libraryKey, 'settings']), action),
				sync: sync(get(state, [action.libraryKey, 'sync']), action),
				tagColors: tagColors(get(state, [action.libraryKey, 'tagColors']), action),
				tagsByCollection: tagsByCollection(get(state, [action.libraryKey, 'tagsByCollection']), action, {
					items: (state[action.libraryKey] || {}).items
				}),
				tagsInPublicationsItems: tagsInPublicationsItems(get(state, [action.libraryKey, 'tagsInPublicationsItems']), action, {
					itemsPublications, items: (state[action.libraryKey] || {}).items
				}),
				tagsInTrashItems: tagsInTrashItems(get(state, [action.libraryKey, 'tagsInTrashItems']), action, {
					items: (state[action.libraryKey] || {}).items
				}),
				tagsTop: tagsTop(get(state, [action.libraryKey, 'tagsTop']), action, {
					items: (state[action.libraryKey] || {}).items
				}),
				tagsInLibrary: tagsInLibrary(get(state, [action.libraryKey, 'tagsInLibrary']), action, {
					items: (state[action.libraryKey] || {}).items
				}),
				updating: updating(get(state, [action.libraryKey, 'updating']), action),
			}
		}
	} else { return state; }
}

export default libraries;
