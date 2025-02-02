import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';

import { hideFields, extraFields } from '../../constants/item';
import Boxfields from './boxfields';

const ItemBox = ({ isReadOnly }) => {
	const item = useSelector(
		state => state.libraries[state.current.libraryKey].items[state.current.itemKey]
	);
	const mappings = useSelector(state => state.meta.mappings);
	const itemTypeFields = useSelector(state => state.meta.itemTypeFields);
	const titleFieldName = (item || {}).itemType in mappings && mappings[item.itemType]['title'] || 'title';
	const titleField = (itemTypeFields[item.itemType] || []).find(itf => itf.field === titleFieldName);

	const fields = [
		{ field: 'itemType', localized: 'Item Type' },
		...(titleField ? [titleField] : []),
		{ field: 'creators', localized: 'Creators' },
		...(itemTypeFields[item.itemType] || []).filter(itf => itf.field !== titleFieldName && !hideFields.includes(itf.field)),
		...extraFields
	];

	return (<Boxfields
		item={ item }
		fields={ fields }
		isReadOnly={ isReadOnly }
	/>);
}

ItemBox.propTypes = {
	isReadOnly: PropTypes.bool,
};

export default memo(ItemBox);
