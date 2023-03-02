import PropTypes from 'prop-types';
import cx from 'classnames';
import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Spinner from '../ui/spinner';
import { Toolbar } from '../ui/toolbars';
import { createLinkedUrlAttachments } from '../../actions';
import Input from '../form/input';
import { cleanURL } from '../../utils';
import { useFocusManager } from '../../hooks';

const AddLinkedUrlFormToolbar = props => {
	const toolbarRef = useRef(null);
	const [isBusy, setBusy] = useState(false);
	const { onClose, onSubmit } = props;
	const { focusNext, focusPrev, receiveBlur, receiveFocus } = useFocusManager(toolbarRef);

	const handleToolbarKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			focusPrev(ev)
		} else if(ev.key === "ArrowRight") {
			focusNext(ev);
		}
	}, [focusNext, focusPrev]);

	const handleLinkedFileConfirmClick = useCallback(async () => {
		setBusy(true);
		const isSuccess = await onSubmit();
		setBusy(false);
		if(isSuccess) {
			onClose();
		}
	}, [onClose, onSubmit]);

	return (
		<Toolbar
			onBlur={ receiveBlur }
			onFocus={ receiveFocus }
			ref={ toolbarRef }
			tabIndex={ 0 }
		>
			{ isBusy && <div className="toolbar-right"><Spinner className="small" /></div> }
			<div className={ cx('toolbar-right', { 'hidden': isBusy }) }>
				<React.Fragment>
					<Button
						className="btn-default"
						onClick={ onClose }
						onKeyDown={ handleToolbarKeyDown }
						tabIndex={ -2 }
					>
						Cancel
					</Button>
					<Button
						className="btn-default"
						onClick={ handleLinkedFileConfirmClick }
						onKeyDown={ handleToolbarKeyDown }
						tabIndex={ -2 }
					>
						Add
					</Button>
				</React.Fragment>
			</div>
		</Toolbar>
	);
}

const AddLinkedUrlForm = forwardRef(({ onClose }, ref) => {
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
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
	}, [dispatch, itemKey, title, url]);

	// Allow submiting form by parent
	useImperativeHandle(ref, () => ({ submit }));

	const handleUrlChange = useCallback(newValue => {
		setIsValid(true);
		setUrl(newValue);
	}, []);

	const handleTitleChange = useCallback(newValue => setTitle(newValue), []);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape') {
			ev.stopPropagation();
			onClose();
		}
	}, [onClose]);

	return (
		<div
			aria-label="Add Linked URL"
			role="dialog"
			className="add-linked-url form"
			onKeyDown={ handleKeyDown }
		>
			<div className="form-group form-row">
				<label className="col-form-label" htmlFor="linked-url-form-url">Link</label>
				<div className="col">
					<Input
						aria-invalid={ !isValid }
						autoFocus
						className={ cx('form-control') }
						id="linked-url-form-url"
						onChange={ handleUrlChange }
						placeholder="Enter or paste URL"
						required={ true }
						tabIndex={ 0 }
						validationError={ isValid ? null : 'Invalid URL' }
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
			{ !isTouchOrSmall && <AddLinkedUrlFormToolbar onSubmit={ submit } onClose={ onClose } /> }
		</div>
	);
});

AddLinkedUrlForm.displayName = 'AddLinkedUrlForm';

AddLinkedUrlForm.propTypes = {
	onClose: PropTypes.func.isRequired
}

export default memo(AddLinkedUrlForm);
