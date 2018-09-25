'use strict';

const React = require('react');
const { UserTypeContext, ViewportContext } = require('../context');


const withDevice = Component => {
	const C = props => (
		<UserTypeContext.Consumer>
		{ userType => (
		<ViewportContext.Consumer>
		{ viewport => {
			const shouldUseEditMode = viewport.xxs || viewport.xs || viewport.sm;
			const shouldUseCompactView = userType === 'touch' && (viewport.md || viewport.lg);
			const shouldUseModalCreatorField = userType === 'touch' || viewport.xxs ||
				viewport.xs || viewport.sm;
			const device = {
				viewport,
				userType,
				shouldUseEditMode,
				shouldUseCompactView,
				shouldUseModalCreatorField,
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
