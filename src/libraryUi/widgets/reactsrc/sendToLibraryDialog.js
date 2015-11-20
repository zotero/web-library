Zotero.ui.widgets.reactsendToLibraryDialog = {};

Zotero.ui.widgets.reactsendToLibraryDialog.init = function(el){
	Z.debug("sendToLibraryDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<SendToLibraryDialog library={library} />,
		document.getElementById('send-to-library-dialog')
	);
};

var SendToLibraryDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;
		library.listen("sendToLibraryDialog", reactInstance.openDialog, {});
	},
	getInitialState: function() {
		return {
			writableLibraries: [],
			loading:false,
			loaded:false
		};
	},
	handleLibraryChange: function(evt) {
		this.setState({targetLibrary: evt.target.value});
	},
	openDialog: function() {
		this.refs.modal.open();
		if(!this.state.loaded){
			this.loadForeignLibraries();
		}
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	loadForeignLibraries: function() {
		var reactInstance = this;
		var library = this.props.library;
		var userID = Zotero.config.loggedInUserID;
		var personalLibraryString = 'u' + userID;
		
		this.setState({loading:true});

		var memberGroups = library.groups.fetchUserGroups(userID)
		.then(function(response){
			Z.debug("got member groups", 3);
			var memberGroups = response.fetchedGroups;
			var writableLibraries = [{name:'My Library', libraryString:personalLibraryString}];
			for(var i = 0; i < memberGroups.length; i++){
				if(memberGroups[i].isWritable(userID)){
					var libraryString = 'g' + memberGroups[i].get('id');
					writableLibraries.push({
						name: memberGroups[i].get('name'),
						libraryString: libraryString,
					});
				}
			}
			reactInstance.setState({writableLibraries: writableLibraries, loading:false, loaded:true});
		}).catch(function(err){
			Zotero.ui.jsNotificationMessage("There was an error loading group libraries", "error");
			Z.error(err);
			Z.error(err.message);
		});
	},
	sendItem: function(evt) {
		Z.debug("sendToLibrary callback", 3);
		var library = this.props.library;
		//instantiate destination library
		var targetLibrary = this.state.targetLibrary;
		var destLibConfig = Zotero.utils.parseLibString(targetLibrary);
		destLibrary = new Zotero.Library(destLibConfig.libraryType, destLibConfig.libraryID);
		Zotero.libraries[targetLibrary] = destLibrary;
		
		//get items to send
		var itemKeys = Zotero.state.getSelectedItemKeys();
		if(itemKeys.length === 0){
			Zotero.ui.jsNotificationMessage("No items selected", 'notice');
			this.closeDialog();
			return false;
		}
		
		var sendItems = library.items.getItems(itemKeys);
		library.sendToLibrary(sendItems, destLibrary)
		.then(function(foreignItems){
			Zotero.ui.jsNotificationMessage("Items sent to other library", 'notice');
		}).catch(function(response){
			Z.debug(response);
			Zotero.ui.jsNotificationMessage("Error sending items to other library", 'notice');
		});
		this.closeDialog();
		return false;
	},
	render: function() {
		var destinationLibraries = this.state.writableLibraries;
		var libraryOptions = destinationLibraries.map(function(lib) {
			return (
				<option key={lib.libraryString} value={lib.libraryString}>{lib.name}</option>
			);
		});
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="send-to-library-dialog" className="send-to-library-dialog" role="dialog" aria-hidden="true" title="Send to Library" data-keyboard="true">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Send To Library</h3>
							</div>
							<div className="send-to-library-div modal-body" data-role="content">
								<form>
									<div data-role="fieldcontain">
									<label htmlFor="destination-library">Library</label>
									<select onChange={this.handleLibraryChange} className='destination-library-select form-control' name="desination-library">
										{libraryOptions}
									</select>
									</div>
								</form>
							</div>
							<div className="modal-footer">
								<button onClick={this.closeDialog} className="btn" data-dismiss="modal" aria-hidden="true">Close</button>
								<button onClick={this.sendItem} className="btn btn-primary sendButton">Send</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});
