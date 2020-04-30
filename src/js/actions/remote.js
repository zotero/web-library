import { STREAMING_REMOTE_LIBRARY_UPDATE } from '../constants/actions';
import { get } from '../utils';
import { fetchAllCollectionsSince, fetchAllItemsSince } from '.';

const remoteLibraryUpdate = (libraryKey, version) => {
	return async (dispatch, getState) => {
		const state = getState();
		const oldVersion = get(state, ['libraries', libraryKey, 'sync', 'version']);
		if(oldVersion && oldVersion < version) {
			dispatch({ type: STREAMING_REMOTE_LIBRARY_UPDATE, libraryKey, version });
			dispatch(fetchAllItemsSince(oldVersion, { includeTrashed: 1 }, { current: { libraryKey } }));
			dispatch(fetchAllCollectionsSince(oldVersion, libraryKey));
		}
	}
}

export {
	remoteLibraryUpdate
};
