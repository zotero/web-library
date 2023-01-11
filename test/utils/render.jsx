import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { setupStore } from '../../src/js/store'

export function renderWithProviders(
	ui,
	{
		preloadedState = {},
		...renderOptions
	} = {}
) {
	const { store, history } = setupStore(preloadedState);
	// eslint-disable-next-line react/prop-types
	function Wrapper({ children }) {
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					{children}
				</ConnectedRouter>
			</Provider>
		)
	}

	// Return an object with the store and all of RTL's query functions
	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
