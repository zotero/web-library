'use strict';

var log = require('../../Log.js').Logger('zotero-web-library:addToCollectionDialog');

var React = require('react');

var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var AddToCollectionDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen('addToCollectionDialog', function(){
			reactInstance.setState({});
			reactInstance.openDialog();
		}, {});
	},
	getInitialState: function() {
		return {
			collectionKey: null
		};
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
		log.debug('add-to-collection clicked', 3);
		var reactInstance = this;
		var library = this.props.library;
		var itemKeys = Zotero.state.getSelectedItemKeys();
		var collectionKey = this.state.collectionKey;
		if(!collectionKey){
			Zotero.ui.jsNotificationMessage('No collection selected', 'error');
			return false;
		}
		if(itemKeys.length === 0){
			Zotero.ui.jsNotificationMessage('No items selected', 'notice');
			return false;
		}
		
		library.collections.getCollection(collectionKey).addItems(itemKeys)
		.then(function(response){
			library.dirty = true;
			Zotero.ui.jsNotificationMessage('Items added to collection', 'success');
			reactInstance.closeDialog();
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

module.exports = AddToCollectionDialog;
