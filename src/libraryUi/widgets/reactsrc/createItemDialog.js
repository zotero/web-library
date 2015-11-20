Zotero.ui.widgets.reactcreateItemDialog = {};

Zotero.ui.widgets.reactcreateItemDialog.init = function(el){
	Z.debug("createItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<CreateItemDialog library={library} />,
		document.getElementById('create-item-dialog')
	);
	
	library.listen("createItem", function(evt){
		Z.debug("Opening createItem dialog");
		Z.debug(evt);
		var itemType = evt.itemType;
		Z.debug(itemType);
		reactInstance.setState({itemType: itemType});
		reactInstance.openDialog();
	}, {});
};

var CreateItemDialog = React.createClass({
	getInitialState: function() {
		return {
			title:"",
			itemType: "document"
		}
	},
	handleTitleChange: function(evt) {
		this.setState({'title': evt.target.value});
	},
	createItem: function() {
		var reactInstance = this;
		var library = this.props.library;
		var itemType = this.state.itemType;
		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var title = reactInstance.state.title;
		if(title == ""){
			title = "Untitled";
		}
		
		var item = new Zotero.Item();
		item.initEmpty(itemType).then(function(){
			item.associateWithLibrary(library);
			item.set('title', title);
			if(currentCollectionKey){
				item.addToCollection(currentCollectionKey);
			}
			return Zotero.ui.saveItem(item);
		}).then(function(responses){
			var itemKey = item.get('key');
			Zotero.state.setUrlVar('itemKey', itemKey);
			Zotero.state.pushState();
			reactInstance.closeDialog();
		}).catch(function(error){
			Zotero.error(error);
			Zotero.ui.jsNotificationMessage("There was an error creating the item.", "error");
			reactInstance.closeDialog();
		});
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	render: function() {
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="create-item-dialog" className="create-item-dialog" role="dialog" title="Create Item" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Create Item</h3>
							</div>
							<div className="new-item-div modal-body" data-role="content">
								<form method="POST">
									<div data-role="fieldcontain">
										<label htmlFor="new-item-title-input">Title</label>
										<input onChange={this.handleTitleChange} id="new-item-title-input" className="new-item-title-input form-control" type="text" />
									</div>
								</form>
							</div>
							<div className="modal-footer">
								<button className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.createItem} className="btn btn-primary createButton">Create</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});
