import { cloneElement, useRef } from 'react';
import cx from 'classnames';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';

const PanelHeader = props => {
	const { className, children: header } = props;

	if(header.type === 'header') {
		return cloneElement(header, {
			className: cx('panel-header', className)
		});
	} else {
		return (
            <header className={ cx('panel-header', className) }>
				{ cloneElement(header) }
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
	const [header, ...body] = props.children ?? [];
	const { bodyClassName, className = '', isBackdrop, headerClassName, onClick, onKeyDown } = props;
	const ref = useRef(null);

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
				nodeRef={ ref }
			>
				<div ref={ ref } className="panel-backdrop" />
			</CSSTransition>
		</section>
	);
}

export default Panel;
