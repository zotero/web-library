'use strict';

import {
    TOGGLE_MODAL,
    TOGGLE_TRANSITIONS,
    TRIGGER_EDITING_ITEM,
    TRIGGER_RESIZE_VIEWPORT,
    TRIGGER_SEARCH_MODE,
    TRIGGER_SELECT_MODE,
} from '../constants/actions';

const triggerEditingItem = (itemKey, isEditing) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;

		return dispatch({
			type: TRIGGER_EDITING_ITEM,
			itemKey,
			libraryKey,
			isEditing
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


const toggleModal = (id, shouldOpen, config) => {
	return { type: TOGGLE_MODAL, id, shouldOpen, ...config }
}

const toggleTransitions = useTransitions => {
	return { type: TOGGLE_TRANSITIONS, useTransitions };
}

export {
	toggleModal,
	toggleTransitions,
	triggerEditingItem,
	triggerResizeViewport,
	triggerSelectMode,
	triggerSearchMode,
};
