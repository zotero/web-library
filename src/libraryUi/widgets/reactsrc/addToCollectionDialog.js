Zotero.ui.widgets.reactaddToCollectionDialog = {};

Zotero.ui.widgets.reactaddToCollectionDialog.init = function(el){
	Z.debug("addtocollectionsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<AddToCollectionDialog library={library} />,
		document.getElementById('add-to-collection-dialog')
	);
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;
};

var AddToCollectionDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("addToCollectionDialog", function(){
			reactInstance.setState({});
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function() {
		return {
			collectionKey: null,
		}
	},
	handleCollectionChange: function(evt) {
		this.setState({'collectionKey': evt.target.value});
	},
	openDialog: function() {
		//this.setState({open:true});
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		//this.setState({open:false});
		this.refs.modal.close();
	},
	addToCollection: function(evt) {
		Z.debug("add-to-collection clicked", 3);
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = this.state.collectionKey;
		if(!collectionKey){
			Zotero.ui.jsNotificationMessage("No collection selected", 'error');
			return false;
		}
		if(itemKeys.length === 0){
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			return false;
		}
		
		library.collections.getCollection(collectionKey).addItems(itemKeys)
		.then(function(response){
			library.dirty = true;
			Zotero.ui.jsNotificationMessage("Items added to collection", 'success');
		}).catch(Zotero.catchPromiseError);
		return false;
	},
	render: function() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();

		var collectionOptions = ncollections.map(function(collection, index){
			return (
				<option key={collection.get('key')} value={collection.get('key')}>{'-'.repeat(collection.nestingDepth)} {collection.get('name')}</option>
			);
		});
		
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="add-to-collection-dialog" className="add-to-collection-dialog" role="dialog" title="Add to Collection" data-keyboard="true">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Add To Collection</h3>
							</div>
							<div className="add-to-collection-div modal-body" data-role="content">
								<form method="POST">
									<div data-role="fieldcontain">
										<label htmlFor="new-collection-parent">Collection</label>
										<select onChange={this.handleCollectionChange} className='collectionKey-select target-collection form-control'>
											{collectionOptions}
										</select>
									</div>
								</form>
							</div>
							<div className="modal-footer">
								<button onClick={this.closeDialog} className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.addToCollection} className="btn btn-primary addButton">Add</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});


var BootstrapModalWrapper = React.createClass({
	// The following two methods are the only places we need to
	// integrate Bootstrap or jQuery with the components lifecycle methods.
	componentDidMount: function() {
		// When the component is added, turn it into a modal
		Z.debug("BootstrapModalWrapper componentDidMount");
		J(this.refs.root).modal({backdrop: 'static', keyboard: false, show: false});
	},
	componentWillUnmount: function() {
		Z.debug("BootstrapModalWrapper componentWillUnmount");
		J(this.refs.root).off('hidden', this.handleHidden);
	},
	close: function() {
		Z.debug("BootstrapModalWrapper close");
		J(this.refs.root).modal('hide');
	},
	open: function() {
		Z.debug("BootstrapModalWrapper open");
		J(this.refs.root).modal('show');
	},
	render: function() {
		return (
			<div className="modal" ref="root">
				{this.props.children}
			</div>
		);
	},
});