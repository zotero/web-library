'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('./ui/icon');
const Button = require('./ui/button');
const Spinner = require('./ui/spinner');
const Node = require('./libraries/node');
const CollectionTree = require('./libraries/collection-tree.jsx');
const TouchHeaderContainer = require('../container/touch-header');

class Libraries extends React.Component {
	state = {
		virtual: null,
		opened: [], // opened group libraries
	}

	componentDidUpdate({ libraryKey: prevLibraryKey }) {
		const { libraryKey } = this.props;

		if(libraryKey != prevLibraryKey) {
			this.setState({ opened: [...this.state.opened, libraryKey ] });
		}
	}

	handleSelect(pathData, ev) {
		ev && ev.preventDefault();
		this.props.onSelect(pathData);
	}

	handleKeyPress(pathData, ev) {
		if(ev && (ev.key === 'Enter' || ev.key === ' ')) {
			ev.stopPropagation();
			this.props.onSelect(pathData);
		}
	}


	handleAdd(libraryKey, collectionKey) {
		this.setState({ virtual: { libraryKey, collectionKey } });
	}

	async handleAddCommit(libraryKey, parentCollection, name) {
		this.setState({ virtual: { ...this.state.virtual, isBusy: true } });
		await this.props.onCollectionAdd(libraryKey, parentCollection, name);
		this.setState({ virtual: null });
	}

	handleAddCancel() {
		this.setState({ virtual: null });
	}

	async handleRename(libraryKey, collectionKey, name) {
		await this.props.onCollectionUpdate(libraryKey, collectionKey, { name });
	}

	async handleDelete(libraryKey, collection) {
		await this.props.onCollectionDelete(libraryKey,collection);
	}

	handleOpenToggle(groupKey, ev) {
		ev && ev.stopPropagation();
		const { onGroupOpen } = this.props;
		const { opened } = this.state;
		const isOpened = opened.includes(groupKey);
		isOpened ?
			this.setState({ opened: opened.filter(k => k !== groupKey) }) :
			this.setState({ opened: [...opened, groupKey ] });

		if(!isOpened) { onGroupOpen(groupKey); }
	}

	renderCollections() {
		const { userLibraryKey, libraryKey } = this.props;
		const { virtual } = this.state;
		const props = {
			...this.props,
			libraryKey: userLibraryKey,
			isUserLibrary: true,
			isCurrentLibrary: libraryKey === userLibraryKey,
			onAdd: this.handleAdd.bind(this),
			onAddCancel: this.handleAddCancel.bind(this),
			onAddCommit: this.handleAddCommit.bind(this),
			onDelete: this.handleDelete.bind(this),
			onRename: this.handleRename.bind(this),
			onSelect: this.handleSelect.bind(this),
			virtual: virtual != null && virtual.libraryKey === userLibraryKey ? virtual : null
		}
		return <CollectionTree { ...props } />;
	}

	renderGroupCollections(groupKey) {
		const { groupCollections, libraryKey } = this.props;
		const { virtual } = this.state;
		const props = {
			...this.props,
			collections: groupCollections[groupKey],
			libraryKey: groupKey,
			isUserLibrary: false,
			isCurrentLibrary: libraryKey === groupKey,
			onAdd: this.handleAdd.bind(this),
			onAddCancel: this.handleAddCancel.bind(this),
			onAddCommit: this.handleAddCommit.bind(this),
			onDelete: this.handleDelete.bind(this),
			onRename: this.handleRename.bind(this),
			onSelect: this.handleSelect.bind(this),
			virtual: virtual != null && virtual.libraryKey === groupKey ? virtual : null
		}
		return <CollectionTree { ...props } />;
	}

	renderGroups() {
		const { groups, libraryKey, itemsSource, device, view } = this.props;
		const { opened } = this.state;

		return (
			<div className={ cx('level', 'level-0') }>
				<ul className="nav" role="group">
					{
						groups.map(group => {
							const groupKey = `g${group.id}`;
							const isOpen = (!device.isTouchOrSmall && opened.includes(groupKey)) ||
								(device.isTouchOrSmall && view !== 'libraries' && libraryKey == groupKey);
							const isSelected = !device.isTouchOrSmall &&
								libraryKey === groupKey && itemsSource === 'top';
							return (
								<Node
									className={ cx({
										'open': isOpen,
										'selected': isSelected,
									}) }
									isOpen={ isOpen }
									onOpen={ this.handleOpenToggle.bind(this, groupKey) }
									onClick={ this.handleSelect.bind(this, { library: groupKey, view: 'library' }) }
									onKeyPress={ this.handleKeyPress.bind(this, { library: groupKey, view: 'library'}) }
									subtree={ this.renderGroupCollections(groupKey) }
									key={ group.id }
								>
									<Icon type="28/library" className="touch" width="28" height="28" />
									<Icon type="16/library" className="mouse" width="16" height="16" />
									<a>{ group.name }</a>
									{
										isOpen && (
											<Button onClick={ this.handleAdd.bind(this, groupKey, null) } >
												<Icon type={ '16/plus' } width="16" height="16" />
											</Button>
										)
									}
								</Node>
						)})
					}
				</ul>
			</div>
		);
	}

	renderMyLibrary() {
		const { libraryKey, userLibraryKey, itemsSource, view, device } = this.props;
		const { opened } = this.state;
		const isOpen = (!device.isTouchOrSmall && opened.includes(userLibraryKey)) ||
			(device.isTouchOrSmall && view !== 'libraries' && libraryKey == userLibraryKey);
		const isSelected = !device.isTouchOrSmall &&
			libraryKey === userLibraryKey && itemsSource === 'top';

		return (
			<div className={ cx('level', 'level-0') }>
				<ul className="nav" role="group">
					<Node
						className={ cx({
							'open': isOpen,
							'selected': isSelected
						}) }
						isOpen={ isOpen }
						onOpen={ this.handleOpenToggle.bind(this, userLibraryKey) }
						onClick={ this.handleSelect.bind(this, { library: userLibraryKey, view: 'library' }) }
						onKeyPress={ this.handleKeyPress.bind(this, { library: userLibraryKey, view: 'library' }) }
						subtree={ this.renderCollections() }
						key={ userLibraryKey }
					>
						<Icon type="28/library" className="touch" width="28" height="28" />
						<Icon type="16/library" className="mouse" width="16" height="16" />
						<a>My Library</a>
						{
							isOpen && (
								<Button onClick={ this.handleAdd.bind(this, userLibraryKey, null) } >
									<Icon type={ '16/plus' } width="16" height="16" />
								</Button>
							)
						}
					</Node>
				</ul>
			</div>
		);
	}

	render() {
		const { userLibraryKey, libraryKey, itemsSource, view } = this.props;
		const isRootActive = view === 'libraries';

		if(this.props.isFetching) {
			return <Spinner />;
		} else {

			return (
				<nav className="collection-tree">
					<TouchHeaderContainer
						className="hidden-xs-down hidden-mouse-md-up"
					/>
					<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
						<div className="scroll-container" role="tree">
							<section>
								{ this.renderMyLibrary() }
							</section>
							<section>
								<h4>Group Libraries</h4>
								{ this.renderGroups() }
							</section>
						</div>
					</div>
				</nav>
			);
		}
	}
}

Libraries.propTypes = {
	isFetching: PropTypes.bool,
	onSelect: PropTypes.func,
	path: PropTypes.array,
	updating: PropTypes.array,
	groups: PropTypes.array,
	groupCollections: PropTypes.object,
	collections: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
			name: PropTypes.string,
		}
	)).isRequired
};

Libraries.defaultProps = {
	collections: [],
	isFetching: false,
	onSelect: () => null,
	path: [],
	updating: []
};

module.exports = Libraries;
