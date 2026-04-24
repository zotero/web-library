import {
	BEGIN_CATCHUP,
	COMPLETE_CATCHUP,
	STREAMING_REMOTE_LIBRARY_UPDATE,
	UPDATE_CATCHUP_TARGET,
} from '../constants/actions';
import { get } from '../utils';
import { getLastPageIndexSettingKey } from '../common/item';
import { fetchDeletedContentSince, fetchAllCollectionsSince, fetchAllItemsSince, fetchLibrarySettings } from '.';

// Per-library leading-edge + trailing-edge coalesce: the first event starts a
// catch-up; overlapping events only bump `pendingTarget`; on completion, one
// trailing catch-up fires if the response's `Last-Modified-Version` did not
// cover the latest observed target.
const remoteLibraryUpdate = (libraryKey, version) => {
	return async (dispatch, getState) => {
		const sync = get(getState(), ['libraries', libraryKey, 'sync']);
		if(!sync?.version) {
			return;
		}
		if(sync.version >= version) {
			return;
		}

		if(sync.isCatchingUp) {
			dispatch({ type: UPDATE_CATCHUP_TARGET, libraryKey, version });
			return;
		}

		const oldVersion = sync.version;
		const state = getState();
		const isReader = state.current.view === 'reader';

		dispatch({ type: BEGIN_CATCHUP, libraryKey, version });
		dispatch({ type: STREAMING_REMOTE_LIBRARY_UPDATE, libraryKey, version });
		dispatch(fetchLibrarySettings(libraryKey, 'tagColors'));

		try {
			if(isReader) {
				const readerItemKey = state.current.attachmentKey || state.current.itemKey;
				const readerFetches = [dispatch(fetchLibrarySettings(libraryKey, 'readerCustomThemes'))];
				if(readerItemKey) {
					const pageIndexSettingKey = getLastPageIndexSettingKey(readerItemKey, state.current.libraryKey);
					readerFetches.push(dispatch(fetchLibrarySettings(libraryKey, pageIndexSettingKey)));
				}
				await Promise.allSettled(readerFetches);
			} else {
				await Promise.allSettled([
					dispatch(fetchAllItemsSince(oldVersion, { includeTrashed: 1 }, { current: { libraryKey } })),
					dispatch(fetchAllCollectionsSince(oldVersion, libraryKey)),
					dispatch(fetchDeletedContentSince(oldVersion, libraryKey)),
				]);
			}
		} finally {
			const after = get(getState(), ['libraries', libraryKey, 'sync']);
			dispatch({ type: COMPLETE_CATCHUP, libraryKey });
			if(after?.pendingTarget && after.pendingTarget > after.version) {
				dispatch(remoteLibraryUpdate(libraryKey, after.pendingTarget));
			}
		}
	}
}

export {
	remoteLibraryUpdate
};
