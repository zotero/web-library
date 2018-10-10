'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

class Panel extends React.Component {

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

		return (
			<section className={ `panel ${this.props.className}` }>
				{ this.renderHeader(header) }
				{ this.renderBody(body) }
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

module.exports = Panel;
