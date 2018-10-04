/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const Libraries = require('../component/libraries');
const {
	fetchCollections,
	createCollection,
	updateCollection,
	deleteCollection,
} = require('../actions');
const { getCollectionsPath } = require('../common/state');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const deepEqual = require('deep-equal');

class LibrariesContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			fetchCollections(this.props.userLibraryKey)
		);
	}

	componentDidUpdate({ groups: prevGroups }) {
		const { groups } = this.props;
		if(!deepEqual(groups, prevGroups)) {
			groups.forEach(group => {
				this.props.dispatch(fetchCollections(`g${group.id}`));
			});
		}
	}

	handleSelect(pathData) {
		this.props.history.push(makePath(pathData));
	}

	async handleCollectionAdd(name, parentCollection = null) {
		return await this.props.dispatch(createCollection({
			name, parentCollection
		}));
	}

	async handleCollectionUpdate(collectionKey, patch) {
		await this.props.dispatch(updateCollection(collectionKey, patch));
	}

	async handleCollectionDelete(collection) {
		await this.props.dispatch(deleteCollection(collection));
		this.props.history.push('/');
	}

	render() {
		return <Libraries
			{ ...this.props }
			onSelect={ this.handleSelect.bind(this) }
			onCollectionAdd={ this.handleCollectionAdd.bind(this) }
			onCollectionUpdate={ this.handleCollectionUpdate.bind(this) }
			onCollectionDelete={ this.handleCollectionDelete.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const libraryKey = state.current.library;
	const userLibraryKey = state.config.userLibraryKey;

	return {
		libraryKey,
		collections: Object.values(
			get(state, ['libraries', userLibraryKey, 'collections'], {})
		),
		userLibraryKey,
		groups: state.groups,
		groupCollections: state.groups.reduce((aggr, group) => {
			aggr[`g${group.id}`] = Object.values(
				get(state, ['libraries', `g${group.id}`, 'collections'], {})
			);
			return aggr;
		}, {}),
		isFetching: libraryKey in state.fetching.collectionsInLibrary,
		selected: state.current.collection,
		path: getCollectionsPath(state),
		itemsSource: state.current.itemsSource,
		updating: Object.keys(get(state, ['libraries', libraryKey, 'updating', 'collections'], {}))
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch
	};
};

LibrariesContainer.propTypes = {
	collections: PropTypes.array,
	dispatch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	path: PropTypes.array,
	selected: PropTypes.string,
};

LibrariesContainer.defaultProps = {
	collections: [],
	path: [],
	selected: ''
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(LibrariesContainer));
