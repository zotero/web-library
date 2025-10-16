import { defineConfig, devices } from '@playwright/test';

const commonContextDesc = { 
	locale: 'en-US', 
	timezoneId: 'America/New_York', 
	geolocation: { longitude: -73.935242, latitude: 40.730610 }, 
};

export default defineConfig({
	testDir: './test/playwright',
	timeout: (process.env.CI ? 30 : 10) * 1000,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	outputDir: './playwright',
	fullyParallel: true,
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
			animations: 'disabled'
		}
	},
	projects: [
		{
			name: 'Desktop Chrome',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				...commonContextDesc,
			},
		},
		{
			name: 'Desktop Chrome Dark',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				...commonContextDesc,
				colorScheme: 'dark',
			},
		},
		{
			name: 'Desktop Safari',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Safari'],
				...commonContextDesc,
			},
		},
		{
			name: 'Desktop Chrome Small',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1024, height: 768 },
				...commonContextDesc,
			},
		},
		{
			name: 'Mobile iPhone',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['iPhone 14'],
				...commonContextDesc,
			},
		},
		{
			name: 'Mobile iPad',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['iPad (gen 7)'],
				...commonContextDesc,
			},
		},
		{
			name: 'Mobile iPad Dark',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['iPad (gen 7)'],
				...commonContextDesc,
				colorScheme: 'dark',
			},
		},
		{
			name: 'Mobile iPad Pro Landscape',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['iPad Pro 11 landscape'],
				...commonContextDesc,
			},
		},
		{
			name: 'Mobile Android',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['Galaxy S24'],
				...commonContextDesc,
			},
		}
	],
});