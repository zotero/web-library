import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BoxField from './boxfield';
import Creators from '../form/creators';
import { get } from '../../utils';
import { getFieldDisplayValue } from '../../common/item';
import { hideIfEmptyFields, noEditFields } from '../../constants/item';
import { renameAttachment, updateItemWithMapping } from '../../actions';

const makeFields = ({fields, item, pendingChanges, itemTypeOptions, isReadOnly}) => {
	const aggregatedPatch = (pendingChanges || []).reduce(
		(aggr, { patch }) => ({ ...aggr, ...patch }), {}
	);
	const itemWithPendingChanges = { ...(item || {}), ...aggregatedPatch };

	return fields.map(f => ({
		options: f.field === 'itemType' ? itemTypeOptions : null,
		key: f.field,
		label: f.localized,
		isReadOnly: isReadOnly ? true : noEditFields.includes(f.field),
		processing: (pendingChanges || []).some(({ patch }) => f.field in patch),
		display: getFieldDisplayValue(itemWithPendingChanges, f.field),
		value: get(itemWithPendingChanges, 'path' in f ? f.path : f.field, null),
		placeholder: f.field === 'accessDate' ? 'YYYY-MM-DD[ hh:mm:ss]' : null,
		title: f.field === 'url' ? itemWithPendingChanges[f.field] || null : null
	})).filter(f => !(f.value === null && hideIfEmptyFields.includes(f.key)))
}

const BoxFields = ({ className, fields, isReadOnly, item }) => {
	const dispatch = useDispatch();
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const isEditing = useSelector(
		state => state.current.itemKey && state.current.editingItemKey === state.current.itemKey
	);
	const itemTypeOptions = useSelector(state => state.meta.itemTypeOptions);
	const pendingChanges = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'updating', 'items', state.current.itemKey])
	);

	const isForm = !!(shouldUseEditMode && isEditing && item);
	const processedFields = useMemo(
		() => makeFields({ fields, item, pendingChanges, itemTypeOptions, isReadOnly}),
		[item, fields, pendingChanges, itemTypeOptions, isReadOnly]
	);

	const [activeEntry, setActiveEntry] = useState(null);

	const handleFieldClick = useCallback(ev => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		const field = processedFields.find(f => f.key === key);
		if (!isForm && field.isReadOnly) {
			return;
		}
		setActiveEntry(key);
	}, [processedFields, isForm]);

	const handleFieldFocus = useCallback(ev => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		const field = processedFields.find(f => f.key === key);

		if (!isForm && field.isReadOnly) {
			return;
		}
		setActiveEntry(key);
	}, [processedFields, isForm]);

	const handleFieldBlur = useCallback(() => {
		setActiveEntry(null);
	}, []);

	const handleCancel = useCallback((isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if (key === activeEntry) {
			setActiveEntry(null);
		}
	}, [activeEntry]);

	const handleCommit = useCallback((newValue, isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if (isChanged) {
			if (key === 'filename') {
				dispatch(renameAttachment(item.key, newValue));
			} else {
				// trim & normalize value, similar to https://github.com/zotero/zotero/blob/e9afd153e9a368e71a29f22982578750e6983ae9/chrome/content/zotero/xpcom/data/item.js#L619
				dispatch(updateItemWithMapping(item, key, newValue.trim().normalize()));
			}
		}

		if (key === activeEntry) {
			setActiveEntry(null);
		}

		if (isForm && ev) {
			if (ev.type == 'keydown' && ev.key == 'Enter') {
				ev.target.blur();
			}
		}

		if (!isForm && ev.target.nodeName === 'TEXTAREA' && (ev.type === 'keydown' && ev.key === 'Enter')) {
			ev.preventDefault();
		}

	}, [dispatch, activeEntry, isForm, item]);

	const handleSaveCreators = useCallback((newValue, isChanged) => {
		if (isChanged) {
			dispatch(updateItemWithMapping(item, 'creators', newValue));
		}
	}, [dispatch, item]);

	return (
		<ol className={cx('metadata-list', className)}>
			{processedFields.map(field =>
				field.key === 'creators' ? (
					<Creators
						itemType={item.itemType}
						isForm={isForm}
						isReadOnly={field.isReadOnly}
						key={field.key}
						name={field.key}
						onSave={handleSaveCreators}
						value={field.value || []}
					/>
				) : (
					<BoxField
						field={field}
						isActive={activeEntry === field.key}
						isForm={isForm}
						key={field.key}
						onBlur={handleFieldBlur}
						onCancel={handleCancel}
						onClick={handleFieldClick}
						onCommit={handleCommit}
						onFocus={handleFieldFocus}
					/>
				)
			)}
		</ol>
	);
}

BoxFields.propTypes = {
    className: PropTypes.string,
    fields: PropTypes.array,
    isReadOnly: PropTypes.bool,
    item: PropTypes.object
};

export default memo(BoxFields);
