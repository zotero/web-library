import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import PropTypes from 'prop-types';

import { selectFirstItem } from '../../../actions';


// @NOTE: `TableFocusEffectComponent` is an effect-only component that has been
// extracted from `Table` to avoid re-rendering the entire `Table` whenever
// `selectedItemKeys` or `isItemsTableFocused` changes.
const TableFocusEffectComponent = memo(({ tableRef, focusBySelector, resetLastFocused }) => {
	const dispatch = useDispatch();
	const selectedItemKeysLength = useSelector(state => state.current.itemKeys.length);
	const isItemsTableFocused = useSelector(state => state.current.isItemsTableFocused);
	const wasItemsTableFocused = usePrevious(isItemsTableFocused);

	useEffect(() => {
		if (!wasItemsTableFocused && isItemsTableFocused && selectedItemKeysLength === 0) {
			(async () => {
				const index = await dispatch(selectFirstItem(true));
				if (index !== null && tableRef.current) {
					focusBySelector('[data-index="0"]');
				}
			})();
		}
		if (wasItemsTableFocused && !isItemsTableFocused) {
			resetLastFocused();
		}
	}, [dispatch, focusBySelector, isItemsTableFocused, selectedItemKeysLength, resetLastFocused, wasItemsTableFocused, tableRef]);

	return null;
});

TableFocusEffectComponent.displayName = "TableFocusEffectComponent";

TableFocusEffectComponent.propTypes = {
	tableRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
	focusBySelector: PropTypes.func.isRequired,
	resetLastFocused: PropTypes.func.isRequired,
};

export default TableFocusEffectComponent;
