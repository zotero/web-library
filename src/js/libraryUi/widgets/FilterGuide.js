'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:filterGuide');

var React = require('react');

var FilterGuide = React.createClass({
	componentWillMount: function() {
		var reactInstance = this;
		var library = this.props.library;

		library.listen('displayedItemsChanged', reactInstance.refreshFilters, {});
		library.listen('displayedItemChanged', reactInstance.refreshFilters, {});
		library.listen('updateFilterGuide', reactInstance.refreshFilters, {});
		library.listen('selectedCollectionChanged', reactInstance.refreshFilters, {});
		library.listen('cachedDataLoaded', reactInstance.refreshFilters, {});
		library.listen('libraryCollectionsUpdated', reactInstance.refreshFilters, {});
	},
	getInitialState: function() {
		return {
			collectionKey: '',
			tags: [],
			query: ''
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
		log.debug('widgets.filterGuide.clearFilter', 3);
		let library = this.props.library;
		let target = evt.currentTarget;
		let collectionKey = target.getAttribute('data-collectionkey');
		let tag = target.getAttribute('data-tag');
		let query = target.getAttribute('data-query');
		if(collectionKey){
			Zotero.state.unsetUrlVar('collectionKey');
			this.setState({collectionKey:''});
		}
		if(tag){
			Zotero.state.toggleTag(tag);
			this.setState({tags:Zotero.state.getUrlVar('tag')});
		}
		if(query){
			library.trigger('clearLibraryQuery');
			this.setState({query:''});
			return;
		}
		Zotero.state.pushState();
	},
	render: function() {
		var reactInstance = this;
		var library = this.props.library;
		var collectionNodes = null;
		var tagNodes = null;
		var searchNodes = null;

		if(this.state.collectionKey != ''){
			var collection = library.collections.getCollection(this.state.collectionKey);
			if(collection){
				collectionNodes = (
					<li key={'collection_' + reactInstance.state.collectionKey} className="filterguide-entry">
						<a onClick={reactInstance.clearFilter} href="#" data-collectionkey={reactInstance.state.collectionKey}>
							<span className="glyphicons fonticon glyphicons-folder-open"></span>
							<span className="filterguide-label">{collection.get('name')}</span>
							<span className="glyphicons fonticon glyphicons-remove"></span>
						</a>
					</li>
				);
			}
		}
		
		var tags = this.state.tags;
		if(typeof tags == 'string'){
			tags = [tags];
		}
		if(tags){
			tagNodes = tags.map(function(tag){
				return (
					<li key={'tag_' + tag} className="filterguide-entry">
						<a onClick={reactInstance.clearFilter} href="#" data-tag={tag}>
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
				<li key={'query_'+reactInstance.state.query} className="filterguide-entry">
					<a onClick={reactInstance.clearFilter} href="#" data-query={reactInstance.state.query}>
						<span className="glyphicons fonticon glyphicons-search"></span>
						<span className="filterguide-label">{reactInstance.state.query}</span>
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

module.exports = FilterGuide;
