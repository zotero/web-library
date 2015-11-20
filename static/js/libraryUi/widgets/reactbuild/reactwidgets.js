"use strict";

Zotero.ui.widgets.reactaddToCollectionDialog = {};

Zotero.ui.widgets.reactaddToCollectionDialog.init = function (el) {
	Z.debug("addtocollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(AddToCollectionDialog, { library: library }), document.getElementById('add-to-collection-dialog'));
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;

	library.listen("addToCollectionDialog", function () {
		reactInstance.setState({});
		reactInstance.openDialog();
	}, {});
};

var AddToCollectionDialog = React.createClass({
	displayName: "AddToCollectionDialog",

	getInitialState: function getInitialState() {
		return {
			collectionKey: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'collectionKey': evt.target.value });
	},
	openDialog: function openDialog() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	addToCollection: function addToCollection(evt) {
		Z.debug("add-to-collection clicked", 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = this.state.collectionKey;
		if (!collectionKey) {
			Zotero.ui.jsNotificationMessage("No collection selected", 'error');
			return false;
		}
		if (itemKeys.length === 0) {
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			return false;
		}

		library.collections.getCollection(collectionKey).addItems(itemKeys).then(function (response) {
			library.dirty = true;
			Zotero.ui.jsNotificationMessage("Items added to collection", 'success');
		})["catch"](Zotero.catchPromiseError);
		return false;
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "add-to-collection-dialog", className: "add-to-collection-dialog", role: "dialog", title: "Add to Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Add To Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "add-to-collection-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-parent" },
										"Collection"
									),
									React.createElement(
										"select",
										{ onChange: this.handleCollectionChange, className: "collectionKey-select target-collection form-control" },
										collectionOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.addToCollection, className: "btn btn-primary addButton" },
								"Add"
							)
						)
					)
				)
			)
		);
	}
});

var BootstrapModalWrapper = React.createClass({
	displayName: "BootstrapModalWrapper",

	// The following two methods are the only places we need to
	// integrate Bootstrap or jQuery with the components lifecycle methods.
	componentDidMount: function componentDidMount() {
		// When the component is added, turn it into a modal
		Z.debug("BootstrapModalWrapper componentDidMount");
		J(this.refs.root).modal({ backdrop: 'static', keyboard: false, show: false });
	},
	componentWillUnmount: function componentWillUnmount() {
		Z.debug("BootstrapModalWrapper componentWillUnmount");
		J(this.refs.root).off('hidden', this.handleHidden);
	},
	close: function close() {
		Z.debug("BootstrapModalWrapper close");
		J(this.refs.root).modal('hide');
	},
	open: function open() {
		Z.debug("BootstrapModalWrapper open");
		J(this.refs.root).modal('show');
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "modal", ref: "root" },
			this.props.children
		);
	}
});
"use strict";

Zotero.ui.widgets.reactbreadcrumbs = {};

Zotero.ui.widgets.reactbreadcrumbs.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(BreadCrumbs, { library: library }), document.getElementById('breadcrumbs'));

	library.listen("displayedItemsChanged displayedItemChanged selectedCollectionChanged", reactInstance.setState());
};

var BreadCrumb = React.createClass({
	displayName: "BreadCrumb",

	getInitialProps: function getInitialProps() {
		return {
			label: "",
			path: ""
		};
	},
	render: function render() {
		if (this.props.path != "") {
			return React.createElement(
				"a",
				{ href: this.props.path },
				this.props.label
			);
		} else {
			return this.props.label;
		}
	}
});

var BreadCrumbs = React.createClass({
	displayName: "BreadCrumbs",

	getInitialProps: function getInitialProps() {
		return { library: null };
	},
	render: function render() {
		var library = this.props.library;
		if (library === null) {
			return null;
		}

		var crumbs = [];
		var config = Zotero.state.getUrlVars();
		if (Zotero.config.breadcrumbsBase) {
			Zotero.config.breadcrumbsBase.forEach(function (crumb) {
				crumbs.push(crumb);
			});
		} else if (library.libraryType == 'user') {
			crumbs = [{ label: 'Home', path: '/' }, { label: 'People', path: '/people' }, { label: library.libraryLabel || library.libraryUrlIdentifier, path: '/' + library.libraryUrlIdentifier }, { label: 'Library', path: '/' + library.libraryUrlIdentifier + '/items' }];
		} else {
			crumbs = [{ label: 'Home', path: '/' }, { label: 'Groups', path: '/groups' }, { label: library.libraryLabel || library.libraryUrlIdentifier, path: '/groups/' + library.libraryUrlIdentifier }, { label: 'Library', path: '/groups/' + library.libraryUrlIdentifier + '/items' }];
		}

		if (config.collectionKey) {
			Z.debug("have collectionKey", 4);
			curCollection = library.collections.getCollection(config.collectionKey);
			if (curCollection) {
				crumbs.push({ label: curCollection.get('name'), path: Zotero.state.buildUrl({ collectionKey: config.collectionKey }) });
			}
		}
		if (config.itemKey) {
			Z.debug("have itemKey", 4);
			crumbs.push({ label: library.items.getItem(config.itemKey).title, path: Zotero.state.buildUrl({ collectionKey: config.collectionKey, itemKey: config.itemKey }) });
		}

		var crumbNodes = [];
		var titleString = "";
		crumbs.forEach(function (crumb, index) {
			crumbNodes.push(React.createElement(BreadCrumb, { label: crumb.label, path: crumb.path }));
			if (crumb.label == "Home") {
				titleString += "Zotero | ";
			} else {
				titleString += crumb.label;
			}
			if (index < crumbs.length) {
				crumbNodes.push(" > ");
				titleString += " > ";
			}
		});

		//set window title
		if (titleString != "") {
			Zotero.state.updateStateTitle(titleString);
		}

		return React.createElement(
			"span",
			null,
			crumbNodes
		);
	}
});
'use strict';

Zotero.ui.widgets.reactchooseSortingDialog = {};

Zotero.ui.widgets.reactchooseSortingDialog.init = function (el) {
	Z.debug("chooseSortingDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ChooseSortingDialog, { library: library }), document.getElementById('choose-sorting-dialog'));
	Zotero.ui.widgets.reactchooseSortingDialog.reactInstance = reactInstance;

	var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
	var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
	reactInstance.setState({
		sortField: currentSortField,
		sortOrder: currentSortOrder
	});

	library.listen("chooseSortingDialog", reactInstance.openDialog, {});
};

var ChooseSortingDialog = React.createClass({
	displayName: 'ChooseSortingDialog',

	getInitialState: function getInitialState() {
		return {
			sortField: "",
			sortOrder: "asc"
		};
	},
	handleFieldChange: function handleFieldChange(evt) {
		this.setState({ sortField: evt.target.value });
	},
	handleOrderChange: function handleOrderChange(evt) {
		this.setState({ sortOrder: evt.target.value });
	},
	saveSorting: function saveSorting() {
		library.trigger("changeItemSorting", { newSortField: this.state.sortField, newSortOrder: this.state.sortOrder });
		this.closeDialog();
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var sortableOptions = library.sortableColumns.map(function (col) {
			return React.createElement(
				'option',
				{ label: Zotero.localizations.fieldMap[col], value: col },
				Zotero.localizations.fieldMap[col]
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: 'modal' },
			React.createElement(
				'div',
				{ id: 'choose-sorting-dialog', className: 'choose-sorting-dialog', role: 'dialog', title: 'Sort Order', 'data-keyboard': 'true' },
				React.createElement(
					'div',
					{ className: 'modal-dialog' },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: 'modal-header' },
							React.createElement(
								'button',
								{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'×'
							),
							React.createElement(
								'h3',
								null,
								'Sort Items By'
							)
						),
						React.createElement(
							'div',
							{ className: 'choose-sorting-div modal-body', 'data-role': 'content' },
							React.createElement(
								'form',
								{ className: 'form-horizontal', role: 'form' },
								React.createElement(
									'select',
									{ defaultValue: this.state.sortField, onChange: this.handleFieldChange, id: 'sort-column-select', className: 'sort-column-select form-control', name: 'sort-column-select' },
									sortableOptions
								),
								React.createElement(
									'select',
									{ defaultValue: this.state.sortOrder, onChange: this.handleOrderChange, id: 'sort-order-select', className: 'sort-order-select form-control', name: 'sort-order-select' },
									React.createElement(
										'option',
										{ label: 'Ascending', value: 'asc' },
										'Ascending'
									),
									React.createElement(
										'option',
										{ label: 'Descending', value: 'desc' },
										'Descending'
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-footer' },
							React.createElement(
								'button',
								{ className: 'btn', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'Cancel'
							),
							React.createElement(
								'button',
								{ onClick: this.saveSorting, className: 'btn btn-primary saveSortButton' },
								'Save'
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactciteItemDialog = {};

Zotero.ui.widgets.reactciteItemDialog.init = function (el) {
	Z.debug("citeItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CiteItemDialog, { library: library }), document.getElementById('cite-item-dialog'));
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;

	reactInstance.getAvailableStyles();

	//Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles();
	library.listen("citeItems", reactInstance.openDialog, {});
};

Zotero.ui.widgets.reactciteItemDialog.show = function (evt) {
	Z.debug("citeItemDialog.show", 3);
	var triggeringEl = J(evt.triggeringElement);
	var hasIndependentItems = false;
	var cslItems = [];
	var library;

	//check if event is carrying item data with it
	if (evt.hasOwnProperty("zoteroItems")) {
		hasIndependentItems = true;
		J.each(evt.zoteroItems, function (ind, item) {
			var cslItem = item.cslItem();
			cslItems.push(cslItem);
		});
	} else {
		library = Zotero.ui.getAssociatedLibrary(triggeringEl);
	}

	var widgetEl = J(evt.data.widgetEl).empty();
	widgetEl.html(J("#citeitemdialogTemplate").render({ freeStyleInput: true }));
	var dialogEl = widgetEl.find(".cite-item-dialog");

	var citeFunction = function citeFunction(e) {
		Z.debug("citeFunction", 3);
		//Zotero.ui.showSpinner(dialogEl.find(".cite-box-div"));
		var triggeringElement = J(evt.currentTarget);
		var style = '';
		if (triggeringElement.is(".cite-item-select, input.free-text-style-input")) {
			style = triggeringElement.val();
		} else {
			style = dialogEl.find(".cite-item-select").val();
			var freeStyle = dialogEl.find("input.free-text-style-input").val();
			if (J.inArray(freeStyle, Zotero.styleList) !== -1) {
				style = freeStyle;
			}
		}

		if (!hasIndependentItems) {
			//get the selected item keys from the items widget
			var itemKeys = Zotero.state.getSelectedItemKeys();
			if (itemKeys.length === 0) {
				itemKeys = Zotero.state.getSelectedItemKeys();
			}
			Z.debug(itemKeys, 4);
			library.loadFullBib(itemKeys, style).then(function (bibContent) {
				dialogEl.find(".cite-box-div").html(bibContent);
			})["catch"](Zotero.catchPromiseError);
		} else {
			Zotero.ui.widgets.reactciteItemDialog.directCite(cslItems, style).then(function (bibContent) {
				dialogEl.find(".cite-box-div").html(bibContent);
			})["catch"](Zotero.catchPromiseError);
			/*.then(function(response){
   	var bib = JSON.parse(response.data);
   	var bibString = Zotero.ui.widgets.reactciteItemDialog.buildBibString(bib);
   	dialogEl.find(".cite-box-div").html(bibString);
   });*/
		}
	};

	dialogEl.find(".cite-item-select").on('change', citeFunction);
	//dialogEl.find("input.free-text-style-input").on('change', citeFunction);

	Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles();
	//dialogEl.find("input.free-text-style-input").typeahead({local:Zotero.styleList, limit:10});

	Zotero.ui.dialog(dialogEl, {});

	return false;
};

Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles = function () {
	if (!Zotero.styleList) {
		Zotero.styleList = [];
		J.getJSON(Zotero.config.styleListUrl, function (data) {
			Zotero.styleList = data;
		});
	}
};

Zotero.ui.widgets.reactciteItemDialog.directCite = function (cslItems, style) {
	var data = {};
	data.items = cslItems;
	var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
	return J.post(url, JSON.stringify(data));
};

Zotero.ui.widgets.reactciteItemDialog.buildBibString = function (bib) {
	var bibMeta = bib.bibliography[0];
	var bibEntries = bib.bibliography[1];
	var bibString = bibMeta.bibstart;
	for (var i = 0; i < bibEntries.length; i++) {
		bibString += bibEntries[i];
	}
	bibString += bibMeta.bibend;
	return bibString;
};

var CiteItemDialog = React.createClass({
	displayName: "CiteItemDialog",

	getDefaultProps: function getDefaultProps() {
		return {
			freeStyleInput: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			styles: [],
			currentStyle: "",
			citationString: ""
		};
	},
	handleStyleChange: function handleStyleChange(evt) {
		this.setState({ 'collectionKey': evt.target.value });
	},
	openDialog: function openDialog() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	cite: function cite(evt) {
		Z.debug("citeFunction", 3);
		var reactInstance = this;
		var library = this.props.library;
		var style = this.state.currentStyle;

		//get the selected item keys from the items widget
		var itemKeys = Zotero.state.getSelectedItemKeys();

		library.loadFullBib(itemKeys, style).then(function (bibContent) {
			reactInstance.setState({
				citationString: bibContent
			});
			//dialogEl.find(".cite-box-div").html(bibContent);
		})["catch"](Zotero.catchPromiseError);
	},
	getAvailableStyles: function getAvailableStyles() {
		if (!Zotero.styleList) {
			Zotero.styleList = [];
			J.getJSON(Zotero.config.styleListUrl, function (data) {
				Zotero.styleList = data;
			});
		}
	},
	directCite: function directCite(cslItems, style) {
		var data = {};
		data.items = cslItems;
		var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
		return J.post(url, JSON.stringify(data));
	},
	buildBibString: function buildBibString(bib) {
		var bibMeta = bib.bibliography[0];
		var bibEntries = bib.bibliography[1];
		var bibString = bibMeta.bibstart;
		for (var i = 0; i < bibEntries.length; i++) {
			bibString += bibEntries[i];
		}
		bibString += bibMeta.bibend;
		return bibString;
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;

		var freeStyleInput = null;
		if (this.props.freeStyleInput) {
			freeStyleInput = React.createElement("input", { type: "text", className: "free-text-style-input form-control", placeholder: "style" });
		}
		var citationHtml = { "__html": this.state.citationString };

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "cite-item-dialog", className: "cite-item-dialog", role: "dialog", title: "Cite", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Cite Items"
							)
						),
						React.createElement(
							"div",
							{ className: "cite-item-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								null,
								React.createElement(
									"select",
									{ onChange: this.cite, className: "cite-item-select form-control", id: "cite-item-select" },
									React.createElement(
										"option",
										{ value: "" },
										"Select Style"
									),
									React.createElement(
										"option",
										{ value: "apsa" },
										"American Political Science Association"
									),
									React.createElement(
										"option",
										{ value: "apa" },
										"American Psychological Association"
									),
									React.createElement(
										"option",
										{ value: "asa" },
										"American Sociological Association"
									),
									React.createElement(
										"option",
										{ value: "chicago-author-date" },
										"Chicago Manual of Style (Author-Date format)"
									),
									React.createElement(
										"option",
										{ value: "chicago-fullnote-bibliography" },
										"Chicago Manual of Style (Full Note with Bibliography)"
									),
									React.createElement(
										"option",
										{ value: "chicago-note-bibliography" },
										"Chicago Manual of Style (Note with Bibliography)"
									),
									React.createElement(
										"option",
										{ value: "harvard1" },
										"Harvard Reference format 1"
									),
									React.createElement(
										"option",
										{ value: "ieee" },
										"IEEE"
									),
									React.createElement(
										"option",
										{ value: "mhra" },
										"Modern Humanities Research Association"
									),
									React.createElement(
										"option",
										{ value: "mla" },
										"Modern Language Association"
									),
									React.createElement(
										"option",
										{ value: "nlm" },
										"National Library of Medicine"
									),
									React.createElement(
										"option",
										{ value: "nature" },
										"Nature"
									),
									React.createElement(
										"option",
										{ value: "vancouver" },
										"Vancouver"
									)
								),
								freeStyleInput
							),
							React.createElement("div", { id: "cite-box-div", className: "cite-box-div", dangerouslySetInnerHTML: citationHtml })
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							)
						)
					)
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactcollections = {};

Zotero.ui.widgets.reactcollections.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);

	var initialCollectionKey = Zotero.state.getUrlVar('collectionKey');
	var reactInstance = ReactDOM.render(React.createElement(Collections, { library: library, initialCollectionKey: initialCollectionKey }), document.getElementById('collection-list-div'));
	Zotero.ui.widgets.reactcollections.reactInstance = reactInstance;
};

var CollectionRow = React.createClass({
	displayName: 'CollectionRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collection: null,
			selectedCollection: "",
			depth: 0,
			expandedCollections: {}
		};
	},
	handleCollectionClick: function handleCollectionClick(evt) {
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		//if current collect
		Zotero.ui.widgets.reactcollections.reactInstance.setState({ currentCollectionKey: collectionKey });
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = collectionKey;
		Zotero.state.pushState();
	},
	handleTwistyClick: function handleTwistyClick(evt) {
		Z.debug("handleTwistyClick");
		//toggle expanded state for this collection
		evt.preventDefault();
		var collectionKey = this.props.collection.get('collectionKey');
		var exp = this.props.expandedCollections;
		if (exp[collectionKey]) {
			delete exp[collectionKey];
		} else {
			exp[collectionKey] = true;
		}
		Zotero.ui.widgets.reactcollections.reactInstance.setState({ expandedCollections: exp });
	},
	render: function render() {
		//Z.debug("CollectionRow render");
		if (this.props.collection == null) {
			return null;
		}
		var collection = this.props.collection;
		var collectionKey = collection.get('key');
		var selectedCollection = this.props.selectedCollection;
		var expandedCollections = this.props.expandedCollections;
		var expanded = expandedCollections[collectionKey] === true;
		var isSelectedCollection = this.props.selectedCollection == collectionKey;

		var childRows = [];
		collection.children.forEach(function (collection, ind) {
			childRows.push(React.createElement(CollectionRow, {
				key: collection.get('key'),
				collection: collection,
				selectedCollection: selectedCollection,
				expandedCollections: expandedCollections }));
		});
		var childrenList = null;
		if (collection.hasChildren) {
			childrenList = React.createElement(
				'ul',
				{ hidden: !expanded },
				childRows
			);
		}

		var placeholderClasses = "placeholder small-icon light-icon pull-left";
		if (expandedCollections[collectionKey] === true) {
			placeholderClasses += " glyphicon glyphicon-chevron-down clickable";
		} else if (childRows.length > 0) {
			placeholderClasses += " glyphicon glyphicon-chevron-right clickable";
		}

		return React.createElement(
			'li',
			{ className: 'collection-row' },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: placeholderClasses, onClick: this.handleTwistyClick }),
				React.createElement('span', { className: 'fonticon glyphicons glyphicons-folder-open barefonticon' })
			),
			React.createElement(
				'a',
				{ href: collection.websiteCollectionLink, className: isSelectedCollection ? "current-collection" : "", onClick: this.handleCollectionClick },
				collection.get('name')
			),
			childrenList
		);
	}
});

var TrashRow = React.createClass({
	displayName: 'TrashRow',

	getDefaultProps: function getDefaultProps() {
		return {
			collectionKey: "trash",
			selectedCollection: ""
		};
	},
	handleClick: function handleClick() {
		Zotero.state.clearUrlVars(['mode']);
		Zotero.state.pathVars['collectionKey'] = this.props.collectionKey;
		Zotero.state.pushState();
	},
	render: function render() {
		Z.debug("TrashRow render");
		var className = this.props.selectedCollection == this.props.collectionKey ? "collection-row current-collection" : "collection-row";

		return React.createElement(
			'li',
			{ className: className },
			React.createElement(
				'div',
				{ className: 'folder-toggle' },
				React.createElement('span', { className: 'sprite-placeholder sprite-icon-16 pull-left dui-icon' }),
				React.createElement('span', { className: 'glyphicons fonticon glyphicons-bin barefonticon' })
			),
			'Trash'
		);
	}
});

var Collections = React.createClass({
	displayName: 'Collections',

	getDefaultProps: function getDefaultProps() {
		return {
			initialCollectionKey: null
		};
	},
	getInitialState: function getInitialState() {
		return {
			collections: null,
			currentCollectionKey: this.props.initialCollectionKey,
			expandedCollections: {},
			loading: false
		};
	},
	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("collectionsDirty", reactInstance.syncCollections, {});
		library.listen("libraryCollectionsUpdated", function () {
			reactInstance.setState({ collections: library.collections });
		}, {});
		library.listen("cachedDataLoaded", reactInstance.syncCollections, {});
	},
	returnToLibrary: function returnToLibrary(evt) {
		evt.preventDefault();
		this.setState({ currentCollectionKey: null });
		Zotero.state.clearUrlVars();
		Zotero.state.pushState();
	},
	syncCollections: function syncCollections(evt) {
		Zotero.debug("react collections syncCollections", 3);
		var reactInstance = this;
		if (this.state.loading) {
			return;
		}
		var library = this.props.library;

		//update the widget as soon as we have the cached collections
		this.setState({ collections: library.collections, loading: true });

		//sync collections if loaded from cache but not synced
		return library.loadUpdatedCollections().then(function () {
			reactInstance.setState({ collections: library.collections, loading: false });
			library.trigger("libraryCollectionsUpdated");
		}, function (err) {
			//sync failed, but we already had some data, so show that
			Z.error("Error syncing collections");
			Z.error(err);
			reactInstance.setState({ collections: library.collections, loading: false });
			library.trigger("libraryCollectionsUpdated");
			Zotero.ui.jsNotificationMessage("Error loading collections. Collections list may not be up to date", 'error');
		});
	},
	render: function render() {
		Z.debug("Collections render");
		var library = this.props.library;
		var collections = this.state.collections;
		if (collections == null) {
			return null;
		}

		var collectionsArray = this.state.collections.collectionsArray;
		var currentCollectionKey = this.state.currentCollectionKey;
		var libraryUrlIdentifier = "";
		//var libraryUrlIdentifier = (collections == null ? "" : collections.libraryUrlIdentifier);

		//Set of collections in an expanded state
		var expandedCollections = this.state.expandedCollections;

		//path from top level collection to currently selected collection, to ensure that we expand
		//them all and the current collection is visible
		var currentCollectionPath = [];
		if (currentCollectionKey !== null) {
			var currentCollection = collections.getCollection(currentCollectionKey);
			var c = currentCollection;
			while (true) {
				if (c && !c.topLevel) {
					var parentCollectionKey = c.get('parentCollection');
					c = collections.getCollection(parentCollectionKey);
					currentCollectionPath.push(parentCollectionKey);
					expandedCollections[parentCollectionKey] = true;
				} else {
					break;
				}
			}
		}

		var collectionRows = [];
		collectionsArray.forEach(function (collection, ind) {
			if (collection.topLevel) {
				collectionRows.push(React.createElement(CollectionRow, {
					key: collection.get('key'),
					collection: collection,
					selectedCollection: currentCollectionKey,
					expandedCollections: expandedCollections }));
			}
		});

		var libraryClassName = "my-library " + (currentCollectionKey == null ? "current-collection" : "");
		return React.createElement(
			'div',
			{ id: 'collection-list-container', className: 'collection-list-container' },
			React.createElement(
				'ul',
				{ id: 'collection-list' },
				React.createElement(
					'li',
					null,
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-inbox barefonticon' }),
					React.createElement(
						'a',
						{ onClick: this.returnToLibrary, className: libraryClassName, href: library.libraryBaseWebsiteUrl },
						'Library'
					)
				),
				collectionRows
			)
		);
	}
});
/*<LoadingSpinner loading={this.state.loading} />*/
"use strict";

Zotero.ui.widgets.reactcontrolPanel = {};

Zotero.ui.widgets.reactcontrolPanel.init = function (el) {
	Z.debug("Zotero.eventful.init.controlPanel", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ControlPanel, { library: library }), document.getElementById('control-panel'));
	Zotero.ui.widgets.reactcontrolPanel.reactInstance = reactInstance;
};

var GroupsButton = React.createClass({
	displayName: "GroupsButton",

	render: function render() {
		var groupsUrl = "/groups";
		return React.createElement(
			"a",
			{ className: "btn btn-default navbar-btn navbar-left", href: groupsUrl, title: "Groups" },
			React.createElement("span", { className: "glyphicons fonticon glyphicons-group" })
		);
	}
});

var LibraryDropdown = React.createClass({
	displayName: "LibraryDropdown",

	getDefaultProps: function getDefaultProps() {
		return {
			library: null,
			user: false
		};
	},
	getInitialState: function getInitialState() {
		return {
			accessibleLibraries: [],
			loading: false,
			loaded: false
		};
	},
	populateDropdown: function populateDropdown() {
		Z.debug("populateDropdown");
		var reactInstance = this;
		if (this.state.loading || this.state.loaded) {
			return;
		}

		var library = this.props.library;
		if (library == null) {
			return;
		}
		if (!Zotero.config.loggedIn) {
			throw new Error("no logged in userID. Required for libraryDropdown widget");
		}

		var user = Zotero.config.loggedInUser;
		var personalLibraryString = 'u' + user.userID;
		var personalLibraryUrl = Zotero.url.userWebLibrary(user.slug);
		var currentLibraryName = Zotero.config.librarySettings.name;

		this.setState({ loading: true });

		var memberGroups = library.groups.fetchUserGroups(user.userID).then(function (response) {
			Z.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var accessibleLibraries = [];
			if (!(Zotero.config.librarySettings.libraryType == 'user' && Zotero.config.librarySettings.libraryID == user.userID)) {
				accessibleLibraries.push({
					name: 'My Library',
					libraryString: personalLibraryString,
					webUrl: personalLibraryUrl
				});
			}

			for (var i = 0; i < memberGroups.length; i++) {
				if (Zotero.config.librarySettings.libraryType == 'group' && memberGroups[i].get('id') == Zotero.config.librarySettings.libraryID) {
					continue;
				}
				var libraryString = 'g' + memberGroups[i].get('id');
				accessibleLibraries.push({
					name: memberGroups[i].get('name'),
					libraryString: libraryString,
					webUrl: Zotero.url.groupWebLibrary(memberGroups[i])
				});
			}

			reactInstance.setState({ accessibleLibraries: accessibleLibraries, loading: false, loaded: true });
		})["catch"](function (err) {
			Z.error(err);
			Z.error(err.message);
		});
	},
	render: function render() {
		if (this.props.user == false) {
			return null;
		}

		var currentLibraryName = Zotero.config.librarySettings.name;

		var accessibleLibraries = this.state.accessibleLibraries;
		var libraryEntries = accessibleLibraries.map(function (lib) {
			return React.createElement(
				"li",
				{ key: lib.libraryString },
				React.createElement(
					"a",
					{ role: "menuitem", href: lib.webUrl },
					lib.name
				)
			);
		});

		return React.createElement(
			"div",
			{ id: "library-dropdown", className: "eventfulwidget btn-group",
				"data-widget": "libraryDropdown", "data-library": this.props.library.libraryString },
			React.createElement(
				"button",
				{ className: "btn btn-default navbar-btn dropdown-toggle", onClick: this.populateDropdown, "data-toggle": "dropdown", href: "#", title: "Libraries" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-inbox" }),
				React.createElement(
					"span",
					{ className: "current-library-name" },
					currentLibraryName
				),
				React.createElement("span", { className: "caret" })
			),
			React.createElement(
				"ul",
				{ className: "library-dropdown-list dropdown-menu actions-menu" },
				React.createElement(
					"li",
					{ hidden: !this.state.loading },
					React.createElement(
						"a",
						{ role: "menuitem", className: "clickable" },
						"Loading..."
					)
				),
				libraryEntries
			)
		);
	}
});

var ActionsDropdown = React.createClass({
	displayName: "ActionsDropdown",

	getDefaultProps: function getDefaultProps() {
		return {
			itemSelected: false,
			selectedCollection: false,
			library: null
		};
	},
	trashOrDeleteItems: function trashOrDeleteItems(evt) {
		//move currently displayed item or list of selected items to trash
		//or permanently delete items if already in trash
		evt.preventDefault();
		Z.debug('move-to-trash clicked', 3);

		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var response;
		var trashingItems = library.items.getItems(itemKeys);
		var deletingItems = []; //potentially deleting instead of trashing

		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));

		if (Zotero.state.getUrlVar('collectionKey') == 'trash') {
			//items already in trash. delete them
			var i;
			for (i = 0; i < trashingItems.length; i++) {
				var item = trashingItems[i];
				if (item.get('deleted')) {
					//item is already in trash, schedule for actual deletion
					deletingItems.push(item);
				}
			}

			//make request to permanently delete items
			response = library.items.deleteItems(deletingItems);
		} else {
			//items are not in trash already so just add them to it
			response = library.items.trashItems(trashingItems);
		}

		library.dirty = true;
		response["catch"](function () {
			Z.error("Error trashing items");
		}).then(function () {
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		})["catch"](Zotero.catchPromiseError);

		return false; //stop event bubbling
	},
	removeFromTrash: function removeFromTrash(evt) {
		//Remove currently displayed single item or checked list of items from trash
		//when remove-from-trash link clicked
		Z.debug('remove-from-trash clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();

		var untrashingItems = library.items.getItems(itemKeys);

		//show spinner before making the possibly many the ajax requests
		//Zotero.ui.showSpinner(J('#library-items-div'));

		var response = library.items.untrashItems(untrashingItems);

		library.dirty = true;
		response["catch"](function () {}).then(function () {
			Z.debug("post-removeFromTrash always execute: clearUrlVars", 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q']);
			Zotero.state.pushState();
			library.trigger("displayedItemsChanged");
		})["catch"](Zotero.catchPromiseError);

		return false;
	},
	removeFromCollection: function removeFromCollection(evt) {
		//Remove currently displayed single item or checked list of items from
		//currently selected collection
		Z.debug('remove-from-collection clicked', 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = Zotero.state.getUrlVar('collectionKey');

		var modifiedItems = [];
		var responses = [];
		itemKeys.forEach(function (itemKey, index) {
			var item = library.items.getItem(itemKey);
			item.removeFromCollection(collectionKey);
			modifiedItems.push(item);
		});

		library.dirty = true;

		library.items.writeItems(modifiedItems).then(function () {
			Z.debug('removal responses finished. forcing reload', 3);
			Zotero.state.clearUrlVars(['collectionKey', 'tag']);
			Zotero.state.pushState(true);
			library.trigger("displayedItemsChanged");
		})["catch"](Zotero.catchPromiseError);

		return false;
	},
	render: function render() {
		var library = this.props.library;
		var itemSelected = this.props.itemSelected;
		var selectedCollection = this.props.selectedCollection;
		var collectionSelected = selectedCollection != false;

		var showTrashActions = itemSelected && selectedCollection == "trash";
		var showNonTrashActions = itemSelected && selectedCollection != "trash";

		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", href: "#", title: "Actions" },
				"Actions",
				React.createElement("span", { className: "caret" })
			),
			React.createElement(
				"ul",
				{ className: "dropdown-menu actions-menu" },
				React.createElement(
					"li",
					{ className: "permission-edit selected-item-action", hidden: !itemSelected },
					React.createElement(
						"a",
						{ role: "menuitem", className: "eventfultrigger add-to-collection-button clickable", "data-library": library.libraryString, "data-triggers": "addToCollectionDialog", title: "Add to Collection" },
						"Add to Collection"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit selected-item-action selected-collection-action", hidden: !(itemSelected && collectionSelected) },
					React.createElement(
						"a",
						{ onClick: this.removeFromCollection, className: "remove-from-collection-button clickable", title: "Remove from Collection" },
						"Remove from Collection"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit selected-item-action", hidden: !showNonTrashActions },
					React.createElement(
						"a",
						{ onClick: this.trashOrDeleteItems, className: "move-to-trash-button clickable", title: "Move to Trash" },
						"Move to Trash"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit selected-item-action", hidden: !showTrashActions },
					React.createElement(
						"a",
						{ onClick: this.trashOrDeleteItems, className: "permanently-delete-button clickable", title: "Move to Trash" },
						"Permanently Delete"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit selected-item-action", hidden: !showTrashActions },
					React.createElement(
						"a",
						{ onClick: this.removeFromTrash, className: "remove-from-trash-button clickable", title: "Remove from Trash" },
						"Remove from Trash"
					)
				),
				React.createElement("li", { className: "divider permission-edit selected-item-action" }),
				React.createElement(
					"li",
					{ className: "permission-edit" },
					React.createElement(
						"a",
						{ className: "create-collection-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "createCollectionDialog", title: "New Collection" },
						"Create Collection"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit", hidden: !collectionSelected },
					React.createElement(
						"a",
						{ className: "update-collection-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "updateCollectionDialog", title: "Change Collection" },
						"Rename Collection"
					)
				),
				React.createElement(
					"li",
					{ className: "permission-edit", hidden: !collectionSelected },
					React.createElement(
						"a",
						{ className: "delete-collection-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "deleteCollectionDialog", title: "Delete Collection" },
						"Delete Collection"
					)
				),
				React.createElement("li", { className: "divider permission-edit" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "librarySettingsDialog" },
						"Library Settings"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "cite-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "citeItems" },
						"Cite"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "export-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "exportItemsDialog" },
						"Export"
					)
				),
				React.createElement("li", { className: "divider selected-item-action" }),
				React.createElement(
					"li",
					{ className: "selected-item-action", hidden: !itemSelected },
					React.createElement(
						"a",
						{ className: "send-to-library-button eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "sendToLibraryDialog", title: "Copy to Library" },
						"Copy to Library"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "syncLibary" },
						"Sync"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: "#", className: "eventfultrigger clickable", "data-library": library.libraryString, "data-triggers": "deleteIdb" },
						"Delete IDB"
					)
				)
			)
		);
	}
});

var CreateItemDropdown = React.createClass({
	displayName: "CreateItemDropdown",

	getDefaultProps: function getDefaultProps() {
		return {};
	},
	createItem: function createItem(evt) {
		//clear path vars and send to new item page with current collection when create-item-link clicked
		Z.debug("create-item-Link clicked", 3);
		evt.preventDefault();
		var library = this.props.library;
		var itemType = J(evt.target).data('itemtype');
		library.trigger("createItem", { itemType: itemType });
		return false;
	},
	render: function render() {
		var reactInstance = this;
		var libraryString = "";
		var itemTypes = Object.keys(Zotero.Item.prototype.typeMap);
		itemTypes = itemTypes.sort();
		var nodes = itemTypes.map(function (itemType, ind) {
			return React.createElement(
				"li",
				{ key: itemType },
				React.createElement(
					"a",
					{ onClick: reactInstance.createItem, href: "#", "data-itemtype": itemType },
					Zotero.Item.prototype.typeMap[itemType]
				)
			);
		});

		var buttonClass = "create-item-button btn btn-default navbar-btn dropdown-toggle";
		if (Zotero.state.getUrlVar('collectionKey') == 'trash') {
			buttonClass += " disabled";
		}

		return React.createElement(
			"div",
			{ className: "btn-group create-item-dropdown permission-edit" },
			React.createElement(
				"button",
				{ type: "button", className: buttonClass, "data-toggle": "dropdown", title: "New Item" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-plus" })
			),
			React.createElement(
				"ul",
				{ className: "dropdown-menu", role: "menu", style: { maxHeight: "300px", overflow: "auto" } },
				nodes
			)
		);
	}
});

var ControlPanel = React.createClass({
	displayName: "ControlPanel",

	componentWillMount: function componentWillMount() {
		reactInstance = this;
		library = this.props.library;

		reactInstance.setState({ user: Zotero.config.loggedInUser });

		library.listen("selectedItemsChanged", function (evt) {
			var selectedItemKeys = evt.selectedItemKeys;
			reactInstance.setState({ selectedItems: selectedItemKeys });
		}, {});

		library.listen("selectedCollectionChanged", function (evt) {
			var selectedCollection = Zotero.state.getUrlVar('collectionKey');
			reactInstance.setState({ selectedCollection: selectedCollection });
		}, {});
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},
	getInitialState: function getInitialState() {
		return {
			user: false,
			canEdit: false,
			selectedItems: [],
			selectedCollection: null
		};
	},
	render: function render() {
		return React.createElement(
			"div",
			{ id: "control-panel", className: "nav navbar-nav", role: "navigation" },
			React.createElement(
				"div",
				{ className: "btn-toolbar navbar-left" },
				React.createElement(GroupsButton, { library: this.props.library }),
				React.createElement(LibraryDropdown, { user: this.state.user, library: this.props.library }),
				React.createElement(ActionsDropdown, { library: this.props.library, itemSelected: this.state.selectedItems.length > 0, selectedCollection: this.state.selectedCollection }),
				React.createElement(CreateItemDropdown, { library: this.props.library })
			)
		);
	}
});
/*<li><a href="#" className="share-button eventfultrigger clickable" data-library={library.libraryString} data-triggers="shareToDocs">Share To Docs</a></li>*/
"use strict";

Zotero.ui.widgets.reactcreateCollectionDialog = {};

Zotero.ui.widgets.reactcreateCollectionDialog.init = function (el) {
	Z.debug("createcollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CreateCollectionDialog, { library: library }), document.getElementById('create-collection-dialog'));
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;

	library.listen("createCollectionDialog", function () {
		reactInstance.forceUpdate();
		reactInstance.openDialog();
	}, {});
};

var CreateCollectionDialog = React.createClass({
	displayName: "CreateCollectionDialog",

	getInitialState: function getInitialState() {
		return {
			collectionName: "",
			parentCollection: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		Z.debug(evt);
		Z.debug(evt.target.value);
		this.setState({ 'parentCollection': evt.target.value });
	},
	handleNameChange: function handleNameChange(evt) {
		this.setState({ 'collectionName': evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	createCollection: function createCollection() {
		Z.debug("react createCollection");
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if (name == "") {
			name = "Untitled";
		}

		library.addCollection(name, parentKey).then(function (responses) {
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState();
			reactInstance.closeDialog();
			Zotero.ui.jsNotificationMessage("Collection Created", 'success');
		})["catch"](function (error) {
			Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
			reactInstance.closeDialog();
		});
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});
		collectionOptions.unshift(React.createElement(
			"option",
			{ key: "emptyvalue", value: "" },
			"None"
		));

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "create-collection-dialog", className: "create-collection-dialog", role: "dialog", title: "Create Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Create Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "new-collection-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-title-input" },
										"Collection Name"
									),
									React.createElement("input", { onChange: this.handleNameChange, className: "new-collection-title-input form-control", type: "text" })
								),
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-collection-parent" },
										"Parent Collection"
									),
									React.createElement(
										"select",
										{ onChange: this.handleCollectionChange, className: "collectionKey-select new-collection-parent form-control", defaultValue: "" },
										collectionOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.createCollection, className: "btn btn-primary createButton" },
								"Create"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactcreateItemDialog = {};

Zotero.ui.widgets.reactcreateItemDialog.init = function (el) {
	Z.debug("createItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(CreateItemDialog, { library: library }), document.getElementById('create-item-dialog'));

	library.listen("createItem", function (evt) {
		Z.debug("Opening createItem dialog");
		Z.debug(evt);
		var itemType = evt.itemType;
		Z.debug(itemType);
		reactInstance.setState({ itemType: itemType });
		reactInstance.openDialog();
	}, {});
};

var CreateItemDialog = React.createClass({
	displayName: "CreateItemDialog",

	getInitialState: function getInitialState() {
		return {
			title: "",
			itemType: "document"
		};
	},
	handleTitleChange: function handleTitleChange(evt) {
		this.setState({ 'title': evt.target.value });
	},
	createItem: function createItem() {
		var reactInstance = this;
		var library = this.props.library;
		var itemType = this.state.itemType;
		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var title = reactInstance.state.title;
		if (title == "") {
			title = "Untitled";
		}

		var item = new Zotero.Item();
		item.initEmpty(itemType).then(function () {
			item.associateWithLibrary(library);
			item.set('title', title);
			if (currentCollectionKey) {
				item.addToCollection(currentCollectionKey);
			}
			return Zotero.ui.saveItem(item);
		}).then(function (responses) {
			var itemKey = item.get('key');
			Zotero.state.setUrlVar('itemKey', itemKey);
			Zotero.state.pushState();
			reactInstance.closeDialog();
		})["catch"](function (error) {
			Zotero.error(error);
			Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
			reactInstance.closeDialog();
		});
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "create-item-dialog", className: "create-item-dialog", role: "dialog", title: "Create Item", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Create Item"
							)
						),
						React.createElement(
							"div",
							{ className: "new-item-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ method: "POST" },
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "new-item-title-input" },
										"Title"
									),
									React.createElement("input", { onChange: this.handleTitleChange, id: "new-item-title-input", className: "new-item-title-input form-control", type: "text" })
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.createItem, className: "btn btn-primary createButton" },
								"Create"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactdeleteCollectionDialog = {};

Zotero.ui.widgets.reactdeleteCollectionDialog.init = function (el) {
	Z.debug("deletecollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(DeleteCollectionDialog, { library: library }), document.getElementById('delete-collection-dialog'));

	library.listen("deleteCollectionDialog", function () {
		reactInstance.setState({ collectionKey: Zotero.state.getUrlVar("collectionKey") });
		reactInstance.openDialog();
	}, { widgetEl: el });
};

var DeleteCollectionDialog = React.createClass({
	displayName: "DeleteCollectionDialog",

	getInitialState: function getInitialState() {
		return {
			collectionKey: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'parentCollection': evt.target.value });
	},
	deleteCollection: function deleteCollection() {
		Z.debug("DeleteCollectionDialog.deleteCollection", 3);
		var reactInstance = this;
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if (!collection) {
			Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
			return false;
		}
		collection.remove().then(function () {
			delete Zotero.state.pathVars['collectionKey'];
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			Zotero.state.pushState();
			Zotero.ui.jsNotificationMessage(collection.get('title') + " removed", 'confirm');
			reactInstance.closeDialog();
		})["catch"](Zotero.catchPromiseError);
		return false;
	},
	openDialog: function openDialog() {
		if (!this.state.collectionKey) {
			Z.error("DeleteCollectionDialog opened with no collectionKey");
		}
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if (!collection) {
			return null;
		}

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "delete-collection-dialog", className: "delete-collection-dialog", role: "dialog", title: "Delete Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Delete Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "delete-collection-div modal-body" },
							React.createElement(
								"p",
								null,
								"Really delete collection \"",
								collection.get('title'),
								"\"?"
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.deleteCollection, className: "btn btn-primary deleteButton" },
								"Delete"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactexportItemsDialog = {};

Zotero.ui.widgets.reactexportItemsDialog.init = function (el) {
	Z.debug("exportItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ExportItemsDialog, { library: library }), document.getElementById('export-dialog'));

	library.listen("exportItemsDialog", function () {
		Z.debug("opening export dialog");
		reactInstance.openDialog();
	}, {});
	library.listen("displayedItemsChanged", function () {
		reactInstance.forceUpdate();
	}, {});
};

var ExportItemsDialog = React.createClass({
	displayName: "ExportItemsDialog",

	getInitialState: function getInitialState() {
		return {};
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var exportUrls = Zotero.url.exportUrls(urlconfig);

		var exportNodes = Object.keys(exportUrls).map(function (key) {
			var exportUrl = exportUrls[key];
			return React.createElement(
				"li",
				{ key: key },
				React.createElement(
					"a",
					{ href: exportUrl, target: "_blank", className: "export-link", "data-exportformat": key },
					Zotero.config.exportFormatsMap[key]
				)
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "export-items-dialog", className: "export-items-dialog", role: "dialog", title: "Library Settings", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Export"
							)
						),
						React.createElement(
							"div",
							{ className: "modal-body", "data-role": "content" },
							React.createElement(
								"div",
								{ className: "export-list" },
								React.createElement(
									"ul",
									{ id: "export-formats-ul" },
									exportNodes
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							)
						)
					)
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactfilterGuide = {};

Zotero.ui.widgets.reactfilterGuide.init = function (el) {
	Z.debug('widgets.filterGuide.init', 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(FilterGuide, { library: library }), document.getElementById('filter-guide'));

	library.listen("displayedItemsChanged", reactInstance.refreshFilters, {});
	library.listen("displayedItemChanged", reactInstance.refreshFilters, {});
	library.listen("updateFilterGuide", reactInstance.refreshFilters, {});
	library.listen("selectedCollectionChanged", reactInstance.refreshFilters, {});
	library.listen("cachedDataLoaded", reactInstance.refreshFilters, {});
	library.listen("libraryCollectionsUpdated", reactInstance.refreshFilters, {});
};

var FilterGuide = React.createClass({
	displayName: 'FilterGuide',

	getInitialState: function getInitialState() {
		return {
			collectionKey: "",
			tags: [],
			query: ""
		};
	},
	refreshFilters: function refreshFilters(evt) {
		var library = this.props.library;
		var displayConfig = Zotero.ui.getItemsConfig(library);
		this.setState({
			collectionKey: displayConfig['collectionKey'],
			tags: displayConfig['tag'],
			query: displayConfig['q']
		});
	},
	clearFilter: function clearFilter(evt) {
		evt.preventDefault();
		Z.debug('widgets.filterGuide.clearFilter', 3);
		var library = this.props.library;
		var target = J(evt.currentTarget);
		var collectionKey = target.data('collectionkey');
		var tag = target.data('tag');
		var query = target.data('query');
		if (collectionKey) {
			Zotero.state.unsetUrlVar('collectionKey');
			this.setState({ collectionKey: "" });
		}
		if (tag) {
			Zotero.state.toggleTag(tag);
			this.setState({ tags: Zotero.state.getUrlVar('tag') });
		}
		if (query) {
			library.trigger('clearLibraryQuery');
			this.setState({ query: "" });
			return;
		}
		Zotero.state.pushState();
	},
	render: function render() {
		var library = this.props.library;
		var collectionNodes = null;
		var tagNodes = null;
		var searchNodes = null;

		if (this.state.collectionKey != "") {
			var collection = library.collections.getCollection(this.state.collectionKey);
			if (collection) {
				collectionNodes = React.createElement(
					'li',
					{ className: 'filterguide-entry' },
					React.createElement(
						'a',
						{ onClick: this.clearFilter, href: '#', 'data-collectionkey': this.state.collectionKey },
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-folder-open' }),
						React.createElement(
							'span',
							{ className: 'filterguide-label' },
							collection.get('name')
						),
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
					)
				);
			}
		}
		if (this.state.tags) {
			tagNodes = this.state.tags.map(function (tag) {
				return React.createElement(
					'li',
					{ className: 'filterguide-entry' },
					React.createElement(
						'a',
						{ onClick: this.clearFilter, href: '#', 'data-tag': tag },
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-tag' }),
						React.createElement(
							'span',
							{ className: 'filterguide-label' },
							tag
						),
						React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
					)
				);
			});
		}
		if (this.state.query) {
			searchNodes = React.createElement(
				'li',
				{ className: 'filterguide-entry' },
				React.createElement(
					'a',
					{ onClick: this.clearFilter, href: '#', 'data-query': this.state.query },
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-search' }),
					React.createElement(
						'span',
						{ className: 'filterguide-label' },
						this.state.query
					),
					React.createElement('span', { className: 'glyphicons fonticon glyphicons-remove' })
				)
			);
		}

		return React.createElement(
			'div',
			{ className: 'filter-guide col-12' },
			React.createElement(
				'ul',
				{ className: 'filterguide-list' },
				collectionNodes,
				tagNodes,
				searchNodes
			)
		);
	}
});
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Zotero.ui.widgets.reactitem = {};
//TODO: trigger showChildren with an extra itemID filter so quick clicks back and forth
//between items don't overwrite with the wrong children?
Zotero.ui.widgets.reactitem.init = function (el) {
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ItemDetails, { library: library }), document.getElementById('item-widget-div'));
	Zotero.ui.widgets.reactitem.reactInstance = reactInstance;
};

Zotero.ui.editMatches = function (props, edit) {
	//Z.debug("Zotero.ui.editMatches");
	//Z.debug(props);
	//Z.debug(edit);
	if (props === null || edit === null) {
		return false;
	}
	if (edit.field != props.field) {
		return false;
	}
	//field is the same, make sure index matches if set
	if (edit.creatorIndex != props.creatorIndex) {
		//Z.debug("creatorIndex mismatch");
		return false;
	}
	if (props.tagIndex != edit.tagIndex) {
		//Z.debug("tagIndex mismatch");
		return false;
	}
	return true;
};

Zotero.ui.genericDisplayedFields = function (item) {
	var genericDisplayedFields = Object.keys(item.apiObj.data).filter(function (field) {
		if (item.hideFields.indexOf(field) != -1) {
			return false;
		}
		if (!item.fieldMap.hasOwnProperty(field)) {
			return false;
		}
		if (field == "title" || field == "creators" || field == "itemType") {
			return false;
		}
		return true;
	});
	return genericDisplayedFields;
};

Zotero.ui.widgets.reactitem.editFields = function (item) {
	var fields = [{ field: "itemType" }, { field: "title" }];
	var creators = item.get('creators');
	creators.forEach(function (k, i) {
		fields.push({ field: "creatorType", creatorIndex: i });
		if (k.name) {
			fields.push({ field: "name", creatorIndex: i });
		} else {
			fields.push({ field: "lastName", creatorIndex: i });
			fields.push({ field: "firstName", creatorIndex: i });
		}
	});

	var genericFields = Zotero.ui.genericDisplayedFields(item);
	genericFields.forEach(function (k, i) {
		fields.push({ field: k });
	});
	return fields;
};

//take an edit object and return the edit object selecting the next field of the item
Zotero.ui.widgets.reactitem.nextEditField = function (item, edit) {
	if (!edit || !edit.field) {
		return null;
	}
	var editFields = Zotero.ui.widgets.reactitem.editFields(item);
	var curFieldIndex;
	for (var i = 0; i < editFields.length; i++) {
		if (editFields[i].field == edit.field) {
			if (editFields[i].creatorIndex == edit.creatorIndex) {
				curFieldIndex = i;
			}
		}
	}
	if (curFieldIndex == editFields.length) {
		return editFields[0];
	} else {
		return editFields[i + 1];
	}
	/*
 //special case if editing a creator
 switch(edit.field) {
 	case "title":
 		return {
 			creatorIndex: 0,
 			field: "creatorType"
 		};
 		break;
 	case "creatorType":
 		var creators = item.get('creators');
 		var creator = creators[edit.creatorIndex];
 		if(creator.name){
 			return {
 				creatorIndex: edit.creatorIndex,
 				field: "name"
 			};
 		} else {
 			return {
 				creatorIndex: edit.creatorIndex,
 				field: "lastName"
 			};
 		}
 		break;
 	case "lastName":
 		return {
 			creatorIndex: edit.creatorIndex + 1,
 			field: "firstName"
 		};
 		break;
 	case "name":
 	case "firstName":
 		//move to next creator, or fields after creators
 		if(edit.creatorIndex < creators.length){
 			return {
 				creatorIndex: edit.creatorIndex + 1,
 				field:"creatorType"
 			}
 		} else {
 			//move to first field after creators
 			var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
 			return {
 				field: genericDisplayedFields[0]
 			}
 		}
 		break;
 	default:
 		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
 		//if currently at the last field, go back up to title
 		if(genericDisplayedFields[genericDisplayedFields.length - 1] == edit.field){
 			return {
 				field:"title"
 			};
 		}
 		//otherwise, return the field at current edit field + 1
 		for(var i = 0; i < genericDisplayedFields.length; i++){
 			if(edit.field == genericDisplayedFields[i]){
 				return {
 					field:genericDisplayedFields[i + 1]
 				};
 			}
 		}
 }
 */
};

var CreatorRow = React.createClass({
	displayName: "CreatorRow",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			library: null,
			creatorIndex: 0,
			edit: null
		};
	},
	render: function render() {
		//Z.debug("CreatorRow render");
		if (this.props.item == null) {
			return null;
		}
		var item = this.props.item;
		var creator = item.get('creators')[this.props.creatorIndex];
		var edit = this.props.edit;
		var nameSpans = null;
		if (creator.name && creator.name != "") {
			nameSpans = React.createElement(ItemField, _extends({}, this.props, { key: "name", field: "name" }));
		} else {
			nameSpans = [React.createElement(ItemField, _extends({}, this.props, { key: "lastName", field: "lastName" })), ", ", React.createElement(ItemField, _extends({}, this.props, { key: "firstName", field: "firstName" }))];
		}
		return React.createElement(
			"tr",
			{ className: "creator-row" },
			React.createElement(
				"th",
				null,
				React.createElement(ItemField, _extends({}, this.props, { field: "creatorType" }))
			),
			React.createElement(
				"td",
				null,
				nameSpans,
				React.createElement(
					"div",
					{ className: "btn-toolbar", role: "toolbar" },
					React.createElement(ToggleCreatorFieldButton, this.props),
					React.createElement(AddRemoveCreatorFieldButtons, this.props)
				)
			)
		);
	}
});

var ToggleCreatorFieldButton = React.createClass({
	displayName: "ToggleCreatorFieldButton",

	render: function render() {
		//Z.debug("ToggleCreatorFieldButton render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "switch-two-field-creator-link btn btn-default",
					title: "Toggle single field creator",
					"data-itemkey": this.props.item.get('key'),
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.switchCreatorFields },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-unchecked" })
			)
		);
	},
	switchCreatorFields: function switchCreatorFields(evt) {
		//Z.debug("CreatorRow switchCreatorFields");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		var creator = creators[creatorIndex];

		//split a single name creator into first/last, or combine first/last
		//into a single name
		if (creator.name !== undefined) {
			var split = creator.name.split(' ');
			if (split.length > 1) {
				creator.lastName = split.splice(-1, 1)[0];
				creator.firstName = split.join(' ');
			} else {
				creator.lastName = creator.name;
				creator.firstName = '';
			}
			delete creator.name;
		} else {
			if (creator.firstName === "" && creator.lastName === "") {
				creator.name = "";
			} else {
				creator.name = creator.firstName + ' ' + creator.lastName;
			}
			delete creator.firstName;
			delete creator.lastName;
		}

		creators[creatorIndex] = creator;
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	}
});

var AddRemoveCreatorFieldButtons = React.createClass({
	displayName: "AddRemoveCreatorFieldButtons",

	render: function render() {
		//Z.debug("AddRemoveCreatorFieldButtons render");
		return React.createElement(
			"div",
			{ className: "btn-group" },
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default",
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.removeCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-minus" })
			),
			React.createElement(
				"button",
				{ type: "button",
					className: "btn btn-default",
					"data-creatorindex": this.props.creatorIndex,
					onClick: this.addCreator },
				React.createElement("span", { className: "fonticon glyphicons glyphicons-plus" })
			)
		);
	},
	addCreator: function addCreator(evt) {
		Z.debug("addCreator");
		var item = this.props.item;
		var creatorIndex = this.props.creatorIndex;
		var creators = item.get('creators');
		var newCreator = { creatorType: "author", firstName: "", lastName: "" };
		creators.splice(creatorIndex + 1, 0, newCreator);
		Zotero.ui.widgets.reactitem.reactInstance.setState({
			item: item,
			edit: {
				field: "lastName",
				creatorIndex: creatorIndex + 1
			}
		});
	},
	removeCreator: function removeCreator(evt) {
		Z.debug("removeCreator");
		var creatorIndex = this.props.creatorIndex;
		var item = this.props.item;
		var creators = item.get('creators');
		creators.splice(creatorIndex, 1);
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	}
});

var ItemNavTabs = React.createClass({
	displayName: "ItemNavTabs",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null
		};
	},
	render: function render() {
		Z.debug("ItemNavTabs render");
		if (this.props.item == null) {
			return null;
		}
		if (!this.props.item.isSupplementaryItem()) {
			return React.createElement(
				"ul",
				{ className: "nav nav-tabs", role: "tablist" },
				React.createElement(
					"li",
					{ role: "presentation", className: "active" },
					React.createElement(
						"a",
						{ href: "#item-info-panel", "aria-controls": "item-info-panel", role: "tab", "data-toggle": "tab" },
						"Info"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-children-panel", "aria-controls": "item-children-panel", role: "tab", "data-toggle": "tab" },
						"Children"
					)
				),
				React.createElement(
					"li",
					{ role: "presentation" },
					React.createElement(
						"a",
						{ href: "#item-tags-panel", "aria-controls": "item-tags-panel", role: "tab", "data-toggle": "tab" },
						"Tags"
					)
				)
			);
		}
		return null;
	}
});

var ItemFieldRow = React.createClass({
	displayName: "ItemFieldRow",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			edit: null
		};
	},
	render: function render() {
		//Z.debug("ItemFieldRow render");
		var item = this.props.item;
		var field = this.props.field;
		var placeholderOrValue = React.createElement(ItemField, { item: item, field: field, edit: this.props.edit });

		if (field == 'url') {
			var url = item.get('url');
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: url },
						item.fieldMap[field]
					)
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else if (field == 'DOI') {
			var doi = item.get('DOI');
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					React.createElement(
						"a",
						{ rel: "nofollow", href: 'http://dx.doi.org/' + doi },
						item.fieldMap[field]
					)
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else if (Zotero.config.richTextFields[field]) {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					item.fieldMap[field],
					"}"
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		} else {
			return React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					item.fieldMap[field] || field
				),
				React.createElement(
					"td",
					{ className: field },
					placeholderOrValue
				)
			);
		}
	}
});

//set onChange
var ItemField = React.createClass({
	displayName: "ItemField",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			field: null,
			edit: null,
			creatorIndex: null,
			tagIndex: null
		};
	},
	handleChange: function handleChange(evt) {
		Z.debug("change on ItemField");
		Z.debug(evt);
		//set field to new value
		var item = this.props.item;
		switch (this.props.field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				var creators = item.get('creators');
				var creator = creators[this.props.creatorIndex];
				creator[this.props.field] = evt.target.value;
				break;
			case "tag":
				var tags = item.get('tags');
				var tag = tags[this.props.tagIndex];
				tag.tag = evt.target.value;
				break;
			default:
				item.set(this.props.field, evt.target.value);
		}
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	handleBlur: function handleBlur(evt) {
		Z.debug("blur on ItemField");
		//save item, move edit to next field
		Z.debug("handleBlur");
		this.handleChange(evt);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ edit: null });
		Zotero.ui.saveItem(this.props.item);
	},
	handleFocus: function handleFocus(evt) {
		Z.debug("focus on ItemField");
		var field = J(evt.target).data('field');
		var creatorIndex = J(evt.target).data('creatorindex');
		var tagIndex = J(evt.target).data('tagindex');
		var edit = {
			field: field,
			creatorIndex: creatorIndex,
			tagIndex: tagIndex
		};
		Z.debug(edit);
		Zotero.ui.widgets.reactitem.reactInstance.setState({
			edit: edit
		});
	},
	checkKey: function checkKey(evt) {
		Z.debug("ItemField checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER) {
			Z.debug("ItemField checkKey enter");
			Z.debug(evt);
			//var nextEdit = Zotero.ui.widgets.reactitem.nextEditField(this.props.item, this.props.edit);
			J(evt.target).blur();
			//Zotero.ui.widgets.reactitem.reactInstance.setState({edit:nextEdit});
		}
	},
	render: function render() {
		//Z.debug("ItemField render");
		var item = this.props.item;
		var field = this.props.field;
		var creatorField = false;
		var tagField = false;
		var value;
		switch (field) {
			case "creatorType":
			case "name":
			case "firstName":
			case "lastName":
				creatorField = true;
				var creatorIndex = this.props.creatorIndex;
				var creator = item.get('creators')[creatorIndex];
				value = creator[field];
				var creatorPlaceHolders = {
					'name': '(name)',
					'lastName': '(Last Name)',
					'firstName': '(First Name)'
				};

				break;
			case "tag":
				tagField = true;
				var tagIndex = this.props.tagIndex;
				var tag = item.get('tags')[tagIndex];
				value = tag.tag;
				break;
			default:
				value = item.get(field);
		}

		var editThisField = Zotero.ui.editMatches(this.props, this.props.edit);
		if (!editThisField) {
			var spanProps = {
				className: "editable-item-field",
				tabIndex: 0,
				"data-field": field,
				onFocus: this.handleFocus
			};

			if (creatorField) {
				spanProps['data-creatorindex'] = this.props.creatorIndex;
				var p = value == "" ? creatorPlaceHolders[field] : value;
			} else if (tagField) {
				spanProps['data-tagindex'] = this.props.tagIndex;
				var p = value;
			} else {
				var p = value == "" ? React.createElement("div", { className: "empty-field-placeholder" }) : Zotero.ui.formatItemField(field, item);
			}
			return React.createElement(
				"span",
				spanProps,
				p
			);
		}

		var focusEl = function focusEl(el) {
			if (el != null) {
				el.focus();
			}
		};

		var inputProps = {
			className: "form-control item-field-control " + this.props.field,
			name: field,
			defaultValue: value,
			//onChange: this.handleChange,
			onKeyDown: this.checkKey,
			onBlur: this.handleBlur,
			creatorindex: this.props.creatorIndex,
			tagindex: this.props.tagIndex,
			ref: focusEl
		};
		if (creatorField) {
			inputProps.placeholder = creatorPlaceHolders[field];
		}

		switch (this.props.field) {
			case null:
				return null;
				break;
			case 'itemType':
				var itemTypeOptions = item.itemTypes.map(function (itemType) {
					return React.createElement(
						"option",
						{ key: itemType.itemType,
							label: itemType.localized,
							value: itemType.itemType },
						itemType.localized
					);
				});
				return React.createElement(
					"select",
					inputProps,
					itemTypeOptions
				);
				break;
			case 'creatorType':
				var creatorTypeOptions = item.creatorTypes[item.get('itemType')].map(function (creatorType) {
					return React.createElement(
						"option",
						{ key: creatorType.creatorType,
							label: creatorType.localized,
							value: creatorType.creatorType
						},
						creatorType.localized
					);
				});
				return React.createElement(
					"select",
					_extends({ id: "creatorType" }, inputProps, { "data-creatorindex": this.props.creatorIndex }),
					creatorTypeOptions
				);
				break;
			default:
				if (Zotero.config.largeFields[this.props.field]) {
					return React.createElement("textarea", inputProps);
				} else if (Zotero.config.richTextFields[this.props.field]) {
					return React.createElement("textarea", _extends({}, inputProps, { className: "rte default" }));
				} else {
					//default single line input field
					return React.createElement("input", _extends({ type: "text" }, inputProps));
				}
		}
	}
});

var ItemInfoPanel = React.createClass({
	displayName: "ItemInfoPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			item: null,
			loading: false,
			edit: null
		};
	},
	render: function render() {
		Z.debug("ItemInfoPanel render");
		var reactInstance = this;
		var library = this.props.library;
		var item = this.props.item;
		Z.debug("ItemInfoPanel render: items.totalResults: " + library.items.totalResults);
		var itemCountP = React.createElement(
			"p",
			{ className: "item-count", hidden: !this.props.libraryItemsLoaded },
			library.items.totalResults + " items in this view"
		);

		var edit = this.props.edit;

		if (item == null) {
			return React.createElement(
				"div",
				{ id: "item-info-panel", role: "tabpanel", className: "item-details-div tab-pane active" },
				React.createElement(LoadingSpinner, { loading: this.props.loading }),
				itemCountP
			);
		}

		var itemKey = item.get('key');
		var libraryType = item.owningLibrary.libraryType;
		var parentUrl = false;
		if (item.get("parentItem")) {
			parentUrl = library.websiteUrl({ itemKey: item.get("parentItem") });
		}

		var parentLink = parentUrl ? React.createElement(
			"a",
			{ href: parentUrl, className: "item-select-link", "data-itemkey": item.get('parentItem') },
			"Parent Item"
		) : null;
		var libraryIDSpan;
		if (libraryType == "user") {
			libraryIDSpan = React.createElement("span", { id: "libraryUserID", title: item.apiObj.library.id });
		} else {
			libraryIDSpan = React.createElement("span", { id: "libraryGroupID", title: item.apiObj.library.id });
		}

		//the Zotero user that created the item, if it's a group library item
		var zoteroItemCreatorRow = null;
		if (libraryType == "group") {
			zoteroItemCreatorRow = React.createElement(
				"tr",
				null,
				React.createElement(
					"th",
					null,
					"Added by"
				),
				React.createElement(
					"td",
					{ className: "user-creator" },
					React.createElement(
						"a",
						{ href: item.apiObj.meta.createdByUser.links.alternate.href, className: "user-link" },
						item.apiObj.meta.createdByUser.name
					)
				)
			);
		}

		var creatorRows = [];
		var creators = item.get('creators');
		if (creators.length == 0) {
			creators.push({
				lastName: "",
				firstName: ""
			});
		}

		if (item.isSupplementaryItem()) {
			creatorRows = null;
		} else {
			creatorRows = item.get('creators').map(function (creator, ind) {
				return React.createElement(CreatorRow, { key: ind, library: library, creatorIndex: ind, item: item, edit: edit });
			});
		}

		var genericFieldRows = [];
		//filter out fields we don't want to display or don't want to include as generic
		var genericDisplayedFields = Zotero.ui.genericDisplayedFields(item);
		genericDisplayedFields.forEach(function (key) {
			genericFieldRows.push(React.createElement(ItemFieldRow, _extends({ key: key }, reactInstance.props, { field: key })));
		});

		var typeAndTitle = ["itemType", "title"].map(function (key) {
			return React.createElement(ItemFieldRow, _extends({ key: key }, reactInstance.props, { field: key }));
		});

		return React.createElement(
			"div",
			{ id: "item-info-panel", role: "tabpanel", className: "item-details-div tab-pane active" },
			React.createElement(LoadingSpinner, { loading: this.props.loading }),
			parentLink,
			libraryIDSpan,
			React.createElement(
				"table",
				{ className: "item-info-table table", "data-itemkey": itemKey },
				React.createElement(
					"tbody",
					null,
					zoteroItemCreatorRow,
					typeAndTitle,
					creatorRows,
					genericFieldRows
				)
			)
		);
	}
});

var TagListRow = React.createClass({
	displayName: "TagListRow",

	getDefaultProps: function getDefaultProps() {
		return {
			tagIndex: 0,
			tag: { tag: "" },
			item: null,
			library: null,
			edit: null
		};
	},
	removeTag: function removeTag(evt) {
		var tag = this.props.tag.tag;
		var item = this.props.item;
		var tagIndex = this.props.tagIndex;

		var tags = item.get('tags');
		tags.splice(tagIndex, 1);
		Zotero.ui.saveItem(item);
		Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
	},
	render: function render() {
		//Z.debug("TagListRow render");
		return React.createElement(
			"div",
			{ className: "row item-tag-row" },
			React.createElement(
				"div",
				{ className: "col-xs-1" },
				React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
			),
			React.createElement(
				"div",
				{ className: "col-xs-9" },
				React.createElement(ItemField, _extends({}, this.props, { field: "tag" }))
			),
			React.createElement(
				"div",
				{ className: "col-xs-2" },
				React.createElement(
					"button",
					{ type: "button", className: "remove-tag-link btn btn-default", onClick: this.removeTag },
					React.createElement("span", { className: "glyphicons fonticon glyphicons-minus" })
				)
			)
		);
	}
});

var ItemTagsPanel = React.createClass({
	displayName: "ItemTagsPanel",

	getInitialState: function getInitialState() {
		return {
			newTagString: ""
		};
	},
	newTagChange: function newTagChange(evt) {
		this.setState({ newTagString: evt.target.value });
	},
	//add the new tag to the item and save if keydown is ENTER
	checkKey: function checkKey(evt) {
		Z.debug("New tag checkKey");
		evt.stopPropagation();
		if (evt.keyCode === Zotero.ui.keyCode.ENTER) {
			Z.debug(evt);
			var item = this.props.item;
			var tags = item.get('tags');
			tags.push({
				tag: evt.target.value
			});
			Zotero.ui.saveItem(item);
			this.setState({ newTagString: "" });
			Zotero.ui.widgets.reactitem.reactInstance.setState({ item: item });
		}
	},
	render: function render() {
		Z.debug("ItemTagsPanel render");
		var reactInstance = this;
		var item = this.props.item;
		var library = this.props.library;
		if (item == null) {
			return React.createElement("div", { id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" });
		}
		var tagRows = [];
		var tagRows = item.apiObj.data.tags.map(function (tag, ind) {
			return React.createElement(TagListRow, _extends({ key: tag.tag }, reactInstance.props, { tag: tag, tagIndex: ind }));
		});

		return React.createElement(
			"div",
			{ id: "item-tags-panel", role: "tabpanel", className: "item-tags-div tab-pane" },
			React.createElement(
				"p",
				null,
				React.createElement(
					"span",
					{ className: "tag-count" },
					item.get('tags').length
				),
				" tags"
			),
			React.createElement(
				"button",
				{ className: "add-tag-button btn btn-default" },
				"Add Tag"
			),
			React.createElement(
				"div",
				{ className: "item-tags-list" },
				tagRows
			),
			React.createElement(
				"div",
				{ className: "add-tag-form form-horizontal" },
				React.createElement(
					"div",
					{ className: "form-group" },
					React.createElement(
						"div",
						{ className: "col-xs-1" },
						React.createElement(
							"label",
							{ htmlFor: "add-tag-input" },
							React.createElement("span", { className: "glyphicons fonticon glyphicons-tag" })
						)
					),
					React.createElement(
						"div",
						{ className: "col-xs-11" },
						React.createElement("input", { type: "text", onKeyDown: this.checkKey, onChange: this.newTagChange, value: this.state.newTagString, id: "add-tag-input", className: "add-tag-input form-control" })
					)
				)
			)
		);
	}
});

var ItemChildrenPanel = React.createClass({
	displayName: "ItemChildrenPanel",

	getDefaultProps: function getDefaultProps() {
		return {
			childItems: []
		};
	},
	triggerUpload: function triggerUpload() {
		this.props.library.trigger("uploadAttachment");
	},
	render: function render() {
		Z.debug("ItemChildrenPanel render");
		var childListEntries = this.props.childItems.map(function (item, ind) {
			var title = item.get('title');
			var href = Zotero.url.itemHref(item);
			var iconClass = item.itemTypeIconClass();
			var key = item.get('key');
			if (item.itemType == "note") {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						title
					)
				);
			} else if (item.attachmentDownloadUrl == false) {
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					title,
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			} else {
				var attachmentDownloadUrl = Zotero.url.attachmentDownloadUrl(item);
				return React.createElement(
					"li",
					{ key: key },
					React.createElement("span", { className: 'fonticon barefonticon ' + iconClass }),
					React.createElement(
						"a",
						{ className: "itemdownloadlink", href: attachmentDownloadUrl },
						title,
						" ",
						Zotero.url.attachmentFileDetails(item)
					),
					"(",
					React.createElement(
						"a",
						{ className: "item-select-link", "data-itemkey": item.get('key'), href: href, title: title },
						"Attachment Details"
					),
					")"
				);
			}
		});
		return React.createElement(
			"div",
			{ id: "item-children-panel", role: "tabpanel", className: "item-children-div tab-pane" },
			React.createElement(
				"ul",
				{ id: "notes-and-attachments" },
				childListEntries
			),
			React.createElement(
				"button",
				{ type: "button", onClick: this.triggerUpload, id: "upload-attachment-link", className: "btn btn-primary upload-attachment-button", hidden: !Zotero.config.librarySettings.allowUpload },
				"Upload File"
			)
		);
	}
});

var ItemDetails = React.createClass({
	displayName: "ItemDetails",

	getInitialState: function getInitialState() {
		return {
			item: null,
			childItems: [],
			itemLoading: false,
			childrenLoading: false,
			libraryItemsLoaded: false,
			edit: null
		};
	},
	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemChanged modeChanged", reactInstance.loadItem, {});
		//library.listen("itemTypeChanged", Zotero.ui.widgets.reactitem.itemTypeChanged, {widgetEl:el});
		library.listen("uploadSuccessful", reactInstance.refreshChildren, {});

		library.listen("tagsChanged", reactInstance.updateTypeahead, {});

		library.listen("showChildren", reactInstance.refreshChildren, {});

		library.trigger("displayedItemChanged");
	},
	componentDidMount: function componentDidMount() {
		return;
		var reactInstance = this;
		var library = this.props.library;

		//add typeahead if there is a tag input
		var addTagInput = J("input.add-tag-input");
		var editTagInput = J("input.item-field-control.tag");

		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		addTagInput.typeahead('destroy');
		editTagInput.typeahead('destroy');

		addTagInput.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
		editTagInput.typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	loadItem: function loadItem() {
		Z.debug('Zotero eventful loadItem', 3);
		var reactInstance = this;
		var library = this.props.library;

		//clean up RTEs before we end up removing their dom elements out from under them
		//Zotero.ui.cleanUpRte(widgetEl);

		//get the key of the item we need to display, or display library stats
		var itemKey = Zotero.state.getUrlVar('itemKey');
		if (!itemKey) {
			Z.debug("No itemKey - " + itemKey, 3);
			reactInstance.setState({ item: null });
			return Promise.reject(new Error("No itemkey - " + itemKey));
		}

		//if we are showing an item, load it from local library of API
		//then display it
		var loadedItem = library.items.getItem(itemKey);
		if (loadedItem) {
			Z.debug("have item locally, loading details into ui", 3);
			loadingPromise = Promise.resolve(loadedItem);
		} else {
			Z.debug("must fetch item from server", 3);
			var config = {
				'target': 'item',
				'libraryType': library.type,
				'libraryID': library.libraryID,
				'itemKey': itemKey
			};
			reactInstance.setState({ itemLoading: true });
			loadingPromise = library.loadItem(itemKey);
		}

		loadingPromise.then(function (item) {
			loadedItem = item;
		}).then(function () {
			return loadedItem.getCreatorTypes(loadedItem.get('itemType'));
		}).then(function (creatorTypes) {
			Z.debug("done loading necessary data; displaying item");
			reactInstance.setState({ item: loadedItem, itemLoading: false });
			library.trigger('showChildren');
			//Zotero.eventful.initTriggers(widgetEl);
			try {
				//trigger event for Zotero translator detection
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent('ZoteroItemUpdated', true, true);
				document.dispatchEvent(ev);
			} catch (e) {
				Zotero.error("Error triggering ZoteroItemUpdated event");
			}
		});
		loadingPromise["catch"](function (err) {
			Z.error("loadItem promise failed");
			Z.error(err);
		}).then(function () {
			reactInstance.setState({ itemLoading: false });
		})["catch"](Zotero.catchPromiseError);

		return loadingPromise;
	},
	refreshChildren: function refreshChildren() {
		Z.debug('reactitem.refreshChildren', 3);
		var reactInstance = this;
		var library = this.props.library;

		var itemKey = Zotero.state.getUrlVar('itemKey');
		if (!itemKey) {
			Z.debug("No itemKey - " + itemKey, 3);
			return Promise.reject(new Error("No itemkey - " + itemKey));
		}

		var item = library.items.getItem(itemKey);
		reactInstance.setState({ loadingChildren: true });
		var p = item.getChildren(library).then(function (childItems) {
			reactInstance.setState({ childItems: childItems, loadingChildren: false });
		})["catch"](Zotero.catchPromiseError);
		return p;
	},
	updateTypeahead: function updateTypeahead() {
		Z.debug("updateTypeahead", 3);
		return;
		var reactInstance = this;
		var library = this.props.library;
		if (library) {
			reactInstance.addTagTypeahead();
		}
	},
	addTagTypeahead: function addTagTypeahead() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;

		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		widgetEl.find("input.taginput").typeahead('destroy');
		widgetEl.find("input.taginput").typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	addTagTypeaheadToInput: function addTagTypeaheadToInput() {
		//TODO: reactify
		Z.debug('adding typeahead', 3);
		var reactInstance = this;
		var library = this.props.library;
		var typeaheadSource = library.tags.plainList;
		if (!typeaheadSource) {
			typeaheadSource = [];
		}
		var ttEngine = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: J.map(typeaheadSource, function (typeaheadSource) {
				return { value: typeaheadSource };
			})
		});
		ttEngine.initialize();
		J(element).typeahead('destroy');
		J(element).typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		}, {
			name: 'tags',
			displayKey: 'value',
			source: ttEngine.ttAdapter()
			//local: library.tags.plainList
		});
	},
	addNote: function addNote() {
		//TODO: reactify
		Z.debug("Zotero.ui.addNote", 3);
		var button = J(e.currentTarget);
		var container = button.closest("form");
		//var itemKey = J(button).data('itemkey');
		var notenum = 0;
		var lastNoteIndex = container.find("textarea.note-text:last").data('noteindex');
		if (lastNoteIndex) {
			notenum = parseInt(lastNoteIndex, 10);
		}

		var newindex = notenum + 1;
		var newNoteID = "note_" + newindex;
		var jel;
		jel = container.find("td.notes button.add-note-button").before('<textarea cols="40" rows="24" name="' + newNoteID + '" id="' + newNoteID + '" className="rte default note-text" data-noteindex="' + newNoteID + '"></textarea>');
		Zotero.ui.init.rte('default', true, newNoteID);
	},
	addTag: function addTag() {
		//TODO: reactify
		Z.debug("Zotero.ui.widgets.reactitem.addTag", 3);
		var triggeringElement = J(e.triggeringElement);
		var widgetEl = J(e.data.widgetEl);
		widgetEl.find(".add-tag-form").show().find(".add-tag-input").focus();
	},
	render: function render() {
		Z.debug("ItemDetails render");
		var library = this.props.library;
		var item = this.state.item;
		var childItems = this.state.childItems;

		return React.createElement(
			"div",
			{ role: "tabpanel" },
			React.createElement(ItemNavTabs, { library: library, item: item }),
			React.createElement(
				"div",
				{ className: "tab-content" },
				React.createElement(ItemInfoPanel, { library: library,
					item: item,
					loading: this.state.itemLoading,
					libraryItemsLoaded: this.state.libraryItemsLoaded,
					edit: this.state.edit
				}),
				React.createElement(ItemChildrenPanel, { library: library, childItems: childItems, loading: this.state.childrenLoading }),
				React.createElement(ItemTagsPanel, { library: library, item: item, edit: this.state.edit })
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reactitems = {};

Zotero.ui.widgets.reactitems.init = function (el) {
	Z.debug("widgets.items.init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(ItemsTable, { library: library }), document.getElementById('library-items-div'));

	Zotero.ui.widgets.reactitems.reactInstance = reactInstance;
	/*
 library.listen("displayedItemsChanged", reactInstance.loadItems, {widgetEl: el});
 library.listen("displayedItemChanged", reactInstance.selectDisplayed);
 Zotero.listen("selectedItemsChanged", function(){
 	reactInstance.setState({selectedItemKeys:Zotero.state.getSelectedItemKeys()});
 });
 
 library.listen("loadMoreItems", reactInstance.loadMoreItems, {widgetEl: el});
 library.listen("changeItemSorting", Zotero.ui.callbacks.resortItems, {widgetEl: el});
 */
	/*
 var container = J(el);
 //monitor scroll position of items pane for infinite scrolling
 container.closest("#items-panel").on('scroll', function(e){
 	if(Zotero.ui.widgets.reactitems.scrollAtBottom(J(this))){
 		library.trigger("loadMoreItems");
 	}
 });
 */

	//library.trigger("displayedItemsChanged");
};
/*
Zotero.ui.widgets.reactitems.loadItems = function(event){
	Z.debug('Zotero eventful loadItems', 3);
	var library = Zotero.ui.widgets.reactitems.reactInstance.props.library;
	var newConfig = Zotero.ui.getItemsConfig(library);
	
	//clear contents and show spinner while loading
	Zotero.ui.widgets.reactitems.reactInstance.setState({items:[], moreloading:true});
	
	var p = library.loadItems(newConfig)
	.then(function(response){
		if(!response.loadedItems){
			Zotero.error("expected loadedItems on response not present");
			throw("Expected response to have loadedItems");
		}
		library.items.totalResults = response.totalResults;
		Zotero.ui.widgets.reactitems.reactInstance.setState({items:response.loadedItems, moreloading:false, sort:newConfig.sort, order:newConfig.order});
	}).catch(function(response){
		Z.error(response);
		Zotero.ui.widgets.reactitems.reactInstance.setState({errorLoading:true, moreloading:false, sort:newConfig.sort, order:newConfig.order});
	});
	return p;
};
*/
//load more items when the user has scrolled to the bottom of the current list
/*
Zotero.ui.widgets.reactitems.loadMoreItems = function(event){
	Z.debug('loadMoreItems', 3);
	var widgetEl = J(event.data.widgetEl);
	//bail out if we're already fetching more items
	if(Zotero.ui.widgets.reactitems.reactInstance.state.moreloading){
		return;
	}
	//bail out if we're done loading all items
	if(Zotero.ui.widgets.reactitems.reactInstance.state.allItemsLoaded){
		return;
	}
	
	var reactInstance = Zotero.ui.widgets.reactitems.reactInstance;
	reactInstance.setState({moreloading:true});
	var library = reactInstance.props.library;
	var newConfig = Zotero.ui.getItemsConfig(library);
	var newStart = reactInstance.state.items.length;
	newConfig.start = newStart;

	var p = library.loadItems(newConfig)
	.then(function(response){
		if(!response.loadedItems){
			Zotero.error("expected loadedItems on response not present");
			throw("Expected response to have loadedItems");
		}
		var reactInstance = Zotero.ui.widgets.reactitems.reactInstance;
		var allitems = reactInstance.state.items.concat(response.loadedItems);
		reactInstance.setState({items:allitems, moreloading:false})

		//see if we're displaying as many items as there are in results
		var itemsDisplayed = allitems.length;
		if(response.totalResults == itemsDisplayed) {
			reactInstance.setState({allItemsLoaded:true});
		}
	}).catch(function(response){
		Z.error(response);
		Zotero.ui.widgets.reactitems.reactInstance.setState({errorLoading:true, moreloading:false});
	});
	
};
*/
Zotero.ui.getItemsConfig = function (library) {
	var effectiveUrlVars = ['tag', 'collectionKey', 'order', 'sort', 'q', 'qmode'];
	var urlConfigVals = {};
	J.each(effectiveUrlVars, function (index, value) {
		var t = Zotero.state.getUrlVar(value);
		if (t) {
			urlConfigVals[value] = t;
		}
	});

	var defaultConfig = { libraryID: library.libraryID,
		libraryType: library.libraryType,
		target: 'items',
		targetModifier: 'top',
		limit: library.preferences.getPref('itemsPerPage')
	};

	var userPreferencesApiArgs = {
		order: Zotero.preferences.getPref('order'),
		sort: Zotero.preferences.getPref('sort'),
		limit: library.preferences.getPref('itemsPerPage')
	};

	//Build config object that should be displayed next and compare to currently displayed
	var newConfig = J.extend({}, defaultConfig, userPreferencesApiArgs, urlConfigVals);
	//newConfig.start = parseInt(newConfig.limit, 10) * (parseInt(newConfig.itemPage, 10) - 1);

	//don't allow ordering by group only columns if user library
	if (library.libraryType == 'user' && Zotero.Library.prototype.groupOnlyColumns.indexOf(newConfig.order) != -1) {
		newConfig.order = 'title';
	}

	if (!newConfig.sort) {
		newConfig.sort = Zotero.config.sortOrdering[newConfig.order];
	}

	//don't pass top if we are searching for tags (or query?)
	if (newConfig.tag || newConfig.q) {
		delete newConfig.targetModifier;
	}

	return newConfig;
};

/**
 * Display the full library items section
 * @param  {Dom Element} el          Container
 * @param  {object} config      items config
 * @param  {array} loadedItems loaded items array
 * @return {undefined}
 */
/*
Zotero.ui.widgets.reactitems.displayItems = function(el, config={}, itemsArray=[]) {
	Z.debug("Zotero.ui.widgets.displayItems", 3);
	var library = Zotero.ui.widgets.reactitems.reactInstance.props.library;
	
	var filledConfig = J.extend({}, Zotero.config.defaultApiArgs, config);
	var displayFields = library.preferences.getPref('listDisplayedFields');
	if(library.libraryType != 'group'){
		displayFields = J.grep(displayFields, function(el, ind){
			return J.inArray(el, Zotero.Library.prototype.groupOnlyColumns) == (-1);
		});
	}
	
	Zotero.ui.widgets.reactitems.reactInstance.setState({items:itemsArray, displayFields:displayFields})
};
*/
/*
Zotero.ui.callbacks.resortItems = function(e){
	Z.debug(".field-table-header clicked", 3);
	var widgetEl = J(e.data.widgetEl);
	var library = Zotero.ui.getAssociatedLibrary(widgetEl);
	var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
	var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
	var newSortField;
	var newSortOrder;
	if(e.newSortField){
		newSortField = e.newSortField;
	}
	else {
		newSortField = J(e.triggeringElement).data('columnfield');
	}
	if(e.newSortOrder){
		newSortOrder = e.newSortOrder;
	}
	else{
		newSortOrder = Zotero.config.sortOrdering[newSortField];
	}
	
	//only allow ordering by the fields we have
	if(J.inArray(newSortField, Zotero.Library.prototype.sortableColumns) == (-1)){
		return false;
	}
	
	//change newSort away from the field default if that was already the current state
	if((!e.newSortOrder) && currentSortField == newSortField && currentSortOrder == newSortOrder){
		if(newSortOrder == 'asc'){
			newSortOrder = 'desc';
		}
		else{
			newSortOrder = 'asc';
		}
	}
	
	//problem if there was no sort column mapped to the header that got clicked
	if(!newSortField){
		Zotero.ui.jsNotificationMessage("no order field mapped to column");
		return false;
	}
	
	//update the url with the new values
	Zotero.state.pathVars['order'] = newSortField;
	Zotero.state.pathVars['sort'] = newSortOrder;
	Zotero.state.pushState();
	
	//set new order as preference and save it to use www prefs
	library.preferences.setPref('sortField', newSortField);
	library.preferences.setPref('sortOrder', newSortOrder);
	library.preferences.setPref('order', newSortField);
	library.preferences.setPref('sort', newSortOrder);
	Zotero.preferences.setPref('order', newSortField);
	Zotero.preferences.setPref('sort', newSortOrder);
};
*/
Zotero.ui.widgets.reactitems.scrollAtBottom = function (el) {
	if (J(el).scrollTop() + J(el).innerHeight() >= J(el)[0].scrollHeight) {
		return true;
	}
	return false;
};

var ItemsTable = React.createClass({
	displayName: 'ItemsTable',

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("displayedItemsChanged", reactInstance.loadItems, {});
		library.listen("displayedItemChanged", reactInstance.selectDisplayed);
		Zotero.listen("selectedItemsChanged", function () {
			reactInstance.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys() });
		});

		library.listen("loadMoreItems", reactInstance.loadMoreItems, {});
		library.trigger("displayedItemsChanged");

		J(window).on('resize', function () {
			if (!window.matchMedia("(min-width: 768px)").matches) {
				reactInstance.setState({ narrow: true });
			} else {
				reactInstance.setState({ narrow: false });
			}
		});
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},
	getInitialState: function getInitialState() {
		return {
			moreloading: false,
			allItemsLoaded: false,
			errorLoading: false,
			items: [],
			selectedItemKeys: [],
			allSelected: false,
			displayFields: ["title", "creator", "dateModified"],
			order: "title",
			sort: "asc",
			narrow: false
		};
	},
	loadItems: function loadItems() {
		Z.debug('Zotero eventful loadItems', 3);
		var reactInstance = this;
		var library = this.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);

		//clear contents and show spinner while loading
		this.setState({ items: [], moreloading: true });

		var p = library.loadItems(newConfig).then(function (response) {
			if (!response.loadedItems) {
				Zotero.error("expected loadedItems on response not present");
				throw "Expected response to have loadedItems";
			}
			library.items.totalResults = response.totalResults;
			reactInstance.setState({
				items: response.loadedItems,
				moreloading: false,
				sort: newConfig.sort,
				order: newConfig.order
			});
		})['catch'](function (response) {
			Z.error(response);
			reactInstance.setState({
				errorLoading: true,
				moreloading: false,
				sort: newConfig.sort,
				order: newConfig.order
			});
		});
		return p;
	},
	loadMoreItems: function loadMoreItems() {
		Z.debug('loadMoreItems', 3);
		var reactInstance = this;
		var library = this.props.library;

		//bail out if we're already fetching more items
		if (reactInstance.state.moreloading) {
			return;
		}
		//bail out if we're done loading all items
		if (reactInstance.state.allItemsLoaded) {
			return;
		}

		reactInstance.setState({ moreloading: true });
		var library = reactInstance.props.library;
		var newConfig = Zotero.ui.getItemsConfig(library);
		var newStart = reactInstance.state.items.length;
		newConfig.start = newStart;

		var p = library.loadItems(newConfig).then(function (response) {
			if (!response.loadedItems) {
				Zotero.error("expected loadedItems on response not present");
				throw "Expected response to have loadedItems";
			}
			var allitems = reactInstance.state.items.concat(response.loadedItems);
			reactInstance.setState({ items: allitems, moreloading: false });

			//see if we're displaying as many items as there are in results
			var itemsDisplayed = allitems.length;
			if (response.totalResults == itemsDisplayed) {
				reactInstance.setState({ allItemsLoaded: true });
			}
		})['catch'](function (response) {
			Z.error(response);
			reactInstance.setState({ errorLoading: true, moreloading: false });
		});
	},
	resortItems: function resortItems(evt) {
		//handle click on the item table header to re-sort items
		//if it is the currently sorted field, simply flip the sort order
		//if it is not the currently sorted field, set it to be the currently sorted
		//field and set the default ordering for that field
		Z.debug(".field-table-header clicked", 3);
		evt.preventDefault();
		var reactInstance = this;
		var library = this.props.library;
		var currentSortField = this.state.order;
		var currentSortOrder = this.state.sort;

		var newSortField = J(evt.target).data('columnfield');
		var newSortOrder;
		if (newSortField != currentSortField) {
			newSortOrder = Zotero.config.sortOrdering[newSortField]; //default for column
		} else {
				//swap sort order
				if (currentSortOrder == "asc") {
					newSortOrder = "desc";
				} else {
					newSortOrder = "asc";
				}
			}

		//only allow ordering by the fields we have
		if (library.sortableColumns.indexOf(newSortField) == -1) {
			return false;
		}

		//problem if there was no sort column mapped to the header that got clicked
		if (!newSortField) {
			Zotero.ui.jsNotificationMessage("no order field mapped to column");
			return false;
		}

		//update the url with the new values
		Zotero.state.pathVars['order'] = newSortField;
		Zotero.state.pathVars['sort'] = newSortOrder;
		Zotero.state.pushState();

		//set new order as preference and save it to use www prefs
		library.preferences.setPref('sortField', newSortField);
		library.preferences.setPref('sortOrder', newSortOrder);
		library.preferences.setPref('order', newSortField);
		library.preferences.setPref('sort', newSortOrder);
		Zotero.preferences.setPref('order', newSortField);
		Zotero.preferences.setPref('sort', newSortOrder);
	},
	//select and highlight in the itemlist the item  that is displayed
	//in the item details widget
	selectDisplayed: function selectDisplayed() {
		Z.debug('widgets.items.selectDisplayed', 3);
		Zotero.state.selectedItemKeys = [];
		this.setState({ selectedItemKeys: Zotero.state.getSelectedItemKeys(), allSelected: false });
	},
	fixTableHeaders: function fixTableHeaders() {
		var tableEl = this.refs.itemsTable;
		var tel = J(tableEl);
		var colWidths = [];
		tel.find("tbody tr").first().find("td").each(function (ind, th) {
			var width = J(th).width();
			colWidths.push(width);
			tel.find("thead th").eq(ind).width(width);
		});

		var bodyOffset = tel.find("thead").height();

		tel.find("thead").css('position', 'fixed').css('margin-top', -bodyOffset).css('background-color', 'white').css('z-index', 10);
		tel.find("tbody").css('margin-top', bodyOffset);
		tel.css("margin-top", bodyOffset);
	},
	handleSelectAllChange: function handleSelectAllChange(evt) {
		var library = this.props.library;
		var nowselected = [];
		var allSelected = false;
		if (evt.target.checked) {
			allSelected = true;
			//select all items
			this.state.items.forEach(function (item) {
				nowselected.push(item.get('key'));
			});
		} else {
			var selectedItemKey = Zotero.state.getUrlVar('itemKey');
			if (selectedItemKey) {
				nowselected.push(selectedItemKey);
			}
		}
		Zotero.state.selectedItemKeys = nowselected;
		this.setState({ selectedItemKeys: nowselected, allSelected: allSelected });
		library.trigger("selectedItemsChanged", { selectedItemKeys: nowselected });

		//if deselected all, reselect displayed item row
		if (nowselected.length === 0) {
			library.trigger('displayedItemChanged');
		}
	},
	nonreactBind: function nonreactBind() {
		Zotero.eventful.initTriggers();
		if (J("body").hasClass('lib-body')) {
			this.fixTableHeaders(J("#field-table"));
		}
	},
	componentDidMount: function componentDidMount() {
		this.nonreactBind();
	},
	componentDidUpdate: function componentDidUpdate() {
		this.nonreactBind();
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;
		var narrow = this.state.narrow;
		var order = this.state.order;
		var sort = this.state.sort;
		var loading = this.state.moreloading;
		var libraryString = library.libraryString;
		var selectedItemKeys = this.state.selectedItemKeys;
		var selectedItemKeyMap = {};
		selectedItemKeys.forEach(function (itemKey) {
			selectedItemKeyMap[itemKey] = true;
		});

		var sortIcon;
		if (sort == "desc") {
			sortIcon = React.createElement('span', { className: 'glyphicon fonticon glyphicon-chevron-down pull-right' });
		} else {
			sortIcon = React.createElement('span', { className: 'glyphicon fonticon glyphicon-chevron-up pull-right' });
		}

		var headers = [React.createElement(
			'th',
			{ key: 'checkbox-header' },
			React.createElement('input', { type: 'checkbox',
				className: 'itemlist-editmode-checkbox all-checkbox',
				name: 'selectall',
				checked: this.state.allSelected,
				onChange: this.handleSelectAllChange })
		)];
		if (narrow) {
			headers.push(React.createElement(
				'th',
				{ key: 'single-cell-header', className: 'eventfultrigger clickable', 'data-library': library.libraryString, 'data-triggers': 'chooseSortingDialog' },
				Zotero.Item.prototype.fieldMap[order],
				sortIcon
			));
		} else {
			var fieldHeaders = this.state.displayFields.map(function (header, ind) {
				var sortable = Zotero.Library.prototype.sortableColumns.indexOf(header) != -1;
				var selectedClass = header == order ? "selected-order sort-" + sort + " " : "";
				var sortspan = null;
				if (header == order) {
					sortspan = sortIcon;
				}
				return React.createElement(
					'th',
					{
						key: header,
						onClick: reactInstance.resortItems,
						className: "field-table-header " + selectedClass + (sortable ? "clickable " : ""),
						'data-columnfield': header },
					Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header,
					sortspan
				);
			});
			headers = headers.concat(fieldHeaders);
		}

		var itemRows = this.state.items.map(function (item) {
			var selected = selectedItemKeyMap.hasOwnProperty(item.get('key')) ? true : false;
			var p = {
				key: item.get("key"),
				item: item,
				selected: selected,
				narrow: narrow
			};
			return React.createElement(ItemRow, p);
		});
		return React.createElement(
			'form',
			{ className: 'item-select-form', method: 'POST' },
			React.createElement(
				'table',
				{ id: 'field-table', ref: 'itemsTable', className: 'wide-items-table table table-striped' },
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						headers
					)
				),
				React.createElement(
					'tbody',
					null,
					itemRows
				)
			),
			React.createElement(LoadingError, { errorLoading: this.state.errorLoading }),
			React.createElement(LoadingSpinner, { loading: this.state.moreloading })
		);
	}
});

var ItemRow = React.createClass({
	displayName: 'ItemRow',

	getDefaultProps: function getDefaultProps() {
		return {
			displayFields: ["title", "creatorSummary", "dateModified"],
			selected: false,
			item: {},
			narrow: false
		};
	},
	handleSelectChange: function handleSelectChange(ev) {
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		selected = Zotero.state.getSelectedItemKeys();

		Zotero.ui.widgets.reactitems.reactInstance.setState({ selectedItemKeys: selected });
		Zotero.ui.widgets.reactitems.reactInstance.props.library.trigger("selectedItemsChanged", { selectedItemKeys: selected });
	},
	handleItemLinkClick: function handleItemLinkClick(evt) {
		evt.preventDefault();
		var itemKey = J(evt.target).data('itemkey');
		Zotero.state.pathVars.itemKey = itemKey;
		Zotero.state.pushState();
	},
	render: function render() {
		var reactInstance = this;
		var item = this.props.item;
		var selected = this.props.selected;
		if (!this.props.narrow) {
			var fields = this.props.displayFields.map(function (field) {
				return React.createElement(
					'td',
					{ onClick: reactInstance.handleItemLinkClick, key: field, className: field, 'data-itemkey': item.get("key") },
					React.createElement(
						'a',
						{ onClick: reactInstance.handleItemLinkClick, className: 'item-select-link', 'data-itemkey': item.get("key"), href: Zotero.url.itemHref(item), title: item.get(field) },
						Zotero.ui.formatItemField(field, item, true)
					)
				);
			});
			return React.createElement(
				'tr',
				{ className: selected ? "highlighed" : "" },
				React.createElement(
					'td',
					{ className: 'edit-checkbox-td', 'data-itemkey': item.get("key") },
					React.createElement('input', { type: 'checkbox', onChange: this.handleSelectChange, checked: selected, className: 'itemlist-editmode-checkbox itemKey-checkbox', name: "selectitem-" + item.get("key"), 'data-itemkey': item.get("key") })
				),
				fields
			);
		} else {
			return React.createElement(
				'tr',
				{ className: selected ? "highlighed" : "", 'data-itemkey': item.get('key') },
				React.createElement(
					'td',
					{ className: 'edit-checkbox-td', 'data-itemkey': item.get('key') },
					React.createElement('input', { type: 'checkbox', className: 'itemlist-editmode-checkbox itemKey-checkbox', name: "selectitem-" + item.get('key'), 'data-itemkey': item.get('key') })
				),
				React.createElement(SingleCellItemField, { onClick: reactInstance.handleItemLinkClick, item: item, displayFields: this.props.displayFields })
			);
		}
	}
});
/*
var SingleCellItemRow = React.createClass({
	getDefaultProps: function() {
		return {
			displayFields: ["title", "creatorSummary", "dateModified"],
			selected: false,
			item: {}
		};
	},
	handleSelectChange: function(ev) {
		var itemKey = this.props.item.get('key');
		Zotero.state.toggleItemSelected(itemKey);
		selected = Zotero.state.getSelectedItemKeys();

		Zotero.ui.widgets.reactitems.reactInstance.setState({selectedItemKeys:selected});
		Zotero.ui.widgets.reactitems.reactInstance.props.library.trigger("selectedItemsChanged", {selectedItemKeys: selected});
	},
	handleItemLinkClick: function(evt) {
		evt.preventDefault();
		var itemKey = J(evt.target).data('itemkey');
		Zotero.state.pathVars.itemKey = itemKey;
		Zotero.state.pushState();
	},
	render: function() {
		var item = this.props.item;
		var selected = this.props.selected;
		
		return (
			<tr className={selected ? "highlighed" : ""} data-itemkey={item.get('key')}>
				<td className="edit-checkbox-td" data-itemkey={item.get('key')}>
					<input type='checkbox' className='itemlist-editmode-checkbox itemKey-checkbox' name={"selectitem-" + item.get('key')} data-itemkey={item.get('key')} />
				</td>
				
				<SingleCellItemField item={item} displayFields={this.props.displayFields} />
			</tr>
		)
	}
});
*/
var SingleCellItemField = React.createClass({
	displayName: 'SingleCellItemField',

	render: function render() {
		var item = this.props.item;
		var field = this.props.field;

		var pps = [];
		this.props.displayFields.forEach(function (field) {
			var fieldDisplayName = Zotero.Item.prototype.fieldMap[field] ? Zotero.Item.prototype.fieldMap[field] + ":" : "";
			if (field == "title") {
				pps.push(React.createElement('span', { key: 'itemTypeIcon', className: 'sprite-icon pull-left sprite-treeitem-' + item.itemTypeImageClass() }));
				pps.push(React.createElement(ColoredTags, { key: 'coloredTags', item: item }));
				pps.push(React.createElement(
					'b',
					{ key: 'title' },
					Zotero.ui.formatItemField(field, item, true)
				));
			} else if (field === 'dateAdded' || field === 'dateModified') {
				pps.push(React.createElement('p', { key: field, title: item.get(field), dangerouslySetInnerHtml: { __html: fieldDisplayName + Zotero.ui.formatItemDateField(field, item, true) } }));
			} else {
				pps.push(React.createElement(
					'p',
					{ key: field, title: item.get(field) },
					fieldDisplayName,
					Zotero.ui.formatItemField(field, item, true)
				));
			}
		});
		return React.createElement(
			'td',
			{ onClick: this.props.onClick, className: 'single-cell-item', 'data-itemkey': item.get('key') },
			React.createElement(
				'a',
				{ className: 'item-select-link', 'data-itemkey': item.get('key'), href: Zotero.url.itemHref(item) },
				pps
			)
		);
	}
});

var ColoredTags = React.createClass({
	displayName: 'ColoredTags',

	render: function render() {
		var item = this.props.item;
		var library = item.owningLibrary;

		var coloredTags = library.matchColoredTags(item.apiObj._supplement.tagstrings);
		Z.debug("coloredTags:" + JSON.stringify(coloredTags));

		return React.createElement('span', { className: 'coloredTags' });
	}
});

var ColoredTag = React.createClass({
	displayName: 'ColoredTag',

	render: function render() {
		var styleObj = { color: this.props.color };
		return React.createElement(
			'span',
			{ style: styleObj },
			React.createElement('span', { style: styleObj, className: 'glyphicons fonticon glyphicons-tag' })
		);
	}
});
/*
var ItemField = React.createClass({
	render: function() {
		var item = this.props.item;
		var field = this.props.field;
		return (
			<td className={field} data-itemkey={item.get("key")}>
				<a onClick={this.props.handleItemLinkClick} className='item-select-link' data-itemkey={item.get("key")} href={Zotero.url.itemHref(item)} title={item.get(field)}>
					{Zotero.ui.formatItemField(field, item, true)}
				</a>
			</td>
		);
	}
});
*/
var LoadingSpinner = React.createClass({
	displayName: 'LoadingSpinner',

	render: function render() {
		var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
		return React.createElement(
			'div',
			{ className: 'items-spinner', hidden: !this.props.loading },
			React.createElement('img', { className: 'spinner', src: spinnerUrl })
		);
	}
});

var LoadingError = React.createClass({
	displayName: 'LoadingError',

	render: function render() {
		return React.createElement(
			'p',
			{ hidden: !this.props.errorLoading },
			'There was an error loading your items. Please try again in a few minutes.'
		);
	}
});
"use strict";

Zotero.ui.widgets.library = {};

Zotero.ui.widgets.library.init = function (el) {
	Z.debug("Zotero.ui.widgets.library.init");
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(ReactZoteroLibrary, { library: library }), document.getElementById('library-widget'));
};

var FeedLink = React.createClass({
	displayName: "FeedLink",

	render: function render() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var requestUrl = Zotero.ajax.apiRequestUrl(urlconfig) + Zotero.ajax.apiQueryString(urlconfig, false);
		var feedUrl = requestUrl.replace(Zotero.config.baseApiUrl, Zotero.config.baseFeedUrl);
		var newkeyurl = Zotero.url.requestReadApiKeyUrl(library.libraryType, library.libraryID, feedUrl);
		var feedHref;
		if (!Zotero.config.librarySettings.publish) {
			feedHref = newkeyurl;
		} else {
			feedHref = feedUrl;
		}

		return React.createElement(
			"p",
			null,
			React.createElement(
				"a",
				{ href: feedHref, type: "application/atom+xml", rel: "alternate", className: "feed-link" },
				React.createElement("span", { className: "sprite-icon sprite-feed" }),
				"Subscribe to this feed"
			)
		);
	}
});

var ReactZoteroLibrary = React.createClass({
	displayName: "ReactZoteroLibrary",

	componentWillMount: function componentWillMount() {
		//preload library
		Z.debug("ReactZoteroLibrary componentWillMount", 3);
		var reactInstance = this;
		var library = this.props.library;
		library.loadSettings();
		library.listen("deleteIdb", function () {
			library.idbLibrary.deleteDB();
		});
		library.listen("indexedDBError", function () {
			Zotero.ui.jsNotificationMessage("There was an error initializing your library. Some data may not load properly.", 'notice');
		});
		library.listen("cachedDataLoaded", function () {});
	},
	componentDidMount: function componentDidMount() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("displayedItemsChanged", function () {
			Z.debug("ReactZoteroLibrary displayedItemsChanged");
			reactInstance.refs.itemsWidget.loadItems();
		}, {});

		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function () {
			Z.debug("setting tags on tagsWidget from Library");
			reactInstance.refs.tagsWidget.setState({ tags: library.tags });
		});
	},
	getInitialState: function getInitialState() {
		return {
			activePanel: "items",
			deviceSize: "xs"
		};
	},
	reflowPanelContainer: function reflowPanelContainer() {},
	render: function render() {
		Z.debug("react library render");
		var library = this.props.library;
		var user = Zotero.config.loggedInUser;
		var userDisplayName = user ? user.displayName : null;
		var base = Zotero.config.baseWebsiteUrl;
		var settingsUrl = base + "/settings";
		var inboxUrl = base + "/messages/inbox"; //TODO
		var downloadUrl = base + "/download";
		var documentationUrl = base + "/support";
		var forumsUrl = Zotero.config.baseForumsUrl; //TODO
		var logoutUrl = base + "/user/logout";
		var loginUrl = base + "/user/login";
		var homeUrl = base;
		var staticUrl = function staticUrl(path) {
			return base + "/static" + path;
		};

		var inboxText = user.unreadMessages > 0 ? React.createElement(
			"strong",
			null,
			"Inbox (",
			user.unreadMessages,
			")"
		) : "Inbox";
		var siteActionsMenu;

		if (user) {
			siteActionsMenu = [React.createElement(
				"button",
				{ key: "button", type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-expanded": "false" },
				userDisplayName,
				React.createElement("span", { className: "caret" }),
				React.createElement(
					"span",
					{ className: "sr-only" },
					"Toggle Dropdown"
				)
			), React.createElement(
				"ul",
				{ key: "listEntries", className: "dropdown-menu", role: "menu" },
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: settingsUrl },
						"Settings"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: inboxUrl },
						inboxText
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: downloadUrl },
						"Download"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: documentationUrl, className: "documentation" },
						"Documentation"
					)
				),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: forumsUrl, className: "forums" },
						"Forums"
					)
				),
				React.createElement("li", { className: "divider" }),
				React.createElement(
					"li",
					null,
					React.createElement(
						"a",
						{ href: logoutUrl },
						"Log Out"
					)
				)
			)];
		} else {
			siteActionsMenu = React.createElement(
				"div",
				{ className: "btn-group" },
				React.createElement(
					"a",
					{ href: loginUrl, className: "btn btn-default navbar-btn", role: "button" },
					"Log In"
				),
				React.createElement(
					"button",
					{ type: "button", href: "#", className: "btn btn-default navbar-btn dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false" },
					React.createElement("span", { className: "caret" }),
					React.createElement(
						"span",
						{ className: "sr-only" },
						"Toggle Dropdown"
					)
				),
				React.createElement(
					"ul",
					{ className: "dropdown-menu", role: "menu" },
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: downloadUrl },
							"Download"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: documentationUrl, className: "documentation" },
							"Documentation"
						)
					),
					React.createElement(
						"li",
						null,
						React.createElement(
							"a",
							{ href: forumsUrl, className: "forums" },
							"Forums"
						)
					)
				)
			);
		}

		return React.createElement(
			"div",
			null,
			React.createElement(
				"nav",
				{ id: "primarynav", className: "navbar navbar-default", role: "navigation" },
				React.createElement(
					"div",
					{ className: "container-fluid" },
					React.createElement(
						"div",
						{ className: "navbar-header" },
						React.createElement(
							"button",
							{ type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#primary-nav-linklist" },
							userDisplayName,
							React.createElement(
								"span",
								{ className: "sr-only" },
								"Toggle navigation"
							),
							React.createElement("span", { className: "glyphicons fonticon glyphicons-menu-hamburger" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand hidden-sm hidden-xs", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero.png'), alt: "Zotero", height: "20px" })
						),
						React.createElement(
							"a",
							{ className: "navbar-brand visible-sm-block visible-xs-block", href: homeUrl },
							React.createElement("img", { src: staticUrl('/images/theme/zotero_theme/zotero_48.png'), alt: "Zotero", height: "24px" })
						)
					),
					React.createElement(
						"div",
						{ className: "collapse navbar-collapse", id: "primary-nav-linklist" },
						React.createElement(ControlPanel, { library: library, ref: "controlPanel" }),
						React.createElement(
							"ul",
							{ className: "nav navbar-nav navbar-right" },
							siteActionsMenu
						),
						React.createElement(
							"div",
							{ className: "eventfulwidget btn-toolbar hidden-xs navbar-right" },
							React.createElement(LibrarySearchBox, { library: library })
						)
					)
				)
			),
			React.createElement(
				"div",
				{ id: "js-message" },
				React.createElement("ul", { id: "js-message-list" })
			),
			React.createElement(
				"div",
				{ id: "library", className: "row" },
				React.createElement(
					"div",
					{ id: "panel-container" },
					React.createElement(
						"div",
						{ id: "left-panel", className: "panelcontainer-panelcontainer col-xs-12 col-sm-4 col-md-3" },
						React.createElement(FilterGuide, { ref: "filterGuide", library: library }),
						React.createElement(
							"div",
							{ role: "tabpanel" },
							React.createElement(
								"ul",
								{ className: "nav nav-tabs", role: "tablist" },
								React.createElement(
									"li",
									{ role: "presentation", className: "active" },
									React.createElement(
										"a",
										{ href: "#collections-panel", "aria-controls": "collections-panel", role: "tab", "data-toggle": "tab" },
										"Collections"
									)
								),
								React.createElement(
									"li",
									{ role: "presentation" },
									React.createElement(
										"a",
										{ href: "#tags-panel", "aria-controls": "tags-panel", role: "tab", "data-toggle": "tab" },
										"Tags"
									)
								)
							),
							React.createElement(
								"div",
								{ className: "tab-content" },
								React.createElement(
									"div",
									{ id: "collections-panel", role: "tabpanel", className: "tab-pane active" },
									React.createElement(Collections, { ref: "collectionsWidget", library: library })
								),
								React.createElement(
									"div",
									{ id: "tags-panel", role: "tabpanel", className: "tab-pane" },
									React.createElement(Tags, { ref: "tagsWidget", library: library }),
									React.createElement(FeedLink, { ref: "feedLinkWidget", library: library })
								)
							)
						)
					),
					React.createElement(
						"div",
						{ id: "right-panel", className: "panelcontainer-panelcontainer col-xs-12 col-sm-8 col-md-9" },
						React.createElement(
							"div",
							{ id: "items-panel", className: "panelcontainer-panel col-sm-12 col-md-7" },
							React.createElement(LibrarySearchBox, { library: library }),
							React.createElement(
								"div",
								{ id: "library-items-div", className: "library-items-div row" },
								React.createElement(ItemsTable, { ref: "itemsWidget", library: library })
							),
							React.createElement(
								"div",
								{ id: "load-more-items-div", className: "row" },
								React.createElement(
									"button",
									{ onClick: function () {
											library.trigger('loadMoreItems');
										}, type: "button", id: "load-more-items-button", className: "btn btn-default" },
									"Load More Items"
								)
							)
						),
						React.createElement(
							"div",
							{ id: "item-panel", className: "panelcontainer-panel col-sm-12 col-md-5" },
							React.createElement(
								"div",
								{ id: "item-widget-div", className: "item-details-div" },
								React.createElement(ItemDetails, { ref: "itemWidget", library: library })
							)
						)
					),
					React.createElement(
						"nav",
						{ id: "panelcontainer-nav", className: "navbar navbar-default navbar-fixed-bottom visible-xs-block", role: "navigation" },
						React.createElement(
							"div",
							{ className: "container-fluid" },
							React.createElement(
								"ul",
								{ className: "nav navbar-nav" },
								React.createElement(
									"li",
									{ className: "eventfultrigger filters-nav", "data-triggers": "showFiltersPanel" },
									React.createElement(
										"a",
										{ href: "#" },
										"Filters"
									)
								),
								React.createElement(
									"li",
									{ className: "eventfultrigger items-nav", "data-triggers": "showItemsPanel" },
									React.createElement(
										"a",
										{ href: "#" },
										"Items"
									)
								)
							)
						)
					),
					React.createElement(SendToLibraryDialog, { ref: "sendToLibraryDialogWidget", library: library }),
					React.createElement(CreateCollectionDialog, { ref: "createCollectionDialogWidget", library: library }),
					React.createElement(UpdateCollectionDialog, { library: library }),
					React.createElement(DeleteCollectionDialog, { library: library }),
					React.createElement(AddToCollectionDialog, { library: library }),
					React.createElement(CreateItemDialog, { library: library }),
					React.createElement(CiteItemDialog, { library: library }),
					React.createElement(UploadAttachmentDialog, { library: library }),
					React.createElement(ExportItemsDialog, { library: library }),
					React.createElement(LibrarySettingsDialog, { library: library })
				)
			)
		);
	}
});
/*<!-- Main Content -->*/ /*<!-- Nav tabs -->*/ /*<!-- Tab panes -->*/ /*<!-- /collections panel -->*/ /*<!-- tags browser section -->*/ /*<!-- /tags panel -->*/ /*<!-- /tabcontent -->*/ /*<!-- /tab-panel -->*/ /*<!-- /left-panel -->*/ /*<!-- /items panel -->*/ /*<!-- /item widget -->*/ /*<!-- /item panel -->*/ /*<!-- /right-panel -->*/ /*<!-- panelContainer nav footer -->*/ /*<ProgressModalDialog library={library} />*/ /*<ChooseSortingDialog library={library} />*/
'use strict';

Zotero.ui.widgets.reactlibrarysettingsdialog = {};

Zotero.ui.widgets.reactlibrarysettingsdialog.init = function (el) {
	Z.debug("librarysettingsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(LibrarySettingsDialog, { library: library }), document.getElementById('library-settings-dialog'));

	library.listen('settingsLoaded', reactInstance.updateStateFromLibrary, {});
	library.listen("librarySettingsDialog", reactInstance.openDialog, {});
};

var LibrarySettingsDialog = React.createClass({
	displayName: 'LibrarySettingsDialog',

	getInitialState: function getInitialState() {
		return {
			listDisplayedFields: [],
			itemsPerPage: 25,
			showAutomaticTags: true
		};
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	updateShowFields: function updateShowFields(evt) {
		Z.debug("updateShowFields");
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var fieldName = evt.target.value;
		var display = evt.target.checked;

		if (display) {
			Z.debug("adding field " + fieldName + " to listDisplayedFields");
			listDisplayedFields.push(fieldName);
		} else {
			Z.debug("filtering field " + fieldName + " from listDisplayedFields");

			listDisplayedFields = listDisplayedFields.filter(function (val) {
				if (val == fieldName) {
					return false;
				}
				return true;
			});
		}

		this.setState({
			listDisplayedFields: listDisplayedFields
		});

		library.preferences.setPref("listDisplayedFields", listDisplayedFields);
		library.preferences.persist();

		library.trigger("displayedItemsChanged");
	},
	updateShowAutomaticTags: function updateShowAutomaticTags(evt) {
		var library = this.props.library;
		var showAutomaticTags = evt.target.checked;

		this.setState({
			showAutomaticTags: showAutomaticTags
		});
		library.preferences.setPref("showAutomaticTags", showAutomaticTags);
		library.preferences.persist();

		library.trigger("tagsChanged");
	}, /*
    updateItemsPerPage: function(evt) {
    var library = this.props.library;
    var itemsPerPage = evt.target.value;
    this.setState({
    itemsPerPage: itemsPerPage
    });
    library.preferences.setPref('itemsPerPage', itemsPerPage);
    library.preferences.persist();
    library.preferences.setPref("listDisplayedFields", listDisplayedFields);
    },*/
	updateStateFromLibrary: function updateStateFromLibrary() {
		var library = this.props.library;
		this.setState({
			listDisplayedFields: library.preferences.getPref('listDisplayedFields'),
			itemsPerPage: library.preferences.getPref('itemsPerPage'),
			showAutomaticTags: library.preferences.getPref('showAutomaticTags')
		});
	},
	render: function render() {
		var reactInstance = this;
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var itemsPerPage = this.state.itemsPerPage;
		var showAutomaticTags = this.state.showAutomaticTags;
		var fieldMap = Zotero.localizations.fieldMap;

		var displayFieldNodes = Zotero.Library.prototype.displayableColumns.map(function (val, ind) {
			var checked = listDisplayedFields.indexOf(val) != -1;
			return React.createElement(
				'div',
				{ key: val, className: 'checkbox' },
				React.createElement(
					'label',
					{ htmlFor: "display-column-field-" + val },
					React.createElement('input', { onChange: reactInstance.updateShowFields, type: 'checkbox', checked: checked, name: 'display-column-field', value: val, id: "display-column-field-" + val, className: 'display-column-field' }),
					fieldMap[val] || val
				)
			);
		});

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: 'modal' },
			React.createElement(
				'div',
				{ id: 'library-settings-dialog', className: 'library-settings-dialog', role: 'dialog', 'aria-hidden': 'true', 'data-keyboard': 'true' },
				React.createElement(
					'div',
					{ className: 'modal-dialog' },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: 'modal-header' },
							React.createElement(
								'button',
								{ type: 'button', className: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'×'
							),
							React.createElement(
								'h3',
								{ className: 'modal-title' },
								'Library Settings'
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-body' },
							React.createElement(
								'form',
								{ id: 'library-settings-form', className: 'library-settings-form', role: 'form' },
								React.createElement(
									'fieldset',
									null,
									React.createElement(
										'legend',
										null,
										'Display Columns'
									),
									displayFieldNodes
								),
								React.createElement(
									'div',
									{ className: 'checkbox' },
									React.createElement(
										'label',
										{ htmlFor: 'show-automatic-tags' },
										React.createElement('input', { onChange: this.updateShowAutomaticTags, type: 'checkbox', id: 'show-automatic-tags', name: 'show-automatic-tags' }),
										'Show Automatic Tags'
									),
									React.createElement(
										'p',
										{ className: 'help-block' },
										'Automatic tags are tags added automatically when a reference was imported, rather than by a user.'
									)
								)
							)
						),
						React.createElement(
							'div',
							{ className: 'modal-footer' },
							React.createElement(
								'button',
								{ className: 'btn btn-default', 'data-dismiss': 'modal', 'aria-hidden': 'true' },
								'Close'
							)
						)
					)
				)
			)
		);
	}
});
/*
<label htmlFor="items-per-page">Items Per Page</label>
<select onChange={this.updateItemPerPage} defaultValue={this.state.itemsPerPage} id="items-per-page" name="items-per-page" className="form-control">
<option value="25">25</option>
<option value="50">50</option>
<option value="75">75</option>
<option value="100">100</option>
</select>
*/
"use strict";

Zotero.ui.widgets.panelContainer = {};

Zotero.ui.widgets.panelContainer.init = function (el) {
    Z.debug("panelContainer widget init", 3);
    var library = Zotero.ui.getAssociatedLibrary(el);

    library.listen("displayedItemsChanged showItemsPanel", Zotero.ui.widgets.panelContainer.showPanel, { widgetEl: el, panelSelector: "#items-panel" });
    library.listen("showFiltersPanel", Zotero.ui.widgets.panelContainer.showPanel, { widgetEl: el, panelSelector: "#left-panel" });
    library.listen("showItemPanel displayedItemChanged", Zotero.ui.widgets.panelContainer.showPanel, { widgetEl: el, panelSelector: "#item-panel" });
    Zotero.listen("reflow", Zotero.ui.widgets.panelContainer.reflow, { widgetEl: el });

    Zotero.ui.widgets.panelContainer.showPanel({ data: { widgetEl: el, panelSelector: "#items-panel" } });
    J(window).on('resize', function () {
        Zotero.ui.widgets.panelContainer.reflow({ data: { widgetEl: el } });
    });
    J(el).on('click', '.single-cell-item', function () {
        library.trigger('showItemPanel');
    });
};

Zotero.ui.widgets.panelContainer.reflow = function (evt) {
    Zotero.ui.widgets.panelContainer.showPanel({ data: { widgetEl: evt.data.widgetEl, panelSelector: "#items-panel" } });
    Zotero.ui.fixTableHeaders(J("#field-table"));
};

Zotero.ui.widgets.panelContainer.showPanel = function (evt) {
    Z.debug("panelContainer.showPanel", 3);
    var widgetEl = J(evt.data.widgetEl);
    var selector = evt.data.panelSelector;
    if (selector == "#item-panel" && !Zotero.state.getUrlVar('itemKey')) {
        Z.debug("item-panel selected with no itemKey", 3);
        selector = "#items-panel";
    }
    Z.debug("selector:" + selector, 3);

    var deviceSize = 'xs';
    var displaySections = [];
    switch (true) {
        case window.matchMedia("(min-width: 1200px)").matches:
            deviceSize = 'lg';
            widgetEl.find(".panelcontainer-panelcontainer").show().find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 992px)").matches:
            deviceSize = 'md';
            widgetEl.find(".panelcontainer-panelcontainer").show().find('.panelcontainer-panel').show();
            break;
        case window.matchMedia("(min-width: 768px)").matches:
            deviceSize = 'sm';
            widgetEl.find(".panelcontainer-panelcontainer").show().find('.panelcontainer-panel').show();
            if (selector == "#item-panel" || selector == "#items-panel") {
                widgetEl.find(selector).siblings(".panelcontainer-panel").hide();
                widgetEl.find(selector).show();
            }
            break;
        default:
            deviceSize = 'xs';
            widgetEl.find('.panelcontainer-panelcontainer').hide().find('.panelcontainer-panel').hide();
            widgetEl.find(selector).show().closest('.panelcontainer-panelcontainer').show();
    }
    Z.debug("panelContainer calculated deviceSize: " + deviceSize, 3);

    widgetEl.find('#panelcontainer-nav li').removeClass('active');

    switch (selector) {
        case '#collections-panel':
            widgetEl.find('li.collections-nav').addClass('active');
            break;
        case '#left-panel':
            widgetEl.find('li.filters-nav').addClass('active');
            break;
    }
};
"use strict";

Zotero.ui.widgets.reactsearchbox = {};

Zotero.ui.widgets.reactsearchbox.init = function (el) {
	Z.debug("Zotero.eventful.init.searchbox", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var container = J(el);

	var reactInstance = ReactDOM.render(React.createElement(LibrarySearchBox, { library: library }), document.getElementById('search-box'));
	Zotero.ui.widgets.reactsearchbox.reactInstance = reactInstance;
};

var LibrarySearchBox = React.createClass({
	displayName: "LibrarySearchBox",

	getInitialState: function getInitialState() {
		return {
			searchType: "simple"
		};
	},
	search: function search(evt) {
		e.preventDefault();
		Z.debug("library-search form submitted", 3);
		Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
		var container = J(evt.target);
		var query = container.find('input.search-query').val();
		var searchType = container.find('input.search-query').data('searchtype');
		if (query !== "" || Zotero.state.getUrlVar('q')) {
			Zotero.state.pathVars['q'] = query;
			if (searchType != "simple") {
				Zotero.state.pathVars['qmode'] = searchType;
			}
			Zotero.state.pushState();
		}
		return false;
	},
	clearLibraryQuery: function clearLibraryQuery(evt) {
		Zotero.state.unsetUrlVar('q');
		Zotero.state.unsetUrlVar('qmode');

		J(".search-query").val("");
		Zotero.state.pushState();
		return;
	},
	changeSearchType: function changeSearchType(evt) {
		evt.preventDefault();
		var selected = J(evt.target);
		var selectedType = selected.data('searchtype');
		this.setState({ searchType: selectedType });
	},
	render: function render() {
		var placeHolder = "";
		if (this.state.searchType == 'simple') {
			placeHolder = 'Search Title, Creator, Year';
		} else if (this.state.searchType == 'everything') {
			placeHolder = 'Search Full Text';
		}
		var defaultValue = Zotero.state.getUrlVar('q');

		return React.createElement(
			"div",
			{ className: "btn-toolbar row visible-xs", id: "search-box", style: { maxWidth: "350px" } },
			React.createElement(
				"form",
				{ action: "/search/", onSubmit: this.search, className: "navbar-form zsearch library-search", role: "search" },
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"div",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown" },
							React.createElement("span", { className: "caret" })
						),
						React.createElement(
							"ul",
							{ className: "dropdown-menu" },
							React.createElement(
								"li",
								null,
								React.createElement(
									"a",
									{ href: "#", onClick: this.changeSearchType, "data-searchtype": "simple" },
									"Title, Creator, Year"
								)
							),
							React.createElement(
								"li",
								null,
								React.createElement(
									"a",
									{ href: "#", onClick: this.changeSearchType, "data-searchtype": "everything" },
									"Full Text"
								)
							)
						)
					),
					React.createElement("input", { defaultValue: defaultValue, type: "text", name: "q", id: "header-search-query", className: "search-query form-control", placeholder: placeHolder }),
					React.createElement(
						"span",
						{ className: "input-group-btn" },
						React.createElement(
							"button",
							{ onClick: this.clearLibraryQuery, className: "btn btn-default clear-field-button", type: "button" },
							React.createElement("span", { className: "glyphicons fonticon glyphicons-remove-2" })
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactsendToLibraryDialog = {};

Zotero.ui.widgets.reactsendToLibraryDialog.init = function (el) {
	Z.debug("sendToLibraryDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(SendToLibraryDialog, { library: library }), document.getElementById('send-to-library-dialog'));

	library.listen("sendToLibraryDialog", reactInstance.openDialog, {});
};

var SendToLibraryDialog = React.createClass({
	displayName: "SendToLibraryDialog",

	getInitialState: function getInitialState() {
		return {
			writableLibraries: [],
			loading: false,
			loaded: false
		};
	},
	handleLibraryChange: function handleLibraryChange(evt) {
		this.setState({ targetLibrary: evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
		if (!this.state.loaded) {
			this.loadForeignLibraries();
		}
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	loadForeignLibraries: function loadForeignLibraries() {
		var reactInstance = this;
		var library = this.props.library;
		var userID = Zotero.config.loggedInUserID;
		var personalLibraryString = 'u' + userID;

		this.setState({ loading: true });

		var memberGroups = library.groups.fetchUserGroups(userID).then(function (response) {
			Z.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var writableLibraries = [{ name: 'My Library', libraryString: personalLibraryString }];
			for (var i = 0; i < memberGroups.length; i++) {
				if (memberGroups[i].isWritable(userID)) {
					var libraryString = 'g' + memberGroups[i].get('id');
					writableLibraries.push({
						name: memberGroups[i].get('name'),
						libraryString: libraryString
					});
				}
			}
			reactInstance.setState({ writableLibraries: writableLibraries, loading: false, loaded: true });
		})["catch"](function (err) {
			Zotero.ui.jsNotificationMessage("There was an error loading group libraries", "error");
			Z.error(err);
			Z.error(err.message);
		});
	},
	sendItem: function sendItem(evt) {
		Z.debug("sendToLibrary callback", 3);
		var library = this.props.library;
		//instantiate destination library
		var targetLibrary = this.state.targetLibrary;
		var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
		destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
		Zotero.libraries[targetLibrary] = destLibrary;

		//get items to send
		var itemKeys = Zotero.state.getSelectedItemKeys();
		if (itemKeys.length === 0) {
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			this.closeDialog();
			return false;
		}

		var sendItems = library.items.getItems(itemKeys);
		library.sendToLibrary(sendItems, destLibrary).then(function (foreignItems) {
			Zotero.ui.jsNotificationMessage("Items sent to other library", 'notice');
		})["catch"](function (response) {
			Z.debug(response);
			Zotero.ui.jsNotificationMessage("Error sending items to other library", 'notice');
		});
		this.closeDialog();
		return false;
	},
	render: function render() {
		var destinationLibraries = this.state.writableLibraries;
		var libraryOptions = destinationLibraries.map(function (lib) {
			return React.createElement(
				"option",
				{ key: lib.libraryString, value: lib.libraryString },
				lib.name
			);
		});
		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "send-to-library-dialog", className: "send-to-library-dialog", role: "dialog", "aria-hidden": "true", title: "Send to Library", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Send To Library"
							)
						),
						React.createElement(
							"div",
							{ className: "send-to-library-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								null,
								React.createElement(
									"div",
									{ "data-role": "fieldcontain" },
									React.createElement(
										"label",
										{ htmlFor: "destination-library" },
										"Library"
									),
									React.createElement(
										"select",
										{ onChange: this.handleLibraryChange, className: "destination-library-select form-control", name: "desination-library" },
										libraryOptions
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ onClick: this.closeDialog, className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.sendItem, className: "btn btn-primary sendButton" },
								"Send"
							)
						)
					)
				)
			)
		);
	}
});
'use strict';

Zotero.ui.widgets.reacttags = {};

Zotero.ui.widgets.reacttags.init = function (el) {
	Z.debug("tags widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);

	var reactInstance = ReactDOM.render(React.createElement(Tags, { library: library }), document.getElementById('tags-list-div'));
	Zotero.ui.widgets.reacttags.reactInstance = reactInstance;
};

var TagRow = React.createClass({
	displayName: 'TagRow',

	getDefaultProps: function getDefaultProps() {
		return {
			showAutomatic: false
		};
	},
	handleClick: function handleClick(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var tag = this.props.tag;

		Z.state.toggleTag(tag.apiObj.tag);
		Z.state.clearUrlVars(['tag', 'collectionKey']);
		Z.state.pushState();

		var selectedTags = Zotero.state.getUrlVar('tag');
		if (!J.isArray(selectedTags)) {
			if (selectedTags) {
				selectedTags = [selectedTags];
			} else {
				selectedTags = [];
			}
		}
		Zotero.ui.widgets.reacttags.reactInstance.setState({ selectedTags: selectedTags });
	},
	render: function render() {
		var tag = this.props.tag;
		var title = tag.apiObj.tag;
		if (tag.apiObj.meta.numItems) {
			title += " (" + tag.apiObj.meta.numItems + ")";
		}
		var newUrl = "";

		var tagStyle = {};
		if (tag.color) {
			tagStyle = {
				color: tag.color,
				fontWeight: "bold"
			};
		}

		//render nothing for automatic tags user doesn't want displayed
		if (this.props.showAutomatic == false && tag.apiObj.meta.type != 0) {
			return null;
		}

		return React.createElement(
			'li',
			{ className: 'tag-row' },
			React.createElement(
				'a',
				{ onClick: this.handleClick, className: 'tag-link', title: title, style: tagStyle, href: newUrl },
				Zotero.ui.trimString(tag.apiObj.tag, 12)
			)
		);
	}
});

var TagList = React.createClass({
	displayName: 'TagList',

	getDefaultProps: function getDefaultProps() {
		return {
			tags: [],
			showAutomatic: false,
			id: ""
		};
	},
	render: function render() {
		var showAutomatic = this.props.showAutomatic;
		var tagRowNodes = this.props.tags.map(function (tag, ind) {
			return React.createElement(TagRow, { key: tag.apiObj.tag, tag: tag, showAutomatic: showAutomatic });
		});

		return React.createElement(
			'ul',
			{ id: this.props.id },
			tagRowNodes
		);
	}
});

var Tags = React.createClass({
	displayName: 'Tags',

	getDefaultProps: function getDefaultProps() {
		return {};
	},
	getInitialState: function getInitialState() {
		return {
			tags: new Zotero.Tags(),
			tagColors: null,
			selectedTags: [],
			tagFilter: "",
			showAutomatic: false,
			loading: false
		};
	},
	componentWillMount: function componentWillMount(evt) {
		var reactInstance = this;
		var library = this.props.library;

		var tagColors = library.preferences.getPref("tagColors");
		var selectedTags = Zotero.state.getUrlVar('tag');
		if (!J.isArray(selectedTags)) {
			if (selectedTags) {
				selectedTags = [selectedTags];
			} else {
				selectedTags = [];
			}
		}

		reactInstance.setState({ tagColors: tagColors, selectedTags: selectedTags });

		library.listen("tagsDirty", reactInstance.syncTags, {});
		library.listen("cachedDataLoaded", reactInstance.syncTags, {});

		library.listen("tagsChanged libraryTagsUpdated selectedTagsChanged", function (evt) {
			reactInstance.setState({ tags: library.tags });
		}, {});
	},
	handleFilterChanged: function handleFilterChanged(evt) {
		this.setState({ tagFilter: evt.target.value });
	},
	syncTags: function syncTags(evt) {
		Z.debug("Tags.syncTags");
		var reactInstance = this;
		if (this.state.loading) {
			return;
		}
		var library = this.props.library;

		//clear tags if we're explicitly not using cached tags
		if (evt.data && evt.data.checkCached === false) {
			library.tags.clear();
		}

		reactInstance.setState({ tags: library.tags, loading: true });

		//cached tags are preloaded with library if the cache is enabled
		//this function shouldn't be triggered until that has already been done
		loadingPromise = library.loadUpdatedTags().then(function () {
			Z.debug("syncTags done. clearing loading div");
			reactInstance.setState({ tags: library.tags, loading: false });
			return;
		}, function (error) {
			Z.error("syncTags failed. showing local data and clearing loading div");
			reactInstance.setState({ tags: library.tags, loading: false });
			Zotero.ui.jsNotificationMessage("There was an error loading tags. Some tags may not have been updated.", 'notice');
		});

		return;
	},
	render: function render() {
		var tags = this.state.tags;
		var selectedTagStrings = this.state.selectedTags;
		var tagColors = this.state.tagColors;
		if (tagColors === null) {
			tagColors = [];
		}

		var matchAnyFilter = this.state.tagFilter;
		var plainTagsList = tags.plainTagsList(tags.tagsArray);
		var matchedTagStrings = Z.utils.matchAnyAutocomplete(matchAnyFilter, plainTagsList);

		var tagColorStrings = [];
		var coloredTags = [];
		tagColors.forEach(function (tagColor, index) {
			Z.debug("tagColor processing " + index);
			tagColorStrings.push(tagColor.name.toLowerCase());
			var coloredTag = tags.getTag(tagColor.name);
			if (coloredTag) {
				coloredTag.color = tagColor.color;
				coloredTags.push(coloredTag);
			}
		});
		var filteredTags = [];
		var selectedTags = [];

		//always show selected tags, even if they don't pass the filter
		selectedTagStrings.forEach(function (tagString) {
			var t = tags.getTag(tagString);
			if (t) {
				selectedTags.push(t);
			}
		});
		//add to filteredTags if passes filter, and is not already selected or colored
		matchedTagStrings.forEach(function (matchedString) {
			var t = tags.getTag(matchedString);
			if (t !== null && t.apiObj.meta.numItems > 0) {
				//we have the actual tag object, and it has items
				//add to filteredTags if it is not already in colored or selected lists
				if (selectedTagStrings.indexOf(matchedString) == -1 && tagColorStrings.indexOf(matchedString) == -1) {
					filteredTags.push(t);
				}
			}
		});

		return React.createElement(
			'div',
			{ id: 'tags-list-div', className: 'tags-list-div' },
			React.createElement(
				'div',
				null,
				React.createElement('input', { type: 'text', id: 'tag-filter-input', className: 'tag-filter-input form-control', placeholder: 'Filter Tags', onChange: this.handleFilterChanged }),
				React.createElement(LoadingSpinner, { loading: this.state.loading }),
				React.createElement(TagList, { tags: selectedTags, id: 'selected-tags-list' }),
				React.createElement(TagList, { tags: coloredTags, id: 'colored-tags-list' }),
				React.createElement(TagList, { tags: filteredTags, id: 'tags-list' })
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactupdateCollectionDialog = {};

Zotero.ui.widgets.reactupdateCollectionDialog.init = function (el) {
	Z.debug("updatecollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(UpdateCollectionDialog, { library: library }), document.getElementById('update-collection-dialog'));

	library.listen("updateCollectionDialog", function () {
		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var currentCollection = library.collections.getCollection(currentCollectionKey);
		var parent = "";
		var name = "";
		if (currentCollection) {
			parent = currentCollection.get('parentCollection');
			name = currentCollection.get('name');
		}
		reactInstance.setState({
			collectionName: name,
			parentCollection: parent
		});
		reactInstance.openDialog();
	}, {});
};

var UpdateCollectionDialog = React.createClass({
	displayName: "UpdateCollectionDialog",

	getInitialState: function getInitialState() {
		return {
			collectionName: "",
			parentCollection: null
		};
	},
	handleCollectionChange: function handleCollectionChange(evt) {
		this.setState({ 'parentCollection': evt.target.value });
	},
	handleNameChange: function handleNameChange(evt) {
		this.setState({ 'collectionName': evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	saveCollection: function saveCollection(evt) {
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if (name == "") {
			name = "Untitled";
		}

		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var collection = library.collections.getCollection(currentCollectionKey);

		if (!collection) {
			Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
			return false;
		}
		Z.debug("updating collection: " + parentKey + ": " + name);
		collection.update(name, parentKey).then(function (response) {
			Zotero.ui.jsNotificationMessage("Collection Saved", 'confirm');
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState(true);
			reactInstance.closeDialog();
		})["catch"](Zotero.catchPromiseError);
	},
	render: function render() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function (collection, index) {
			return React.createElement(
				"option",
				{ key: collection.get('key'), value: collection.get('key') },
				'-'.repeat(collection.nestingDepth),
				" ",
				collection.get('name')
			);
		});
		collectionOptions.unshift(React.createElement(
			"option",
			{ key: "emptyvalue", value: "" },
			"None"
		));

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "update-collection-dialog", className: "update-collection-dialog", role: "dialog", title: "Update Collection", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								null,
								"Update Collection"
							)
						),
						React.createElement(
							"div",
							{ className: "update-collection-div modal-body" },
							React.createElement(
								"form",
								{ method: "POST", className: "zform" },
								React.createElement(
									"ol",
									null,
									React.createElement(
										"li",
										null,
										React.createElement(
											"label",
											{ htmlFor: "updated-collection-title-input" },
											"Rename Collection"
										),
										React.createElement("input", { value: this.state.collectionName, onChange: this.handleNameChange, id: "updated-collection-title-input", className: "updated-collection-title-input form-control" })
									),
									React.createElement(
										"li",
										null,
										React.createElement(
											"label",
											{ htmlFor: "update-collection-parent-select" },
											"Parent Collection"
										),
										React.createElement(
											"select",
											{ value: this.state.parentCollection, onChange: this.handleCollectionChange, className: "collectionKey-select update-collection-parent form-control" },
											collectionOptions
										)
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ className: "btn", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.saveCollection, className: "btn btn-primary updateButton" },
								"Update"
							)
						)
					)
				)
			)
		);
	}
});
"use strict";

Zotero.ui.widgets.reactuploadDialog = {};

Zotero.ui.widgets.reactuploadDialog.init = function (el) {
	Z.debug("uploaddialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(UploadAttachmentDialog, { library: library }), document.getElementById('upload-dialog'));

	library.listen("uploadAttachment", function () {
		Z.debug("got uploadAttachment event; opening upload dialog");
		reactInstance.setState({ itemKey: Zotero.state.getUrlVar('itemKey') });
		reactInstance.openDialog();
	}, {});
};

var UploadAttachmentDialog = React.createClass({
	displayName: "UploadAttachmentDialog",

	getInitialState: function getInitialState() {
		return {
			title: "",
			fileInfo: null,
			filename: "",
			filesize: 0,
			contentType: null,
			percentLoaded: 0,
			uploading: false
		};
	},
	upload: function upload() {
		Z.debug("uploadFunction", 3);
		var reactInstance = this;
		var library = this.props.library;

		//callback for when everything in the upload form is filled
		//grab file blob
		//grab file data given by user
		//create or modify attachment item
		//Item.uploadExistingFile or uploadChildAttachment

		var fileInfo = this.state.fileInfo;
		var specifiedTitle = this.state.title;

		var progressCallback = function progressCallback(e) {
			Z.debug('fullUpload.upload.onprogress', 3);
			var percentLoaded = Math.round(e.loaded / e.total * 100);
			reactInstance.setState({ percentLoaded: percentLoaded });
		};

		this.setState({ uploading: true });

		//upload new copy of file if we're modifying an attachment
		//create child and upload file if we're modifying a top level item
		var itemKey = Zotero.state.getUrlVar('itemKey');
		var item = library.items.getItem(itemKey);
		var uploadPromise;

		if (!item.get("parentItem")) {
			Z.debug("no parentItem", 3);
			//get template item
			var childItem = new Zotero.Item();
			childItem.associateWithLibrary(library);
			uploadPromise = childItem.initEmpty('attachment', 'imported_file').then(function (childItem) {
				Z.debug("templateItemDeferred callback", 3);
				childItem.set('title', specifiedTitle);

				return item.uploadChildAttachment(childItem, fileInfo, progressCallback);
			});
		} else if (item.get('itemType') == 'attachment' && item.get("linkMode") == 'imported_file') {
			Z.debug("imported_file attachment", 3);
			uploadPromise = item.uploadFile(fileInfo, progressCallback);
		}

		uploadPromise.then(function () {
			Z.debug("uploadSuccess", 3);
			library.trigger("uploadSuccessful");
			reactInstance.closeDialog();
		})["catch"](reactInstance.failureHandler).then(function () {
			reactInstance.closeDialog();
		});
	},
	handleUploadFailure: function handleUploadFailure(failure) {
		Z.debug("Upload failed", 3);
		Z.debug(failure, 3);
		Zotero.ui.jsNotificationMessage("There was a problem uploading your file.", 'error');
		switch (failure.code) {
			case 400:
				Zotero.ui.jsNotificationMessage("Bad Input. 400", 'error');
				break;
			case 403:
				Zotero.ui.jsNotificationMessage("You do not have permission to edit files", 'error');
				break;
			case 409:
				Zotero.ui.jsNotificationMessage("The library is currently locked. Please try again in a few minutes.", 'error');
				break;
			case 412:
				Zotero.ui.jsNotificationMessage("File conflict. Remote file has changed", 'error');
				break;
			case 413:
				Zotero.ui.jsNotificationMessage("Requested upload would exceed storage quota.", 'error');
				break;
			case 428:
				Zotero.ui.jsNotificationMessage("Precondition required error", 'error');
				break;
			case 429:
				Zotero.ui.jsNotificationMessage("Too many uploads pending. Please try again in a few minutes", 'error');
				break;
			default:
				Zotero.ui.jsNotificationMessage("Unknown error uploading file. " + failure.code, 'error');
		}
	},
	handleFiles: function handleFiles(files) {
		Z.debug("attachmentUpload handleFiles", 3);
		var reactInstance = this;

		if (typeof files == 'undefined' || files.length === 0) {
			return false;
		}
		var file = files[0];

		Zotero.file.getFileInfo(file).then(function (fileInfo) {
			Z.debug(fileInfo);
			reactInstance.setState({
				fileInfo: fileInfo,
				filename: fileInfo.filename,
				filesize: fileInfo.filesize,
				contentType: fileInfo.contentType
			});
		});
		return;
	},
	handleDrop: function handleDrop(evt) {
		Z.debug("fileuploaddroptarget drop callback", 3);
		evt.stopPropagation();
		evt.preventDefault();
		//clear file input so drag/drop and input don't show conflicting information
		var e = evt.originalEvent;
		var dt = e.dataTransfer;
		var files = dt.files;
		this.handleFiles(files);
	},
	handleFileInputChange: function handleFileInputChange(evt) {
		Z.debug("fileuploaddroptarget callback 1", 3);
		evt.stopPropagation();
		evt.preventDefault();
		var files = J(this.refs.fileInput).get(0).files;
		this.handleFiles(files);
	},
	handleTitleChange: function handleTitleChange(evt) {
		this.setState({ title: evt.target.value });
	},
	openDialog: function openDialog() {
		this.refs.modal.open();
	},
	closeDialog: function closeDialog(evt) {
		this.refs.modal.close();
	},
	render: function render() {
		var library = this.props.library;

		return React.createElement(
			BootstrapModalWrapper,
			{ ref: "modal" },
			React.createElement(
				"div",
				{ id: "upload-attachment-dialog", className: "upload-attachment-dialog", role: "dialog", title: "Upload Attachment", "data-keyboard": "true" },
				React.createElement(
					"div",
					{ className: "modal-dialog" },
					React.createElement(
						"div",
						{ className: "modal-content" },
						React.createElement(
							"div",
							{ className: "modal-header" },
							React.createElement(
								"button",
								{ type: "button", className: "close", "data-dismiss": "modal", "aria-hidden": "true" },
								"×"
							),
							React.createElement(
								"h3",
								{ className: "modal-title" },
								"Upload Attachment"
							)
						),
						React.createElement(
							"div",
							{ className: "upload-attachment-div modal-body", "data-role": "content" },
							React.createElement(
								"form",
								{ className: "attachmentuploadForm zform" },
								React.createElement(
									"h3",
									null,
									"Select a file for upload or drag and drop below"
								),
								React.createElement(
									"span",
									{ className: "btn btn-primary btn-file" },
									"Choose File",
									React.createElement("input", { onChange: this.handleFileInputChange, ref: "fileInput", type: "file", id: "fileuploadinput", className: "fileuploadinput", multiple: true })
								),
								React.createElement(
									"div",
									{ onDrop: this.handleDrop, id: "fileuploaddroptarget", className: "fileuploaddroptarget" },
									React.createElement(
										"h3",
										null,
										"Drop your file here"
									),
									React.createElement("h3", { id: "droppedfilename", className: "droppedfilename" }),
									React.createElement(LoadingSpinner, { loading: this.state.uploading })
								),
								React.createElement(
									"div",
									{ id: "attachmentuploadfileinfo", className: "attachmentuploadfileinfo" },
									React.createElement(
										"table",
										{ className: "table table-striped" },
										React.createElement(
											"tbody",
											null,
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Title"
												),
												React.createElement(
													"td",
													null,
													React.createElement("input", { onChange: this.handleTitleChange, id: "upload-file-title-input", className: "upload-file-title-input form-control", type: "text" })
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Size"
												),
												React.createElement(
													"td",
													{ className: "uploadfilesize" },
													this.state.filesize
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Type"
												),
												React.createElement(
													"td",
													{ className: "uploadfiletype" },
													this.state.contentType
												)
											),
											React.createElement(
												"tr",
												null,
												React.createElement(
													"th",
													null,
													"Upload"
												),
												React.createElement(
													"td",
													{ className: "uploadprogress" },
													React.createElement("meter", { min: "0", max: "100", value: "0", id: "uploadprogressmeter", value: this.state.percentLoaded })
												)
											)
										)
									)
								)
							)
						),
						React.createElement(
							"div",
							{ className: "modal-footer" },
							React.createElement(
								"button",
								{ type: "button", className: "btn btn-default", "data-dismiss": "modal", "aria-hidden": "true" },
								"Close"
							),
							React.createElement(
								"button",
								{ onClick: this.upload, type: "button", className: "btn btn-primary uploadButton" },
								"Upload"
							)
						)
					)
				)
			)
		);
	}
});
