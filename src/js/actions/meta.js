'use strict';

import {
    REQUEST_ITEM_TYPE_CREATOR_TYPES,
    RECEIVE_ITEM_TYPE_CREATOR_TYPES,
    ERROR_ITEM_TYPE_CREATOR_TYPES,
    REQUEST_ITEM_TYPE_FIELDS,
    RECEIVE_ITEM_TYPE_FIELDS,
    ERROR_ITEM_TYPE_FIELDS,
    REQUEST_ITEM_TEMPLATE,
    RECEIVE_ITEM_TEMPLATE,
    ERROR_ITEM_TEMPLATE,
} from '../constants/actions';
import apiBase from 'zotero-api-client';
import cache from 'zotero-api-client-cache';
const api = apiBase().use(cache()).api;

const fetchItemTypeCreatorTypes = itemType => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType
		});
		let config = getState().config;
		try {
			let creatorTypes = (await api(config.apiKey, config.apiConfig)
				.itemTypeCreatorTypes(itemType)
				.get())
			.getData();

			dispatch({
				type: RECEIVE_ITEM_TYPE_CREATOR_TYPES,
				itemType,
				creatorTypes
			});
			return creatorTypes;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TYPE_CREATOR_TYPES,
				error,
				itemType
			});
			throw error;
		}
	};
};

const fetchItemTypeFields = itemType => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType
		});
		let config = getState().config;
		try {
			let fields = (await api(config.apiKey, config.apiConfig).itemTypeFields(itemType).get()).getData();
			dispatch({
				type: RECEIVE_ITEM_TYPE_FIELDS,
				itemType,
				fields
			});
			return fields;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TYPE_FIELDS,
				itemType,
				error
			});
			throw error;
		}
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
