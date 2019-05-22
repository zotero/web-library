'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Button from './ui/button';
import CollectionTree from './libraries/collection-tree.jsx';
import cx from 'classnames';
import Icon from './ui/icon';
import Node from './libraries/node';
import Spinner from './ui/spinner';
import Types from '../types';
import { stopPropagation } from '../utils';

class Libraries extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			virtual: null,
			opened: [props.libraryKey], // opened group libraries
		}
	}

	componentDidUpdate({ libraryKey: prevLibraryKey }) {
		const { libraryKey } = this.props;

		if(libraryKey !== prevLibraryKey) {
			this.setState({ opened: [...this.state.opened, libraryKey ] });
		}
	}

	handleSelect(pathData, ev) {
		ev && ev.preventDefault();
		this.props.onSelect(pathData);
	}

	handleAdd(libraryKey, collectionKey) {
		const { opened } = this.state;
		if(!opened.includes(libraryKey)) {
			this.toggleOpen(libraryKey);
		}
		window.setTimeout(() => this.setState({ virtual: { libraryKey, collectionKey } }));
	}

	async handleAddCommit(libraryKey, parentCollection, name) {
		this.setState({ virtual: { ...this.state.virtual, isBusy: true } });
		await this.props.onCollectionAdd(libraryKey, parentCollection, name);
		this.setState({ virtual: null });
	}

	handleAddCancel() {
		this.setState({ virtual: null });
	}

	async handleDelete(libraryKey, collection) {
		await this.props.onCollectionDelete(libraryKey,collection);
	}

	handleOpenToggle = (ev, shouldOpen = null) => {
		const libraryKey = ev.currentTarget.closest('[data-key]').dataset.key;
		this.toggleOpen(libraryKey, shouldOpen);
	}

	handlePickerPick = ev => {
		const { onPickerPick } = this.props;
		const libraryKey = ev.currentTarget.closest('[data-key]').dataset.key;
		onPickerPick({ libraryKey }, ev);
	}

	handleFocus = ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}
		this.ref.tabIndex = -1;
		this.ref.querySelector('[tabIndex="-2"]').focus();
	}

	handleBlur = ev => {
		if(ev.relatedTarget &&
			(ev.relatedTarget === this.ref || ev.relatedTarget.closest('[data-root]'))
		) {
			return;
		}
		this.ref.tabIndex = 0;
	}

	handleNext = ev => {
		const tabbables = Array.from(
			this.ref.querySelectorAll('[tabIndex="-2"]')
		).filter(t => t.offsetParent);
		const nextIndex = tabbables.findIndex(t => t === ev.currentTarget) + 1;
		ev.preventDefault();
		if(nextIndex < tabbables.length) {
			tabbables[nextIndex].focus();
		}
	}

	handlePrevious = ev => {
		const tabbables = Array.from(
			this.ref.querySelectorAll('[tabIndex="-2"]')
		).filter(t => t.offsetParent);
		const prevIndex = tabbables.findIndex(t => t === ev.currentTarget) - 1;
		ev.preventDefault();
		if(prevIndex >= 0) {
			tabbables[prevIndex].focus();
		}
	}

	toggleOpen = (libraryKey, shouldOpen = null) => {
		const { onLibraryOpen } = this.props;
		const { opened } = this.state;
		const isOpened = opened.includes(libraryKey);

		if(shouldOpen !== null && shouldOpen === isOpened) {
			return;
		}

		isOpened ?
			this.setState({ opened: opened.filter(k => k !== libraryKey) }) :
			this.setState({ opened: [...opened, libraryKey ] });

		if(!isOpened) { onLibraryOpen(libraryKey); }
	}

	renderCollections({ key, isMyLibrary, isReadOnly }) {
		const { collections, libraryKey } = this.props;
		const { virtual } = this.state;
		const props = {
			...this.props, //@TODO: pick props
			collections: collections[key],
			libraryKey: key,
			isMyLibrary,
			isCurrentLibrary: libraryKey === key,
			isReadOnly,
			onAdd: this.handleAdd.bind(this),
			onAddCancel: this.handleAddCancel.bind(this),
			onAddCommit: this.handleAddCommit.bind(this),
			onDelete: this.handleDelete.bind(this),
			onSelect: this.handleSelect.bind(this),
			onNext: this.handleNext,
			onPrevious: this.handlePrevious,
			virtual: virtual != null && virtual.libraryKey === key ? virtual : null
		}
		return <CollectionTree { ...props } />;
	}

	renderLibrary = ({ key, name, isReadOnly, isMyLibrary }) => {
		const { device, isPickerMode, itemsSource, librariesWithCollectionsFetching,
		libraryKey, pickerIncludeLibraries, picked, view,
		} = this.props;
		const { opened } = this.state;
		const shouldBeTabbableOnTouch = view === 'libraries';
		const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;
		const isOpen = (!device.isTouchOrSmall && opened.includes(key)) ||
			(device.isTouchOrSmall && view !== 'libraries' && libraryKey == key);
		const isSelected = !device.isTouchOrSmall &&
			libraryKey === key && itemsSource === 'top';
		const isFetching = !device.isTouchOrSmall && librariesWithCollectionsFetching.includes(key);

		return (
			<Node
				className={ cx({
					'open': isOpen && !isFetching,
					'selected': isSelected,
					'busy': isFetching
				}) }
				tabIndex={ shouldBeTabbable ? "-2" : null }
				isOpen={ isOpen && !isFetching }
				onOpen={ this.handleOpenToggle }
				onClick={ this.handleSelect.bind(this, { library: key, view: 'library' }) }
				onNext={ this.handleNext }
				onPrevious={ this.handlePrevious }
				subtree={ isFetching ? null : this.renderCollections({ key, isMyLibrary, isReadOnly }) }
				key={ key }
				data-key={ key }
				dndTarget={ isReadOnly ? { } : { 'targetType': 'library', libraryKey: key } }
			>
				<Icon type="28/library" className="touch" width="28" height="28" />
				<Icon type="16/library" className="mouse" width="16" height="16" />
				<div className="truncate">{ name }</div>
				{ isPickerMode && pickerIncludeLibraries && !isFetching && (
					<input
						type="checkbox"
						checked={ picked.some(({ collectionKey: c, libraryKey: l }) => l === key && !c) }
						onChange={ this.handlePickerPick }
						onClick={ stopPropagation }
					/>
				)}
				{ isFetching && <Spinner className="small mouse" /> }
				{
					!isFetching && !isReadOnly && (
						<Button
							className="mouse btn-icon-plus"
							icon
							onClick={ this.handleAdd.bind(this, key, null) }
							tabIndex={ -1 }
						>
							<Icon type={ '16/plus' } width="16" height="16" />
						</Button>
					)
				}
			</Node>
		);
	}

	render() {
		const { view, libraries } = this.props;
		const isRootActive = view === 'libraries';
		const myLibraries = libraries.filter(l => l.isMyLibrary);
		const groupLibraries = libraries.filter(l => l.isGroupLibrary);
		const otherLibraries = libraries.filter(l => !l.isMyLibrary && !l.isGroupLibrary);

		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<nav className="collection-tree"
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					tabIndex={ 0 }
					ref={ ref => this.ref = ref }
					data-root={ 1 }
				>
					<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
						<div className="scroll-container-touch" role="tree">
							<section>
								{ myLibraries.length > 0 && (
									<div className={ cx('level', 'level-0') }>
										<ul className="nav" role="group">
											{ myLibraries.map(this.renderLibrary) }
										</ul>
									</div>
								)}
								{ groupLibraries.length > 0 && (
									<React.Fragment>
										<h4>Group Libraries</h4>
										<div className={ cx('level', 'level-0') }>
											<ul className="nav" role="group">
												{ groupLibraries.map(this.renderLibrary) }
											</ul>
										</div>
									</React.Fragment>
								)}
								{ otherLibraries.length > 0 && (
									<React.Fragment>
										<h4>Other Libraries</h4>
										<div className={ cx('level', 'level-0') }>
											<ul className="nav" role="group">
												{ otherLibraries.map(this.renderLibrary) }
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
	}
}

Libraries.propTypes = {
	device: PropTypes.object,
	isFetching: PropTypes.bool,
	itemsSource: PropTypes.string,
	librariesWithCollectionsFetching: PropTypes.arrayOf(PropTypes.string),
	libraryKey: PropTypes.string,
	onPickerPick: PropTypes.func,
	onSelect: PropTypes.func,
	path: PropTypes.array,
	picked: PropTypes.array,
	pickerIncludeLibraries: PropTypes.bool,
	updating: PropTypes.array,
	view: PropTypes.string,
	onLibraryOpen: PropTypes.func,
	libraries: PropTypes.arrayOf(
		PropTypes.shape({
			key:  PropTypes.string.isRequired,
			isMyLibrary: PropTypes.bool,
			isGroupLibrary: PropTypes.bool,
		})
	),
	collections: PropTypes.objectOf(
		PropTypes.arrayOf(Types.collection)
	).isRequired,
	isPickerMode: PropTypes.bool
};

Libraries.defaultProps = {
	collections: {},
	isFetching: false,
	onSelect: () => null,
	path: [],
	updating: [],
	libraries: [],
};

export default Libraries;
