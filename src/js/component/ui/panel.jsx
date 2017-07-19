'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class Panel extends React.Component {

	renderHeader(header) {
		if(header.type === 'header') {
			return React.cloneElement(header, {
				className: 'panel-header'
			});
		} else {
			return (
				<header className="panel-header">
					{ React.cloneElement(header) }
				</header>
			);
		}
	}

	renderBody(body) {
		return (
			<div className="panel-body">
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
	className: PropTypes.string
};

Panel.defaultProps = {
	children: null,
	className: ''
};

module.exports = Panel;