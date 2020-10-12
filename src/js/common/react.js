import React from 'react';

const mapChildren = (children, mapFunc, out = []) => {
	React.Children.toArray(children).reduce((out, child) => {
		if(child.type === React.Fragment) {
			mapChildren(child.props.children, mapFunc, out);
		} else {
			out.push(mapFunc(child));
		}
		return out;
	}, out);
	return out;
}

const flattenChildren = children => mapChildren(children, child => child);

export { flattenChildren, mapChildren };
