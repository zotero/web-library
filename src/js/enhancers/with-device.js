'use strict';

import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { UserContext, ViewportContext } from '../context';

const device = {
	isKeyboardUser: false,
	isMouseUser: false,
	isSingleColumn: false,
	isTouchOrSmall: false,
	isTouchUser: false,
	scrollbarWidth: false,
	shouldUseEditMode: false,
	shouldUseModalCreatorField: false,
	shouldUseSidebar: false,
	shouldUseTabs: false,
	userType: false,
	viewport: false,
};

const withDevice = Component => {
	const C = props => (
		<UserContext.Consumer>
		{ ({ userType, isKeyboardUser, isMouseUser, isTouchUser, scrollbarWidth }) => (
		<ViewportContext.Consumer>
		{ viewport => {
			const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
			const shouldUseEditMode = isTouchOrSmall;
			const shouldUseModalCreatorField = isTouchOrSmall;
			const shouldUseTabs = viewport.md || (viewport.lg && userType != 'touch');
			const isSingleColumn = viewport.xxs || viewport.xs;
			const shouldUseSidebar = !viewport.lg;

			device['isKeyboardUser'] = isKeyboardUser;
			device['isMouseUser'] = isMouseUser;
			device['isSingleColumn'] = isSingleColumn;
			device['isTouchOrSmall'] = isTouchOrSmall;
			device['isTouchUser'] = isTouchUser;
			device['scrollbarWidth'] = scrollbarWidth;
			device['shouldUseEditMode'] = shouldUseEditMode;
			device['shouldUseModalCreatorField'] = shouldUseModalCreatorField;
			device['shouldUseSidebar'] = shouldUseSidebar;
			device['shouldUseTabs'] = shouldUseTabs;
			device['userType'] = userType;
			device['viewport'] = viewport;

			return <Component { ...props } device={ device } />
		}}
		</ViewportContext.Consumer>
		)}
		</UserContext.Consumer>
	);

	C.displayName = `withDevice(${Component.displayName || Component.name})`;
	C.WrappedComponent = Component;
	hoistNonReactStatic(C, Component);
	return C;
};

export default withDevice;
