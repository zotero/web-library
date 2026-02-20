import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { Button, Icon } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

import Modal from '../ui/modal';
import TagList from '../tag-selector/tag-list';
import TagColorManager from '../tag-selector/tag-color-manager';
import { MANAGE_TAGS } from '../../constants/modals';
import { filterTags, toggleModal } from '../../actions';
import FocusTrap from '../focus-trap';


const ManageTagsModal = () => {
	const dispatch = useDispatch();
	const searchStringWhenOpening = useRef('');
	const isOpen = useSelector(state => state.modal.id === MANAGE_TAGS);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const wasOpen = usePrevious(isOpen);
	const inputRef = useRef(null);
	const modalRef = useRef(null);
	const tagListRef = useRef(null);
	const tagColorManagerRef = useRef(null);
	const fadeOverlayRef = useRef(null);
	const tagBeingClosedRef = useRef(null);
	const [tagBeingManaged, setTagBeingManaged] = useState(null);
	const prevTagBeingManaged = usePrevious(tagBeingManaged);

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

	const handleAfterOpen = useCallback(() => {
		requestAnimationFrame(() => {
			inputRef.current.focus();
		});
	}, []);

	const handleToggleTagManager = useCallback((tag) => {
		setTagBeingManaged(tag);
	}, []);

	const handleTagManagerCancel = useCallback(() => {
		setTagBeingManaged(null);
	}, []);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			searchStringWhenOpening.current = tagsSearchString;
			dispatch(filterTags(''));
		} else if(!isOpen && !wasOpen) {
			resetTagSearch();
		}
	}, [isOpen, wasOpen, dispatch, resetTagSearch, tagsSearchString]);

	useEffect(() => {
		if(tagBeingManaged === null && prevTagBeingManaged) {
			tagBeingClosedRef.current = prevTagBeingManaged;
		}
	}, [prevTagBeingManaged, tagBeingManaged]);

	const handleTagColorManagerExited = useCallback(() => {
		if(tagBeingClosedRef.current) {
			const tagName = tagBeingClosedRef.current;
			tagBeingClosedRef.current = null;
			// Defer focus to the next frame so React can unmount the TagColorManager first,
			// otherwise its blur handler steals focus back
			requestAnimationFrame(() => {
				const btn = document.querySelector(`.manage-tags [data-tag="${CSS.escape(tagName)}"] [title="More"]`);
				if(btn) {
					btn.focus();
				}
			});
		}
	}, []);

	return (
		<Modal
			className="manage-tags"
			contentLabel="Manage Tags"
			isOpen={ isOpen }
			onRequestClose={ handleCancel }
			onAfterOpen={ handleAfterOpen }
			overlayClassName="modal-full-height"
			ref={ modalRef }
		>
			<FocusTrap>
			<CSSTransition
				in={ tagBeingManaged !== null }
				mountOnEnter
				unmountOnExit
				timeout={ 250 }
				classNames="fade"
				nodeRef={ fadeOverlayRef }
			>
				<div ref={ fadeOverlayRef } onClick={ handleTagManagerCancel } className="fade-overlay"></div>
			</CSSTransition>
			<CSSTransition
				classNames="slide-down"
				mountOnEnter
				unmountOnExit
				in={ tagBeingManaged !== null }
				timeout={ 500 }
				nodeRef={ tagColorManagerRef }
				onExited={ handleTagColorManagerExited }
			>
				<TagColorManager
					ref={ tagColorManagerRef }
					onToggleTagManager={ handleToggleTagManager }
					tag={ tagBeingManaged }
				/>
			</CSSTransition>
			<div className="modal-header">
				<div className="modal-header-left">
				{ isTouchOrSmall && (
					<Button
						className="btn-link"
						onClick={ handleCancel }
					>
						Close
					</Button>
				) }
				</div>
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						Tag Manager
					</h4>
				</div>
				<div className="modal-header-right">
				{ !isTouchOrSmall && (
					<Button
						icon
						className="close"
						onClick={ handleCancel }
					>
						<Icon type={ '16/close' } width="16" height="16" />
					</Button>
				) }
				</div>
			</div>
			<div className="modal-body">
				<div className="tag-manager-list-container">
					<div className="filter-container">
						<div className="search input-group">
							<input
								aria-label="Filter Tags"
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
					{ isOpen && <TagList ref={ tagListRef } isManager={ true } onToggleTagManager={ handleToggleTagManager } /> }
				</div>
			</div>
			</FocusTrap>
		</Modal>
	);
}

ManageTagsModal.propTypes = {
	items: PropTypes.array,
}

export default memo(ManageTagsModal);
