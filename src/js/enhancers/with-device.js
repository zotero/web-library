'use strict';

const React = require('react');
const { UserTypeContext, ViewportContext } = require('../context');


const withDevice = Component => {
	const C = props => (
		<UserTypeContext.Consumer>
		{ userType => (
		<ViewportContext.Consumer>
		{ viewport => {
			const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
			const shouldUseEditMode = isTouchOrSmall;
			const shouldUseModalCreatorField = isTouchOrSmall;
			const shouldUseTabs = viewport.md || (viewport.lg && userType != 'touch');
			const isSingleColumn = viewport.xxs || viewport.xs;
			const device = {
				viewport,
				[userType]: true,
				isSingleColumn,
				isTouchOrSmall,
				shouldUseEditMode,
				shouldUseModalCreatorField,
				shouldUseTabs,
			}
			return <Component { ...props } device={ device } />
		}}
		</ViewportContext.Consumer>
		)}
		</UserTypeContext.Consumer>
	);

	C.displayName = `withDevice(${Component.displayName || Component.name})`;
	C.WrappedComponent = Component;
	return C;
};

module.exports = withDevice;
