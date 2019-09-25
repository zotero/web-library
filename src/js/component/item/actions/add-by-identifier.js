import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '../../ui/button';
import Icon from '../../ui/icon';
import withDevice from '../../../enhancers/with-device';
import { getUniqueId } from '../../../utils';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import Input from '../../form/input';
import { createItem, searchIdentifier, navigate, resetIdentifier } from '../../../actions';

const AddByIdentifier = props => {
	const { device, onAddByIdentifierModalOpen, onKeyDown } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	const [identifier, setIdentifier] = useState('');
	const id = useRef(getUniqueId());
	const dispatch = useDispatch();
	const { isError, reviewItem, isSearching } = useSelector(state => state.identifier);
	const { collectionKey, itemsSource, libraryKey } = useSelector(state => state.current);

	const handleClick = useCallback(ev => {
		if(device.isTouchOrSmall) {
			onAddByIdentifierModalOpen(ev);
		} else {
			setIsOpen(!isOpen);
		}
	});

	const handleInputChange = useCallback(newIdentifier => {
		setIdentifier(newIdentifier);
	});

	const handleInputCommit = useCallback(newIdentifier => {
		addItem(newIdentifier);
	});

	const handleInputBlur = useCallback(() => true);

	const toggleOpen = useCallback(() => {
		dispatch(resetIdentifier());
		setIsOpen(!isOpen);
	});

	const handleSearch = useCallback(() => {
		addItem(identifier);
	});

	const addItem = useCallback(async itemIdentifier => {
		if(itemIdentifier) {
			setIsBusy(true);
			const reviewItem = await dispatch(searchIdentifier(itemIdentifier));
			if(itemsSource === 'collection' && collectionKey) {
				reviewItem.collections = [collectionKey];
			}
			const item = await dispatch(createItem(reviewItem, libraryKey));
			setIsBusy(false);
			setIsOpen(false);
			dispatch(resetIdentifier());
			dispatch(navigate({
				library: libraryKey,
				collection: collectionKey,
				items: [item.key],
				view: 'item-list'
			}, true));
		}
	});

	return (
		<React.Fragment>
			<Button
				icon
				onClick={ handleClick }
				onKeyDown={ onKeyDown }
				tabIndex={ -2 }
				title="Add By Identifier"
				id={ id.current }
			>
				<Icon type="16/magic-wand" width="16" height="16" />
			</Button>
			<Popover
				isOpen={ isOpen }
				toggle={ toggleOpen }
				trigger="legacy"
				placement="bottom"
				target={ id.current }
				className="popover-container"
			>
				<PopoverHeader>
					<label htmlFor={ `${id.current}-input` }>
						Enter a URL, ISBN, DOI, PMID, or arXiv ID:
					</label>
				</PopoverHeader>
				<PopoverBody>
					<div className="form">

						<Input
							autoFocus
							id={ `${id.current}-input` }
							isBusy={ isBusy }
							isDisabled={ isBusy }
							onBlur={ handleInputBlur }
							onChange={ handleInputChange }
							onCommit={ handleInputCommit }
							tabIndex={ 0 }
							value={ identifier }
						/>
						<Button onClick={ handleSearch } >Search</Button>
					</div>
				</PopoverBody>
			</Popover>
		</React.Fragment>
	);
}


export default withDevice(AddByIdentifier);
