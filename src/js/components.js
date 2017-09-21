'use strict';

const Button = require('./component/ui/button');
const CollectionTree = require('./component/collection-tree');
const Creators = require('./component/creators');
const Editable = require('./component/editable');
const EditableContent = require('./component/editable/content');
const Icon = require('./component/ui/icon');
const Item = require('./component/item');
const ItemBox = require('./component/item/box');
const ItemDetails = require('./component/item/details');
const ItemList = require('./component/item/list');
const Library = require('./component/library');
const Navbar = require('./component/ui/navbar');
const NoteEditor = require('./component/note-editor');
const Panel = require('./component/ui/panel');
const RichEditor = require('./component/rich-editor');
const Spinner = require('./component/ui/spinner');
const TagSelector = require('./component/tag-selector');
const TouchHeader = require('./component/touch-header');
const TouchNavigation = require('./component/touch-navigation');
const { Tab, Tabs } = require('./component/ui/tabs');
const { Toolbar, ToolGroup } = require('./component/ui/toolbars');

module.exports = () => ({
	Button,
	CollectionTree,
	Creators,
	Editable,
	EditableContent,
	Icon,
	Item,
	ItemBox,
	ItemDetails,
	ItemList,
	Library,
	Navbar,
	NoteEditor,
	Panel,
	RichEditor,
	Spinner,
	Tab,
	Tabs,
	TagSelector,
	Toolbar,
	ToolGroup,
	TouchHeader,
	TouchNavigation
});
