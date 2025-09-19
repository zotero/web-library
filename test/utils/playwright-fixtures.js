import { test as baseTest } from '@playwright/test';
import { getPort } from './fixed-state-server.js';

export const test = baseTest.extend({
	serverPort: [async ({ }, use, workerInfo) => {
		const port = getPort(workerInfo.workerIndex + 1);
		await use(port);
	}, { scope: 'worker' }],
});

export const expect = test.expect;
