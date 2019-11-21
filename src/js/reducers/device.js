import { TRIGGER_USER_TYPE_CHANGE, TRIGGER_RESIZE_VIEWPORT } from '../constants/actions.js';
import { getScrollbarWidth } from '../utils';
import { pick } from '../common/immutable';

const defaultState = {
	isKeyboardUser: null,
	isMouseUser: typeof(matchMedia) === 'function' ? matchMedia('(pointer:fine)').matches : null,
	isSingleColumn: false,
	isTouchOrSmall: false,
	isTouchUser: typeof(matchMedia) === 'function' ? matchMedia('(pointer:coarse)').matches : null,
	scrollbarWidth: getScrollbarWidth(),
	shouldUseEditMode: false,
	shouldUseModalCreatorField: false,
	shouldUseSidebar: false,
	shouldUseTabs: false,
	userType: matchMedia('(pointer:coarse)').matches ? 'touch' : null,
};

const getDevice = ({ userType }, viewport) => {
	const isSingleColumn = viewport.xxs || viewport.xs;
	const isTouchOrSmall = userType === 'touch' || viewport.xxs || viewport.xs || viewport.sm;
	const shouldUseEditMode = isTouchOrSmall;
	const shouldUseModalCreatorField = isTouchOrSmall;
	const shouldUseSidebar = !viewport.lg;
	const shouldUseTabs = viewport.md || (viewport.lg && userType != 'touch');
	return { isSingleColumn, isTouchOrSmall, shouldUseEditMode, shouldUseModalCreatorField,
	shouldUseSidebar, shouldUseTabs }
};

const device = (state = defaultState, action, { viewport = {} } = {}) => {
	switch(action.type) {
		case TRIGGER_RESIZE_VIEWPORT:
		case TRIGGER_USER_TYPE_CHANGE:
			return {
				...state,
				...pick(action, ['isKeyboardUser', 'isMouseUser', 'isTouchUser', 'userType', 'scrollbarWidth']),
				...getDevice(action, viewport),
			}
		default:
			return state;
	}
};

export default device;

