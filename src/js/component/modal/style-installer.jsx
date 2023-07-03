import cx from 'classnames';
import { Fragment, useCallback, useEffect, useState, memo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import Input from '../form/input';
import Modal from '../ui/modal';
import SearchWorker from 'web-worker:../../style-search.worker.js';
import { addCitationStyle, deleteCitationStyle, toggleModal, fetchStyles } from '../../actions';
import { coreCitationStyles } from '../../../../data/citation-styles-data.json';
import { STYLE_INSTALLER } from '../../constants/modals';

const SEARCH_INPUT_DEBOUNCE_DELAY = 300; //ms

const searchWorker = new SearchWorker();

const StyleItem = memo(props => {
	const { isActive, isCore, isSelected, isInstalled, onDelete, onInstall, style } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	return (
		<li
			className={ cx('style', { selected: isSelected }) }
			key={ style.name }
		>
			<div className="style-title">
				{ style.title }
			</div>
			{
				isActive ? (
					<Button
						className={ cx({
							'btn-circle btn-primary': isTouchOrSmall,
							'btn-outline-light': !isTouchOrSmall
						}) }
						disabled
					>
						{
							isTouchOrSmall ? (
								<Icon type="16/minus-strong" width="16" height="16" />
							) : 'Active'
						}
					</Button>
				) : isCore ? (
					<Button
						className={ cx({
							'btn-circle btn-primary': isTouchOrSmall,
							'btn-outline-light': !isTouchOrSmall
						}) }
						disabled
					>
						{
							isTouchOrSmall ? (
								<Icon type="16/minus-strong" width="16" height="16" />
							) : 'Default'
						}
					</Button>
				) : isInstalled ? (
					<Button
						value={ style.name }
						className={ cx({
							'btn-circle btn-primary': isTouchOrSmall,
							'btn-outline-primary': !isTouchOrSmall
						}) }
						onClick={ onDelete }
					>
						{
							isTouchOrSmall ? (
								<Icon type="16/minus-strong" width="16" height="16" />
							) : 'Remove'
						}
					</Button>
				) : (
					<Button
						value={ style.name }
						className={ cx({
							'btn-circle btn-secondary': isTouchOrSmall,
							'btn-outline-secondary': !isTouchOrSmall
						}) }
						onClick={ onInstall }
					>
						{
							isTouchOrSmall ? (
								<Icon type="16/plus-strong" width="16" height="16" />
							) : 'Add'
						}
					</Button>
				)
			}
		</li>
	);
});

StyleItem.displayName = 'StyleItem';

const StyleInstallerModal = () => {
	const dispatch = useDispatch();
	const isFetching = useSelector(state => state.styles.isFetching);
	const stylesData = useSelector(state => state.styles.stylesData);
	const installedCitationStyles = useSelector(state => state.preferences.installedCitationStyles);
	const currentCitationStyle = useSelector(state=> state.preferences.citationStyle);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === STYLE_INSTALLER);

	const [isWorkerReady, setIsWorkerReady] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [hasResults, setHasResults] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [filterInputValue, setFilterInputValue] = useState('');
	const [matchedCitationStyles, setMatchedCitationStyles] = useState([]);

	const handleWorkerMessage = useCallback(event => {
		const [messageKind, payload] = event.data;
		switch(messageKind) {
			case 'READY':
				setIsWorkerReady(true);
			break;
			case 'FILTER_COMPLETE':
				setIsSearching(false);
				setHasResults(true);
				setMatchedCitationStyles(payload);
			break;
		}
	}, []);

	const performSearch = useDebouncedCallback(newFilterValue => {
		setHasResults(false);
		setSelectedIndex(null);

		if(newFilterValue.length > 0) {
			setIsSearching(true);
			searchWorker.postMessage(['FILTER', newFilterValue.toLowerCase()]);
		}
	}, SEARCH_INPUT_DEBOUNCE_DELAY);

	const handleClose = useCallback(() => {
		dispatch(toggleModal(STYLE_INSTALLER, false));

		// clear filter once modal is really closed, but not before to avoid flicker
		setTimeout(() => {
			setFilterInputValue('');
			setSelectedIndex(null);
		}, 300);
	}, [dispatch]);

	const handleFilterInputChange = useCallback(newValue => {
		setFilterInputValue(newValue);
		performSearch(newValue);
	}, [performSearch]);

	const handleDelete = useCallback(ev => {
		const styleName = ev.currentTarget.value;
		dispatch(deleteCitationStyle(styleName));
	}, [dispatch]);

	const handleInstall = useCallback(ev => {
		const styleName = ev.currentTarget.value;
		const style = matchedCitationStyles.find(c => c.name == styleName);

		dispatch(addCitationStyle(style));
	}, [dispatch, matchedCitationStyles]);

	useEffect(() => {
		searchWorker.addEventListener('message', handleWorkerMessage);
		return () => {
			searchWorker.removeEventListener('message', handleWorkerMessage);
		}
	}, [handleWorkerMessage]);

	useEffect(() => {
		if(stylesData !== null) {
			searchWorker.postMessage(['LOAD', stylesData]);
		}
	}, [stylesData]);

	useEffect(() => {
		if( isOpen && !stylesData && !isFetching) {
			dispatch(fetchStyles());
		}
	}, [dispatch, isOpen, stylesData, isFetching]);

	const isReady = stylesData !== null && !isFetching && isWorkerReady;
	const localCitationStyles = [...coreCitationStyles, ...installedCitationStyles];
	const className = cx({
		'style-installer modal-scrollable modal-lg': true,
		'modal-touch': isTouchOrSmall,
		'loading': !isReady
	});

	return (
        <Modal
			className={ className }
			contentLabel="Citation Style Installer"
			isBusy={ !isReady }
			isOpen={ isOpen }
			onRequestClose={ handleClose }
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<Fragment>
							<div className="modal-header-left" />
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									Citation Styles
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									className="btn-link"
									onClick={ handleClose }
								>
									Close
								</Button>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								Citation Styles
							</h4>
							<Button
								icon
								className="close"
								onClick={ handleClose }
							>
								<Icon type={ '16/close' } width="16" height="16" />
							</Button>
						</Fragment>
					)
				}
			</div>
			<div className="modal-body" tabIndex={ 0 }>
				<div className="style-search">
					<Input
						autoFocus
						className="form-control form-control-lg style-search-input"
						isBusy={ isSearching }
						onChange={ handleFilterInputChange }
						placeholder="Search"
						tabIndex={ 0 }
						type="text"
						value={ filterInputValue }
					/>
				</div>
				<ul className="style-list">
					{
						(hasResults ? matchedCitationStyles : localCitationStyles).map(
						style => {
							const styleData = localCitationStyles.find(cs => cs.name === style.name);
							const isInstalled = typeof styleData !== 'undefined';
							const isCore = isInstalled && styleData.isCore || false;
							const isActive = style.name === currentCitationStyle;
							const isSelected = matchedCitationStyles[selectedIndex] ?
								matchedCitationStyles[selectedIndex].name === style.name : false;

							return <StyleItem
								isActive={ isActive }
								isCore={ isCore }
								isInstalled={ isInstalled }
								isSelected={ isSelected }
								key={ style.name }
								onDelete={ handleDelete }
								onInstall={ handleInstall }
								style={ style }
							/>;
						})
					}
				</ul>
			</div>
		</Modal>
    );
}

export default memo(StyleInstallerModal);
