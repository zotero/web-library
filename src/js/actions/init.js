import api from 'zotero-api-client';
import { REQUEST_META, RECEIVE_META, ERROR_META, CONFIGURE } from '../constants/actions';
import { apiCheckCache, apiResetCache } from '.';

const tryCached = async (key, metaApi) => {
	if(apiCheckCache(key)) {
		try {
			return await metaApi.get({ cache: 'force-cache' });
		} catch(e) {
			apiResetCache(key);
		}
	}
	return await metaApi.get();
}

const initialize = () => {
	return async (dispatch, getState) => {
		const { config: apiConfig } = getState();
		dispatch({
			type: REQUEST_META
		});

		try {
			const [itemTypes, itemFields, creatorFields] = (await Promise.all([
				tryCached('itemTypes', api(null, apiConfig).itemTypes()),
				tryCached('itemFields', api(null, apiConfig).itemFields()),
				tryCached('creatorFields', api(null, apiConfig).creatorFields()),
			])).map(response => response.getData());
			dispatch({
				type: RECEIVE_META,
				itemTypes, itemFields, creatorFields
			});
		} catch(error) {
			dispatch({
				type: ERROR_META,
				error
			});
			throw error;
		}
	};
};

const configure = config => {
	return {
		...config,
		type: CONFIGURE,
	};
};

export { initialize, configure };
