'use strict';

const api = require('zotero-api-client')().api;
const {
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,
	CONFIGURE_API,
} = require('../constants/actions');

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

const configureApi = (userId, apiKey, apiConfig = {}, stylesSourceUrl) => {
	return {
		type: CONFIGURE_API,
		apiKey,
		userId,
		apiConfig,
		stylesSourceUrl
	};
};

module.exports = { initialize, configureApi };
