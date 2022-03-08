import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { pluralize } from '../../common/format';
import { get } from '../../utils';

const ItemDetailsInfoView = () => {
	const itemKey = useSelector(state => state.current.itemKey);
	const itemKeys = useSelector(state => state.current.itemKeys);
	const isEmbedded = useSelector(state => state.config.isEmbedded);

	const itemsCount = useSelector(state => {
		const { collectionKey, libraryKey, itemsSource } = state.current;
		switch(itemsSource) {
			case 'query':
				return state.query.totalResults || null;
			case 'top':
				return get(state, ['libraries', libraryKey, 'itemsTop', 'totalResults'], null);
			case 'trash':
				return get(state, ['libraries', libraryKey, 'itemsTrash', 'totalResults'], null);
			case 'collection':
				return get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey, 'totalResults'], null)
		}
	});
	const [label, setLabel] = useState('');

	useEffect(() => {
		if(isEmbedded) {
			setLabel('');
		} else if(itemKeys.length > 0) {
			setLabel([
				itemKeys.length,
				pluralize('item', itemKeys.length),
				'selected'
			].join(' '));
		} else if(!itemKey && itemsCount !== null) {
			setLabel([
				itemsCount === 0 ? 'No' : itemsCount,
				pluralize('item', itemsCount),
				'in this view'
			].join(' '));
		} else {
			setLabel('');
		}
	}, [isEmbedded, itemsCount, itemKey, itemKeys]);

	return <div className="info-view">{ label }</div>;
}

export default ItemDetailsInfoView;
