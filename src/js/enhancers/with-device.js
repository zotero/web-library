'use strict';

import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import hoistNonReactStatic from 'hoist-non-react-statics';

//@NOTE: legacy enhancer component, use selector instead. See #294
const withDevice = Component => {
	const C = React.forwardRef((props, ref) => {
		const device = useSelector(state => state.device, shallowEqual);

		return <Component { ...props } device={ device } ref={ ref } />
	});

	C.displayName = `withDevice(${Component.displayName || Component.name})`;
	C.WrappedComponent = Component;
	hoistNonReactStatic(C, Component);
	return C;
};

export default withDevice;
