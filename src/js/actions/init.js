import schema from 'zotero-schema/schema.json';
import { REQUEST_SCHEMA, RECEIVE_SCHEMA, CONFIGURE } from '../constants/actions';

const initialize = () => {
	return async (dispatch) => {
		dispatch({ type: REQUEST_SCHEMA });
		dispatch({ type: RECEIVE_SCHEMA, schema, embedded: true });
	};
};

const configure = config => {
	return {
		...config,
		type: CONFIGURE,
	};
};

export { initialize, configure };
