'use strict';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Spinner from './ui/spinner';
import Icon from './ui/icon';
import Button from './ui/button';
import { getItemTitle } from '../common/item';

const Related = ({ fetchRelatedItems, itemKey, isFetched, isFetching, libraryKey,
	navigate, relatedItems, removeRelatedItem }) => {

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

	return isFetched ? (
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
	) : <Spinner />;
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
