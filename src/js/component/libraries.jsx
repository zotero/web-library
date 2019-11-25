'use strict';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from './ui/button';
import CollectionTreeContainer from '../container/collection-tree';
import cx from 'classnames';
import Icon from './ui/icon';
import Node from './libraries/node';
import Spinner from './ui/spinner';
import { stopPropagation } from '../utils';
import { pick } from '../common/immutable';
import withFocusManager from '../enhancers/with-focus-manager';
import withDevice from '../enhancers/with-device';

const LibraryNode = props => {
	const {
		device, addVirtual, collectionsCount, isFetching, isOpen, isPickerMode, isReadOnly, isSelected,
		libraryKey, name, navigate, pickerPick, picked, pickerIncludeLibraries, shouldBeTabbable,
		toggleOpen, virtual
	} = props;


	// no nodes inside if device is non-touch (no "All Items" node) and library is read-only (no
	// trash) and has no collections
	const isConfirmedEmpty = isReadOnly && !device.isTouchOrSmall && collectionsCount === 0;

	const handleClick = useCallback(() => {
		navigate({ library: libraryKey, view: 'library' }, true);
	});

	const handlePickerPick = useCallback(() => {
		pickerPick({ libraryKey });
	});

	const handleAddVirtualClick = useCallback(() => {
		addVirtual(libraryKey);
	});

	const handleOpenToggle = useCallback((ev, shouldOpen = null) => {
		toggleOpen(libraryKey, shouldOpen);
	});

	const getTreeProps = () => {
		const parentLibraryKey = libraryKey;
		const isVirtualInThisTree = virtual && virtual.libraryKey === libraryKey;

		return {
			...pick(props, ['addVirtual', 'cancelAdd', 'commitAdd',
			'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'selectedCollectionKey']),
			isPickerMode, parentLibraryKey, picked, pickerPick,
			virtual: isVirtualInThisTree ? virtual : null,
		}
	}

	return (
		<Node
			className={ cx({
				'open': isOpen && !isFetching,
				'selected': isSelected,
				'busy': isFetching
			}) }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			isOpen={ isOpen && !isFetching }
			onOpen={ handleOpenToggle }
			onClick={ handleClick }
			showTwisty={ !isConfirmedEmpty }
			subtree={ isFetching || isConfirmedEmpty ? null : isOpen ? <CollectionTreeContainer { ...getTreeProps() } /> : null }
			data-key={ libraryKey }
			dndTarget={ isReadOnly ? { } : { 'targetType': 'library', libraryKey: libraryKey } }
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
			<div className="truncate">{ name }</div>
			{ isPickerMode && pickerIncludeLibraries && !isFetching && (
				<input
					type="checkbox"
					checked={ picked.some(({ collectionKey: c, libraryKey: l }) => l === libraryKey && !c) }
					onChange={ handlePickerPick }
					onClick={ stopPropagation }
				/>
			)}
			{ isFetching && <Spinner className="small mouse" /> }
			{
				!isFetching && !isReadOnly && (
					<Button
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
	collectionsCount: PropTypes.number,
	device: PropTypes.object,
	isFetching: PropTypes.bool,
	isOpen: PropTypes.bool,
	isPickerMode: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	libraryKey: PropTypes.string,
	name: PropTypes.string,
	navigate: PropTypes.func,
	picked: PropTypes.array,
	pickerIncludeLibraries: PropTypes.bool,
	pickerPick: PropTypes.func,
	shouldBeTabbable: PropTypes.bool,
	toggleOpen: PropTypes.func,
	virtual: PropTypes.object,
};

const Libraries = props => {
	const {
		collectionCountByLibrary, createCollection, device, fetchAllCollections,
		fetchLibrarySettings, hasMoreCollections, isFetching, itemsSource, libraries,
		librariesWithCollectionsFetching, onBlur, onFocus, registerFocusRoot, selectedLibraryKey,
		view
	} = props;

	const myLibraries = useMemo(
		() => libraries.filter(l => l.isMyLibrary),
		[libraries]
	);
	const groupLibraries = useMemo(
		() => libraries.filter(l => l.isGroupLibrary),
		[libraries]
	);
	const otherLibraries = useMemo(
		() => libraries.filter(l => !l.isMyLibrary && !l.isGroupLibrary),
		[libraries]
	);

	const [opened, setOpened] = useState([]);
	const [virtual, setVirtual] = useState(null);

	const isRootActive = view === 'libraries';

	useEffect(() => {
		if(selectedLibraryKey) {
			toggleOpen(selectedLibraryKey, true);
			//@TODO: Minor opitimisation: only fetch library settings if needed
			fetchLibrarySettings(selectedLibraryKey);
		}
	}, [selectedLibraryKey]);

	useEffect(() => {
		//@NOTE: this should only trigger when library is reset. Otherwise collections are fetched
		//		 by loader or when library is first opened. See #289
		if(hasMoreCollections) {
			fetchAllCollections(selectedLibraryKey);
		}
	}, [hasMoreCollections]);

	const cancelAdd = () => {
		setVirtual(null);
	}

	const commitAdd = async (libraryKey, parentCollection, name) => {
		if(name === '') {
			setVirtual(null);
			return;
		}

		setVirtual({ ...virtual, isBusy: true });
		try {
			await createCollection({ name, parentCollection }, libraryKey);
		} finally {
			setVirtual(null);
		}
	}

	const toggleOpen = (libraryKey, shouldOpen = null) => {
		const isOpened = opened.includes(libraryKey);

		if(shouldOpen !== null && shouldOpen === isOpened) {
			return;
		}

		isOpened ?
			setOpened(opened.filter(k => k !== libraryKey)) :
			setOpened([...opened, libraryKey ]);

		if(!isOpened) {
			fetchAllCollections(libraryKey);
		}
	}

	const addVirtual = (libraryKey, collectionKey) => {
		if(!opened.includes(libraryKey)) {
			toggleOpen(libraryKey);
		}
		window.setTimeout(() => setVirtual({ libraryKey, collectionKey }));
	}

	const getNodeProps = libraryData => {
		const { key, ...rest } = libraryData;
		const shouldBeTabbableOnTouch = view === 'libraries';
		const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;
		const isOpen = (!device.isTouchOrSmall && opened.includes(key)) ||
			(device.isTouchOrSmall && view !== 'libraries' && selectedLibraryKey == key);
		const isSelected = !device.isTouchOrSmall && selectedLibraryKey === key && itemsSource === 'top';
		const isFetching = !device.isTouchOrSmall && librariesWithCollectionsFetching.includes(key);
		const collectionsCount = key in collectionCountByLibrary ? collectionCountByLibrary[key] : null;

		return {
			collectionsCount, libraryKey: key, shouldBeTabbableOnTouch, shouldBeTabbable, isOpen, isSelected, isFetching,
			addVirtual, commitAdd, cancelAdd, toggleOpen, virtual,
			...rest,
			...pick(props, ['device', 'picked', 'pickerIncludeLibraries', 'onDrillDownNext',
				'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'navigate', 'isPickerMode', 'selectedCollectionKey',
				'pickerPick'
			])
		}
	}

	if(isFetching) {
		return <Spinner />;
	}

	return (
		<nav className="collection-tree"
			onFocus={ onFocus }
			onBlur={ onBlur }
			tabIndex={ 0 }
			ref={ ref => registerFocusRoot(ref) }
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
	collectionCountByLibrary: PropTypes.object,
	createCollection: PropTypes.func,
	device: PropTypes.object,
	fetchAllCollections: PropTypes.func,
	fetchLibrarySettings: PropTypes.func,
	hasMoreCollections: PropTypes.bool,
	isFetching: PropTypes.bool,
	itemsSource: PropTypes.string,
	libraries: PropTypes.array,
	librariesWithCollectionsFetching: PropTypes.array,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	registerFocusRoot: PropTypes.func,
	selectedLibraryKey: PropTypes.string,
	view: PropTypes.string,
}

export default React.memo(withDevice(withFocusManager(Libraries)));
