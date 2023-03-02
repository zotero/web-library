import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Editable from '../editable';
import TextAreaInput from '../form/text-area';
import { get } from '../../utils';
import { pick } from '../../common/immutable';
import { updateItemWithMapping } from '../../actions';

const Abstract = ({ isReadOnly, ...rest }) => {
	const dispatch = useDispatch();
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const isEditing = useSelector(
		state => state.current.itemKey && state.current.editingItemKey === state.current.itemKey
	);
	const item = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey])
	);
	const pendingChanges = useSelector(state =>
		get(state, ['libraries', state.current.libraryKey, 'updating', 'items', state.current.itemKey])
	);
	const [isActive, setIsActive] = useState(false);

	const placeholder = !shouldUseEditMode || (shouldUseEditMode && isEditing) ?
		'Add abstract…' : '';

	const itemWithPendingChanges = useMemo(() => {
		const aggregatedPatch = (pendingChanges || []).reduce(
			(aggr, { patch }) => ({...aggr, ...patch}), {}
		);
		return { ...(item || {}), ...aggregatedPatch};
	}, [item, pendingChanges]);

	const isBusy = pendingChanges && pendingChanges.some(({ patch }) => 'abstractNote' in patch);

	const handleMakeActive = useCallback(() => {
		if(!isReadOnly) {
			setIsActive(true);
		}
	}, [isReadOnly]);

	const handleCommit = useCallback((newValue, hasChanged) => {
		if(item && hasChanged) {
			dispatch(updateItemWithMapping(item, 'abstractNote', newValue));
		}
		setIsActive(false);
	}, [dispatch, item]);

	const handleCancel = useCallback(() => {
		setIsActive(false);
	}, []);

	const input = (
		<TextAreaInput
			{ ...pick(rest, p => p.startsWith('aria-')) }
			autoFocus={ !(shouldUseEditMode && isEditing) }
			isBusy={ isBusy }
			isReadOnly={ isReadOnly }
			onCancel={ handleCancel }
			onCommit={ handleCommit }
			placeholder={ placeholder }
			resize='vertical'
			selectOnFocus={ !(shouldUseEditMode && isEditing) }
			tabIndex={ (shouldUseEditMode && isEditing) ? 0 : null }
			value={ itemWithPendingChanges.abstractNote || '' }
			className={ cx({
				'form-control': shouldUseEditMode && isEditing,
				'form-control-sm': shouldUseEditMode && isEditing,
				'editable-control': !(shouldUseEditMode && isEditing),
			}) }
		/>
	);

	return (shouldUseEditMode && isEditing) ? input : (
		<Editable
			id={ 'abstract' }
			input={ input }
			isActive={ isActive }
			isBusy={ isBusy }
			isDisabled={ isReadOnly }
			labelId={ 'label-abstract' }
			onClick={ handleMakeActive }
			onFocus={ handleMakeActive }
		/>
	);
}

Abstract.propTypes = {
	isReadOnly: PropTypes.bool,
};

export default memo(Abstract);
