'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import TagList from './tag-selector/tag-list';
import Input from './form/input';
import withFocusManager from '../enhancers/with-focus-manager';
import { pick } from '../common/immutable';
import { noop } from '../utils';

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
		const { isFetching, onFocus, onBlur, registerFocusRoot } = this.props;
		return (
			<div className="tag-selector">
				<TagList
					{ ...pick(this.props, ['checkColoredTags', 'fetchTags',
						'isFetching', 'onSelect', 'searchString', 'sourceTagsPointer',
						'tags', 'totalTagCount'])
					}
				/>
				<div
					className="tag-selector-filter-container"
					onBlur={ onBlur }
					onFocus={ onFocus }
					ref={ ref => registerFocusRoot(ref) }
					tabIndex={ 0 }
				>
					<Input
						className="tag-selector-filter form-control form-control-lg"
						onChange={ this.props.onSearch }
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
						type="search"
						value={ this.props.searchString }
						isBusy={ isFetching }
					/>
					<button
						className="tag-selector-actions"
						onClick={ this.props.onSettings }
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
					/>
				</div>
			</div>
		);
	}

	static propTypes = {
		isFetching: PropTypes.bool,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		fetchTags: PropTypes.func.isRequired,
		onSearch: PropTypes.func,
		onSettings: PropTypes.func,
		registerFocusRoot: PropTypes.func,
		searchString: PropTypes.string,
	}

	static defaultProps = {
		onSearch: noop,
		onSettings: noop,
		searchString: '',
	}
}

export default withFocusManager(TagSelector);
