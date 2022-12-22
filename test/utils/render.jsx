import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { setupStore } from '../../src/js/store'

export function renderWithProviders(
	ui,
	{
		preloadedState = {},
		store = setupStore(preloadedState),
		...renderOptions
	} = {}
) {
	// eslint-disable-next-line react/prop-types
	function Wrapper({ children }) {
		return <Provider store={store}>{children}</Provider>
	}

	// Return an object with the store and all of RTL's query functions
	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
