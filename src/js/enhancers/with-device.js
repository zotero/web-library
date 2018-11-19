'use strict';

const React = require('react');
const hoistNonReactStatic = require('hoist-non-react-statics');
const { UserContext, ViewportContext } = require('../context');


const withDevice = Component => {
	const C = props => (
		<UserContext.Consumer>
		{ ({ userType, isKeyboardUser, isMouseUser, isTouchUser }) => (
		<ViewportContext.Consumer>
		{ viewport => {
			const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
			const shouldUseEditMode = isTouchOrSmall;
			const shouldUseModalCreatorField = isTouchOrSmall;
			const shouldUseTabs = viewport.md || (viewport.lg && userType != 'touch');
			const isSingleColumn = viewport.xxs || viewport.xs;
			const device = {
				viewport,
				userType,
				[userType]: true,
				isSingleColumn,
				isTouchOrSmall,
				shouldUseEditMode,
				shouldUseModalCreatorField,
				shouldUseTabs,
				isKeyboardUser,
				isMouseUser,
				isTouchUser,
			}
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

module.exports = withDevice;
