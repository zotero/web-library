import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';

const PanelHeader = props => {
	const { className, children: header } = props;

	if(header.type === 'header') {
		return React.cloneElement(header, {
			className: cx('panel-header', className)
		});
	} else {
		return (
			<header className={ cx('panel-header', className) }>
				{ React.cloneElement(header) }
			</header>
		);
	}
}

const PanelBody = props => {
	const { className, children: body } = props;
	return (
		<div className={ cx('panel-body', className) }>
			{ body }
		</div>
	);
}

const Panel = props => {
	const [header, ...body] = props.children;
	const { bodyClassName, className, isBackdrop, headerClassName, onClick, onKeyDown } = props;

	return (
		<section
			className={ `panel ${className}` }
			onClick={ onClick }
			onKeyDown={ onKeyDown }
		>
			<PanelHeader className={ headerClassName }>{ header }</PanelHeader>
			<PanelBody className={ bodyClassName} >{ body }</PanelBody>
			<CSSTransition
				in={ isBackdrop }
				timeout={ 500 }
				classNames="nav-fade"
				mountOnEnter
				unmountOnExit
			>
				<div className="panel-backdrop" />
			</CSSTransition>
		</section>
	);
}

Panel.propTypes = {
	bodyClassName: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
	headerClassName: PropTypes.string,
	isBackdrop: PropTypes.bool,
	onClick: PropTypes.func,
	onKeyDown: PropTypes.func,
};

Panel.defaultProps = {
	children: null,
	className: ''
};

PanelBody.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
}

PanelHeader.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
}

export default Panel;
