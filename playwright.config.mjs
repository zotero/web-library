import {defineConfig, devices} from '@playwright/test';

const commonContextDesc = {
	locale: 'en-US',
	timezoneId: 'America/New_York',
	geolocation: {longitude: -73.935242, latitude: 40.730610},
};

export default defineConfig({
	testDir: './test/playwright',
	timeout: (process.env.CI ? 30 : 10) * 1000,
	retries: process.env.CI ? 3 : 0,
	outputDir: './playwright',
	fullyParallel: true,
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02,
			threshold: 0.3,
			animations: 'disabled'
		}
	},
	projects: [
		// -- Desktop (functional tests) --
		{
			name: 'Desktop Chrome',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				...commonContextDesc,
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
			name: 'Desktop Firefox',
			testMatch: /.*\.desktop\.test\.js/,
			use: {
				...devices['Desktop Firefox'],
				...commonContextDesc,
			},
		},
		// -- Mobile (functional tests) --
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
			name: 'Mobile iPad Pro 12.9 Landscape',
			testMatch: /.*\.mobile\.test\.js/,
			use: {
				...devices['iPad Pro 11 landscape'],
				viewport: {width: 1366, height: 1024},
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
		},
		// -- Visual Desktop (screenshot tests) --
		{
			name: 'Visual Desktop Chrome',
			testMatch: /.*\.visual-desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				...commonContextDesc,
			},
		},
		{
			name: 'Visual Desktop Chrome Dark',
			testMatch: /.*\.visual-desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				...commonContextDesc,
				colorScheme: 'dark',
			},
		},
		{
			name: 'Visual Desktop Safari',
			testMatch: /.*\.visual-desktop\.test\.js/,
			use: {
				...devices['Desktop Safari'],
				...commonContextDesc,
			},
		},
		{
			name: 'Visual Desktop Chrome Small',
			testMatch: /.*\.visual-desktop\.test\.js/,
			use: {
				...devices['Desktop Chrome'],
				viewport: {width: 1024, height: 768},
				...commonContextDesc,
			},
		},
		// -- Visual Mobile (screenshot tests) --
		{
			name: 'Visual Mobile iPhone',
			testMatch: /.*\.visual-mobile\.test\.js/,
			use: {
				...devices['iPhone 14'],
				...commonContextDesc,
			},
		},
		{
			name: 'Visual Mobile iPad',
			testMatch: /.*\.visual-mobile\.test\.js/,
			use: {
				...devices['iPad (gen 7)'],
				...commonContextDesc,
			},
		},
		{
			name: 'Visual Mobile iPad Dark',
			testMatch: /.*\.visual-mobile\.test\.js/,
			use: {
				...devices['iPad (gen 7)'],
				...commonContextDesc,
				colorScheme: 'dark',
			},
		},
		{
			name: 'Visual Mobile iPad Pro Landscape',
			testMatch: /.*\.visual-mobile\.test\.js/,
			use: {
				...devices['iPad Pro 11 landscape'],
				...commonContextDesc,
			},
		},
		{
			name: 'Visual Mobile Android',
			testMatch: /.*\.visual-mobile\.test\.js/,
			use: {
				...devices['Galaxy S24'],
				...commonContextDesc,
			},
		},
	],
});
