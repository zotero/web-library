import { useCallback, useEffect, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';
import { isTriggerEvent } from 'web-common/utils';

import Libraries from '../libraries';
import { EMBEDDED_LIBRARIES_TREE } from '../../constants/modals';
import { toggleModal } from '../../actions';
import FocusTrap from '../focus-trap';

const EmbeddedLibrariesTreeModal = () => {
	const dispatch = useDispatch();
	const ref = useRef();
	const librariesRef = useRef();
	const isOpen = useSelector(state => state.modal.id === EMBEDDED_LIBRARIES_TREE);
	const wasOpen = usePrevious(isOpen);
	const lastFocus = useRef(null);

	const handleNodeSelected = useCallback(() => {
		dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
	}, [dispatch]);

	const handleClose = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
		}
	}, [dispatch]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape') {
			dispatch(toggleModal(EMBEDDED_LIBRARIES_TREE, false));
			ev.preventDefault();
		}
		if(isTriggerEvent(ev)) {
			ev.preventDefault();
		}
	}, [dispatch]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			lastFocus.current = document.activeElement;
			librariesRef.current.focus({ preventScroll: true });
		} else if(wasOpen && !isOpen && lastFocus.current && 'focus' in lastFocus.current) {
			lastFocus.current.focus({ preventScroll: true });
			lastFocus.current = null;
		}
	}, [isOpen, wasOpen]);

	return isOpen ? (
		<FocusTrap targetRef={ librariesRef }>
			<div className="embedded-collection-tree" onKeyDown={ handleKeyDown } ref={ ref }>
				<Libraries ref={ librariesRef } onNodeSelected={ handleNodeSelected } />
				<Button icon className="close" onKeyDown={ handleClose } onClick={ handleClose } >
					<Icon type={ '16/close' } width="16" height="16" />
				</Button>
			</div>
		</FocusTrap>
	) : null;
}

export default memo(EmbeddedLibrariesTreeModal);
