import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import schema from 'zotero-schema/schema.json';

import { setupStore } from '../../src/js/store'
import { configureZotero } from '../../src/js/utils'

export function renderWithProviders(
	ui,
	{
		preloadedState = {},
		...renderOptions
	} = {}
) {
	const store = setupStore(preloadedState);
	configureZotero(schema);
	// eslint-disable-next-line react/prop-types
	function Wrapper({ children }) {
		return (
			<Provider store={store}>
				{children}
			</Provider>
		)
	}

	const renderResult = render(ui, {
		wrapper: Wrapper,
		...renderOptions
	});

	// Return an object with the store and all of RTL's query functions
	return { store, ...renderResult }
}
