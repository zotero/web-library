"use strict";

Zotero.ui.widgets.reactaddToCollectionDialog = {};

Zotero.ui.widgets.reactaddToCollectionDialog.init = function (el) {
	Z.debug("addtocollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(React.createElement(AddToCollectionDialog, { library: library }), document.getElementById('add-to-collection-dialog'));
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;
};

var AddToCollectionDialog = React.createClass({
	displayName: "AddToCollectionDialog",

	componentWillMount: function componentWillMount() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("addToCollectionDialog", function () {
			reactInstance.setState({});
			reactInstance.openDialog();
		}, {});
	},
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
		}).catch(Zotero.catchPromiseError);
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
