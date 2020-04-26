import { REMOTE_LIBRARY_UPDATE } from '../constants/actions';

const remoteLibraryUpdate = (libraryKey, version) => {
	return { type: REMOTE_LIBRARY_UPDATE, libraryKey, version };
}

export {
	remoteLibraryUpdate
};
