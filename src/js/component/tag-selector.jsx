'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import TagList from './tag-selector/tag-list';
import Input from './form/input';
import Spinner from './ui/spinner';

class TagSelector extends React.PureComponent {
	componentDidUpdate({ searchString: prevSearchString, sourceTags: { length: prevTagsLength } }) {
		const { searchString, sourceTags: { length: tagsLength} } = this.props;
		if(searchString !== prevSearchString || prevTagsLength !== tagsLength) {
			this.tagListRef.maybeLoadMore();
		}
	}

	render() {
		const { sourceTags, totalTagCount, tags, isFetching } = this.props;
		return (
			<div className="tag-selector">
				<TagList ref={ tagListRef => this.tagListRef = tagListRef } { ...this.props } />
				<div className="tag-selector-filter-container">
					<Input
						type="search"
						value={ this.props.searchString }
						onChange={ this.props.onSearch }
						className="tag-selector-filter"
					/>
					<button className="tag-selector-actions" onClick={ ev => this.props.onSettings(ev) } />
				</div>
				<div className="tag-selector-status">
					Tags loaded: { sourceTags.length } / { totalTagCount }; Visible: { tags.length }
					{ isFetching && <Spinner className="inline" /> }
				</div>
			</div>
		);
	}
}

TagSelector.propTypes = {
	tags: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		selected: PropTypes.bool,
		color: PropTypes.string,
		disabled: PropTypes.bool
	})),
	searchString: PropTypes.string,
	shouldFocus: PropTypes.bool,
	onSelect: PropTypes.func,
	onTagContext: PropTypes.func,
	onSearch: PropTypes.func,
	onSettings: PropTypes.func,
	onLoadMore: PropTypes.func.isRequired,
	totalTagCount: PropTypes.number,
};

TagSelector.defaultProps = {
	tags: [],
	searchString: '',
	shouldFocus: false,
	onSelect: () => Promise.resolve(),
	onTagContext: () => Promise.resolve(),
	onSearch: () => Promise.resolve(),
	onSettings: () => Promise.resolve()
};

export default TagSelector;
