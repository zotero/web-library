'use strict';

import Zotero from 'libzotero';
import React from 'react';
import ReactDOM from 'react-dom';
import ItemListContainer from './item/item-list-container';
import LibraryContainer from './library/library-container';
import CollectionTreeContainer from './collection/collection-tree-container';
import components from './components';

if(!Zotero.ui) {
	Zotero.ui = {};
}

//expose components & react
Object.assign(Zotero.ui, {
	React,
	ReactDOM,
	CollectionTreeContainer,
	ItemListContainer,
	LibraryContainer
}, components());