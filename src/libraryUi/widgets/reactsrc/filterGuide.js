Zotero.ui.widgets.reactfilterGuide = {};

Zotero.ui.widgets.reactfilterGuide.init = function(el){
	Z.debug('widgets.filterGuide.init', 3);
	var library = Zotero.ui.getAssociatedLibrary(el);
	var reactInstance = ReactDOM.render(
		<FilterGuide library={library} />,
		document.getElementById('filter-guide')
	);
};

var FilterGuide = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen("displayedItemsChanged", reactInstance.refreshFilters, {});
		library.listen("displayedItemChanged", reactInstance.refreshFilters, {});
		library.listen("updateFilterGuide", reactInstance.refreshFilters, {});
		library.listen("selectedCollectionChanged", reactInstance.refreshFilters, {});
		library.listen("cachedDataLoaded", reactInstance.refreshFilters, {});
		library.listen("libraryCollectionsUpdated", reactInstance.refreshFilters, {});
	},
	getInitialState: function() {
		return {
			collectionKey: "",
			tags: [],
			query: ""
		};
	},
	refreshFilters: function(evt){
		var library = this.props.library;
		var displayConfig = Zotero.ui.getItemsConfig(library);
		this.setState({
			collectionKey: displayConfig['collectionKey'],
			tags: displayConfig['tag'],
			query: displayConfig['q']
		});
	},
	clearFilter: function(evt){
		evt.preventDefault();
		Z.debug('widgets.filterGuide.clearFilter', 3);
		var library = this.props.library;
		var target = J(evt.currentTarget);
		var collectionKey = target.data('collectionkey');
		var tag = target.data('tag');
		var query = target.data('query');
		if(collectionKey){
			Zotero.state.unsetUrlVar('collectionKey');
			this.setState({collectionKey:""});
		}
		if(tag){
			Zotero.state.toggleTag(tag);
			this.setState({tags:Zotero.state.getUrlVar('tag')});
		}
		if(query){
			library.trigger('clearLibraryQuery');
			this.setState({query:""});
			return;
		}
		Zotero.state.pushState();
	},
	render: function() {
		var library = this.props.library;
		var collectionNodes = null;
		var tagNodes = null;
		var searchNodes = null;

		if(this.state.collectionKey != ""){
			var collection = library.collections.getCollection(this.state.collectionKey);
			if(collection){
				collectionNodes = (
					<li className="filterguide-entry">
						<a onClick={this.clearFilter} href="#" data-collectionkey={this.state.collectionKey}>
							<span className="glyphicons fonticon glyphicons-folder-open"></span>
							<span className="filterguide-label">{collection.get('name')}</span>
							<span className="glyphicons fonticon glyphicons-remove"></span>
						</a>
					</li>
				);
			}
		}
		if(this.state.tags){
			tagNodes = this.state.tags.map(function(tag){
				return (
					<li className="filterguide-entry">
						<a onClick={this.clearFilter} href="#" data-tag={tag}>
							<span className="glyphicons fonticon glyphicons-tag"></span>
							<span className="filterguide-label">{tag}</span>
							<span className="glyphicons fonticon glyphicons-remove"></span>
						</a>
					</li>
				);
			});
		}
		if(this.state.query){
			searchNodes = (
				<li className="filterguide-entry">
					<a onClick={this.clearFilter} href="#" data-query={this.state.query}>
						<span className="glyphicons fonticon glyphicons-search"></span>
						<span className="filterguide-label">{this.state.query}</span>
						<span className="glyphicons fonticon glyphicons-remove"></span>
					</a>
				</li>
			);
		}

		return (
			<div id="filter-guide" className="filter-guide col-12">
				<ul className="filterguide-list">
					{collectionNodes}
					{tagNodes}
					{searchNodes}
				</ul>
			</div>
		);
	}
});
