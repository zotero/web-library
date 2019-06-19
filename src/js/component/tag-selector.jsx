'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import TagList from './tag-selector/tag-list';
import Input from './form/input';
import Spinner from './ui/spinner';
import withFocusManager from '../enhancers/with-focus-manager';

class TagSelector extends React.PureComponent {
	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	};
	render() {
		const { sourceTags, totalTagCount, tags, isFetching, onFocus,
			onBlur, registerFocusRoot } = this.props;
		return (
			<div className="tag-selector">
				<TagList ref={ tagListRef => this.tagListRef = tagListRef } { ...this.props } />
				<div
					className="tag-selector-filter-container"
					onBlur={ onBlur }
					onFocus={ onFocus }
					ref={ ref => registerFocusRoot(ref) }
					tabIndex={ 0 }
				>
					<Input
						className="tag-selector-filter"
						onChange={ this.props.onSearch }
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
						type="search"
						value={ this.props.searchString }
					/>
					<button
						className="tag-selector-actions"
						onClick={ ev => this.props.onSettings(ev) }
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
					/>
				</div>
				<div className="tag-selector-status">
					Tags loaded: { sourceTags.length } / { totalTagCount }; Visible: { tags.length }
					{ isFetching && <Spinner className="inline" /> }
				</div>
			</div>
		);
	}

	static propTypes = {
		tags: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			selected: PropTypes.bool,
			color: PropTypes.string,
			disabled: PropTypes.bool
		})),
		isFetching: PropTypes.bool,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		fetchTags: PropTypes.func.isRequired,
		onSearch: PropTypes.func,
		onSelect: PropTypes.func,
		onSettings: PropTypes.func,
		onTagContext: PropTypes.func,
		registerFocusRoot: PropTypes.func,
		searchString: PropTypes.string,
		shouldFocus: PropTypes.bool,
		totalTagCount: PropTypes.number,
	}

	static defaultProps = {
		tags: [],
		searchString: '',
		shouldFocus: false,
		onSelect: () => Promise.resolve(),
		onTagContext: () => Promise.resolve(),
		onSearch: () => Promise.resolve(),
		onSettings: () => Promise.resolve()
	}
}

export default withFocusManager(TagSelector);
