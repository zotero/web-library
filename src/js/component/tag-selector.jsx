'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from './ui/button';
import Icon from './ui/icon';
import Input from './form/input';
import TagList from './tag-selector/tag-list';
import withFocusManager from '../enhancers/with-focus-manager';
import { noop } from '../utils';
import { pick } from '../common/immutable';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

class TagSelector extends React.PureComponent {
	state = {
		isCollapsed: false
	}

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

	handleDeselectClick = () => {
		const {  navigate } = this.props;
		navigate({ tags: [] });
	}

	handleCollapse = ev => {
		const { isCollapsed } = this.state;
		this.setState({ isCollapsed: !isCollapsed });
	}

	render() {
		const { isFetching, onFocus, onBlur, registerFocusRoot, selectedTags } = this.props;
		return (
			<div
				className={ cx('tag-selector', { 'collapsed': this.state.isCollapsed }) }
				>
				<div className="scroll-container">
					<Button
						className="tag-selector-toggle"
						onClick={ this.handleCollapse }
					>
						<Icon type="16/grip" width="16" height="2" />
					</Button>
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
							className="tag-selector-filter form-control"
							onChange={ this.props.onSearch }
							onKeyDown={ this.handleKeyDown }
							tabIndex={ -2 }
							type="search"
							value={ this.props.searchString }
							isBusy={ isFetching }
							placeholder="Filter Tags"
						/>
						<UncontrolledDropdown className="dropdown dropdown-wrapper">
								<DropdownToggle
									className="btn-icon dropdown-toggle tag-selector-actions"
									onKeyDown={ this.handleKeyDown }
									tabIndex={ -2 }
									color={ null }
								>
									<Icon type="16/options" width="16" height="16" />
								</DropdownToggle>
								<DropdownMenu right>
									<DropdownItem disabled>
										{ selectedTags.length } tag selected
									</DropdownItem>
									<DropdownItem onClick={ this.handleDeselectClick } >
										Deselect All
									</DropdownItem>
								</DropdownMenu>
						</UncontrolledDropdown>
					</div>
				</div>
			</div>
		);
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		fetchTags: PropTypes.func.isRequired,
		isFetching: PropTypes.bool,
		isMyPublications: PropTypes.bool,
		isTrash: PropTypes.bool,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		onSearch: PropTypes.func,
		onSettings: PropTypes.func,
		qmode: PropTypes.string,
		registerFocusRoot: PropTypes.func,
		search: PropTypes.string,
		searchString: PropTypes.string,
		selectedTags: PropTypes.array,
		view: PropTypes.string,
	}

	static defaultProps = {
		onSearch: noop,
		onSettings: noop,
		searchString: '',
	}
}

export default withFocusManager(TagSelector);
