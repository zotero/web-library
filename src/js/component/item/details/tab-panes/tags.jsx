'use strict';

import React from 'react';
import cx from 'classnames';
import TagsContainer from '../../../../container/tags';

class TagsTabPane extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'tags': true,
				'active': this.props.isActive
			}) }>
				<h5 className="h2 tab-pane-heading hidden-mouse">Tags</h5>
				<TagsContainer key={ this.props.item.key } />
			</div>
		);
	}
}

export default TagsTabPane;
