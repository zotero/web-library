'use strict';

import React, { useCallback, useMemo, useState } from 'react';
import baseMappings from 'zotero-base-mappings';
import PropTypes from 'prop-types';
import cx from 'classnames';

import BoxField from './boxfield';
import Creators from '../form/creators';
import withDevice from '../../enhancers/with-device';
import withEditMode from '../../enhancers/with-edit-mode';
import { getFieldDisplayValue } from '../../common/item';
import { hideFields, noEditFields, extraFields } from '../../constants/item';

const makeFields = (item, pendingChanges, itemTypes, itemTypeFields, isReadOnly) => {
	const titleField = item.itemType in baseMappings && baseMappings[item.itemType]['title'] || 'title';
	const aggregatedPatch = pendingChanges.reduce(
		(aggr, { patch }) => ({...aggr, ...patch}), {}
	);
	const itemWithPendingChnages = { ...item, ...aggregatedPatch };

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
		display: getFieldDisplayValue(itemWithPendingChnages, f.field),
		value: itemWithPendingChnages[f.field] || null,
		title: f.field === 'url' ? itemWithPendingChnages[f.field] || null : null
	}));
}

const ItemBox = props => {
	const { creatorTypes, device, isEditing, isReadOnly, item, itemTypeFields, itemTypes,
		pendingChanges, updateItemWithMapping, } = props;

	const isForm = !!(device.shouldUseEditMode && isEditing && item);

	//@TODO: mapping should be handled by <Creators />
	//@TODO: even better, we should store this mapped already
	const creatorTypeOptions = useMemo(() => creatorTypes.map(ct => ({
		value: ct.creatorType,
		label: ct.localized
	})));
	const itemTypeOptions = useMemo(() => itemTypes.map(it => ({
			value: it.itemType,
			label: it.localized
		}))
		.filter(it => it.value !== 'note')
	);

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
	});

	const handleFieldFocus = useCallback(ev => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		const field = fields.find(f => f.key === key);

		if(!isForm && field.isReadOnly) {
			return;
		}
		setActiveEntry(key);
	});

	const handleFieldBlur = useCallback(() => {
		setActiveEntry(null);
	});

	const handleCancel = useCallback((isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if(key === activeEntry) {
			setActiveEntry(null);
		}
	});

	const handleCommit = useCallback((newValue, isChanged, ev) => {
		const key = ev.currentTarget.closest('[data-key]').dataset.key;
		if(isChanged) {
			updateItemWithMapping(item, key, newValue);
		}

		if(key === activeEntry) {
			setActiveEntry(null);
		}

		if(isForm && ev) {
			if(ev.type == 'keydown' && ev.key == 'Enter') {
				ev.target.blur();
			}
		}
	});

	const handleSaveCreators = useCallback((newValue, isChanged) => {
		if(isChanged) {
			updateItemWithMapping(item, 'creators', newValue);
		}
	});

	const handleDragStatusChange = useCallback(
		isDragging => setIsDragging(isDragging)
	);

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
	creatorTypes: PropTypes.array,
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	item: PropTypes.object,
	itemTypeFields: PropTypes.object,
	itemTypes: PropTypes.array,
	pendingChanges: PropTypes.array,
	updateItemWithMapping: PropTypes.func,
};

export default withDevice(withEditMode(ItemBox));
