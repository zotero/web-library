/* global globalThis: readonly */
import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { setupStore } from '../../src/js/store'

export function renderWithProviders(
	ui,
	{
		preloadedState = {},
		includeStyles = false, // enabling styles makes test very slow so use with caution
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

	if (includeStyles) {
		const styleElement = document.createElement('style');
		styleElement.innerHTML = globalThis.css;
		document.head.appendChild(styleElement);
	}

	document.body.classList.add(globalThis.containerClass);

	const renderResult = render(ui, {
		wrapper: Wrapper,
		...renderOptions
	});


	// Return an object with the store and all of RTL's query functions
	return { store, ...renderResult }
}
