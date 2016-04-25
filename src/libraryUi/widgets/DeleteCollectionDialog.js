'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:deleteCollectionDialog');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var DeleteCollectionDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("deleteCollectionDialog", function(){
			reactInstance.setState({collectionKey:Zotero.state.getUrlVar("collectionKey")});
			reactInstance.openDialog();
		});
	},
	getInitialState: function() {
		return {
			collectionKey: null,
		}
	},
	handleCollectionChange: function(evt) {
		this.setState({'parentCollection': evt.target.value});
	},
	deleteCollection: function() {
		log.debug("DeleteCollectionDialog.deleteCollection", 3);
		var reactInstance = this;
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if(!collection){
			Zotero.ui.jsNotificationMessage("Selected collection not found", 'error');
			return false;
		}
		collection.remove()
		.then(function(){
			delete Zotero.state.pathVars['collectionKey'];
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			Zotero.state.pushState();
			Zotero.ui.jsNotificationMessage(collection.get('title') + " removed", 'confirm');
			reactInstance.closeDialog();
		}).catch(Zotero.catchPromiseError);
		return false;
	},
	openDialog: function() {
		if(!this.state.collectionKey){
			log.error("DeleteCollectionDialog opened with no collectionKey");
		}
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	render: function() {
		var library = this.props.library;
		var collection = library.collections.getCollection(this.state.collectionKey);
		if(!collection){
			return null;
		}
		
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="delete-collection-dialog" className="delete-collection-dialog" role="dialog" title="Delete Collection" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Delete Collection</h3>
							</div>
							<div className="delete-collection-div modal-body">
								<p>Really delete collection "{collection.get('title')}"?</p>
							</div>
							<div className="modal-footer">
								<button className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.deleteCollection} className="btn btn-primary deleteButton">Delete</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = DeleteCollectionDialog;
