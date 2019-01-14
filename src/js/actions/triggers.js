'use strict';

const {
	TRIGGER_EDITING_ITEM,
	TRIGGER_SELECT_MODE,
	TRIGGER_RESIZE_VIEWPORT,
	TOGGLE_MODAL,
	TOGGLE_TRANSITIONS,
} = require('../constants/actions');

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

module.exports = {
	triggerEditingItem,
	triggerSelectMode,
	triggerResizeViewport,
	toggleModal,
	toggleTransitions,
}
