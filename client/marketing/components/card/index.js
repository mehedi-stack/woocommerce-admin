/**
 * External dependencies
 */
import {
	Card as WPCard,
	CardBody,
	CardHeader,
	__experimentalText as Text,
} from '@wordpress/components';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

const Card = ( props ) => {
	const { title, description, children, className } = props;

	return (
		<WPCard
			className={ classnames(
				className,
				'woocommerce-admin-marketing-card'
			) }
		>
			<CardHeader>
				<div>
					<Text variant="title.small">{ title }</Text>
					<Text
						variant="subtitle.small"
						className="woocommerce-admin-marketing-card-subtitle"
					>
						{ description }
					</Text>
				</div>
			</CardHeader>
			<CardBody>{ children }</CardBody>
		</WPCard>
	);
};

Card.propTypes = {
	/**
	 * Card title.
	 */
	title: PropTypes.string,
	/**
	 * Card description.
	 */
	description: PropTypes.string,
	/**
	 * Additional class name to style the component.
	 */
	className: PropTypes.string,
	/**
	 * A renderable component (or string) which will be displayed as the content of this item. Generally a `ToggleControl`.
	 */
	children: PropTypes.node,
};

export default Card;
