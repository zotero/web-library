'use strict';

import {
	DISMISS_ERROR,
	TOGGLE_MODAL,
	TOGGLE_NAVBAR,
	TOGGLE_TAG_SELECTOR,
	TOGGLE_TOUCH_TAG_SELECTOR,
	TOGGLE_TRANSITIONS,
	TRIGGER_EDITING_ITEM,
	TRIGGER_FOCUS,
	TRIGGER_RESIZE_VIEWPORT,
	TRIGGER_SEARCH_MODE,
	TRIGGER_SELECT_MODE,
	TRIGGER_USER_TYPE_CHANGE,
} from '../constants/actions';

const triggerEditingItem = (itemKey, toggleValue) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;

		return dispatch({
			type: TRIGGER_EDITING_ITEM,
			isEditing: toggleValue,
			itemKey,
			libraryKey,
		});
	}
};

const triggerSelectMode = (isSelectMode) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;

		return dispatch({
			type: TRIGGER_SELECT_MODE,
			libraryKey,
			isSelectMode
		});
	}
};

const triggerSearchMode = isSearchMode => ({
	type: TRIGGER_SEARCH_MODE,
	isSearchMode
});

const triggerResizeViewport = (width, height) => {
	return {
		type: TRIGGER_RESIZE_VIEWPORT,
		width,
		height
	};
};

const triggerUserTypeChange = userType => {
	return {
		type: TRIGGER_USER_TYPE_CHANGE,
		...userType
	}
}

const toggleModal = (id, shouldOpen, config) => {
	return { type: TOGGLE_MODAL, id, shouldOpen, ...config }
}

const toggleNavbar = isOpen => {
	return { type: TOGGLE_NAVBAR, isOpen };
}

const toggleTagSelector = isOpen => {
	return { type: TOGGLE_TAG_SELECTOR, isOpen };
}

const toggleTouchTagSelector = isOpen => {
	return { type: TOGGLE_TOUCH_TAG_SELECTOR, isOpen };
}

const toggleTransitions = useTransitions => {
	return { type: TOGGLE_TRANSITIONS, useTransitions };
}

const dismissError = errorId => {
	return { type: DISMISS_ERROR, errorId };
}

const triggerFocus = (section, isOn) => {
	return { type: TRIGGER_FOCUS, section, isOn }	;
}

export {
	dismissError,
	toggleModal,
	toggleNavbar,
	toggleTagSelector,
	toggleTouchTagSelector,
	toggleTransitions,
	triggerEditingItem,
	triggerFocus,
	triggerResizeViewport,
	triggerSearchMode,
	triggerSelectMode,
	triggerUserTypeChange,
};
