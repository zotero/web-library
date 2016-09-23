'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:updateCollectionDialog');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var UpdateCollectionDialog = React.createClass({
	componentWillMount: function() {
	},
	getInitialState: function() {
		return {
			collectionName: '',
			parentCollection: '',
		};
	},
	updateCollectionContext: function(){
		let library = this.props.library;
		let currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		let currentCollection = library.collections.getCollection(currentCollectionKey);
		let parent = '';
		let name = '';
		if(currentCollection){
			parent = currentCollection.get('parentCollection');
			name = currentCollection.get('name');
		}
		this.setState({
			collectionName: name,
			parentCollection: parent
		});
	},
	handleCollectionChange: function(evt) {
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
	saveCollection: function(evt) {
		var reactInstance = this;
		var library = this.props.library;
		var parentKey = this.state.parentCollection;
		var name = this.state.collectionName;
		if(name == ''){
			name = 'Untitled';
		}
		
		var currentCollectionKey = Zotero.state.getUrlVar('collectionKey');
		var collection = library.collections.getCollection(currentCollectionKey);
		
		if(!collection){
			Zotero.ui.jsNotificationMessage('Selected collection not found', 'error');
			return false;
		}
		log.debug('updating collection: ' + parentKey + ': ' + name);
		collection.update(name, parentKey)
		.then(function(response){
			Zotero.ui.jsNotificationMessage('Collection Saved', 'confirm');
			library.collections.dirty = true;
			library.collections.initSecondaryData();
			library.trigger('libraryCollectionsUpdated');
			Zotero.state.pushState(true);
			reactInstance.closeDialog();
		}).catch(Zotero.catchPromiseError);
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
				<div id="update-collection-dialog" className="update-collection-dialog" role="dialog" title="Update Collection" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Update Collection</h3>
							</div>
							<div className="update-collection-div modal-body">
								<form method="POST" className="zform">
									<ol>
										<li>
											<label htmlFor="updated-collection-title-input">Rename Collection</label>
											<input value={this.state.collectionName} onChange={this.handleNameChange} id="updated-collection-title-input" className="updated-collection-title-input form-control" />
										</li>
										<li>
											<label htmlFor="update-collection-parent-select">Parent Collection</label>
											<select value={this.state.parentCollection} onChange={this.handleCollectionChange} className='collectionKey-select update-collection-parent form-control'>
												{collectionOptions}
											</select>
										</li>
									</ol>
								</form>
							</div>
							<div className="modal-footer">
								<button className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.saveCollection} className="btn btn-primary updateButton">Update</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = UpdateCollectionDialog;
