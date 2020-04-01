import PropTypes from 'prop-types';
import cx from 'classnames';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Spinner from '../ui/spinner';
import { Toolbar } from '../ui/toolbars';
import { createLinkedUrlAttachments } from '../../actions';
import Input from '../form/input';
import { cleanURL } from '../../utils';

const AddLinkedUrlForm = forwardRef(({ onClose }, ref) => {
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [isBusy, setBusy] = useState(false);
	const [url, setUrl] = useState('');
	const [title, setTitle] = useState('');
	const [isValid, setIsValid] = useState(true);

	const submit = useCallback(async () => {
		var cleanedUrl = cleanURL(url, true);
		if(!cleanedUrl) {
			setIsValid(false);
			return false;
		}

		await dispatch(createLinkedUrlAttachments({ url: cleanedUrl, title }, { parentItem: itemKey }));
		return true;
	});

	// Allow submiting form by parent
	useImperativeHandle(ref, () => ({ submit }));

	const handleLinkedFileConfirmClick = useCallback(async () => {
		setBusy(true);
		const isSuccess = await submit();
		setBusy(false);
		if(isSuccess) {
			onClose();
		}
	});

	const handleUrlChange = useCallback(newValue => {
		setIsValid(true);
		setUrl(newValue);
	});
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
						className={ cx('form-control') }
						validationError={ isValid ? null : 'Invalid URL' }
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
