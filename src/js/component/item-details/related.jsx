'use strict';

import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../ui/button';
import Icon from '../ui/icon';
import withDevice from '../../enhancers/with-device';
import { getItemTitle } from '../../common/item';
import { getUniqueId } from '../../utils';
import { isTriggerEvent } from '../../common/event';
import { pick } from '../../common/immutable';
import { getScrollContainerPageCount, sortItemsByKey } from '../../utils';
import { TabPane } from '../ui/tabs';
import { useFocusManager } from '../../hooks';


const RelatedItem = props => {
	const { device, parentItemKey, relatedItem, libraryKey, removeRelatedItem, navigate, onKeyDown } = props;
	const iconSize = device.isTouchOrSmall ? '28' : '16';
	const id = useRef(getUniqueId());

	const handleSelect = useCallback(ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		navigate({
			library: libraryKey,
			items: relatedItemKey
		}, true);
	});

	const handleDelete = useCallback(ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		removeRelatedItem(parentItemKey, relatedItemKey);
	});

	const getItemIcon = item => {
		const { iconName } = item[Symbol.for('derived')];
		const dvp = window.devicePixelRatio >= 2 ? 2 : 1;
		return device.isTouchOrSmall ?
			`28/item-types/light/${iconName}` : `16/item-types/light/${dvp}x/${iconName}`;
	}

	return (
			<li
				aria-labelledby={ id.current }
				className="related"
				data-key={ relatedItem.key }
				key={ relatedItem.key }
				onKeyDown={ onKeyDown }
				role="listitem button"
				tabIndex={ -2 }
			>
				<Icon
					type={ getItemIcon(relatedItem) }
					width={ iconSize }
					height={ iconSize }
				/>
				<a id={ id.current } onClick={ handleSelect }>
					{ getItemTitle(relatedItem) }
				</a>
				<Button icon
					aria-label="remove related"
					onClick={ handleDelete }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			</li>
		)
}

RelatedItem.propTypes = {
	device: PropTypes.object.isRequired,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func.isRequired,
	parentItemKey: PropTypes.string,
	relatedItem: PropTypes.object,
	removeRelatedItem: PropTypes.func.isRequired,
}

const Related = ({ device, fetchRelatedItems, itemKey, isFetched, isFetching, relatedItems, ...props }) => {
	const [sortedRelatedItems, setSortedRelatedItems] = useState([]);
	const scrollContainerRef = useRef(null);
	const { receiveBlur, focusDrillDownPrev, focusDrillDownNext, receiveFocus, focusNext,
		focusPrev } = useFocusManager(scrollContainerRef, null, false);

	useEffect(() => {
		if(!isFetching && !isFetched) {
			fetchRelatedItems(itemKey);
		}
	}, []);

	useEffect(() => {
		const sortedRelatedItems = [...relatedItems];
		sortItemsByKey(sortedRelatedItems, 'title');
		setSortedRelatedItems(sortedRelatedItems);
	}, [relatedItems])

	const handleKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			focusDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			focusDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && focusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && focusPrev(ev);
		} else if(ev.key === 'Home' && scrollContainerRef.current) {
			focusPrev(ev, { offset: Infinity });
			ev.preventDefault();
		} else if(ev.key === 'End' && scrollContainerRef.current) {
			focusNext(ev, { offset: Infinity });
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.related');
			focusNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.related');
			focusPrev(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(isTriggerEvent(ev)) {
			ev.target.querySelector('a').click();
			ev.preventDefault();
		}
	});

	return (
		<TabPane { ...pick(props, ['isActive']) } isLoading={ device.shouldUseTabs && !isFetched }>
			<h5 className="h2 tab-pane-heading hidden-mouse">Related</h5>
			<div
				className="scroll-container-mouse"
				onBlur={ receiveBlur }
				onFocus={ receiveFocus }
				ref={ scrollContainerRef }
				tabIndex={ 0 }
			>
				{ sortedRelatedItems.length > 0 && (
					<nav>
						<ul className="details-list related-list">
							{
								sortedRelatedItems.map(relatedItem => (
									<RelatedItem
										device={ device }
										key={ relatedItem.key }
										parentItemKey={ itemKey }
										relatedItem={ relatedItem }
										onKeyDown={ handleKeyDown }
										{ ...pick(props, ['libraryKey', 'navigate', 'removeRelatedItem']) }
									/>
								))
							}
						</ul>
					</nav>
				) }
			</div>
		</TabPane>
	);
}

Related.propTypes = {
	device: PropTypes.object,
	fetchRelatedItems: PropTypes.func.isRequired,
	isFetched: PropTypes.bool,
	isFetching: PropTypes.bool,
	itemKey: PropTypes.string,
	relatedItems: PropTypes.array,
}

export default withDevice(Related);
