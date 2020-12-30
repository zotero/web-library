import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../ui/button';
import Icon from '../../ui/icon';
import Input from '../../form/input';
import { ADD_BY_IDENTIFIER, IDENTIFIER_PICKER } from '../../../constants/modals';
import { currentAddTranslatedItem, searchIdentifier, toggleModal, reportIdentifierNoResults, resetIdentifier } from '../../../actions';
import { EMPTY } from '../../../constants/identifier-result-types';
import { getUniqueId } from '../../../utils';
import { usePrevious } from '../../../hooks';

const AddByIdentifier = props => {
	const { onKeyDown } = props;
	const dispatch = useDispatch();

	const isSearching = useSelector(state => state.identifier.isSearching);
	const result = useSelector(state => state.identifier.result);
	const item = useSelector(state => state.identifier.item);
	const items = useSelector(state => state.identifier.items);
	const prevItem = usePrevious(item);
	const prevItems = usePrevious(items);
	const wasSearching = usePrevious(isSearching);

	const [isOpen, setIsOpen] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	const [identifier, setIdentifier] = useState('');
	const [isBusyOrSearching] = useDebounce(isBusy || isSearching, 100); //avoid flickering

	const inputEl = useRef(null);
	const id = useRef(getUniqueId());

	const addItem = useCallback(async item => {
	const translatedItem = { ...item };
		try {
			setIsBusy(true);
			await dispatch(currentAddTranslatedItem(translatedItem));
			setIsBusy(false);
			setIsOpen(false);
		} catch(_) {
			setIsBusy(false);
			setIdentifier('');
			inputEl.current.focus();
		}
	}, [dispatch]);

	const handleClick = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleInputChange = useCallback(newIdentifier => {
		setIdentifier(newIdentifier);
	}, []);

	const handleInputBlur = useCallback(() => true, []);

	const toggleOpen = useCallback((ev) => {
		if(!isOpen) {
			dispatch(resetIdentifier());
		}
		setIdentifier('');
		setIsOpen(!isOpen);
	}, [dispatch, isOpen]);

	const handleInputCommit = useCallback(newIdentifier => {
		dispatch(searchIdentifier(newIdentifier));
	}, [dispatch]);

	useEffect(() => {
		if(isOpen && item && prevItem === null) {
			addItem({ ...item });
		}
	}, [addItem, isOpen, item, prevItem]);

	useEffect(() => {
		if(isOpen && items && prevItems === null) {
			dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
			dispatch(toggleModal(IDENTIFIER_PICKER, true));
		}
	}, [dispatch, isOpen, items, prevItems]);

	useEffect(() => {
		if(!isSearching && wasSearching && result === EMPTY) {
			setIdentifier('');
			dispatch(reportIdentifierNoResults());
		}
	}, [dispatch, isSearching, wasSearching, result]);


	return (
		<React.Fragment>
			<Button
				icon
				id={ id.current }
				onClick={ handleClick }
				onKeyDown={ onKeyDown }
				tabIndex={ -2 }
				title="Add By Identifier"
			>
				<Icon type="16/magic-wand" width="16" height="16" />
			</Button>
			<Popover
				className="popover-container"
				isOpen={ isOpen }
				placement="bottom"
				target={ id.current }
				toggle={ toggleOpen }
				trigger="legacy"
			>
				<PopoverHeader>
					<label htmlFor={ `${id.current}-input` }>
						Enter a URL, ISBN, DOI, PMID, or arXiv ID
					</label>
				</PopoverHeader>
				<PopoverBody>
					<div className="form">
						<Input
							autoFocus
							id={ `${id.current}-input` }
							isBusy={ isBusyOrSearching }
							isDisabled={ isBusyOrSearching }
							onBlur={ handleInputBlur }
							onChange={ handleInputChange }
							onCommit={ handleInputCommit }
							ref={ inputEl }
							tabIndex={ 0 }
							value={ identifier }
						/>
					</div>
				</PopoverBody>
			</Popover>
		</React.Fragment>
	);
}

AddByIdentifier.propTypes = {
	onKeyDown: PropTypes.func,
}

export default memo(AddByIdentifier);
