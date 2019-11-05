'use strict';

import React from 'react';
import { connect } from 'react-redux';

import {  toggleModal, toggleNavbar, triggerSearchMode, navigate, resetLibrary } from '../actions';
import Library from '../component/library';
import { get } from '../utils';

const LibraryContainer = props => <Library { ...props } />

const mapStateToProps = state => {
	const { collectionKey, isLibraryReadOnly, isMyPublications, isNavBarOpen, isSearchMode,
		isSelectMode, isTrash, itemsSource, libraryKey, noteKey, qmode, search, searchState, tags,
		useTransitions, userLibraryKey, view } = state.current;
	const { itemTypes } = state.meta;
	const { isSynced } = get(state, ['libraries', libraryKey, 'sync'], {});
	const { config, fetching: { collectionsInLibrary }, viewport } = state;
	const isFetchingCollections = collectionsInLibrary.some(key => key === userLibraryKey || key === libraryKey);
	const isFetchingLibrarySettings = get(state, ['libraries', libraryKey, 'fetching', 'librarySettings']);

	return { config, view, userLibraryKey, viewport, isSearchMode, isSelectMode, itemsSource,
		collectionKey, isFetchingCollections, isFetchingLibrarySettings, isNavBarOpen,
		isMyPublications, isSynced, itemTypes, isTrash, useTransitions, libraryKey, noteKey, search,
		searchState, tags, qmode, isLibraryReadOnly, };
};

export default connect(
	mapStateToProps, { navigate, resetLibrary, triggerSearchMode, toggleModal, toggleNavbar }
)(LibraryContainer);
