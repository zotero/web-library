'use strict';

import { makePath } from '../common/navigation';
import { push } from 'connected-react-router';

const navigate = (path, isAbsolute = false) => {
	return async (dispatch, getState) => {
		const { config, current } = getState();
		if(isAbsolute) {
			const configuredPath = makePath(config, path);
			dispatch(push(configuredPath));
		} else {
			const updatedPath = {
				collection: current.collectionKey,
				items: current.itemKeys,
				library: current.libraryKey,
				noteKey: current.noteKey,
				publications: current.isMyPublications,
				qmode: current.qmode,
				search: current.search,
				tags: current.tags,
				trash: current.isTrash,
				view: current.view,
				...path
			};
			const configuredPath = makePath(config, updatedPath);
			dispatch(push(configuredPath));
		}
	}
};

export { navigate };
