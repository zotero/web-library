import React, { useCallback, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import Button from './ui/button';
import { Toolbar } from './ui/toolbars';
import Icon from './ui/icon';

const TouchTagSelector = props => {
	const [isOpen, setIsOpen] = useState(false);
	const handleClick = useCallback(() => {
		setIsOpen(!isOpen);
	});

	return (
		<div className="touch-tag-selector">
			<CSSTransition
				in={ isOpen }
				timeout={ 200 }
				classNames="slide"
				mountOnEnter
				unmountOnExit
			>
				<div className="pane">
					<header className="touch-header">
						<Toolbar>
							<div className="toolbar-left" />
							<div className="toolbar-center">
								2 Tags Selected
							</div>
							<div className="toolbar-right">
								<Button className="btn-link" onClick={ handleClick }>Done</Button>
							</div>
						</Toolbar>
					</header>
					<div className="filter-container">
						<input type="text" className="form-control" placeholder="Filter Tags" />
					</div>
					<ul className="selected-tags">
						<li className="tag">Carbon Dioxide</li>
						<li className="tag">Carbonic Anhydrases</li>
					</ul>
					<div className="scroll-container">
						<ul className="tag-selector-list">
							<li className="tag">green-tag2</li>
							<li className="tag">red-tag</li>
							<li className="tag">Aldehyde Oxidoreductases</li>
							<li className="tag">purple-tag</li>
							<li className="tag">Adenosine Triphosphate</li>
						</ul>
					</div>
					<footer className="touch-footer">
						<Toolbar>
							<div className="toolbar-center">
								<Button className="btn-link">Deselect All</Button>
							</div>
						</Toolbar>
					</footer>
				</div>
			</CSSTransition>
			<footer className="touch-footer darker">
				<Toolbar>
					<div className="toolbar-left">
						<Button className="btn-link" onClick={ handleClick }>
							<Icon type="24/tag" width="24" height="24" />
						</Button>
					</div>
					<div className="toolbar-center">
						2 Tags Selected
					</div>
					<div className="toolbar-right" />
				</Toolbar>
			</footer>
		</div>
	);
}

export default TouchTagSelector;
