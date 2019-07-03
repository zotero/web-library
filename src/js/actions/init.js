'use strict';

import api from 'zotero-api-client';
import { pick } from '../common/immutable';
import { REQUEST_META, RECEIVE_META, ERROR_META, CONFIGURE } from '../constants/actions';

const initialize = () => {
	return async (dispatch, getState) => {
		const { config: apiConfig } = getState();
		dispatch({
			type: REQUEST_META
		});

		try {
			const [itemTypes, itemFields, creatorFields] = (await Promise.all([
				api(null, apiConfig).itemTypes().get(),
				api(null, apiConfig).itemFields().get(),
				api(null, apiConfig).creatorFields().get()
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
		...pick(config, ['apiConfig', 'apiKey', 'libraries', 'menus', 'stylesSourceUrl',
			'translateUrl', 'userId', 'userSlug']
		),
		type: CONFIGURE,
	};
};

export { initialize, configure };
