import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withFocusManager from '../../enhancers/with-focus-manager';
import { isTriggerEvent } from '../../common/event';
const PAGE_SIZE = 100;

class TagList extends React.PureComponent {
	componentDidMount() {
		const { onLoadMore } = this.props;
		onLoadMore(0, PAGE_SIZE);
	}

	componentDidUpdate({ searchString: prevSearchString, sourceTags: { length: prevTagsLength } }) {
		const { searchString, sourceTags: { length: tagsLength} } = this.props;
		if(searchString !== prevSearchString || prevTagsLength !== tagsLength) {
			this.maybeLoadMore();
		}
	}

	maybeLoadMore = () => {
		const { isFetching, sourceTags, totalTagCount, onLoadMore } = this.props;
		const containerHeight = this.containerRef.getBoundingClientRect().height;
		const totalHeight = this.listRef.getBoundingClientRect().height;
		const scrollProgress = (this.containerRef.scrollTop + containerHeight) / totalHeight;

		if(scrollProgress > 0.5 && !isFetching && totalTagCount > sourceTags.length) {
			onLoadMore(sourceTags.length, PAGE_SIZE);
		}
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev, onSelect } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
			onFocusPrev(ev);
		} else if(isTriggerEvent(ev)) {
			const tag = ev.currentTarget.dataset.tag;
			onSelect(tag, ev);
		}
	};

	handleClick = ev => {
		const { onSelect } = this.props;
		const tag = ev.currentTarget.dataset.tag;
		onSelect(tag, ev);
	}

	renderTag(tag) {
		const className = cx('tag-selector-item', {
			disabled: tag.disabled,
			selected: tag.selected,
			colored: tag.color,
			placeholder: tag.isPlaceholder
		});

		return (
			<li
				className={ className }
				key={ tag.tag }
				data-tag={ tag.tag }
				onClick={ this.handleClick }
				onKeyDown={ this.handleKeyDown }
				style={ tag.color && { color: tag.color } }
				tabIndex={ -2 }
			>
				{ tag.tag }
			</li>
		);
	}

	render() {
		const { onFocus, onBlur, registerFocusRoot, tags } = this.props;

		return (
			<div
				className="tag-selector-container"
				onBlur={ onBlur }
				onFocus={ onFocus }
				onScroll={ this.maybeLoadMore }
				ref={ ref => { this.containerRef = ref; registerFocusRoot(ref); } }
				tabIndex={ 0 }
			>
				<ul
					ref={ listRef => this.listRef = listRef }
					className="tag-selector-list"
				>
					{ tags.map(this.renderTag.bind(this)) }
				</ul>
			</div>
		)
	}

	static propTypes = {
		isFetching: PropTypes.bool,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		onLoadMore: PropTypes.func,
		onSelect: PropTypes.func,
		registerFocusRoot: PropTypes.func,
		searchString: PropTypes.string,
		sourceTags: PropTypes.array,
		tags: PropTypes.array,
		totalTagCount: PropTypes.number,
	}
}

export default withFocusManager(TagList);
