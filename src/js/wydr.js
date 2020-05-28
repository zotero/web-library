import React from 'react';
import whyDidYouRender from "@welldone-software/why-did-you-render";
import * as ReactRedux from 'react-redux';
import * as FocusManagerHooks from './hooks/use-focus-manager';
import * as FetchingStateHooks from './hooks/use-fetching-state';

if (process.env.NODE_ENV === 'development') {
	whyDidYouRender(React, {
		onlyLogs: true,
		titleColor: '#957DAD',
		diffNameColor: '#FFDFD3',
		// trackAllPureComponents: true,
		trackExtraHooks: [
			[ReactRedux, 'useSelector'],
			[FocusManagerHooks, 'useFocusManager'],
			[FetchingStateHooks, 'useFetchingState', 'useSourceSignature', 'useSourceData', 'useTags'],
		]
	});
	console.warn('whyDidYouRender installed');
}
