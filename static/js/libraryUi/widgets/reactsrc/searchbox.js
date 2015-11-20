Zotero.ui.widgets.reactsearchbox = {};

Zotero.ui.widgets.reactsearchbox.init = function(el){
	Z.debug("Zotero.eventful.init.searchbox", 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var container = J(el);
	
	var reactInstance = ReactDOM.render(
		<LibrarySearchBox library={library} />,
		document.getElementById('search-box')
	);
	Zotero.ui.widgets.reactsearchbox.reactInstance = reactInstance;
};

var LibrarySearchBox = React.createClass({
	getInitialState: function(){
		return {
			searchType: "simple",
		};
	},
	search: function(evt) {
		e.preventDefault();
		Z.debug("library-search form submitted", 3);
		Zotero.state.clearUrlVars(['collectionKey', 'tag', 'q', 'qmode']);
		var container = J(evt.target);
		var query = container.find('input.search-query').val();
		var searchType = container.find('input.search-query').data('searchtype');
		if(query !== "" || Zotero.state.getUrlVar('q') ){
			Zotero.state.pathVars['q'] = query;
			if(searchType != "simple"){
				Zotero.state.pathVars['qmode'] = searchType;
			}
			Zotero.state.pushState();
		}
		return false;
	},
	clearLibraryQuery: function(evt){
		Zotero.state.unsetUrlVar('q');
		Zotero.state.unsetUrlVar('qmode');
		
		J(".search-query").val("");
		Zotero.state.pushState();
		return;
	},
	changeSearchType: function(evt){
		evt.preventDefault();
		var selected = J(evt.target);
		var selectedType = selected.data('searchtype');
		this.setState({searchType: selectedType});
	},
	render: function() {
		var placeHolder = "";
		if(this.state.searchType == 'simple'){
			placeHolder = 'Search Title, Creator, Year';
		} else if(this.state.searchType == 'everything'){
			placeHolder = 'Search Full Text';
		}
		var defaultValue = Zotero.state.getUrlVar('q');

		return (
			<div className="btn-toolbar row visible-xs" id="search-box" style={{maxWidth:"350px"}}>
				<form action="/search/" onSubmit={this.search} className="navbar-form zsearch library-search" role="search">
					<div className="input-group">
						<div className="input-group-btn">
							<button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></button>
							<ul className="dropdown-menu">
								<li><a href="#" onClick={this.changeSearchType} data-searchtype="simple">Title, Creator, Year</a></li>
								<li><a href="#" onClick={this.changeSearchType} data-searchtype="everything">Full Text</a></li>
							</ul>
						</div>
						<input defaultValue={defaultValue} type="text" name="q" id="header-search-query" className="search-query form-control" placeholder={placeHolder}/>
						<span className="input-group-btn">
							<button onClick={this.clearLibraryQuery} className="btn btn-default clear-field-button" type="button"><span className="glyphicons fonticon glyphicons-remove-2"></span></button>
						</span>
					</div>
				</form>
			</div>
		);
	}
});
