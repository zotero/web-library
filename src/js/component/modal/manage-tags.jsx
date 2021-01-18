import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import Modal from '../ui/modal';
import TouchTagList from '../tag-selector/touch-tag-list';
import { MANAGE_TAGS } from '../../constants/modals';
import { filterTags, toggleModal } from '../../actions';
import { usePrevious } from '../../hooks';


const ManageTagsModal = () => {
	const dispatch = useDispatch();
	const searchStringWhenOpening = useRef('');
	const isOpen = useSelector(state => state.modal.id === MANAGE_TAGS);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const wasOpen = usePrevious(isOpen);
	const inputRef = useRef(null);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		dispatch(filterTags(newValue));
	}, [dispatch]);

	const handleSearchClear = useCallback(() => {
		dispatch(filterTags(''));
		if(inputRef.current) {
			inputRef.current.focus();
		}
	}, [dispatch]);

	const resetTagSearch = useCallback(() => {
		dispatch(filterTags(searchStringWhenOpening.current));
		searchStringWhenOpening.current = '';
	}, [dispatch]);

	const handleCancel = useCallback(() => {
		resetTagSearch();
		dispatch(toggleModal(null, false));
	}, [dispatch, resetTagSearch]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			searchStringWhenOpening.current = tagsSearchString;
			dispatch(filterTags(''));
		} else if(!isOpen && !wasOpen) {
			resetTagSearch();

		}
	}, [isOpen, wasOpen, dispatch, resetTagSearch, tagsSearchString]);

	useEffect(() => {
		if(isTouchOrSmall) {
			dispatch(toggleModal(MANAGE_TAGS, false));
		}
	}, [dispatch, isTouchOrSmall]);

	return (
		<Modal
			className="manage-tags"
			contentLabel="Manage Tags"
			isOpen={ isOpen }
			onRequestClose={ handleCancel }
			overlayClassName="modal-full-height"
		>
			<div className="modal-header">
				<h4 className="modal-title truncate">
					Tag Manager
				</h4>
				<Button
					icon
					className="close"
					onClick={ handleCancel }
				>
					<Icon type={ '16/close' } width="16" height="16" />
				</Button>
			</div>
			<div className="modal-body">
				<div className="tag-manager-list-container">
					<div className="filter-container">
						<div className="search input-group">
							<input
								className="form-control tag-selector-filter"
								onChange={ handleSearchChange }
								placeholder="Filter Tags"
								type="search"
								ref={ inputRef }
								value={ tagsSearchString }
							/>
							{ tagsSearchString.length > 0 && (
								<Button
									icon
									className="clear"
									onClick={ handleSearchClear }
								>
									<Icon type={ '10/x' } width="10" height="10" />
								</Button>
							)}
						</div>
					</div>
					<TouchTagList />
				</div>
			</div>
		</Modal>
	);
}

ManageTagsModal.propTypes = {
	items: PropTypes.array,
}

export default memo(ManageTagsModal);
