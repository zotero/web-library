import { Fragment, forwardRef, memo, useCallback, useState, useEffect, useImperativeHandle,
	useMemo, useRef, } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Icon, Spinner } from 'web-common/components';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { noop, pick } from 'web-common/utils';

import CollectionTree from '../component/libraries/collection-tree';
import cx from 'classnames';
import Node from './libraries/node';
import { createAttachmentsFromDropped, createCollection, fetchAllCollections, fetchLibrarySettings, navigate, triggerFocus } from '../actions';
import { get, stopPropagation, getUniqueId } from '../utils';
import { PICKS_SINGLE_COLLECTION, PICKS_MULTIPLE_COLLECTIONS } from '../constants/picker-modes';

const LibraryNode = props => {
	const { addVirtual, isOpen, isFileUploadAllowed, isMyLibrary, isReadOnly, isSelected, libraryKey, name,
		pickerMode, pickerNavigate, pickerPick, pickerSkipLibraries = [], pickerRequireFileUpload, picked = [], pickerAllowRoot, onNodeSelected =
		noop, shouldBeTabbable, toggleOpen, virtual } = props;
	const dispatch = useDispatch();
	const isFetchingAll = useSelector(state => get(state, ['libraries', libraryKey, 'collections', 'isFetchingAll'], false));
	const totalResults = useSelector(state => get(state, ['libraries', libraryKey, 'collections', 'totalResults'], null));
	const isCurrent = useSelector(state => libraryKey === state.current.libraryKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const id = useRef(getUniqueId('library-'));
	const hasChecked = totalResults !== null;
	const shouldShowSpinner = !isTouchOrSmall && isFetchingAll;
	const isPicked = picked.some(({ collectionKey: c, libraryKey: l }) => l === libraryKey && !c);
	const isFocusedAndSelected = useSelector(state => isSelected && state.current.isCollectionsTreeFocused);
	const pickerPicksCollection = [PICKS_MULTIPLE_COLLECTIONS, PICKS_SINGLE_COLLECTION].includes(pickerMode);

	// no nodes inside if device is non-touch (no "All Items" node) and library is read-only (no
	// trash) and has no collections
	const isConfirmedEmpty = isReadOnly && !isTouchOrSmall && totalResults === 0;
	const isPickerSkip = pickerMode && (isReadOnly || pickerSkipLibraries.includes(libraryKey) || (pickerRequireFileUpload && !isFileUploadAllowed));

	const handleSelect = useCallback(() => {
		const path = { library: libraryKey, view: 'library' };

		if (pickerPicksCollection && !isPickerSkip && !isTouchOrSmall) {
			pickerPick({ libraryKey });
		} else if (pickerMode && isTouchOrSmall) {
			pickerNavigate(path);
		} else if(!pickerMode) {
			dispatch(navigate(path, true));
		}

		onNodeSelected(path);
	}, [libraryKey, pickerPicksCollection, isPickerSkip, isTouchOrSmall, pickerMode, onNodeSelected, pickerPick, pickerNavigate, dispatch]);

	const handlePickerPick = useCallback(() => {
		pickerPick({ libraryKey });
	}, [libraryKey, pickerPick]);

	const handleAddVirtualClick = useCallback(() => {
		addVirtual(libraryKey);
	}, [addVirtual, libraryKey]);

	const handleOpenToggle = useCallback((ev, shouldOpen = null) => {
		if(!isConfirmedEmpty) {
			toggleOpen(libraryKey, shouldOpen);
		}
	}, [isConfirmedEmpty, libraryKey, toggleOpen]);

	const handleFileDrop = useCallback(async droppedFiles => {
		await dispatch(createAttachmentsFromDropped(droppedFiles, { libraryKey: libraryKey }));
	}, [dispatch, libraryKey]);

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
			...pick(props, ['addVirtual', 'cancelAdd', 'commitAdd', 'disabledCollections',
				'focusBySelector', 'onFocusNext', 'onFocusPrev', 'pickerSkipCollections', 'collectionKey', 'itemsSource', 'view']),
				pickerMode, onNodeSelected, parentLibraryKey, picked, pickerNavigate, pickerPick,
			virtual: isVirtualInThisTree ? virtual : null, libraryKey
		}
	}

	return (
        <Node
			className={ cx({
				'library-node': true, // using .library risks conflicting css rules
				'my-library': isMyLibrary,
				'open': isOpen && !shouldShowSpinner,
				'selected': isSelected,
				'focused': isFocusedAndSelected,
				'picked': pickerMode && isPicked,
				'picker-skip': isPickerSkip,
				'busy': shouldShowSpinner
			}) }
			aria-labelledby={ id.current }
			aria-selected={ isSelected }
			aria-level={ 1 }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			isFileUploadAllowed={ isFileUploadAllowed }
			isOpen={ isOpen && !shouldShowSpinner }
			isReadOnly={ isReadOnly }
			onOpen={ handleOpenToggle }
			onSelect={ handleSelect }
			onFileDrop={ isTouchOrSmall ? null : handleFileDrop }
			showTwisty={ !isConfirmedEmpty }
			subtree={ isConfirmedEmpty ? null : isOpen ? <CollectionTree { ...getTreeProps() } /> : null }
			data-key={ libraryKey }
			dndData={isReadOnly ? {} : { 'targetType': 'library', libraryKey: libraryKey, isFileUploadAllowed } }
			{ ...pick(props, ['onFocusNext', 'onFocusPrev'])}
		>
			{pickerPicksCollection && pickerAllowRoot && !isPickerSkip && !isReadOnly && isTouchOrSmall ? (
				<input
					type="checkbox"
					checked={isPicked}
					onChange={handlePickerPick}
					onMouseDown={stopPropagation}
					onClick={stopPropagation}
				/>
			) : pickerPicksCollection ? <div className="picker-checkbox-placeholder" /> : null}
			{ isReadOnly ? (
				<Fragment>
					<Icon type="32/library-read-only" className="touch" width="32" height="32" />
					<Icon type="20/library-read-only" className="mouse" width="20" height="20" />
				</Fragment>
			) : (
				<Fragment>
					<Icon type="28/library" className="touch" width="28" height="28" />
					<Icon type="16/library" className="mouse" width="16" height="16" />
				</Fragment>
			) }
			<div className="truncate" id={ id.current } title={ name }>{ name }</div>
			{ shouldShowSpinner && <Spinner className="small mouse" /> }
			{
				!shouldShowSpinner && !isReadOnly && !pickerMode && (
					<Button
						className="mouse btn-icon-plus"
						icon
						onMouseDown={ stopPropagation }
						onClick={ handleAddVirtualClick }
						tabIndex={ -3 }
						title="Add Collection"
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
	isFileUploadAllowed: PropTypes.bool,
	isMyLibrary: PropTypes.bool,
	isOpen: PropTypes.bool,
	pickerMode: PropTypes.number,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	libraryKey: PropTypes.string,
	name: PropTypes.string,
	onNodeSelected: PropTypes.func,
	picked: PropTypes.array,
	pickerAllowRoot: PropTypes.bool,
	pickerNavigate: PropTypes.func,
	pickerSkipLibraries: PropTypes.array,
	pickerPick: PropTypes.func,
	pickerRequireFileUpload: PropTypes.bool,
	pickerState: PropTypes.object,
	shouldBeTabbable: PropTypes.bool,
	toggleOpen: PropTypes.func,
	virtual: PropTypes.object,
};

const Libraries = forwardRef((props, ref) => {
	const { excludeLibraries, includeLibraries, pickerMode, libraryKey, collectionKey, itemsSource, view } = props;
	const dispatch = useDispatch();
	const libraries = useSelector(state => state.config.libraries);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const treeRef = useRef();
	const mouseDownTracker = useRef(false);
	const prevLibraryKey = usePrevious(libraryKey);
	const { focusBySelector, focusNext, focusPrev, receiveBlur, receiveFocus } = useFocusManager(treeRef);

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
	const myGroupLibraries = useMemo(
		() => filteredLibraries.filter(l => l.isGroupLibrary && !l.isExternal),
		[filteredLibraries]
	);
	const otherGroupLibraries = useMemo(
		() => filteredLibraries.filter(l => l.isGroupLibrary && l.isExternal),
		[filteredLibraries]
	);
	const otherLibraries = useMemo(
		() => filteredLibraries.filter(l => !l.isMyLibrary && !l.isGroupLibrary),
		[filteredLibraries]
	);

	const [opened, setOpened] = useState([]);
	const [virtual, setVirtual] = useState(null);

	useImperativeHandle(ref, () => ({
		focus: () => {
			if(treeRef.current) {
				treeRef.current.focus();
			}
		}
	}));

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


	const handleFocus = useCallback(ev => {
		// fix #335: prevent scrollbar "jumping" to the top when using scrollbar handle to scroll
		let preventScroll = mouseDownTracker.current;
		const hasChangedFocused = receiveFocus(ev, { preventScroll });
		if (hasChangedFocused) {
			dispatch(triggerFocus('collections-tree', true));
		}
	}, [dispatch, receiveFocus]);

	const handleBlur = useCallback(ev => {
		const hasChangedFocused = receiveBlur(ev);
		const closestRootSkipDropdown = ev?.relatedTarget?.closest?.('[data-focus-root]:not(.dropdown-menu)');
		// ignore blur within or to the "three dots" menu
		if (hasChangedFocused && closestRootSkipDropdown !== treeRef.current) {
			dispatch(triggerFocus('collections-tree', false));
		}
	}, [dispatch, receiveBlur]);

	const handleGlobalMouseDown = useCallback(() => {
		mouseDownTracker.current = true;
	}, []);

	const handleGlobalMouseUp = useCallback(() => {
		mouseDownTracker.current = false;
	}, []);

	useEffect(() => {
		if(libraryKey && libraryKey !== prevLibraryKey) {
			toggleOpen(libraryKey, true);
			if(typeof(prevLibraryKey) !== 'undefined') {
				//@TODO: Minor opitimisation: only fetch library settings if needed
				dispatch(fetchLibrarySettings(libraryKey, 'tagColors'));
			}
		}
	}, [dispatch, libraryKey, prevLibraryKey, toggleOpen]);



	useEffect(() => {
		document.addEventListener('mousedown', handleGlobalMouseDown);
		document.addEventListener('mouseup', handleGlobalMouseUp);

		return () => {
			document.removeEventListener('mousedown', handleGlobalMouseDown);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		}
	}, [handleGlobalMouseDown, handleGlobalMouseUp]);

	const getNodeProps = libraryData => {
		const { key, ...rest } = libraryData;
		const shouldBeTabbableOnTouch = view === 'libraries';
		const shouldBeTabbable = shouldBeTabbableOnTouch || !isTouchOrSmall;
		const isOpen = (!isTouchOrSmall && opened.includes(key)) ||
			(isTouchOrSmall && view !== 'libraries' && libraryKey == key);
		const isSelected = !isTouchOrSmall && libraryKey === key &&
			!collectionKey && ['top', 'query'].includes(itemsSource);

		return {
			libraryKey: key, shouldBeTabbableOnTouch, shouldBeTabbable, isOpen, isSelected,
			addVirtual, commitAdd, cancelAdd, toggleOpen, virtual,
			...rest,
			onFocusNext: focusNext,
			onFocusPrev: focusPrev,
			focusBySelector,
			...pick(props, ['disabledCollections', 'onNodeSelected', 'picked',
				'pickerAllowRoot', 'pickerMode', 'pickerNavigate', 'pickerPick', 'pickerRequireFileUpload',
				'pickerSkipCollections', 'pickerSkipLibraries', 'collectionKey', 'itemsSource', 'view'])
		}
	}

	return (
        <nav
			aria-label="collection tree"
			className={cx('collection-tree', { 'picker-mode': pickerMode }) }
			onFocus={ isTouchOrSmall ? noop : handleFocus }
			onBlur={ isTouchOrSmall ? noop : handleBlur }
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
										<LibraryNode key={ lib.key } isMyLibrary={ true } { ...getNodeProps(lib) } />
									) }
								</ul>
							</div>
						)}
						{ myGroupLibraries.length > 0 && (
							<Fragment>
								<h4>{ otherGroupLibraries.length > 0 ? 'My ' : '' }Group Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ myGroupLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</Fragment>
						)}
						{ otherGroupLibraries.length > 0 && (
							<Fragment>
								<h4>Other Group Libraries</h4>
								<div className={cx('level', 'level-0')}>
									<ul className="nav" role="group">
										{otherGroupLibraries.map(lib =>
											<LibraryNode key={lib.key} {...getNodeProps(lib)} />
										)}
									</ul>
								</div>
							</Fragment>
						)}
						{ otherLibraries.length > 0 && (
							<Fragment>
								<h4>Other Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ otherLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</Fragment>
						)}
					</section>
				</div>
			</div>
		</nav>
    );
});

Libraries.displayName = 'Libraries';

Libraries.propTypes = {
	excludeLibraries: PropTypes.array,
	includeLibraries: PropTypes.array,
	pickerMode: PropTypes.number,
	pickerState: PropTypes.object,
}

export default memo(Libraries);
