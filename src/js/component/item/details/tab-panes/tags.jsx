'use strict';

import React from 'react';
import cx from 'classnames';
import Tags from '../../../tags';

class TagsTabPane extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'tags': true,
				'active': this.props.isActive
			}) }>
				<h5 className="h2 tab-pane-heading">Tags</h5>
				<Tags
					item={ this.props.item }
					tags={ this.props.item.tags }
					isProcessingTags={ this.props.isProcessingTags }
					isReadOnly={ this.props.isReadOnly }
					onAddTag={ this.props.onAddTag }
					onDeleteTag={ this.props.onDeleteTag }
					onUpdateTag={ this.props.onUpdateTag }
				/>
			</div>
		);
	}
}

export default TagsTabPane;
