'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:createCollectionDialog');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var CreateCollectionDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("createCollectionDialog", function(){
			reactInstance.forceUpdate();
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function() {
		return {
			collectionName: "",
			parentCollection: null,
		}
	},
	handleCollectionChange: function(evt) {
		log.debug(evt);
		log.debug(evt.target.value);
		this.setState({'parentCollection': evt.target.value});
	},
	handleNameChange: function(evt) {
		this.setState({'collectionName': evt.target.value});
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	createCollection: function() {
		log.debug("react createCollection");
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if(name == ""){
			name = "Untitled";
		}
		
		library.addCollection(name, parentKey)
		.then(function(responses){
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState();
			reactInstance.closeDialog();
			Zotero.ui.jsNotificationMessage("Collection Created", 'success');
		}).catch(function(error){
			Zotero.ui.jsNotificationMessage("There was an error creating the collection.", "error");
			reactInstance.closeDialog();
		});
	},
	render: function() {
		var library = this.props.library;
		var ncollections = library.collections.nestedOrderingArray();
		
		var collectionOptions = ncollections.map(function(collection, index){
			return (
				<option key={collection.get('key')} value={collection.get('key')}>{'-'.repeat(collection.nestingDepth)} {collection.get('name')}</option>
			);
		});
		collectionOptions.unshift(
			<option key="emptyvalue" value=''>None</option>
		);

		return (
			<BootstrapModalWrapper ref="modal">
			<div id="create-collection-dialog" className="create-collection-dialog" role="dialog" title="Create Collection" data-keyboard="true">
				<div  className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
							<h3>Create Collection</h3>
						</div>
						<div className="new-collection-div modal-body" data-role="content">
							<form method="POST">
								<div data-role="fieldcontain">
									<label htmlFor="new-collection-title-input">Collection Name</label>
									<input onChange={this.handleNameChange} className="new-collection-title-input form-control" type="text" />
								</div>
								<div data-role="fieldcontain">
								<label htmlFor="new-collection-parent">Parent Collection</label>
								<select onChange={this.handleCollectionChange} className='collectionKey-select new-collection-parent form-control' defaultValue="">
									{collectionOptions}
								</select>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button onClick={this.closeDialog} className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
							<button onClick={this.createCollection} className="btn btn-primary createButton">Create</button>
						</div>
					</div>
				</div>
			</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = CreateCollectionDialog;
