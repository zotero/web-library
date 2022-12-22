import React from 'react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './utils/render'
import { MainZotero } from '../src/js/component/main'
import { setupStore } from '../src/js/store';
import * as defaults from '../src/js/constants/defaults';
import config from './fixtures/config';
import { configure } from '../src/js/actions';
import itemTypes from './fixtures/item-types';
import itemFields from './fixtures/item-fields';
import creatorFields from './fixtures/creator-fields';


const handlers = [
	rest.get('https://api.zotero.org/itemTypes', (req, res, ctx) => {
		return res(ctx.json(itemTypes));
	}),
	rest.get('https://api.zotero.org/itemFields', (req, res, ctx) => {
		return res(ctx.json(itemFields));
	}),
	rest.get('https://api.zotero.org/creatorFields', (req, res, ctx) => {
		return res(ctx.json(creatorFields));
	}),
	rest.get('https://api.zotero.org/users/475425/settings', (req, res, ctx) => {
		return res(ctx.json({}));
	}),
	rest.get('https://api.zotero.org/users/475425/collections', (req, res, ctx) => {
		return res(ctx.json([]));
	}),
];

const server = setupServer(...handlers)

// Enable API mocking before tests.
beforeAll(() => server.listen())

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Disable API mocking after the tests are done.
afterAll(() => server.close())

test('hello world', async () => {
	const store = setupStore();
	const libraries = { ...defaults.libraries, ...config.libraries };
	const apiConfig = { ...defaults.apiConfig, ...config.apiConfig };

	store.dispatch(
		configure({ ...defaults, ...config, apiConfig, libraries })
	);
	renderWithProviders(<MainZotero />, { store });
	expect(screen.getByRole('img', { name: 'Loading' })).toBeTruthy();
});
