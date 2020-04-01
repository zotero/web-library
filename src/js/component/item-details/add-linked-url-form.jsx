import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Spinner from '../ui/spinner';
import { Toolbar } from '../ui/toolbars';
import { createLinkedUrlAttachments } from '../../actions';
import Input from '../form/input';

const AddLinkedUrlForm = forwardRef(({ onClose }, ref) => {
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [isBusy, setBusy] = useState(false);
	const [url, setUrl] = useState('');
	const [title, setTitle] = useState('');

	// Allow submiting form by parent
	useImperativeHandle(ref, () => ({
		submit: handleLinkedFileConfirmClick
	}));

	const handleLinkedFileConfirmClick = useCallback(async () => {
		setBusy(true);
		await dispatch(createLinkedUrlAttachments({ url, title }, { parentItem: itemKey }));
		setBusy(false);
		onClose();
	});

	const handleUrlChange = useCallback(newValue => setUrl(newValue));
	const handleTitleChange = useCallback(newValue => setTitle(newValue));
	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape') {
			ev.stopPropagation();
			onClose();
		}
	});

	return (
		<div className="add-linked-url form" onKeyDown={ handleKeyDown }>
			<div className="form-group form-row">
				<label className="col-form-label" htmlFor="linked-url-form-url">Link</label>
				<div className="col">
					<Input
						autoFocus
						id="linked-url-form-url"
						onChange={ handleUrlChange }
						placeholder="Enter or paste URL"
						tabIndex={ 0 }
						value={ url }
					/>
				</div>
			</div>
			<div className="form-group form-row">
				<label className="col-form-label" htmlFor="linked-url-form-title">Title</label>
				<div className="col">
					<Input
						id="linked-url-form-title"
						onChange={ handleTitleChange }
						placeholder="(Optional)"
						tabIndex={ 0 }
						value={ title }
					/>
				</div>
			</div>
			{ !isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-right">
						{ isBusy ? <Spinner className="small" /> : (
						<React.Fragment>
							<Button
								onClick={ onClose }
								className="btn-default"
								tabIndex={ 0 }
							>
								Cancel
							</Button>
							<Button
								onClick={ handleLinkedFileConfirmClick }
								className="btn-default"
								tabIndex={ 0 }
							>
								Add
							</Button>
						</React.Fragment>
						)}
					</div>
				</Toolbar>
			) }
		</div>
	);
});

AddLinkedUrlForm.displayName = 'AddLinkedUrlForm';

AddLinkedUrlForm.propTypes = {
	onClose: PropTypes.func.isRequired,
	onBusyStateChange: PropTypes.func,
}

export default AddLinkedUrlForm;
