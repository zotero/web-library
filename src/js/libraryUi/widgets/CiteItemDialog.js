'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:citeItemDialog');

var React = require('react');
var BootstrapModalWrapper = require('./BootstrapModalWrapper.js');

var CiteItemDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		reactInstance.getAvailableStyles();
		library.listen('citeItems', reactInstance.openDialog, {});
	},
	getDefaultProps: function() {
		return {
			freeStyleInput: false
		};
	},
	getInitialState: function() {
		return {
			styles: [],
			currentStyle: '',
			citationString:''
		};
	},
	handleStyleChange: function(evt) {
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
	cite: function(evt) {
		log.debug('citeFunction', 3);
		var reactInstance = this;
		var library = this.props.library;
		var style = this.state.currentStyle;

		//get the selected item keys from the items widget
		var itemKeys = Zotero.state.getSelectedItemKeys();
		
		library.loadFullBib(itemKeys, style)
		.then(function(bibContent){
			reactInstance.setState({
				citationString: bibContent
			});
			//dialogEl.find(".cite-box-div").html(bibContent);
		}).catch(Zotero.catchPromiseError);
	},
	getAvailableStyles: function(){
		if(!Zotero.styleList){
			Zotero.styleList = [];
			J.getJSON(Zotero.config.styleListUrl, function(data){
				Zotero.styleList = data;
			});
		}
	},
	directCite: function(cslItems, style){
		var data = {};
		data.items = cslItems;
		var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
		return J.post(url, JSON.stringify(data) );
	},
	buildBibString: function(bib) {
		var bibMeta = bib.bibliography[0];
		var bibEntries = bib.bibliography[1];
		var bibString = bibMeta.bibstart;
		for(var i = 0; i < bibEntries.length; i++){
			bibString += bibEntries[i];
		}
		bibString += bibMeta.bibend;
		return bibString;
	},
	render: function() {
		var reactInstance = this;
		var library = this.props.library;
		
		var freeStyleInput = null;
		if(this.props.freeStyleInput){
			freeStyleInput = (<input type="text" className="free-text-style-input form-control" placeholder="style" />);
		}
		var citationHtml = {'__html': this.state.citationString};

		return (
			<BootstrapModalWrapper ref="modal">
				<div id="cite-item-dialog" className="cite-item-dialog" role="dialog" title="Cite" data-keyboard="true">
					<div  className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
								<h3>Cite Items</h3>
							</div>
							<div className="cite-item-div modal-body" data-role="content">
								<form>
									<select onChange={this.cite} className='cite-item-select form-control' id='cite-item-select'>
										<option value=''>Select Style</option>
										<option value='apsa'>American Political Science Association</option>
										<option value='apa'>American Psychological Association</option>
										<option value='asa'>American Sociological Association</option>
										<option value='chicago-author-date'>Chicago Manual of Style (Author-Date format)</option>
										<option value='chicago-fullnote-bibliography'>Chicago Manual of Style (Full Note with Bibliography)</option>
										<option value='chicago-note-bibliography'>Chicago Manual of Style (Note with Bibliography)</option>
										<option value='harvard1'>Harvard Reference format 1</option>
										<option value='ieee'>IEEE</option>
										<option value='mhra'>Modern Humanities Research Association</option>
										<option value='mla'>Modern Language Association</option>
										<option value='nlm'>National Library of Medicine</option>
										<option value='nature'>Nature</option>
										<option value='vancouver'>Vancouver</option>
									</select>
									{freeStyleInput}
								</form>
								<div id="cite-box-div" className="cite-box-div" dangerouslySetInnerHTML={citationHtml}>
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

module.exports = CiteItemDialog;