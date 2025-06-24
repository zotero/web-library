export { createElement } from 'react';
export { createRoot } from 'react-dom/client';
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types';

import { JSONtoState } from '../utils/state';
import { MainZotero } from '../../src/js/component/main';
import { setupStore } from '../../src/js/store'

export const MainWithState = ({ state = {} }) => {
	state = JSONtoState(state);
	const { store, history } = setupStore(state);
	return (
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<MainZotero />
			</ConnectedRouter>
		</Provider>
	)
}

MainWithState.propTypes = {
	state: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.string
	])
};
