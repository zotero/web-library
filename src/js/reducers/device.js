import { TRIGGER_USER_TYPE_CHANGE, TRIGGER_RESIZE_VIEWPORT, PREFERENCE_CHANGE } from '../constants/actions.js';
import { getScrollbarWidth, pick } from 'web-common/utils';

const getViewport = ({ width }) => {
	return {
		xxs: width < 480,
		xs: width >= 480 && width < 768,
		sm: width >= 768 && width < 992,
		md: width >= 992 && width < 1200,
		lg: width >= 1200
	};
};

const getDefaultState = () => {
	const isWindows = navigator.userAgent.indexOf("Windows") >= 0;
	const isInitiallyMouse = typeof (window.matchMedia) === 'function' ? (window.matchMedia('(pointer:fine)').matches || (isWindows && window.matchMedia('(any-pointer:fine)'))) : null;
	const isInitiallyTouch = !isInitiallyMouse && (typeof(window.matchMedia) === 'function' ? window.matchMedia('(pointer:coarse)').matches : null);

	return {
		isKeyboardUser: false,
		isMouseUser: isInitiallyMouse,
		isSingleColumn: false,
		isTouchOrSmall: false,
		isTouchUser: isInitiallyTouch,
		scrollbarWidth: getScrollbarWidth(),
		shouldUseEditMode: false,
		shouldUseModalCreatorField: false,
		shouldUseSidebar: false,
		shouldUseTabs: false,
		userType: isInitiallyTouch ? 'touch' : 'mouse',
		...getViewport(process.env.NODE_ENV === 'test' ? {} : window.innerWidth)
	}
};

const getDevice = (userType, viewport, { isEmbedded } = {}) => {
	const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
	const isSingleColumn = viewport.xxs || viewport.xs || (isTouchOrSmall && isEmbedded);
	const shouldUseEditMode = isTouchOrSmall;
	const shouldUseModalCreatorField = isTouchOrSmall;
	const shouldUseSidebar = !viewport.lg;
	const shouldUseTabs = (viewport.md || viewport.lg) && userType !== 'touch';

	return { isSingleColumn, isTouchOrSmall, shouldUseEditMode, shouldUseModalCreatorField,
		shouldUseSidebar, shouldUseTabs };
};

const getUserType = (state, action, preferences) => {
	if (action.type === PREFERENCE_CHANGE && action.name === 'density') {
		return action.value ? action.value : state.lastDetectedUserType;
	}

	if (preferences.density) {
		return preferences.density;
	}

	if(action.type === TRIGGER_USER_TYPE_CHANGE) {
		return action.userType;
	}

	return state.userType;
}

const getUserTypeBooleans = (state, action, userType) => {
	return {
		isKeyboardUser: action.type === TRIGGER_USER_TYPE_CHANGE ? action.isKeyboardUser : state.isKeyboardUser,
		isMouseUser: userType === 'mouse',
		isTouchUser: userType === 'touch'
	};
}

const device = (state = getDefaultState(), action, { config, preferences } = {}) => {
	switch(action.type) {
		case PREFERENCE_CHANGE:
		case TRIGGER_RESIZE_VIEWPORT:
		case TRIGGER_USER_TYPE_CHANGE: {
			const viewport = action.type === TRIGGER_RESIZE_VIEWPORT ? getViewport(action) : pick(state, ['xxs', 'xs', 'sm', 'md', 'lg']);
			const userType = getUserType(state, action, preferences);
			return {
				...state,
				...getUserTypeBooleans(state, action, userType),
				...getDevice(userType, viewport, config),
				...viewport,
				lastDetectedUserType: action.type === TRIGGER_USER_TYPE_CHANGE ? action.userType : state.lastDetectedUserType,
				scrollbarWidth: state.userType === 'touch' && userType === 'mouse' ? getScrollbarWidth() : state.scrollbarWidth
			}
		}
		default:
			return state;
	}
};

export default device;

