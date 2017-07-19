'use strict';

require('babel-regenerator-runtime');

const React = require('react');
const ReactDOM = require('react-dom');
const ItemListContainer = require('./component/item/list/container');
const LibraryContainer = require('./component/library/container');
const CollectionTreeContainer = require('./component/collection-tree/container');
const getComponents = require('./components');


//expose components & react
module.exports = {
	React,
	ReactDOM,
	CollectionTreeContainer,
	ItemListContainer,
	LibraryContainer,
	...getComponents()
};
