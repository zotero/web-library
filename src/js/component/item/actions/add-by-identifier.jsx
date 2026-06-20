import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Popover, PopoverBody, PopoverDialog, PopoverHeader, PopoverTrigger } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

import Input from '../../form/input';
import { IDENTIFIER_PICKER } from '../../../constants/modals';
import { currentAddTranslatedItem, searchIdentifier, toggleModal, reportIdentifierNoResults, resetIdentifier } from '../../../actions';
import { EMPTY, CHOICE, CHOICE_EXHAUSTED, MULTIPLE } from '../../../constants/identifier-result-types';

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
	const id = useId();

	const addItem = useCallback(async item => {
		const translatedItem = { ...item };
		try {
			setIsBusy(true);
			await dispatch(currentAddTranslatedItem(translatedItem));
			setIsBusy(false);
			ref.current.focus();
			setIsOpen(false);
		} catch {
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

	const handleInputKeyDown = useCallback(ev => {
		if (ev.key === 'Tab') {
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
			setIsOpen(false);
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

	useEffect(() => {
		if (isOpen && !wasOpen) {
			dispatch(resetIdentifier());
		}
	}, [dispatch, isOpen, wasOpen]);

	return (
		<Popover isOpen={ isOpen } onToggle={ toggleOpen } placement="bottom-start">
			<PopoverTrigger
				icon
				onKeyDown={ onKeyDown }
				tabIndex={ -2 }
				title="Add By Identifier"
				ref={ ref }
			>
				<Icon type="16/magic-wand" width="16" height="16" />
			</PopoverTrigger>
			<PopoverDialog aria-label="Add By Identifier">
				<PopoverHeader>
					<label htmlFor={ `${id}-input` }>
						Enter a URL, ISBNs, DOIs, PMIDs, arXiv IDs, or ADS Bibcodes to add to your library:
					</label>
				</PopoverHeader>
				<PopoverBody>
					<div className="form">
						<Input
							id={ `${id}-input` }
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
				</PopoverBody>
			</PopoverDialog>
		</Popover>
	);
}

AddByIdentifier.propTypes = {
	onKeyDown: PropTypes.func,
}

export default memo(AddByIdentifier);
