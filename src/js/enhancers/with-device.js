'use strict';

import React from 'react';
import { useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import hoistNonReactStatic from 'hoist-non-react-statics';

var device = {
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
	const C = React.forwardRef((props, ref) => {
		const userTypeData = useSelector(state => state.userType);
		const viewport = useSelector(state => state.viewport);

		const { isKeyboardUser, isMouseUser, isTouchUser, scrollbarWidth, userType } = userTypeData;
		const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
		const shouldUseEditMode = isTouchOrSmall;
		const shouldUseModalCreatorField = isTouchOrSmall;
		const shouldUseTabs = viewport.md || (viewport.lg && userType != 'touch');
		const isSingleColumn = viewport.xxs || viewport.xs;
		const shouldUseSidebar = !viewport.lg;

		const newDevice = { isKeyboardUser, isMouseUser, isSingleColumn, isTouchOrSmall,
			isTouchUser, scrollbarWidth, shouldUseEditMode, shouldUseModalCreatorField,
			shouldUseSidebar, shouldUseTabs, userType, viewport
		};

		if(!deepEqual(device, newDevice)) {
			device = newDevice;
		}

		return <Component { ...props } device={ device } ref={ ref } />
	});

	C.displayName = `withDevice(${Component.displayName || Component.name})`;
	C.WrappedComponent = Component;
	hoistNonReactStatic(C, Component);
	return C;
};

export default withDevice;
