import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { pluralize } from '../../common/format';
import { get } from '../../utils';
import { useSourcePath } from '../../hooks/';

const ItemDetailsInfoView = () => {
	const objectKey = useSelector(state => state.current.itemKey);
	const objectKeys = useSelector(state => state.current.itemKeys);
	const dataObjects = useSelector(state => state.libraries[state.current.libraryKey]?.dataObjects) ?? [];
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const sourcePath = useSourcePath();
	const isTrash = useSelector(state => state.current.isTrash);
	const totalCount = useSelector(state => get(state, sourcePath, null)?.totalCount);
	const totalResults = useSelector(state => get(state, sourcePath, null)?.totalResults);
	const itemsCount = totalCount ?? totalResults ?? null;
	const objects = objectKeys.map(key => dataObjects[key]);
	const hasCollections = objects.some(obj => obj?.[Symbol.for('type')] === 'collection');
	const hasItems = objects.some(obj => !obj || obj?.[Symbol.for('type')] === 'item');
	const objectType = objects.length === 0 ?
		(objectKeys.length === 0 && isTrash && totalCount !== totalResults ? 'object' : 'item') :
		(hasCollections && hasItems) ? 'object' : hasCollections ? 'collection' : 'item';

	const [label, setLabel] = useState('');

	useEffect(() => {
		if(isEmbedded) {
			setLabel('');
		} else if(objectKeys.length > 0) {
			setLabel([
				objectKeys.length,
				pluralize(objectType, objectKeys.length),
				'selected'
			].join(' '));
		} else if(!objectKey && itemsCount !== null) {
			setLabel([
				itemsCount === 0 ? 'No' : itemsCount,
				pluralize(objectType, itemsCount),
				'in this view'
			].join(' '));
		} else {
			setLabel('');
		}
	}, [isEmbedded, itemsCount, objectKey, objectKeys, objectType]);

	return <div className="info-view">{ label }</div>;
}

export default ItemDetailsInfoView;
