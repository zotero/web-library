'use strict';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from './ui/icon';
import Button from './ui/button';
import { getItemTitle } from '../common/item';
import { TabPane } from './ui/tabs';
import { pick } from '../common/immutable';

const Related = ({ fetchRelatedItems, itemKey, isFetched, isFetching, libraryKey,
	navigate, relatedItems, removeRelatedItem, ...props }) => {

	useEffect(() => {
		if(!isFetching && !isFetched) {
			fetchRelatedItems(itemKey);
		}
	}, []);

	const handleSelect = ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		navigate({
			library: libraryKey,
			items: relatedItemKey
		}, true);
	}

	const handleDelete = ev => {
		const relatedItemKey = ev.currentTarget.closest('[data-key]').dataset.key;
		removeRelatedItem(itemKey, relatedItemKey);
	}

	return (
		<TabPane { ...pick(props, ['isActive']) } isLoading={ !isFetched }>
			<h5 className="h2 tab-pane-heading hidden-mouse">Related</h5>
			<div className="scroll-container-mouse">
				<nav>
					<ul className="details-list related-list">
						{
							relatedItems.map(relatedItem => (
								<li
									className="related"
									data-key={ relatedItem.key }
									key={ relatedItem.key }
								>
									<Icon type={ '16/document' } width="16" height="16" />
									<a onClick={ handleSelect }>
										{ getItemTitle(relatedItem) }
									</a>
									<Button icon onClick={ handleDelete }>
										<Icon type={ '16/minus-circle' } width="16" height="16" />
									</Button>
								</li>
							))
						}
					</ul>
				</nav>
			</div>
		</TabPane>
	);
}

Related.propTypes = {
	fetchRelatedItems: PropTypes.func.isRequired,
	isFetched: PropTypes.bool,
	isFetching: PropTypes.bool,
	itemKey: PropTypes.string,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func.isRequired,
	relatedItems: PropTypes.array,
	removeRelatedItem: PropTypes.func.isRequired,
}

export default Related;
