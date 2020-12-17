import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import columnProperties from '../../constants/column-properties';
import Modal from '../ui/modal';
import RadioSet from '../form/radio-set';
import { SORT_ITEMS } from '../../constants/modals';
import { toggleModal, updateItemsSorting } from '../../actions';

const ItemsSortModal = () => {
	const dispatch = useDispatch();
	const sortField = useSelector(state => (state.preferences.columns.find(c => c.sort) || {}).field || 'title');
	const isKeyboardUser = useSelector(state => state.device.isKeyboardUser);
	const isMyLibrary = useSelector(state => state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isMyLibrary;
	const isOpen = useSelector(state => state.modal.id === SORT_ITEMS);
	const [selectedSortField, setSelectedSortField] = useState(sortField);
	const prevSelectedSortField = useRef(selectedSortField);
	const radioSetOptions = useMemo(() => Object.entries(columnProperties)
		.map(([value, properties]) => ({ value, label: properties.name }))
		.filter(({ value }) => columnProperties[value].sortKey) // skip unsortable columns
		.filter(({ value }) => !isMyLibrary || (isMyLibrary && !columnProperties[value].excludeInMyLibrary))
	, [isMyLibrary]);

	const handleSortChange = useCallback(newSortField => setSelectedSortField(newSortField), []);

	const handleConfirmChange = useCallback(() => {
		dispatch(updateItemsSorting(selectedSortField, 'asc'));
		dispatch(toggleModal(SORT_ITEMS, false));
	}, [dispatch, selectedSortField]);

	const handleCancel = useCallback(() => dispatch(toggleModal(SORT_ITEMS, false)), [dispatch]);

	useEffect(() => {
		if(!isKeyboardUser && selectedSortField !== prevSelectedSortField.current) {
			dispatch(updateItemsSorting(selectedSortField, 'asc'));
			dispatch(toggleModal(SORT_ITEMS, false));
		}
	}, [dispatch, selectedSortField, isKeyboardUser]);

	useEffect(() => {
		prevSelectedSortField.current = selectedSortField;
	}, [selectedSortField]);

	return (
		<Modal
			className="modal-touch modal-form"
			contentLabel="Collection Editor"
			isOpen={ isOpen }
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
						Sort By
					</h4>
				</div>
				<div className="modal-header-right">
					{
						isKeyboardUser && (
							<Button
								className="btn-link"
								onClick={ handleConfirmChange }
							>
								Confirm
							</Button>
						)
					}
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<RadioSet
						onChange={ handleSortChange }
						options={ radioSetOptions }
						value={ selectedSortField }
					/>
				</div>
			</div>
		</Modal>
	);
}

export default memo(ItemsSortModal);
