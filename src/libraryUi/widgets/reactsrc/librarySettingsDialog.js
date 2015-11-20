Zotero.ui.widgets.reactlibrarysettingsdialog = {};

Zotero.ui.widgets.reactlibrarysettingsdialog.init = function(el){
	Z.debug("librarysettingsdialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<LibrarySettingsDialog library={library} />,
		document.getElementById('library-settings-dialog')
	);
};

var LibrarySettingsDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen('settingsLoaded', reactInstance.updateStateFromLibrary, {});
		library.listen("librarySettingsDialog", reactInstance.openDialog, {});
	},
	getInitialState: function() {
		return {
			listDisplayedFields: [],
			itemsPerPage: 25,
			showAutomaticTags: true
		};
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	updateShowFields: function(evt) {
		Z.debug("updateShowFields");
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var fieldName = evt.target.value;
		var display = evt.target.checked;
		
		if(display){
			Z.debug("adding field " + fieldName + " to listDisplayedFields");
			listDisplayedFields.push(fieldName);
		} else {
			Z.debug("filtering field " + fieldName + " from listDisplayedFields");
			
			listDisplayedFields = listDisplayedFields.filter(function(val){
				if(val == fieldName){
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
	updateShowAutomaticTags: function(evt){
		var library = this.props.library;
		var showAutomaticTags = evt.target.checked;

		this.setState({
			showAutomaticTags: showAutomaticTags
		});
		library.preferences.setPref("showAutomaticTags", showAutomaticTags);
		library.preferences.persist();

		library.trigger("tagsChanged");
	},/*
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
	updateStateFromLibrary: function(){
		var library = this.props.library;
		this.setState({
			listDisplayedFields: library.preferences.getPref('listDisplayedFields'),
			itemsPerPage: library.preferences.getPref('itemsPerPage'),
			showAutomaticTags: library.preferences.getPref('showAutomaticTags')
		});
	},
	render: function() {
		var reactInstance = this;
		var library = this.props.library;
		var listDisplayedFields = this.state.listDisplayedFields;
		var itemsPerPage = this.state.itemsPerPage;
		var showAutomaticTags = this.state.showAutomaticTags;
		var fieldMap = Zotero.localizations.fieldMap;

		var displayFieldNodes = Zotero.Library.prototype.displayableColumns.map(function(val, ind){
			var checked = (listDisplayedFields.indexOf(val) != -1);
			return (
				<div key={val} className="checkbox">
					<label htmlFor={"display-column-field-" + val}><input onChange={reactInstance.updateShowFields} type="checkbox" checked={checked} name="display-column-field" value={val} id={"display-column-field-" + val} className="display-column-field" />{fieldMap[val] || val}</label>
				</div>
			);
		});
		
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="library-settings-dialog" className="library-settings-dialog" role="dialog" aria-hidden="true" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
								<h3 className="modal-title">Library Settings</h3>
							</div>
							<div className="modal-body">
								<form id="library-settings-form" className="library-settings-form" role="form">
								<fieldset>
									<legend>Display Columns</legend>
									{displayFieldNodes}
								</fieldset>
								{/*
								<label htmlFor="items-per-page">Items Per Page</label>
								<select onChange={this.updateItemPerPage} defaultValue={this.state.itemsPerPage} id="items-per-page" name="items-per-page" className="form-control">
									<option value="25">25</option>
									<option value="50">50</option>
									<option value="75">75</option>
									<option value="100">100</option>
								</select>
								*/}
								<div className="checkbox">
									<label htmlFor="show-automatic-tags">
									<input onChange={this.updateShowAutomaticTags} type="checkbox" id="show-automatic-tags" name="show-automatic-tags" />
									Show Automatic Tags
									</label>
									<p className="help-block">Automatic tags are tags added automatically when a reference was imported, rather than by a user.</p>
								</div>
								</form>
							</div>
							<div className="modal-footer">
								<button className="btn btn-default" data-dismiss="modal" aria-hidden="true">Close</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

