import { STREAMING_REMOTE_LIBRARY_UPDATE } from '../constants/actions';
import { get } from '../utils';
import { getLastPageIndexSettingKey } from '../common/item';
import { fetchDeletedContentSince, fetchAllCollectionsSince, fetchAllItemsSince, fetchLibrarySettings } from '.';

const remoteLibraryUpdate = (libraryKey, version) => {
	return async (dispatch, getState) => {
		const state = getState();
		const oldVersion = get(state, ['libraries', libraryKey, 'sync', 'version']);
		if(oldVersion && oldVersion < version) {
			dispatch({ type: STREAMING_REMOTE_LIBRARY_UPDATE, libraryKey, version });
			dispatch(fetchLibrarySettings(libraryKey, 'tagColors'));
			dispatch(fetchAllItemsSince(oldVersion, { includeTrashed: 1 }, { current: { libraryKey } }));
			dispatch(fetchAllCollectionsSince(oldVersion, libraryKey));
			dispatch(fetchDeletedContentSince(oldVersion, libraryKey));
			if (state.current.view === 'reader' && state.current.attachmentKey) {
				const pageIndexSettingKey = getLastPageIndexSettingKey(state.current.attachmentKey, state.current.libraryKey);
				dispatch(fetchLibrarySettings(libraryKey, pageIndexSettingKey));
			}
		}
	}
}

export {
	remoteLibraryUpdate
};
