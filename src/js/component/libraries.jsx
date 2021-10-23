import React, { memo, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import Button from './ui/button';
import CollectionTree from '../component/libraries/collection-tree';
import cx from 'classnames';
import Icon from './ui/icon';
import Node from './libraries/node';
import Spinner from './ui/spinner';
import { createCollection, fetchAllCollections, fetchLibrarySettings, navigate } from '../actions';
import { get, stopPropagation, getUniqueId } from '../utils';
import { pick } from '../common/immutable';
import { useFocusManager, usePrevious } from '../hooks/';

const LibraryNode = props => {
	const { addVirtual, isOpen, isPickerMode, isReadOnly, isSelected, libraryKey, name,
		pickerNavigate, pickerPick, pickerState, picked = [], pickerAllowRoot, shouldBeTabbable,
		toggleOpen, virtual } = props;
	const dispatch = useDispatch();
	const isFetchingAll = useSelector(state => get(state, ['libraries', libraryKey, 'collections', 'isFetchingAll'], false));
	const totalResults = useSelector(state => get(state, ['libraries', libraryKey, 'collections', 'totalResults'], null));
	const isCurrent = useSelector(state => libraryKey === state.current.libraryKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const id = useRef(getUniqueId('library-'));
	const hasChecked = totalResults !== null;
	const shouldShowSpinner = !isTouchOrSmall && isFetchingAll;
	const isPicked = picked.some(({ collectionKey: c, libraryKey: l }) => l === libraryKey && !c);


	// no nodes inside if device is non-touch (no "All Items" node) and library is read-only (no
	// trash) and has no collections
	const isConfirmedEmpty = isReadOnly && !isTouchOrSmall && totalResults === 0;
	const isPickerSkip = isPickerMode && isReadOnly;

	const handleClick = useCallback(() => {
		if(isTouchOrSmall && isPickerMode && !isPickerSkip) {
			pickerNavigate({ library: libraryKey, view: 'library' });
		} else if(isPickerMode && !isPickerSkip && !isTouchOrSmall) {
			pickerPick({ libraryKey });
		} else if(!isPickerMode) {
			dispatch(navigate({ library: libraryKey, view: 'library' }, true));
		}
	}, [dispatch, isPickerMode, isTouchOrSmall, isPickerSkip, libraryKey, pickerNavigate, pickerPick]);

	const handlePickerPick = useCallback(() => {
		pickerPick({ libraryKey });
	}, [libraryKey, pickerPick]);

	const handleAddVirtualClick = useCallback(() => {
		addVirtual(libraryKey);
	}, [addVirtual, libraryKey]);

	const handleOpenToggle = useCallback((ev, shouldOpen = null) => {
		if(!(isConfirmedEmpty || isPickerSkip)) {
			toggleOpen(libraryKey, shouldOpen);
		}
	}, [isConfirmedEmpty, isPickerSkip, libraryKey, toggleOpen]);

	useEffect(() => {
		//@NOTE: this should only trigger when library is reset. Otherwise collections are fetched
		//		 by loader or when library is first opened. See #289
		if(isCurrent && !hasChecked && !isFetchingAll) {
			dispatch(fetchAllCollections(libraryKey));
		}
	}, [dispatch, isCurrent, hasChecked, libraryKey, isFetchingAll]);

	const getTreeProps = () => {
		const parentLibraryKey = libraryKey;
		const isVirtualInThisTree = virtual && virtual.libraryKey === libraryKey;

		return {
			...pick(props, ['addVirtual', 'cancelAdd', 'commitAdd', 'excludeCollections',
			'includeCollections', 'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext',
			'onFocusPrev', 'pickerSkipCollections', 'selectedCollectionKey']),
			isPickerMode, parentLibraryKey, picked, pickerNavigate, pickerPick, pickerState,
			virtual: isVirtualInThisTree ? virtual : null,
		}
	}

	return (
		<Node
			className={ cx({
				'open': isOpen && !shouldShowSpinner,
				'selected': isSelected && !isPickerMode,
				'picked': isPickerMode && isPicked,
				'picker-skip': isPickerSkip,
				'busy': shouldShowSpinner
			}) }
			aria-labelledby={ id.current }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			isOpen={ isOpen && !shouldShowSpinner }
			onOpen={ handleOpenToggle }
			onClick={ handleClick }
			showTwisty={ !(isConfirmedEmpty || isPickerSkip) }
			subtree={ (isConfirmedEmpty || isPickerSkip) ? null : isOpen ? <CollectionTree { ...getTreeProps() } /> : null }
			data-key={ libraryKey }
			dndData={ isReadOnly ? { } : { 'targetType': 'library', libraryKey: libraryKey } }
			{ ...pick(props, ['onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev'])}
		>
			{ isReadOnly ? (
				<React.Fragment>
					<Icon type="32/library-read-only" className="touch" width="32" height="32" />
					<Icon type="20/library-read-only" className="mouse" width="20" height="20" />
				</React.Fragment>
			) : (
				<React.Fragment>
					<Icon type="28/library" className="touch" width="28" height="28" />
					<Icon type="16/library" className="mouse" width="16" height="16" />
				</React.Fragment>
			) }
			<div className="truncate" id={ id.current } title={ name }>{ name }</div>
			{ shouldShowSpinner && <Spinner className="small mouse" /> }
			{ isPickerMode && pickerAllowRoot && !isReadOnly && isTouchOrSmall && (
				<input
					type="checkbox"
					checked={ isPicked }
					onChange={ handlePickerPick }
					onClick={ stopPropagation }
				/>
			)}
			{
				!shouldShowSpinner && !isReadOnly && !isPickerMode && (
					<Button
						aria-label="add collection"
						className="mouse btn-icon-plus"
						icon
						onClick={ handleAddVirtualClick }
						tabIndex={ -3 }
					>
						<Icon type={ '16/plus' } width="16" height="16" />
					</Button>
				)
			}
		</Node>
	);
}

LibraryNode.propTypes = {
	addVirtual: PropTypes.func,
	isOpen: PropTypes.bool,
	isPickerMode: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	libraryKey: PropTypes.string,
	name: PropTypes.string,
	picked: PropTypes.array,
	pickerAllowRoot: PropTypes.bool,
	pickerNavigate: PropTypes.func,
	pickerPick: PropTypes.func,
	pickerState: PropTypes.object,
	shouldBeTabbable: PropTypes.bool,
	toggleOpen: PropTypes.func,
	virtual: PropTypes.object,
};

const Libraries = props => {
	const { isPickerMode, pickerState, includeLibraries, excludeLibraries } = props;
	const dispatch = useDispatch();
	const libraries = useSelector(state => state.config.libraries);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const stateSelectedLibraryKey = useSelector(state => state.current.libraryKey);
	const selectedLibraryKey = isPickerMode ? pickerState.libraryKey : stateSelectedLibraryKey;
	const stateView = useSelector(state => state.current.view);
	const view = isPickerMode ? pickerState.view : stateView;
	const itemsSource = useSelector(state => state.current.itemsSource);
	const firstCollectionKey = useSelector(state => state.current.firstCollectionKey);
	const firstIsTrash = useSelector(state => state.current.firstIsTrash);
	const treeRef = useRef();
	const prevSelectedLibraryKey = usePrevious(selectedLibraryKey);
	const { focusNext, focusPrev, focusDrillDownNext, focusDrillDownPrev, receiveBlur, receiveFocus
	} = useFocusManager(treeRef);

	const filteredLibraries = useMemo(
		() => (includeLibraries || excludeLibraries) ?
			libraries.filter(l =>
				(!includeLibraries || includeLibraries.includes(l.key)) &&
				(!excludeLibraries || (excludeLibraries && !excludeLibraries.includes(l.key)))
			) : [ ...libraries ],
		[libraries, includeLibraries, excludeLibraries]
	);

	const myLibraries = useMemo(
		() => filteredLibraries.filter(l => l.isMyLibrary),
		[filteredLibraries]
	);
	const groupLibraries = useMemo(
		() => filteredLibraries.filter(l => l.isGroupLibrary),
		[filteredLibraries]
	);
	const otherLibraries = useMemo(
		() => filteredLibraries.filter(l => !l.isMyLibrary && !l.isGroupLibrary),
		[filteredLibraries]
	);

	const [opened, setOpened] = useState([]);
	const [virtual, setVirtual] = useState(null);

	const isRootActive = view === 'libraries';

	const toggleOpen = useCallback((libraryKey, shouldOpen = null) => {
		const isOpened = opened.includes(libraryKey);

		if(shouldOpen !== null && shouldOpen === isOpened) {
			return;
		}
		isOpened ?
			setOpened(opened.filter(k => k !== libraryKey)) :
			setOpened([...opened, libraryKey ]);

		if(!isOpened) {
			dispatch(fetchAllCollections(libraryKey));
		}
	}, [dispatch, opened]);

	const cancelAdd = useCallback(() => {
		setVirtual(null);
	}, []);

	const commitAdd = useCallback(async (libraryKey, parentCollection, name) => {
		if(name === '') {
			setVirtual(null);
			return;
		}

		setVirtual({ ...virtual, isBusy: true });
		try {
			await dispatch(createCollection({ name, parentCollection }, libraryKey));
		} finally {
			setVirtual(null);
		}
	}, [dispatch, virtual]);

	const addVirtual = useCallback((libraryKey, collectionKey) => {
		if(!opened.includes(libraryKey)) {
			toggleOpen(libraryKey);
		}
		window.setTimeout(() => setVirtual({ libraryKey, collectionKey }));
	}, [opened, toggleOpen]);

	useEffect(() => {
		if(selectedLibraryKey && selectedLibraryKey !== prevSelectedLibraryKey) {
			toggleOpen(selectedLibraryKey, true);
			if(typeof(prevSelectedLibraryKey) !== 'undefined') {
				//@TODO: Minor opitimisation: only fetch library settings if needed
				dispatch(fetchLibrarySettings(selectedLibraryKey));
			}
		}
	}, [dispatch, prevSelectedLibraryKey, selectedLibraryKey, toggleOpen]);

	useEffect(() => {
		const selectedLibraryNode = treeRef.current?.querySelector(`[data-key="${selectedLibraryKey}"]`);
		if(selectedLibraryNode && !isTouchOrSmall && !isPickerMode && !firstCollectionKey && !firstIsTrash) {
			// wait for other effect to dispatch and process toggleOpen, then scroll on next frame
			setTimeout(() => selectedLibraryNode.scrollIntoView(), 0);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const getNodeProps = libraryData => {
		const { key, ...rest } = libraryData;
		const shouldBeTabbableOnTouch = view === 'libraries';
		const shouldBeTabbable = shouldBeTabbableOnTouch || !isTouchOrSmall;
		const isOpen = (!isTouchOrSmall && opened.includes(key)) ||
			(isTouchOrSmall && view !== 'libraries' && selectedLibraryKey == key);
		const isSelected = !isTouchOrSmall && selectedLibraryKey === key && itemsSource === 'top';

		return {
			libraryKey: key, shouldBeTabbableOnTouch, shouldBeTabbable, isOpen, isSelected,
			addVirtual, commitAdd, cancelAdd, toggleOpen, virtual,
			...rest,
			onDrillDownNext: focusDrillDownNext,
			onDrillDownPrev: focusDrillDownPrev,
			onFocusNext: focusNext,
			onFocusPrev: focusPrev,
			...pick(props, ['isPickerMode', 'includeCollections', 'excludeCollections', 'picked',
			'pickerAllowRoot', 'pickerNavigate', 'pickerPick', 'pickerState',
			'pickerSkipCollections', 'selectedCollectionKey' ])
		}
	}

	return (
		<nav
			aria-label="collection tree"
			className={ cx('collection-tree', { 'picker-mode': isPickerMode }) }
			onFocus={ receiveFocus }
			onBlur={ receiveBlur }
			tabIndex={ 0 }
			ref={ treeRef }
		>
			<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
				<div className="scroll-container-touch" role="tree">
					<section>
						{ myLibraries.length > 0 && (
							<div className={ cx('level', 'level-0') }>
								<ul className="nav" role="group">
									{ myLibraries.map(lib =>
										<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
									) }
								</ul>
							</div>
						)}
						{ groupLibraries.length > 0 && (
							<React.Fragment>
								<h4>Group Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ groupLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</React.Fragment>
						)}
						{ otherLibraries.length > 0 && (
							<React.Fragment>
								<h4>Other Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ otherLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</React.Fragment>
						)}
					</section>
				</div>
			</div>
		</nav>
	);
}

Libraries.propTypes = {
	excludeLibraries: PropTypes.array,
	includeLibraries: PropTypes.array,
	isPickerMode: PropTypes.bool,
	pickerState: PropTypes.object,
}

export default memo(Libraries);
