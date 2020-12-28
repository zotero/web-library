import React, { useCallback, useEffect, memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Modal from '../ui/modal';
import { IDENTIFIER_PICKER } from '../../constants/modals';
import { currentAddMultipleTranslatedItems, toggleModal } from '../../actions';
import { usePrevious } from '../../hooks';
import { processIdentifierMultipleItems } from '../../utils';

const Item = memo(({ onChange, isPicked, item }) => {
	const { key, description, title, itemType, source } = item;
	let badge = null;
	if(source === 'url') {
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
	} else if(itemType) {
		badge = itemType;
	}
	return (
			<li
				className="result"
				data-key={ item.key }
			>
				{ badge && <span key={badge} className="badge badge-light d-sm-none">{ badge }</span> }
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
				<input
					type="checkbox"
					checked={ isPicked }
					onChange={ onChange }
				/>
			</li>
		)
});

Item.displayName = 'Item';

const IdentifierPicker = () => {
	const dispatch = useDispatch();
	const isOpen = useSelector(state => state.modal.id === IDENTIFIER_PICKER);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const items = useSelector(state => state.identifier.items);
	const isSearchingMultiple = useSelector(state => state.identifier.isSearchingMultiple);
	const wasSearchingMultiple = usePrevious(isSearchingMultiple);
	const processedItems = items && processIdentifierMultipleItems(items, itemTypes, false);  //@TODO: isUrl source should be stored in redux
	const [selectedKeys, setSelectedKeys] = useState([]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(IDENTIFIER_PICKER, false));
	}, [dispatch]);

	const handleItemChange = useCallback(ev => {
		try {
			const key = ev.currentTarget.closest('[data-key]').dataset.key;
			setSelectedKeys(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]);
		} catch(e) {}
	}, [selectedKeys]);

	const handleAddSelected = useCallback(ev => {
		dispatch(currentAddMultipleTranslatedItems(selectedKeys));
	}, [dispatch, selectedKeys]);

	useEffect(() => {
		if(wasSearchingMultiple && !isSearchingMultiple) {
			dispatch(toggleModal(IDENTIFIER_PICKER, false));
		}
	}, [dispatch, isSearchingMultiple, wasSearchingMultiple]);

	return (
		<Modal
			className="modal-touch"
			contentLabel="Add By Identifier"
			isOpen={ isOpen }
			isBusy={ !wasSearchingMultiple && isSearchingMultiple }
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
						onClick={ handleAddSelected }
						className="btn-link"
					>
						Add Selected
					</Button>
				</div>
			</div>
			<div className="modal-body">
				{ Array.isArray(processedItems) && processedItems
					.map(item => <Item
						key={ item.key }
						item={ item }
						isPicked={ selectedKeys.includes(item.key) }
						onChange={ handleItemChange }
					/>)
				}
			</div>
		</Modal>
	);
}

export default memo(IdentifierPicker);
