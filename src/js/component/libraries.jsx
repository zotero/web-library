'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('./ui/icon');
const Button = require('./ui/button');
const Spinner = require('./ui/spinner');
const Node = require('./libraries/node');
const CollectionTree = require('./libraries/collection-tree.jsx');

class Libraries extends React.Component {
	state = {
		virtualEntryIn: false,
		virtualEntryBusy: false,
		opened: [], // opened group libraries
	}

	componentDidUpdate({ libraryKey: prevLibraryKey }) {
		const { libraryKey, userLibraryKey } = this.props;

		if(libraryKey != prevLibraryKey && libraryKey !== userLibraryKey) {
			this.setState({ opened: [...this.state.opened, libraryKey ] });
		}
	}

	handleSelect(pathData, ev) {
		ev && ev.preventDefault();
		this.props.onSelect(pathData);
	}


	handleAdd(libraryKey) {
		this.setState({ virtualEntryIn: libraryKey });
	}

	async handleAddCommit(libraryKey, name) {
		this.setState({ virtualEntryBusy: true });
		await this.props.onCollectionAdd(libraryKey, name);
		this.setState({
			virtualEntryIn: null,
			virtualEntryBusy: false
		});
	}

	handleAddCancel() {
		this.setState({ virtualEntryIn: null });
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
		const { userLibraryKey } = this.props;
		const { virtualEntryIn, virtualEntryBusy } = this.state;
		const props = {
			...this.props,
			libraryKey: userLibraryKey,
			isUserLibrary: true,
			onAddCancel: this.handleAddCancel.bind(this),
			onAddCommit: this.handleAddCommit.bind(this),
			onDelete: this.handleDelete.bind(this),
			onRename: this.handleRename.bind(this),
			onSelect: this.handleSelect.bind(this),
			isAdding: virtualEntryIn === userLibraryKey,
			isAddingBusy: virtualEntryIn === userLibraryKey && virtualEntryBusy,
		}
		return <CollectionTree { ...props } />;
	}

	renderGroupCollections(groupKey) {
		const { groupCollections } = this.props;
		const { virtualEntryIn, virtualEntryBusy } = this.state;
		const props = {
			...this.props,
			collections: groupCollections[groupKey],
			libraryKey: groupKey,
			isUserLibrary: false,
			onAddCancel: this.handleAddCancel.bind(this),
			onAddCommit: this.handleAddCommit.bind(this),
			onDelete: this.handleDelete.bind(this),
			onRename: this.handleRename.bind(this),
			onSelect: this.handleSelect.bind(this),
			isAdding: virtualEntryIn === groupKey,
			isAddingBusy: virtualEntryIn === groupKey && virtualEntryBusy,
		}
		return <CollectionTree { ...props } />;
	}

	renderGroups() {
		const { groups } = this.props;
		const { opened } = this.state;

		// @TODO
		// onClick={ this.handleSelect.bind(this, {'library': groupKey }) }
		// onKeyPress={ this.handleKeyPress.bind(this, {'library': groupKey }) }

		return (
			<div className={ cx('level', 'level-0') }>
				<ul className="nav" role="group">
					{
						groups.map(group => {
							const groupKey = `g${group.id}`;
							return (
								<Node
									className={ cx({ 'open': opened.includes(groupKey) }) }
									isOpen={ opened.includes(groupKey) }
									onOpen={ this.handleOpenToggle.bind(this, groupKey) }
									subtree={ this.renderGroupCollections(groupKey) }
									key={ group.id }
								>
									<Icon type="28/folder" className="touch" width="28" height="28" />
									<Icon type="16/folder" className="mouse" width="16" height="16" />
									<a>{ group.name }</a>
									{
										opened.includes(groupKey) && (
											<Button onClick={ this.handleAdd.bind(this, groupKey) } >
												<Icon type={ '20/add-collection' } width="20" height="20" />
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

	render() {
		const { userLibraryKey, libraryKey, itemsSource } = this.props;
		const isRootActive = libraryKey === userLibraryKey && itemsSource === 'top';

		if(this.props.isFetching) {
			return <Spinner />;
		} else {

			return (
				<nav className="collection-tree">
					<header className="touch-header hidden-mouse-md-up hidden-xs-down">
						<h3>Library</h3>
					</header>
					<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
						<div className="scroll-container" role="tree">
							<section>
								<div className="desktop-header">
									<h4>My Library</h4>
									<Button onClick={ this.handleAdd.bind(this, userLibraryKey) } >
										<Icon type={ '20/add-collection' } width="20" height="20" />
									</Button>
								</div>
								{ this.renderCollections() }
							</section>
							<section>
								<div className="desktop-header">
									<h4>Group Libraries</h4>
								</div>
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
