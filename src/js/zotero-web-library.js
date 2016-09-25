'use strict';

import Zotero from 'libzotero';
import React from 'react';
import ReactDOM from 'react-dom';

import CollectionTree from './collection/collection-tree.jsx';
import CollectionTreeContainer from './collection/collection-tree-container.jsx';
import Item from './item/item.jsx';
import ItemDetails from './item/item-details.jsx';
import ItemsList from './item/items-list.jsx';
import ItemsListContainer from './item/items-list-container.jsx';
import Library from './library/library.jsx';
import LibraryContainer from './library/library-container.jsx';
import Navbar from './app/navbar.jsx';
import Spinner from './app/spinner.jsx';
import TagSelector from './app/tag-selector.jsx';

if(!Zotero.ui) {
	Zotero.ui = {};
}

//expose components & react
Object.assign(Zotero.ui, {
	CollectionTree,
	CollectionTreeContainer,
	Item,
	ItemDetails,
	ItemsList,
	ItemsListContainer,
	Library,
	LibraryContainer,
	Navbar,
	Spinner,
	TagSelector,
	React,
	ReactDOM
});