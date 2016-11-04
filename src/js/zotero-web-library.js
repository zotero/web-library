'use strict';

import Zotero from 'libzotero';
import React from 'react';
import ReactDOM from 'react-dom';

import CollectionTree from './collection/collection-tree';
import CollectionTreeContainer from './collection/collection-tree-container';
import Item from './item/item';
import ItemDetails from './item/item-details';
import ItemsList from './item/items-list';
import ItemsListContainer from './item/items-list-container';
import Library from './library/library';
import LibraryContainer from './library/library-container';
import Navbar from './app/navbar';
import Spinner from './app/spinner';
import TagSelector from './tag/tag-selector';
import Editable from './editable/editable';

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
	Editable,
	React,
	ReactDOM
});