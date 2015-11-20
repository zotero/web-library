Zotero.ui.widgets.reactciteItemDialog = {};

Zotero.ui.widgets.reactciteItemDialog.init = function(el){
	Z.debug("citeItemDialog widget init", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<CiteItemDialog library={library} />,
		document.getElementById('cite-item-dialog')
	);
	Zotero.ui.widgets.reactaddToCollectionDialog.reactInstance = reactInstance;
};
/*
Zotero.ui.widgets.reactciteItemDialog.show = function(evt){
	Z.debug("citeItemDialog.show", 3);
	var triggeringEl = J(evt.triggeringElement);
	var hasIndependentItems = false;
	var cslItems = [];
	var library;
	
	//check if event is carrying item data with it
	if(evt.hasOwnProperty("zoteroItems")){
		hasIndependentItems = true;
		J.each(evt.zoteroItems, function(ind, item){
			var cslItem = item.cslItem();
			cslItems.push(cslItem);
		});
	}
	else {
		library = Zotero.ui.getAssociatedLibrary(triggeringEl);
	}
	
	var widgetEl = J(evt.data.widgetEl).empty();
	widgetEl.html( J("#citeitemdialogTemplate").render({freeStyleInput:true}) );
	var dialogEl = widgetEl.find(".cite-item-dialog");
	
	var citeFunction = function(e){
		Z.debug("citeFunction", 3);
		//Zotero.ui.showSpinner(dialogEl.find(".cite-box-div"));
		var triggeringElement = J(evt.currentTarget);
		var style = '';
		if(triggeringElement.is(".cite-item-select, input.free-text-style-input")){
			style = triggeringElement.val();
		}
		else{
			style = dialogEl.find(".cite-item-select").val();
			var freeStyle = dialogEl.find("input.free-text-style-input").val();
			if(J.inArray(freeStyle, Zotero.styleList) !== -1){
				style = freeStyle;
			}
		}
		
		if(!hasIndependentItems){
			//get the selected item keys from the items widget
			var itemKeys = Zotero.state.getSelectedItemKeys();
			if(itemKeys.length === 0){
				itemKeys = Zotero.state.getSelectedItemKeys();
			}
			Z.debug(itemKeys, 4);
			library.loadFullBib(itemKeys, style)
			.then(function(bibContent){
				dialogEl.find(".cite-box-div").html(bibContent);
			}).catch(Zotero.catchPromiseError);
		}
		else {
			Zotero.ui.widgets.reactciteItemDialog.directCite(cslItems, style)
			.then(function(bibContent){
				dialogEl.find(".cite-box-div").html(bibContent);
			}).catch(Zotero.catchPromiseError);
		}
	};
	
	dialogEl.find(".cite-item-select").on('change', citeFunction);
	//dialogEl.find("input.free-text-style-input").on('change', citeFunction);
	
	Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles();
	//dialogEl.find("input.free-text-style-input").typeahead({local:Zotero.styleList, limit:10});
	
	Zotero.ui.dialog(dialogEl, {});
	
	return false;
};

Zotero.ui.widgets.reactciteItemDialog.getAvailableStyles = function(){
	if(!Zotero.styleList){
		Zotero.styleList = [];
		J.getJSON(Zotero.config.styleListUrl, function(data){
			Zotero.styleList = data;
		});
	}
};

Zotero.ui.widgets.reactciteItemDialog.directCite = function(cslItems, style){
	var data = {};
	data.items = cslItems;
	var url = Zotero.config.citationEndpoint + '?linkwrap=1&style=' + style;
	return J.post(url, JSON.stringify(data) );
};

Zotero.ui.widgets.reactciteItemDialog.buildBibString = function(bib){
	var bibMeta = bib.bibliography[0];
	var bibEntries = bib.bibliography[1];
	var bibString = bibMeta.bibstart;
	for(var i = 0; i < bibEntries.length; i++){
		bibString += bibEntries[i];
	}
	bibString += bibMeta.bibend;
	return bibString;
};
*/

var CiteItemDialog = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		reactInstance.getAvailableStyles();
		library.listen("citeItems", reactInstance.openDialog, {});
	},
	getDefaultProps: function() {
		return {
			freeStyleInput: false
		};
	},
	getInitialState: function() {
		return {
			styles: [],
			currentStyle: "",
			citationString:""
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
		Z.debug("citeFunction", 3);
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
		var citationHtml = {"__html": this.state.citationString};

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

