import {
    REQUEST_ITEM_TEMPLATE,
    RECEIVE_ITEM_TEMPLATE,
    ERROR_ITEM_TEMPLATE,
} from '../constants/actions';
import { apiCheckCache, apiResetCache } from '.';
import apiBase from 'zotero-api-client';
const api = apiBase().api;


// must return template, cannot use backoff
const fetchItemTemplate = (itemType, opts = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TEMPLATE,
			itemType
		});
		let config = getState().config;
		const cacheKey = `ITEM_TEMPLATE-${JSON.stringify({itemType, opts})}`;
		try {
			var template;
			if(apiCheckCache(cacheKey)) {
				try {
					template = (await api(config.apiKey, config.apiConfig)
						.template(itemType)
						.get({ ...opts, cache: 'force-cache' }))
					.getData();
				} catch(e) {
					apiResetCache(cacheKey);
				}
			}
			if(!template) {
				template = (await api(config.apiKey, config.apiConfig).template(itemType).get(opts)).getData();
			}
			dispatch({
				type: RECEIVE_ITEM_TEMPLATE,
				itemType,
				template
			});
			return template;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TEMPLATE,
				itemType,
				error
			});
			throw error;
		}
	};
};

export {
	fetchItemTemplate,
};
