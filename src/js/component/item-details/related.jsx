'use strict';

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import Button from '../ui/button';
import Icon from '../ui/icon';
import withDevice from '../../enhancers/with-device';
import { getItemTitle } from '../../common/item';
import { pick } from '../../common/immutable';
import { sortItemsByKey } from '../../utils';
import { TabPane } from '../ui/tabs';


const RelatedItem = props => {
	const { device, parentItemKey, relatedItem, libraryKey, removeRelatedItem, navigate } = props;
	const handleSelect = ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		navigate({
			library: libraryKey,
			items: relatedItemKey
		}, true);
	}
	const iconSize = device.isTouchOrSmall ? '28' : '16';

	const handleDelete = ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		removeRelatedItem(parentItemKey, relatedItemKey);
	}

	const getItemIcon = item => {
		const { iconName } = item[Symbol.for('derived')];
		const dvp = window.devicePixelRatio >= 2 ? 2 : 1;
		return device.isTouchOrSmall ?
			`28/item-types/light/${iconName}` : `16/item-types/light/${dvp}x/${iconName}`;
	}

	return (
			<li
				className="related"
				data-key={ relatedItem.key }
				key={ relatedItem.key }
			>
				<Icon
					type={ getItemIcon(relatedItem) }
					width={ iconSize }
					height={ iconSize }
				/>
				<a onClick={ handleSelect }>
					{ getItemTitle(relatedItem) }
				</a>
				<Button icon onClick={ handleDelete }>
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

	return (
		<TabPane { ...pick(props, ['isActive']) } isLoading={ device.shouldUseTabs && !isFetched }>
			<h5 className="h2 tab-pane-heading hidden-mouse">Related</h5>
			<div className="scroll-container-mouse">
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
