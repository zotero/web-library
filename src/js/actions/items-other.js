import { omit } from 'web-common/utils';

import { preferenceChange } from '.';

const updateItemsSorting = (columnsKey, sortBy, sortDirection) => {
	return (dispatch, getState) => {
		const columns = getState().preferences[columnsKey];
		dispatch(preferenceChange(columnsKey, columns.map(column => {
			if(column.field === sortBy) {
				return { ...column, sort: sortDirection }
			} else {
				return omit(column, 'sort');
			}
		})));
	}
};

const toggleItemsSortingDirection = (columnsKey) => {
	return (dispatch, getState) => {
		const columns = getState().preferences[columnsKey];
		const sortColumn = columns.find(c => c.sort);
		return dispatch(updateItemsSorting(columnsKey, sortColumn.field, sortColumn.sort === 'desc' ? 'asc' : 'desc'));
	}
}

export {
	toggleItemsSortingDirection,
	updateItemsSorting,
}
