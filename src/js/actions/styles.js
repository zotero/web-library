'use strict';

import { REQUEST_FETCH_STYLES, RECEIVE_FETCH_STYLES, ERROR_FETCH_STYLES } from '../constants/actions';

const fetchStyles = () => {
	return async (dispatch, getState) => {
		const { stylesSourceUrl } = getState().config;

		dispatch({
			type: REQUEST_FETCH_STYLES,
			stylesSourceUrl
		});

		try {
			const response = await fetch(stylesSourceUrl);
			const stylesData = await response.json();

			dispatch({
				type: RECEIVE_FETCH_STYLES,
				isFromCacheFallback: false,
				stylesSourceUrl,
				stylesData,
			});
			return stylesData;
		} catch(_) {
			try {
				// try to fallback for a cached version
				const response = await fetch(stylesSourceUrl, { 'cache': 'force-cache' });
				const stylesData = await response.json();

				dispatch({
					type: RECEIVE_FETCH_STYLES,
					isFromCacheFallback: true,
					stylesSourceUrl,
					stylesData,
				});
				return stylesData;
			} catch(error) {
				dispatch({
					type: ERROR_FETCH_STYLES,
					stylesSourceUrl,
					error
				});
			}
		}
	}
}

export { fetchStyles };
