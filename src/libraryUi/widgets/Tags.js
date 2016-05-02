'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:Tags');

var React = require('react');

var LoadingSpinner = require('./LoadingSpinner.js');

var TagRow = React.createClass({
	getDefaultProps: function(){
		return {
			showAutomatic: false
		};
	},
	handleClick: function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var tag = this.props.tag;
		
		Z.state.toggleTag(tag.apiObj.tag);
		Z.state.clearUrlVars(['tag', 'collectionKey']);
        Z.state.pushState();
	},
	render: function() {
		var tag = this.props.tag;
		var title = tag.apiObj.tag;
		if(tag.apiObj.meta.numItems) {
			title += ' (' + tag.apiObj.meta.numItems + ')';
		}
		var newUrl = '';

		var tagStyle = {};
		if(tag.color){
			tagStyle = {
				color: tag.color,
				fontWeight: 'bold'
			};
		}
		
		//render nothing for automatic tags user doesn't want displayed
		if((this.props.showAutomatic == false) && (tag.apiObj.meta.type != 0)){
			return null;
		}

		return (
			<li className="tag-row">
				<a onClick={this.handleClick} className='tag-link' title={title} style={tagStyle} href={newUrl}>{Zotero.format.trimString(tag.apiObj.tag, 12)}</a>
			</li>
		);
	}
});

var TagList = React.createClass({
	getDefaultProps: function(){
		return {
			tags: [],
			showAutomatic: false,
			id: ''
		};
	},
	render: function() {
		var showAutomatic = this.props.showAutomatic;
		var tagRowNodes = this.props.tags.map(function(tag, ind){
			return (
				<TagRow key={tag.apiObj.tag} tag={tag} showAutomatic={showAutomatic} />
			);
		});

		return (
			<ul id={this.props.id}>
				{tagRowNodes}
			</ul>
		);
	}
});

var Tags = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {
			tags: new Zotero.Tags(),
			tagColors: null,
			selectedTags: [],
			tagFilter: '',
			showAutomatic: false,
			loading:false
		};
	},
	componentWillMount: function(evt) {
		var reactInstance = this;
		var library = this.props.library;
		var tagColors = library.preferences.getPref('tagColors');
		reactInstance.setState({tagColors: tagColors});
		
		library.listen('tagsDirty', reactInstance.syncTags, {});
		library.listen('cachedDataLoaded', reactInstance.syncTags, {});
		
		library.listen('tagsChanged libraryTagsUpdated selectedTagsChanged', function(evt){
			reactInstance.setState({tags:library.tags});
		}, {});
		
	},
	handleFilterChanged: function(evt) {
		this.setState({tagFilter: evt.target.value});
	},
	getSelectedTagsArray: function() {
		var selectedTags = Zotero.state.getUrlVar('tag');
        if(!J.isArray(selectedTags)){
			if(selectedTags) {
				selectedTags = [selectedTags];
			}
			else {
				selectedTags = [];
			}
		}
		return selectedTags;
	},
	syncTags: function(evt) {
		log.debug('Tags.syncTags', 3);
		var reactInstance = this;
		if(this.state.loading){
			return;
		}
		var library = this.props.library;

		//clear tags if we're explicitly not using cached tags
		if(evt.data && (evt.data.checkCached === false)){
			library.tags.clear();
		}
		
		reactInstance.setState({tags:library.tags, loading:true});
		
		//cached tags are preloaded with library if the cache is enabled
		//this function shouldn't be triggered until that has already been done
		var loadingPromise = library.loadUpdatedTags()
		.then(function(){
			reactInstance.setState({tags:library.tags, loading:false});
			return;
		},
		function(error){
			log.error('syncTags failed. showing local data and clearing loading div');
			reactInstance.setState({tags:library.tags, loading:false});
			Zotero.ui.jsNotificationMessage('There was an error loading tags. Some tags may not have been updated.', 'notice');
		});
		
		return;
	},
	render: function() {
		var reactInstance = this;
		var tags = this.state.tags;
		var selectedTagStrings = reactInstance.getSelectedTagsArray();
		var tagColors = this.state.tagColors;
		if(tagColors === null){
			tagColors = [];
		}

		var matchAnyFilter = this.state.tagFilter;
		var plainTagsList = tags.plainTagsList(tags.tagsArray);
		var matchedTagStrings = Z.utils.matchAnyAutocomplete(matchAnyFilter, plainTagsList);

		var tagColorStrings = [];
		var coloredTags = [];
		tagColors.forEach(function(tagColor, index){
			tagColorStrings.push(tagColor.name.toLowerCase());
			var coloredTag = tags.getTag(tagColor.name);
			if(coloredTag){
				coloredTag.color = tagColor.color;
				coloredTags.push(coloredTag);
			}
		});
		var filteredTags = [];
		var selectedTags = [];

		//always show selected tags, even if they don't pass the filter
		selectedTagStrings.forEach(function(tagString){
			var t = tags.getTag(tagString);
			if(t){
				selectedTags.push(t);
			}
		});
		//add to filteredTags if passes filter, and is not already selected or colored
		matchedTagStrings.forEach(function(matchedString){
			var t = tags.getTag(matchedString);
			if(t !== null && (t.apiObj.meta.numItems > 0)) {
				//we have the actual tag object, and it has items
				//add to filteredTags if it is not already in colored or selected lists
				if(selectedTagStrings.indexOf(matchedString) == -1 && tagColorStrings.indexOf(matchedString) == -1){
					filteredTags.push(t);
				}
			}
		});

		return (
			<div id="tags-list-div" className="tags-list-div">
				<div>
					<input type="text" id="tag-filter-input" className="tag-filter-input form-control" placeholder="Filter Tags" onChange={this.handleFilterChanged} />
					<LoadingSpinner loading={this.state.loading} />
					<TagList tags={selectedTags} id="selected-tags-list" />
					<TagList tags={coloredTags} id="colored-tags-list" />
					<TagList tags={filteredTags} id="tags-list" />
				</div>
			</div>
		);
	}
});

module.exports = Tags;
