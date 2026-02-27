import cx from 'classnames';
import { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import FocusTrap from '../focus-trap';
import Modal from '../ui/modal';
import { focusOnModalOpen } from '../../common/modal-focus';
import { preferenceChange, toggleModal } from '../../actions';
import { SETTINGS } from '../../constants/modals';
import Select from '../form/select';
import { getUniqueId } from '../../utils';

const colorSchemeOptions = [
	{ label: 'Automatic', value: '' },
	{ label: 'Light', value: 'light' },
	{ label: 'Dark', value: 'dark' },
];

const densityOptions = [
	{ label: 'Automatic', value: '' },
	{ label: 'Mouse', value: 'mouse' },
	{ label: 'Touch', value: 'touch' },
];

const SettingsModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const colorScheme = useSelector(state => state.preferences.colorScheme ?? '');
	const density = useSelector(state => state.preferences.density ?? '');
	const isSmall = useSelector(state => state.device.xxs || state.device.xs || state.device.sm);
	const isOpen = useSelector(state => state.modal.id === SETTINGS);
	const colorSchemeInputId = useRef(getUniqueId());
	const densityInputId = useRef(getUniqueId());
	const densitySelectRef = useRef(null);
	const colorSchemeSelectRef = useRef(null);

	const handleChange = useCallback(() => true, []);

	const handleSelectColorScheme = useCallback((newColorScheme) => {
		dispatch(preferenceChange('colorScheme', newColorScheme));
	}, [dispatch]);

	const handleSelectDensity = useCallback((newDensity) => {
		dispatch(preferenceChange('density', newDensity));
	}, [dispatch]);

	const handleClose = useCallback(
		() => dispatch(toggleModal(SETTINGS, false)),
	[dispatch]);

	const handleAfterOpen = useCallback(({ contentEl }) => {
		focusOnModalOpen(contentEl, isTouchOrSmall, () => {
			const ref = isSmall ? colorSchemeSelectRef : densitySelectRef;
			ref.current?.focus({ preventScroll: true });
		});
	}, [isSmall, isTouchOrSmall]);

	return (
		<Modal
			className="modal-touch modal-settings"
			contentLabel="Settings"
			isOpen={isOpen}
			onAfterOpen={handleAfterOpen}
			onRequestClose={handleClose}
			overlayClassName="modal-centered modal-slide"
		>
			<FocusTrap>
			<div className="modal-header">
				<div className="modal-header-left">
				</div>
				<div className="modal-header-center">
					<h4 className="modal-title truncate">
						Settings
					</h4>
				</div>
				<div className="modal-header-right">
					<Button
						icon
						className="close"
						onClick={handleClose}
						title="Close Dialog"
					>
						<Icon type={'16/close'} width="16" height="16" />
					</Button>
				</div>
			</div>
			<div className="modal-body">
				<div className="form">
					<div className={cx("form-group", { disabled: isSmall })}>
						<label
							id={`${densityInputId.current}-label`}
							className="col-form-label"
							htmlFor={isTouchOrSmall ? densityInputId.current : null}
						>
							UI Density
						</label>
						<div className="col">
							<Select
								ref={densitySelectRef}
								isDisabled={isSmall}
								aria-labelledby={isTouchOrSmall ? null : `${densityInputId.current}-label` }
								id={densityInputId.current}
								className="form-control form-control-sm"
								onChange={handleChange}
								onCommit={handleSelectDensity}
								options={densityOptions}
								value={isSmall ? 'touch' : density}
								searchable={false}
							/>
						</div>
					</div>
					<div className="form-group">
						<label
							id={`${colorSchemeInputId.current}-label`}
							className="col-form-label"
							htmlFor={isTouchOrSmall ? colorSchemeInputId.current : null}
						>
							Color Scheme
						</label>
						<div className="col">
							<Select
								ref={colorSchemeSelectRef}
								aria-labelledby={isTouchOrSmall ? null : `${colorSchemeInputId.current}-label`}
								id={colorSchemeInputId.current}
								className="form-control form-control-sm"
								onChange={handleChange}
								onCommit={handleSelectColorScheme}
								options={colorSchemeOptions}
								value={colorScheme}
								searchable={false}
							/>
						</div>
					</div>
				</div>
			</div>
			</FocusTrap>
		</Modal>
    );
}

export default memo(SettingsModal);
