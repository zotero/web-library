import { useCallback, useEffect, memo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon, Spinner } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';

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

const IdentifierPicker = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.modal.id === IDENTIFIER_PICKER);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const items = useSelector(state => state.identifier.items);
	const isImport = useSelector(state => state.identifier.import);
	const isSearchingMultiple = useSelector(state => state.identifier.isSearchingMultiple);
	const identifierIsUrl = useSelector(state => state.identifier.identifierIsUrl);
	const identifierResult = useSelector(state => state.identifier.result);
	const identifierMessage = useSelector(state => state.identifier.message);
	const mappings = useSelector(state => state.meta.mappings);
	const isSearching = useSelector(state => state.identifier.isSearching);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const wasSearchingMultiple = usePrevious(isSearchingMultiple);
	const processedItems = items && processIdentifierMultipleItems(items, itemTypes, false);  //@TODO: isUrl source should be stored in redux
	const [selectedKeys, setSelectedKeys] = useState([]);
	const isBusy = useBufferGate((isImport && isSearching) || (!wasSearchingMultiple && isSearchingMultiple), 200);
	const isReady = isOpen && !isBusy;
	const wasReady = usePrevious(isReady);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(IDENTIFIER_PICKER, false));
	}, [dispatch]);

	const handleItemChange = useCallback(ev => {
		try {
			const key = ev.currentTarget.closest('[data-key]').dataset.key;
			setSelectedKeys(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]);
		} catch(e) {} // eslint-disable-line no-empty
	}, [selectedKeys]);

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
			<div className="modal-body">
				<ul className="results">
					{ Array.isArray(processedItems) && processedItems
						.map(item => <Item
							identifierIsUrl={ identifierIsUrl }
							key={ item.key }
							item={ item }
							mappings={ mappings }
							isPicked={ selectedKeys.includes(item.key) }
							onChange={ handleItemChange }
						/>)
					}
				</ul>
			</div>
			<div className="modal-footer">
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
