'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

import Editable from '../editable';
import TextAreaInput from '../form/text-area';
import withDevice from '../../enhancers/with-device';

const Abstract = props => {
	const { device, item, isEditing, isReadOnly, pendingChanges } = props;
	const { updateItemWithMapping } = props;
	const [isActive, setIsActive] = useState(false);

	console.log({ pendingChanges });

	const placeholder = !device.shouldUseEditMode || (device.shouldUseEditMode && isEditing) ?
		'Add abstract…' : '';

	const itemWithPendingChanges = useMemo(() => {
		const aggregatedPatch = pendingChanges.reduce(
			(aggr, { patch }) => ({...aggr, ...patch}), {}
		);
		return { ...item, ...aggregatedPatch};
	}, [item, pendingChanges]);

	const isBusy = useMemo(() => {
		pendingChanges.some(({ patch }) => 'abstractNote' in patch);
	});

	const handleMakeActive = useCallback(() => {
		console.log('make active', { isReadOnly } );
		if(!isReadOnly) {
			setIsActive(true);
		}
	});

	const handleCommit = useCallback((newValue, hasChanged) => {
		console.log('handleCommit');
		if(hasChanged) {
			updateItemWithMapping(item, 'abstractNote', newValue);
		}
		setIsActive(false);
	});

	const handleCancel = useCallback(() => {
		console.log('handleCancel');
		setIsActive(false);
	});

	console.log({ isActive, isEditing });

	const input = (
		<TextAreaInput
			autoFocus={ !(device.shouldUseEditMode && isEditing) }
			isBusy={ isBusy }
			isReadOnly={ isReadOnly }
			onCancel={ handleCancel }
			onCommit={ handleCommit }
			placeholder={ placeholder }
			resize='vertical'
			selectOnFocus={ !(device.shouldUseEditMode && isEditing) }
			tabIndex={ (device.shouldUseEditMode && isEditing) ? 0 : null }
			value={ itemWithPendingChanges.abstractNote || '' }
			className={ cx({
				'form-control': device.shouldUseEditMode && isEditing,
				'form-control-sm': device.shouldUseEditMode && isEditing,
				'editable-control': !(device.shouldUseEditMode && isEditing),
			}) }
		/>
	);

	return (device.shouldUseEditMode && isEditing) ? input : (
		<Editable
			input={ input }
			isActive={ isActive }
			isBusy={ isBusy }
			isDisabled={ device.shouldUseEditMode && !isEditing }
			isReadOnly={ isReadOnly }
			onClick={ handleMakeActive }
			onFocus={ handleMakeActive }
		/>
	);
}

Abstract.propTypes = {
	device: PropTypes.object,
	isEditing: PropTypes.bool,
	isForm: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	item: PropTypes.object,
	pendingChanges: PropTypes.array,
	updateItemWithMapping: PropTypes.func,
};

Abstract.defaultProps = {
	pendingChanges: []
};

export default withDevice(Abstract);
