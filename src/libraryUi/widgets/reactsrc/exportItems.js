Zotero.ui.widgets.reactexportItemsDialog = {};

Zotero.ui.widgets.reactexportItemsDialog.init = function(el){
	Z.debug("exportItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<ExportItemsDialog library={library} />,
		document.getElementById('export-dialog')
	);
};

var ExportItemsDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("exportItemsDialog", function(){
			Z.debug("opening export dialog");
			reactInstance.openDialog();
		}, {});
		library.listen("displayedItemsChanged", function(){
			reactInstance.forceUpdate();
		}, {});
	},
	getInitialState: function() {
		return {
		};
	},
	openDialog: function() {
		this.refs.modal.open();
	},
	closeDialog: function(evt) {
		this.refs.modal.close();
	},
	render: function() {
		var library = this.props.library;
		var urlconfig = Zotero.ui.getItemsConfig(library);
		var exportUrls = Zotero.url.exportUrls(urlconfig);
		
		var exportNodes = Object.keys(exportUrls).map(function(key){
			var exportUrl = exportUrls[key];
			return (
				<li key={key}>
					<a href={exportUrl} target="_blank" className="export-link" title={key} data-exportformat={key}>{Zotero.config.exportFormatsMap[key]}</a>
				</li>
			);
		});
		
		return (
			<BootstrapModalWrapper ref="modal">
				<div id="export-items-dialog" className="export-items-dialog" role="dialog" title="Export" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Export</h3>
							</div>
							<div className="modal-body" data-role="content">
								<div className="export-list">
									<ul id="export-formats-ul">
										{exportNodes}
									</ul>
								</div>
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

