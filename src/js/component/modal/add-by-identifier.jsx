import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Input from '../form/input';
import Modal from '../ui/modal';
import { ADD_BY_IDENTIFIER, IDENTIFIER_PICKER } from '../../constants/modals';
import { EMPTY, CHOICE, MULTIPLE } from '../../constants/identifier-result-types';
import { currentAddTranslatedItem, reportIdentifierNoResults, resetIdentifier, searchIdentifier, toggleModal } from '../../actions';
import { usePrevious } from '../../hooks';

const AddByIdentifierModal = () => {
	const dispatch = useDispatch();
	const isSearching = useSelector(state => state.identifier.isSearching);
	const result = useSelector(state => state.identifier.result);
	const item = useSelector(state => state.identifier.item);
	const items = useSelector(state => state.identifier.items);
	const prevItem = usePrevious(item);
	const prevItems = usePrevious(items);
	const wasSearching = usePrevious(isSearching);

	const isOpen = useSelector(state => state.modal.id === ADD_BY_IDENTIFIER);
	const [identifier, setIdentifier] = useState('');
	const [isBusy, setIsBusy] = useState(false);
	const [isBusyOrSearching] = useDebounce(isBusy || isSearching, 100); //avoid flickering
	const inputEl = useRef(null);

	const addItem = useCallback(async item => {
		const translatedItem = { ...item };
		try {
			setIsBusy(true);
			await dispatch(currentAddTranslatedItem(translatedItem));
			setIsBusy(false);
			dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
		} catch(_) {
			setIsBusy(false);
			setIdentifier('');
			inputEl.current.focus();
		}
	}, [dispatch]);

	const handleCancel = useCallback(() => {
		setIdentifier('');
		dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
		dispatch(resetIdentifier());
	}, [dispatch]);

	const handleInputChange = useCallback(newIdentifier => {
		setIdentifier(newIdentifier);
	}, []);

	const handleInputBlur = useCallback(() => {
		return true;
	}, []);

	const handleModalAfterOpen = useCallback(() => {
		setTimeout(() => {
			// using autoFocus breaks the animation, hence this
			if(inputEl.current) {
				inputEl.current.focus();
			}
		}, 200);
	}, []);

	const handleInputCommit = useCallback(newIdentifier => {
		dispatch(searchIdentifier(newIdentifier));
	}, [dispatch]);

	const handleAddClick = useCallback(() => {
		dispatch(searchIdentifier(identifier));
	}, [dispatch, identifier]);

	useEffect(() => {
		if(isOpen && item && prevItem === null) {
			addItem({ ...item });
		}
	}, [addItem, isOpen, item, prevItem]);

	useEffect(() => {
		if(isOpen && items && prevItems === null && [CHOICE, MULTIPLE].includes(result)) {
			dispatch(toggleModal(ADD_BY_IDENTIFIER, false));
			dispatch(toggleModal(IDENTIFIER_PICKER, true));
		}
	}, [dispatch, isOpen, items, prevItems, result]);

	useEffect(() => {
		if(!isSearching && wasSearching && result === EMPTY) {
			setIdentifier('');
			dispatch(reportIdentifierNoResults());
		}
	}, [dispatch, isSearching, wasSearching, result])

	return (
		<Modal
			className="modal-touch"
			contentLabel="Add By Identifier"
			isBusy={ isBusyOrSearching }
			isOpen={ isOpen }
			onAfterOpen={ handleModalAfterOpen }
			onRequestClose={ handleCancel }
			overlayClassName="modal-centered modal-slide"
		>
			<div className="modal-header">
				<div className="modal-header-left">
					<Button
						className="btn-link"
						onClick={ handleCancel }
					>
						Cancel
					</Button>
				</div>
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						Add Item
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						disabled={ identifier === '' }
						className="btn-link"
						onClick={ handleAddClick }
					>
						Add
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<div className="form-group">
						<Input
							onBlur={ handleInputBlur }
							onChange={ handleInputChange }
							onCommit={ handleInputCommit }
							placeholder="URL, ISBN, DOI, PMID, or arXiv ID"
							ref={ inputEl }
							tabIndex={ 0 }
							value={ identifier }
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}

export default memo(AddByIdentifierModal);
