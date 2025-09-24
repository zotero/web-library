import { createRoot } from 'react-dom/client';

import * as defaults from './constants/defaults';
import Main from './component/main';
import { setupStore } from './store';
import { configure } from './actions';

const init = (element, config = {}) => {
	const libraries = { ...defaults.libraries, ...config.libraries };
	const apiConfig = { ...defaults.apiConfig, ...config.apiConfig };
	const store = setupStore();

	store.dispatch(
		configure({ ...defaults, ...config, apiConfig, libraries })
	);

	if (process.env.NODE_ENV === 'development') {
		// only in development, expose redux store
		window.WebLibStore = store;
		window.WebLibCrash = () =>
			window.WebLibStore.dispatch({ type: 'CONFIGURE', ...defaults, ...config, apiConfig, libraries, menus: null });
	}

	const root = createRoot(element);
	root.render(<Main store={ store } />);
}

export default init;
