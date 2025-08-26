import schema from 'zotero-schema/schema.json';
import { REQUEST_SCHEMA, RECEIVE_SCHEMA, CONFIGURE } from '../constants/actions';
import { configureZoteroShim } from 'web-common/zotero';

const initialize = () => {
	const mockIntl = { locale: navigator?.language || 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
	configureZoteroShim(schema, mockIntl);

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
