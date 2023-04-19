import api from 'zotero-api-client';
import { REQUEST_SCHEMA, RECEIVE_SCHEMA, ERROR_SCHEMA, CONFIGURE } from '../constants/actions';

const initialize = () => {
	return async (dispatch, getState) => {
		const { config: apiConfig } = getState();
		dispatch({
			type: REQUEST_SCHEMA
		});

		try {
			const schema = (await api(null, apiConfig).schema().get()).getData();
			dispatch({ type: RECEIVE_SCHEMA, schema });
		} catch(error) {
			dispatch({ type: ERROR_SCHEMA, error });
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
