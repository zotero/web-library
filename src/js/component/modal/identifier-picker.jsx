import { useCallback, useEffect, memo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon, Spinner } from 'web-common/components';
import { usePrevious, useFocusManager } from 'web-common/hooks';

import Modal from '../ui/modal';
import { IDENTIFIER_PICKER } from '../../constants/modals';
import { currentAddMultipleTranslatedItems, searchIdentifierMore, reportIdentifierNoResults, toggleModal } from '../../actions';
import { useBufferGate } from '../../hooks';
import { getUniqueId, processIdentifierMultipleItems } from '../../utils';
import { getBaseMappedValue } from '../../common/item';
import { CHOICE, EMPTY, MULTIPLE } from '../../constants/identifier-result-types';
import { pluralize } from '../../common/format';

const Item = memo(({ onChange, identifierIsUrl, isPicked, item, mappings }) => {
	const { description } = item;
	const inputId = useRef(getUniqueId());

	let badge = null, title = '';
	if('itemType' in item) {
		title = getBaseMappedValue(mappings, item, 'title');
		badge = item.itemType;
	} else if(identifierIsUrl) {
		let badges = [];
		let matches = title.match(/^\[([A-Z]*)\]/);
		while(matches) {
			let badge = matches[1]
				.split(' ')
				.map(w => w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
				.join(' ');
			badges.push(badge);
			matches = title.substring(matches[0].length).match(/^\[([A-Z]*)\]/);
		}
		badges = [ ...new Set(badges) ].filter(b => b.length > 1);

		if(badges.length) {
			badge = badges[0];
		}
	}

	const handleClick = useCallback(ev => {
		if(ev.currentTarget === ev.target) {
			ev.preventDefault();
			onChange(ev);
		}
	}, [onChange]);

	return (
			<li
				className="result"
				onClick={ handleClick }
				data-key={ item.key }
			>
				<label className="label" htmlFor={ inputId.current }>
					<h5 className="title">
						<span className="title-container">
							{ title }
						</span>
						{ badge && <span key={badge} className="badge badge-light d-xs-none d-sm-inline-block">{ badge }</span> }
					</h5>
					{ description && (
						<p className="description">
							{ description }
						</p>
					)}
				</label>
				<div className="checkbox-wrap">
					<input
						id={ inputId.current }
						type="checkbox"
						checked={ isPicked }
						onChange={ onChange }
						tabIndex={-2}
					/>
				</div>
			</li>
		)
});

Item.displayName = 'Item';

Item.propTypes = {
	onChange: PropTypes.func.isRequired,
	identifierIsUrl: PropTypes.bool.isRequired,
	isPicked: PropTypes.bool.isRequired,
	item: PropTypes.object.isRequired,
	mappings: PropTypes.object.isRequired
};

const IdentifierList = ({ selectedKeys, setSelectedKeys, processedItems }) => {
	const listRef = useRef(null);
	const identifierIsUrl = useSelector(state => state.identifier.identifierIsUrl);
	const mappings = useSelector(state => state.meta.mappings);
	const { focusNext, focusPrev, receiveBlur, receiveFocus } = useFocusManager(
		listRef, { isCarousel: false }
	);

	const handleItemChange = useCallback(ev => {
		try {
			const key = ev.currentTarget.closest('[data-key]').dataset.key;
			setSelectedKeys(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]);
		} catch (e) { } // eslint-disable-line no-empty
	}, [selectedKeys, setSelectedKeys]);

	const handleListKeyDown = useCallback(ev => {
		if (ev.key === 'ArrowDown') {
			focusNext(ev, { useCurrentTarget: false });
		} else if (ev.key === 'ArrowUp') {
			focusPrev(ev, { useCurrentTarget: false });
		} else if (ev.key === 'PageDown') {
			focusNext(ev, { useCurrentTarget: false, offset: 10 });
		} else if (ev.key === 'PageUp') {
			focusPrev(ev, { useCurrentTarget: false, offset: 10 });
		}
	}, [focusNext, focusPrev]);

	return (
		<ul
			tabIndex={0}
			ref={listRef}
			onFocus={receiveFocus}
			onBlur={receiveBlur}
			onKeyDown={handleListKeyDown}
			aria-label="Results"
			className="results"
		>
			{Array.isArray(processedItems) && processedItems
				.map(item => <Item
					identifierIsUrl={identifierIsUrl}
					key={item.key}
					item={item}
					mappings={mappings}
					isPicked={selectedKeys.includes(item.key)}
					onChange={handleItemChange}
				/>)
			}
		</ul>
	);
}

IdentifierList.propTypes = {
	selectedKeys: PropTypes.array.isRequired,
	setSelectedKeys: PropTypes.func.isRequired,
	processedItems: PropTypes.array
};

const IdentifierPicker = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.modal.id === IDENTIFIER_PICKER);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const items = useSelector(state => state.identifier.items);
	const isImport = useSelector(state => state.identifier.import);
	const isSearchingMultiple = useSelector(state => state.identifier.isSearchingMultiple);
	const identifierResult = useSelector(state => state.identifier.result);
	const identifierMessage = useSelector(state => state.identifier.message);
	const isSearching = useSelector(state => state.identifier.isSearching);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const wasSearchingMultiple = usePrevious(isSearchingMultiple);
	const processedItems = items && processIdentifierMultipleItems(items, itemTypes, false);  //@TODO: isUrl source should be stored in redux
	const [selectedKeys, setSelectedKeys] = useState([]);
	const isBusy = useBufferGate((isImport && isSearching) || (!wasSearchingMultiple && isSearchingMultiple), 200);
	const isReady = isOpen && !isBusy;
	const wasReady = usePrevious(isReady);
	const footerRef = useRef(null);
	const skipNextFocusRef = useRef(false); // required for modal's scopedTab (focus trap) to work correctly
	const { focusNext, focusPrev, receiveBlur, receiveFocus, resetLastFocused } = useFocusManager(
		footerRef, { initialQuerySelector: '.btn-outline-secondary:not(:disabled)' }
	);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(IDENTIFIER_PICKER, false));
	}, [dispatch]);

	const handleAddSelected = useCallback(() => {
		dispatch(currentAddMultipleTranslatedItems(selectedKeys));
	}, [dispatch, selectedKeys]);

	const handleSearchMore = useCallback(() => {
		dispatch(searchIdentifierMore());
	}, [dispatch]);

	const handleSelectAll = useCallback(() => {
		if (Array.isArray(processedItems)) {
			setSelectedKeys(processedItems.map(i => i.key));
		}
	}, [processedItems]);

	const handleClearSelection = useCallback(() => {
		setSelectedKeys([]);
	}, []);

	const handleFocus = useCallback((ev) => {
		if (skipNextFocusRef.current) {
			skipNextFocusRef.current = false;
		} else {
			receiveFocus(ev);
		}
	}, [receiveFocus]);

	const handleBlur = useCallback((ev) => {
		// Forget the last focused element every time the footer loses focus
		// This means that, once at least one item is selected, after tabbing to the footer focus goes to the "Add Selected" button
		receiveBlur(ev);
		resetLastFocused();
	}, [receiveBlur, resetLastFocused])

	const handleFooterKeyDown = useCallback((ev) => {
		if (ev.key === 'ArrowRight') {
			focusNext(ev, { useCurrentTarget: false });
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev, { useCurrentTarget: false });
		} else if (ev.key === 'Tab' && !ev.shiftKey) {
			// for the modal's focus trap to work correctly, we need to make sure the focus is moved to the footerRef
			// (scopedTab in react-modal needs focus to be on the last "tabbable" so that it can trap the focus)
			skipNextFocusRef.current = true;
			footerRef.current.focus();
			footerRef.current.tabIndex = 0;
			footerRef.current.dataset.focusRoot = '';
		}
	}, [focusNext, focusPrev]);

	const handleAfterOpen = useCallback(() => {
		setTimeout(() => footerRef.current.focus(), 0);
	}, []);

	useEffect(() => {
		if(wasSearchingMultiple && !isSearchingMultiple) {
			dispatch(toggleModal(IDENTIFIER_PICKER, false));
		}
	}, [dispatch, isSearchingMultiple, wasSearchingMultiple]);

	useEffect(() => {
		if(!wasReady && isReady) {
			if (identifierResult === EMPTY) {
				dispatch(toggleModal(IDENTIFIER_PICKER, false));
				if (identifierMessage) {
					dispatch(reportIdentifierNoResults(identifierMessage));
				}
			} else if(isImport || identifierResult === MULTIPLE) {
				// Select all if either importing or add by identifier result is multiple (but not choice)
				handleSelectAll();
			}
		}
	}, [dispatch, handleSelectAll, identifierMessage, identifierResult, isImport, isReady, wasReady]);

	return (
		<Modal
			className="identifier-picker-modal modal-scrollable modal-lg modal-touch"
			contentLabel="Add By Identifier"
			isOpen={ isOpen }
			isBusy={ isBusy }
			onAfterOpen={ handleAfterOpen }
			onRequestClose={ handleCancel }
			overlayClassName="modal-slide modal-centered"
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<>
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={handleCancel}
								>
									Cancel
								</Button>
							</div>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									Select Items
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									disabled={selectedKeys.length === 0}
									className="btn-link"
									onClick={handleAddSelected}
								>
									{
										selectedKeys.length > 0 ? `Add ${selectedKeys.length} ${pluralize('Item', selectedKeys.length)}` : 'Add Selected'
									}
								</Button>
							</div>
						</>
					) : (
						<>
							<h4 className="modal-title truncate">
								Select Items
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
								title="Close Dialog"
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</>
					)
				}
			</div>
			<div className="modal-body" tabIndex="-1">
				<IdentifierList
					selectedKeys={selectedKeys}
					setSelectedKeys={setSelectedKeys}
					processedItems={processedItems}
				/>
			</div>
			<div
				className="modal-footer"
				ref={footerRef}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleFooterKeyDown}
				tabIndex={0}
			>
				<div className="modal-footer-left">
					<Button className="btn btn-link" onClick={handleSelectAll} tabIndex={-2}>
						Select All
					</Button>
					<Button className="btn btn-link" onClick={handleClearSelection} tabIndex={-2}>
						Clear Selection
					</Button>
				</div>
					{ identifierResult === CHOICE && (
						<div className="modal-footer-center">
							{ isSearching ? <Spinner /> : (
							<Button
								className={cx("btn more-button", { 'btn-link': isTouchOrSmall, 'btn-lg btn-secondary': !isTouchOrSmall }) }
								onClick={ handleSearchMore }
							>
								More
							</Button>
							) }
						</div>
					) }
				{ !isTouchOrSmall && (
					<div className="modal-footer-right">
						<Button
							disabled={selectedKeys.length === 0}
							className="btn-outline-secondary btn-min-width"
							onClick={ handleAddSelected }
							tabIndex={-2}
						>
							{
								selectedKeys.length > 0 ? `Add ${selectedKeys.length} ${pluralize('Item', selectedKeys.length)}` : 'Add Selected'
							}
						</Button>
					</div>
				) }
			</div>
		</Modal>
	);
}

export default memo(IdentifierPicker);
