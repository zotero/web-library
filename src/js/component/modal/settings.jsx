import { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ColorSchemeSwitcher, FocusTrap, Icon, Switcher } from 'web-common/components';

import Modal from '../ui/modal';
import { focusOnModalOpen } from '../../common/modal-focus';
import { preferenceChange, toggleModal } from '../../actions';
import { SETTINGS } from '../../constants/modals';
import { useSystemColorScheme } from '../../hooks';
import { getUniqueId } from '../../utils';

const SettingsModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const isDesktopUIPreferred = useSelector(state => state.preferences.density === 'mouse');
	const isSmall = useSelector(state => state.device.xxs || state.device.xs || state.device.sm);
	const isOpen = useSelector(state => state.modal.id === SETTINGS);
	const systemColorScheme = useSystemColorScheme();
	const colorSchemeInputId = useRef(getUniqueId());
	const densityInputId = useRef(getUniqueId());
	const colorSchemeSwitchRef = useRef(null);

	const handleToggleColorScheme = useCallback((newColorScheme) => {
		dispatch(preferenceChange('colorScheme', newColorScheme === systemColorScheme ? '' : newColorScheme));
	}, [dispatch, systemColorScheme]);

	const handleToggleDesktopUI = useCallback((isChecked) => {
		dispatch(preferenceChange('density', isChecked ? 'mouse' : null));
	}, [dispatch]);

	const handleClose = useCallback(
		() => dispatch(toggleModal(SETTINGS, false)),
	[dispatch]);

	const handleAfterOpen = useCallback(({ contentEl }) => {
		focusOnModalOpen(contentEl, isTouchOrSmall, () => {
			colorSchemeSwitchRef.current?.focus({ preventScroll: true });
		});
	}, [isTouchOrSmall]);

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
					<div className="form-group">
						<label
							id={`${colorSchemeInputId.current}-label`}
							className="col-form-label"
							htmlFor={colorSchemeInputId.current}
						>
							Color Scheme
						</label>
						<span id={`${colorSchemeInputId.current}-description`} className="offscreen">
							On uses the dark scheme
						</span>
						<div className="switcher-container">
							<ColorSchemeSwitcher
								ref={colorSchemeSwitchRef}
								aria-describedby={`${colorSchemeInputId.current}-description`}
								aria-labelledby={`${colorSchemeInputId.current}-label`}
								id={colorSchemeInputId.current}
								mode={colorScheme || systemColorScheme}
								onToggle={handleToggleColorScheme}
							/>
						</div>
					</div>
					{!isSmall && (
						<div className="form-group">
							<label
								id={`${densityInputId.current}-label`}
								className="col-form-label"
								htmlFor={densityInputId.current}
							>
								Prefer Desktop UI
							</label>
							<div className="switcher-container">
								<Switcher
									aria-labelledby={`${densityInputId.current}-label`}
									checked={isDesktopUIPreferred}
									id={densityInputId.current}
									onToggle={handleToggleDesktopUI}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			</FocusTrap>
		</Modal>
	);
}

export default memo(SettingsModal);
