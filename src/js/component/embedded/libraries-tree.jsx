import React, { useCallback, useEffect, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Libraries from '../libraries';
import { EMBEDDED_LIBRARIES_TREE } from '../../constants/modals';
import { toggleModal } from '../../actions';
import { usePrevious } from '../../hooks';
import { isTriggerEvent } from '../../common/event';

const EmbeddedLibrariesTreeModal = () => {
	const dispatch = useDispatch();
	const ref = useRef();
	const librariesRef = useRef();
	const isOpen = useSelector(state => state.modal.id === EMBEDDED_LIBRARIES_TREE);
	const wasOpen = usePrevious(isOpen);

	const focusOnHeader = () =>
		ref.current.closest('.library-container').querySelector('.embedded-header').focus();

	const handleNodeSelected = useCallback(() => {
		focusOnHeader();
		dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
	}, [dispatch]);

	const handleClose = useCallback(() => {
		dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
	}, [dispatch]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape') {
			focusOnHeader();
			dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
			ev.preventDefault();
		}
		if(isTriggerEvent(ev)) {
			ev.preventDefault();
		}
	}, [dispatch]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			librariesRef.current.focus();
		}
	}, [isOpen, wasOpen]);

	return isOpen ? (
		<div className="embedded-collection-tree" onKeyDown={ handleKeyDown } ref={ ref }>
			<Button icon className="close" onClick={ handleClose } >
				<Icon type={ '16/close' } width="16" height="16" />
			</Button>
			<Libraries ref={ librariesRef } onNodeSelected={ handleNodeSelected } />
		</div>
	) : null;
}

export default memo(EmbeddedLibrariesTreeModal);
