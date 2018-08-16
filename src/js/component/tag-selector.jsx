'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const TagList = require('./tag-selector/tag-list');

class TagSelector extends React.Component {
	render() {
		return (
			<div className="tag-selector">
				<TagList { ...this.props } />
				<div className="tag-selector-filter-container">
					<input
						type="search"
						value={this.props.searchString}
						onChange={ ev => this.props.onSearch(ev.target.value) }
						className="tag-selector-filter" />
					<button className="tag-selector-actions" onClick={ ev => this.props.onSettings(ev) } />
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
	onSelection: PropTypes.func,
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
	onSelection: () => Promise.resolve(),
	onTagContext: () => Promise.resolve(),
	onSearch: () => Promise.resolve(),
	onSettings: () => Promise.resolve()
};

module.exports = TagSelector;
