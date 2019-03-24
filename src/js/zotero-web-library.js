'use strict';

import 'babel-regenerator-runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import ItemsContainer from './container/items';
import LibraryContainer from './container/library';
import LibrariesContainer from './container/libraries';
import Button from './component/ui/button';
import Libraries from './component/libraries';
import Creators from './component/form/creators';
import Editable from './component/editable';
import EditableContent from './component/editable/content';
import Icon from './component/ui/icon';
import ItemBox from './component/item/box';
import ItemDetails from './component/item/details';
import Items from './component/item/items';
import Library from './component/library';
import Navbar from './component/ui/navbar';
import Notes from './component/notes';
import Tags from './component/tags';
import Attachments from './component/attachments';
import Relations from './component/relations';
import Panel from './component/ui/panel';
import RichEditor from './component/rich-editor';
import Spinner from './component/ui/spinner';
import TagSelector from './component/tag-selector';
import TouchHeader from './component/touch-header';
import TouchNavigation from './component/touch-navigation';
import { Tab, Tabs } from './component/ui/tabs';
import { Toolbar, ToolGroup } from './component/ui/toolbars';

//expose components & react
export default {
	React,
	ReactDOM,
	Attachments,
	Button,
	Creators,
	Editable,
	EditableContent,
	Icon,
	ItemBox,
	ItemDetails,
	Items,
	ItemsContainer,
	Libraries,
	LibrariesContainer,
	Library,
	LibraryContainer,
	Navbar,
	Notes,
	Panel,
	Relations,
	RichEditor,
	Spinner,
	Tab,
	Tabs,
	Tags,
	TagSelector,
	Toolbar,
	ToolGroup,
	TouchHeader,
	TouchNavigation,
};
