'use strict';

import React from 'react';
import { connect } from 'react-redux';

import { fetchLibrarySettings, toggleModal, toggleNavbar, triggerSearchMode, navigate, resetLibrary } from '../actions';
import Library from '../component/library';
import { get } from '../utils';

const LibraryContainer = props => <Library { ...props } />

const mapStateToProps = state => {
	const { collectionKey, isMyPublications, isNavBarOpen, isSearchMode,
		isSelectMode, isTouchTagSelectorOpen, isTrash, itemsSource, libraryKey, noteKey, qmode,
		search, searchState, tags, useTransitions, userLibraryKey, view } = state.current;
	const { itemTypes } = state.meta;
	const { isSynced } = get(state, ['libraries', libraryKey, 'sync'], {});
	const { config, fetching: { collectionsInLibrary } } = state;
	const isFetchingCollections = collectionsInLibrary.some(key => key === userLibraryKey || key === libraryKey);
	const isFetchingLibrarySettings = get(state, ['libraries', libraryKey, 'fetching', 'librarySettings']);
	const isLibraryReadOnly = (state.config.libraries.find(l => l.key === libraryKey) || {}).isReadOnly;

	return { config, view, userLibraryKey, isSearchMode, isSelectMode, itemsSource, collectionKey,
		isFetchingCollections, isFetchingLibrarySettings, isNavBarOpen, isMyPublications, isSynced,
		isTouchTagSelectorOpen, isTrash, itemTypes, useTransitions, libraryKey, noteKey, search,
		searchState, tags, qmode, isLibraryReadOnly, };
};

export default connect(
	mapStateToProps, { fetchLibrarySettings, navigate, resetLibrary, triggerSearchMode, toggleModal, toggleNavbar }
)(LibraryContainer);
