import {
    REQUEST_ITEM_TYPE_CREATOR_TYPES,
    REQUEST_ITEM_TYPE_FIELDS,
    REQUEST_ITEM_TEMPLATE,
    RECEIVE_ITEM_TEMPLATE,
    ERROR_ITEM_TEMPLATE,
} from '../constants/actions';
import { requestTracker, requestWithBackoff } from '.';
import apiBase from 'zotero-api-client';
const api = apiBase().api;

const fetchItemTypeCreatorTypes = itemType => {
	return async (dispatch, getState) => {
		const id = requestTracker.id++;
		const config = getState().config;
		const type = 'ITEM_TYPE_CREATOR_TYPES';

		dispatch({
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType
		});

		const makeRequest = async () => {
			const creatorTypes = (await api(config.apiKey, config.apiConfig)
				.itemTypeCreatorTypes(itemType)
				.get())
				.getData();

			return { creatorTypes }
		}

		const payload = { itemType };
		return dispatch(requestWithBackoff(makeRequest, { id, type, payload }));
	};
};

const fetchItemTypeFields = itemType => {
	return async (dispatch, getState) => {
		const id = requestTracker.id++;
		const config = getState().config;
		const type = 'ITEM_TYPE_FIELDS';

		dispatch({
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType
		});

		const makeRequest = async () => {
			const fields = (await api(config.apiKey, config.apiConfig)
				.itemTypeFields(itemType)
				.get())
				.getData();

			return { fields }
		}

		const payload = { itemType };
		return dispatch(requestWithBackoff(makeRequest, { id, type, payload }));
	};
};

const fetchItemTemplate = (itemType, opts = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TEMPLATE,
			itemType
		});
		let config = getState().config;
		try {
			let template = (await api(config.apiKey, config.apiConfig).template(itemType).get(opts)).getData();
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
