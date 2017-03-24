'use strict';

import Zotero from 'libzotero';
import React from 'react';
import ReactDOM from 'react-dom';
import ItemListContainer from './component/item/list/container';
import LibraryContainer from './component/library/container';
import CollectionTreeContainer from './component/collection-tree/container';
import getComponents from './components';

if(!Zotero.ui) {
	Zotero.ui = {};
}

//expose components & react
Zotero.ui = {
	React,
	ReactDOM,
	CollectionTreeContainer,
	ItemListContainer,
	LibraryContainer,
	...getComponents(),
	...Zotero.ui
};
