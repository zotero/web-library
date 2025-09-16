import PropTypes from 'prop-types';
import cx from 'classnames';
import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { useFloating, arrow } from '@floating-ui/react-dom';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

import Input from '../../form/input';
import { IDENTIFIER_PICKER } from '../../../constants/modals';
import { currentAddTranslatedItem, searchIdentifier, toggleModal, reportIdentifierNoResults, resetIdentifier } from '../../../actions';
import { EMPTY, CHOICE, CHOICE_EXHAUSTED, MULTIPLE } from '../../../constants/identifier-result-types';
import { getUniqueId } from '../../../utils';

const AddByIdentifier = props => {
	const { onKeyDown } = props;
	const dispatch = useDispatch();

	const isSearching = useSelector(state => state.identifier.isSearching || state.identifier.isSearchingMultiple);
	const result = useSelector(state => state.identifier.result);
	const item = useSelector(state => state.identifier.item);
	const items = useSelector(state => state.identifier.items);
	const message = useSelector(state => state.identifier.message);
	const prevItem = usePrevious(item);
	const prevItems = usePrevious(items);
	const wasSearching = usePrevious(isSearching);

	const [isOpen, setIsOpen] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	const [identifier, setIdentifier] = useState('');
	const [isBusyOrSearching] = useDebounce(isBusy || isSearching, 100); //avoid flickering
	const wasOpen = usePrevious(isOpen);

	const ref = useRef(null);
	const inputEl = useRef(null);
	const id = useRef(getUniqueId());
	const popoverRef = useRef(null);
	const arrowRef = useRef(null);

	const { x, y, refs, strategy, update, middlewareData } = useFloating({
		placement: 'bottom-start', middleware: [arrow({ element: arrowRef })]
	});

	const addItem = useCallback(async item => {
		const translatedItem = { ...item };
		try {
			setIsBusy(true);
			await dispatch(currentAddTranslatedItem(translatedItem));
			setIsBusy(false);
			ref.current.focus();
			setIsOpen(false);
		} catch(_) {
			setIsBusy(false);
			setIdentifier('');
			inputEl.current.focus();
		}
	}, [dispatch]);


	const handleInputChange = useCallback(newIdentifier => {
		setIdentifier(newIdentifier);
	}, []);

	const handleInputBlur = useCallback(() => true, []);
	const handleInputFocus = useCallback(ev => ev.stopPropagation(), []);

	const toggleOpen = useCallback(() => {
		setIdentifier('');
		setIsOpen(isOpen => !isOpen);
	}, []);

	const handleInputCommit = useCallback(newIdentifier => {
		dispatch(searchIdentifier(newIdentifier));
	}, [dispatch]);

	const handleDocumentEvent = useCallback(ev => {
		if (ev.type === 'click' && ev.button === 2) {
			return;
		}

		if (ev.type === 'keyup' && ev.key !== 'Tab') {
			return;
		}

		if (ev.target?.closest?.('.popover') === popoverRef.current) {
			return;
		}

		toggleOpen(ev);
	}, [toggleOpen]);

	const handleInputKeyDown = useCallback(ev => {
		if (ev.key === 'Escape' || ev.key === 'Tab') {
			ref.current.focus();
			toggleOpen(ev);
		}
	}, [toggleOpen]);

	const handlePaste = useCallback(ev => {
		const clipboardData = ev.clipboardData || window.clipboardData;
		const pastedData = clipboardData.getData('Text');
		const isMultiLineData = pastedData.split('\n').filter(line => line.trim().length > 0).length > 1;

		if (!isMultiLineData) {
			return;
		}

		ev.preventDefault();
		setIdentifier(pastedData);
		dispatch(searchIdentifier(pastedData, { shouldImport: true }));
	}, [dispatch]);

	useEffect(() => {
		if(isOpen && item && prevItem === null) {
			addItem({ ...item });
		}
	}, [addItem, isOpen, item, prevItem]);

	useEffect(() => {
		if (isOpen && items && prevItems === null && [CHOICE, CHOICE_EXHAUSTED, MULTIPLE].includes(result)) {
			setIsOpen(!isOpen);
			dispatch(toggleModal(IDENTIFIER_PICKER, true));
		}
	}, [dispatch, isOpen, items, prevItems, result]);

	useEffect(() => {
		if(!isSearching && wasSearching) {
			setIdentifier('');
			if(result === EMPTY) {
				dispatch(reportIdentifierNoResults(message));
			} else {
				ref.current.focus();
				setIsOpen(false);
			}
		}
	}, [dispatch, isSearching, wasSearching, result, message]);

	useLayoutEffect(() => {
		if (isOpen && !wasOpen) {
			update();
		}
	}, [isOpen, update, wasOpen]);

	useEffect(() => {
		if (isOpen && !wasOpen) {
			dispatch(resetIdentifier());
			inputEl.current.focus();
		}
	}, [dispatch, isOpen, wasOpen]);

	useEffect(() => {
		if (isOpen) {
			['click', 'touchstart'].forEach(evType =>
				document.addEventListener(evType, handleDocumentEvent, true)
			);
		} else {
			['click', 'touchstart', 'keyup'].forEach(evType =>
				document.removeEventListener(evType, handleDocumentEvent, true)
			);
		}

		return () => {
			['click', 'touchstart', 'keyup'].forEach(evType =>
				document.removeEventListener(evType, handleDocumentEvent, true)
			);
		}

	}, [isOpen, handleDocumentEvent]);

	return (
        <Fragment>
			<Button
				aria-controls={ `${id.current}-dialog` }
				icon
				id={ id.current }
				onClick={ toggleOpen }
				onKeyDown={ onKeyDown }
				tabIndex={ -2 }
				title="Add By Identifier"
				ref={ r => { refs.setReference(r); ref.current = r; } }
			>
				<Icon type="16/magic-wand" width="16" height="16" />
			</Button>
			<div
				aria-label="Add By Identifier"
				aria-hidden={ !isOpen }
				id={ `${id.current}-dialog` }
				role="dialog"
				ref={r => { refs.setFloating(r); popoverRef.current = r; } }
				className={ cx('popover', 'popover-bottom', { show: isOpen })}
				style={{ position: strategy, transform: isOpen ? `translate3d(${x}px, ${y}px, 0px)` : '' }}
			>
				<div className="popover-inner" role="tooltip">
					<h3 className="popover-header">
						<label htmlFor={ `${id.current}-input` }>
							Enter a URL, ISBNs, DOIs, PMIDs, arXiv IDs, or ADS Bibcodes to add to your library:
						</label>
					</h3>
					<div className="popover-body">
						<div className="form">
							<Input
								id={ `${id.current}-input` }
								isBusy={ isBusyOrSearching }
								isDisabled={ isBusyOrSearching }
								onFocus={ handleInputFocus }
								onBlur={ handleInputBlur }
								onChange={ handleInputChange }
								onCommit={ handleInputCommit }
								onKeyDown={ handleInputKeyDown }
								onPaste={ handlePaste }
								ref={ inputEl }
								tabIndex={ 0 }
								value={ identifier }
							/>
						</div>
					</div>
				</div>
				<span className="popover-arrow" ref={arrowRef} style={ { left: middlewareData?.arrow?.x } }></span>
			</div>
		</Fragment>
    );
}

AddByIdentifier.propTypes = {
	onKeyDown: PropTypes.func,
}

export default memo(AddByIdentifier);
