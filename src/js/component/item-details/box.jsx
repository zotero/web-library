import baseMappings from 'zotero-base-mappings';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BoxField from './boxfield';
import Creators from '../form/creators';
import { get } from '../../utils';
import { getFieldDisplayValue } from '../../common/item';
import { hideFields, hideIfEmptyFields, noEditFields, extraFields } from '../../constants/item';
import { updateItemWithMapping } from '../../actions';

const makeFields = (item, pendingChanges, itemTypes, itemTypeFields, isReadOnly) => {
	const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';
	const aggregatedPatch = pendingChanges.reduce(
		(aggr, { patch }) => ({...aggr, ...patch}), {}
	);
	const itemWithPendingChanges = { ...item, ...aggregatedPatch };

	return [
		{ field: 'itemType', localized: 'Item Type' },
		itemTypeFields[item.itemType].find(itf => itf.field === titleField),
		{ field: 'creators', localized: 'Creators' },
		...itemTypeFields[item.itemType].filter(itf => itf.field !== titleField && !hideFields.includes(itf.field)),
		...extraFields
	].map(f => ({
		options: f.field === 'itemType' ? itemTypes : null,
		key: f.field,
		label: f.localized,
		isReadOnly: isReadOnly ? true : noEditFields.includes(f.field),
		processing: pendingChanges.some(({ patch }) => f.field in patch),
		display: getFieldDisplayValue(itemWithPendingChanges, f.field),
		value: get(itemWithPendingChanges, 'path' in f ? f.path : f.field, null),
		title: f.field === 'url' ? itemWithPendingChanges[f.field] || null : null
	})).filter(f => !(f.value === null && hideIfEmptyFields.includes(f.key)))
}

const ItemBox = ({ isReadOnly }) => {
	const dispatch = useDispatch();
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const isEditing = useSelector(
		state => state.current.itemKey && state.current.editingItemKey === state.current.itemKey
	);
	const item = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey], {})
	);
	const creatorTypes = useSelector(state=> state.meta.itemTypeCreatorTypes[item.itemType]);
	const itemTypeFields = useSelector(state=> state.meta.itemTypeFields);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const pendingChanges = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'updating', 'items', state.current.itemKey], [])
	);

	const isForm = !!(shouldUseEditMode && isEditing && item);

	//@TODO: mapping should be handled by <Creators />
	//@TODO: even better, we should store this mapped already
	const creatorTypeOptions = useMemo(() => creatorTypes.map(ct => ({
		value: ct.creatorType,
		label: ct.localized
	})), [creatorTypes]);
	const itemTypeOptions = useMemo(() => itemTypes.map(it => ({
		value: it.itemType,
		label: it.localized
	})).filter(it => it.value !== 'note'), [itemTypes]);

	const fields = useMemo(
		() => makeFields(item, pendingChanges, itemTypeOptions, itemTypeFields, isReadOnly),
		[item, pendingChanges, itemTypeOptions, itemTypeFields, isReadOnly]
	);

	const [activeEntry, setActiveEntry] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFieldClick = useCallback(ev => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		const field = fields.find(f => f.key === key);
		if(!isForm && field.isReadOnly) {
			return;
		}
		setActiveEntry(key);
	}, [fields, isForm]);

	const handleFieldFocus = useCallback(ev => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		const field = fields.find(f => f.key === key);

		if(!isForm && field.isReadOnly) {
			return;
		}
		setActiveEntry(key);
	}, [fields, isForm]);

	const handleFieldBlur = useCallback(() => {
		setActiveEntry(null);
	}, []);

	const handleCancel = useCallback((isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if(key === activeEntry) {
			setActiveEntry(null);
		}
	}, [activeEntry]);

	const handleCommit = useCallback((newValue, isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if(isChanged) {
			dispatch(updateItemWithMapping(item, key, newValue));
		}

		if(key === activeEntry) {
			setActiveEntry(null);
		}

		if(isForm && ev) {
			if(ev.type == 'keydown' && ev.key == 'Enter') {
				ev.target.blur();
			}
		}
	}, [dispatch, activeEntry, isForm, item]);

	const handleSaveCreators = useCallback((newValue, isChanged) => {
		if(isChanged) {
			dispatch(updateItemWithMapping(item, 'creators', newValue));
		}
	}, [dispatch, item]);

	const handleDragStatusChange = useCallback(isDragging => setIsDragging(isDragging), []);

	return (
		<ol className={ cx('metadata-list', {
			'dnd-in-progress': isDragging
		}) }>
			{ fields.map(field =>
				field.key === 'creators' ? (
					<Creators
						creatorTypes = { creatorTypeOptions }
						isForm = { isForm }
						isReadOnly = { field.isReadOnly }
						key = { field.key }
						name = { field.key }
						onDragStatusChange = { handleDragStatusChange }
						onSave = { handleSaveCreators }
						value = { field.value || [] }
					/>
				) : (
					<BoxField
						field = { field }
						isActive = { activeEntry === field.key }
						isForm = { isForm }
						key = { field.key }
						onBlur = { handleFieldBlur }
						onCancel = { handleCancel }
						onClick = { handleFieldClick }
						onCommit = { handleCommit }
						onFocus = { handleFieldFocus }
					/>
				)
			) }
		</ol>
	);
}

ItemBox.propTypes = {
	isReadOnly: PropTypes.bool,
};

export default memo(ItemBox);
