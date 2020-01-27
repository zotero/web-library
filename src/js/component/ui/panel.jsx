'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { pick } from '../../common/immutable';

class Panel extends React.PureComponent {
	renderHeader(header) {
		if(header.type === 'header') {
			return React.cloneElement(header, {
				className: 'panel-header'
			});
		} else {
			return (
				<header className={ cx('panel-header', this.props.headerClassName) }>
					{ React.cloneElement(header) }
				</header>
			);
		}
	}
	renderBody(body) {
		return (
			<div className={ cx('panel-body', this.props.bodyClassName) }>
				{ body }
			</div>
		);
	}
	render() {
		const [header, ...body] = React.Children.toArray(this.props.children);
		const props = pick(this.props, ['onClick', 'onKeyDown']);

		return (
			<section { ...props } className={ `panel ${this.props.className}` }>
				{ this.renderHeader(header) }
				{ this.renderBody(body) }
				<div className="panel-backdrop" />
			</section>
		);
	}
}

Panel.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	bodyClassName: PropTypes.string,
	headerClassName: PropTypes.string,
};

Panel.defaultProps = {
	children: null,
	className: ''
};

export default Panel;
