export { createElement } from 'react';
export { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import PropTypes from 'prop-types';
import { configureZoteroShim } from 'web-common/zotero';
import schema from 'zotero-schema/schema.json';

import { JSONtoState } from '../utils/state';
import { MainZotero } from '../../src/js/component/main';
import { setupStore } from '../../src/js/store'
import { remoteLibraryUpdate } from '../../src/js/actions';

export const MainWithState = ({ state = {} }) => {
	state = JSONtoState(state);
	const store = setupStore(state);
	const mockIntl = { locale: navigator?.language || 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
	configureZoteroShim(schema, mockIntl);

	// Expose the store and select action creators so Playwright tests can drive
	// the app by dispatching thunks directly via page.evaluate.
	window.WebLibStore = store;
	window.WebLibActions = { remoteLibraryUpdate };

	return (
		<Provider store={store}>
			<MainZotero />
		</Provider>
	)
}

MainWithState.propTypes = {
	state: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.string
	])
};
