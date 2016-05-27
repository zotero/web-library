'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:chooseSortingDialog');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var ChooseSortingDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		var currentSortField = Zotero.ui.getPrioritizedVariable('order', 'title');
		var currentSortOrder = Zotero.ui.getPrioritizedVariable('sort', 'asc');
		reactInstance.setState({
			sortField: currentSortField,
			sortOrder: currentSortOrder
		});

		library.listen('chooseSortingDialog', reactInstance.openDialog, {});
	},
	getInitialState: function() {
		return {
			sortField: '',
			sortOrder: 'asc'
		};
	},
	handleFieldChange: function(evt) {
		this.setState({sortField: evt.target.value});
	},
	handleOrderChange: function(evt) {
		this.setState({sortOrder: evt.target.value});
	},
	saveSorting: function() {
		var library = this.props.library;
		library.trigger('changeItemSorting', {newSortField:this.state.sortField, newSortOrder:this.state.sortOrder});
		this.closeDialog();
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	render: function() {
		var library = this.props.library;
		var sortableOptions = library.sortableColumns.map(function(col){
			return (
				<option key={col} label={Zotero.localizations.fieldMap[col]} value={col}>{Zotero.localizations.fieldMap[col]}</option>
			);
		});

		return (
			<BootstrapModalWrapper ref="modal">
				<div id="choose-sorting-dialog" className="choose-sorting-dialog" role="dialog" title="Sort Order" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Sort Items By</h3>
							</div>
							<div className="choose-sorting-div modal-body" data-role="content">
								<form className="form-horizontal" role="form">
									<select defaultValue={this.state.sortField} onChange={this.handleFieldChange} id="sort-column-select" className="sort-column-select form-control" name="sort-column-select">
										{sortableOptions}
									</select>
									
									<select defaultValue={this.state.sortOrder} onChange={this.handleOrderChange} id="sort-order-select" className="sort-order-select form-control" name="sort-order-select">
										<option label="Ascending" value="asc">Ascending</option>
										<option label="Descending" value="desc">Descending</option>
									</select>
								</form>
							</div>
							<div className="modal-footer">
								<button className="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
								<button onClick={this.saveSorting} className="btn btn-primary saveSortButton">Save</button>
							</div>
						</div>
					</div>
				</div>
			</BootstrapModalWrapper>
		);
	}
});

module.exports = ChooseSortingDialog;