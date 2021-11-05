import {
    REQUEST_ITEM_TYPE_CREATOR_TYPES,
    REQUEST_ITEM_TYPE_FIELDS,
    REQUEST_ITEM_TEMPLATE,
    RECEIVE_ITEM_TEMPLATE,
    ERROR_ITEM_TEMPLATE,
} from '../constants/actions';
import { apiCheckCache, apiResetCache, requestTracker, requestWithCacheAndBackoff } from '.';
import apiBase from 'zotero-api-client';
const api = apiBase().api;


const fetchItemTypeCreatorTypes = itemType => {
	return async (dispatch, getState) => {
		const id = requestTracker.id++;
		const config = getState().config;
		const type = 'ITEM_TYPE_CREATOR_TYPES';
		const payload = { itemType };

		dispatch({
			id,
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType
		});

		const makeRequest = async ({ useCache = false }) => {
			const creatorTypes = (await api(config.apiKey, config.apiConfig)
				.itemTypeCreatorTypes(itemType)
				.get({ cache: useCache ? 'force-cache' : 'default'}))
				.getData();

			return { creatorTypes };
		}

		return requestWithCacheAndBackoff(dispatch, makeRequest, { id, type, payload });
	};
};

const fetchItemTypeFields = itemType => {
	return async (dispatch, getState) => {
		const id = requestTracker.id++;
		const config = getState().config;
		const type = 'ITEM_TYPE_FIELDS';
		const payload = { itemType };

		dispatch({
			id,
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType
		});

		const makeRequest = async ({ useCache }) => {
			const fields = (await api(config.apiKey, config.apiConfig)
				.itemTypeFields(itemType)
				.get({ cache: useCache ? 'force-cache' : 'default'}))
				.getData();

			return { fields };
		}

		return requestWithCacheAndBackoff(dispatch, makeRequest, { id, type, payload });
	};
};

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
	fetchItemTypeCreatorTypes,
	fetchItemTypeFields,
	fetchItemTemplate,
};
