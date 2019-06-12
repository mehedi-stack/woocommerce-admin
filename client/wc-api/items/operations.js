/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * WooCommerce dependencies
 */
import { stringifyQuery } from '@woocommerce/navigation';

/**
 * Internal dependencies
 */
import { getResourceIdentifier, getResourcePrefix, getResourceName } from '../utils';
import { NAMESPACE, PRIVATE_NAMESPACE } from '../constants';

const typeEndpointMap = {
	'items-query-categories': NAMESPACE + '/products/categories',
	'items-query-customers': NAMESPACE + '/customers',
	'items-query-coupons': NAMESPACE + '/coupons',
	'items-query-leaderboards': PRIVATE_NAMESPACE + '/leaderboards',
	'items-query-orders': NAMESPACE + '/orders',
	'items-query-products': NAMESPACE + '/products',
	'items-query-taxes': NAMESPACE + '/taxes',
};

function read( resourceNames, fetch = apiFetch ) {
	const filteredNames = resourceNames.filter( name => {
		const prefix = getResourcePrefix( name );
		return Boolean( typeEndpointMap[ prefix ] );
	} );

	return filteredNames.map( async resourceName => {
		const prefix = getResourcePrefix( resourceName );
		const endpoint = typeEndpointMap[ prefix ];
		const query = getResourceIdentifier( resourceName );
		const url = `${ endpoint }${ stringifyQuery( query ) }`;
		const isUnboundedRequest = -1 === query.per_page;

		try {
			const response = await fetch( {
				/* eslint-disable max-len */
				/**
				 * A false parse flag allows a full response including headers which are useful
				 * to determine totalCount. However, this invalidates an unbounded request, ie
				 * `per_page: -1` by skipping middleware in apiFetch.
				 *
				 * See the Gutenberg code for more:
				 * https://github.com/WordPress/gutenberg/blob/dee3dcf49028717b4af3164e3096bfe747c41ed2/packages/api-fetch/src/middlewares/fetch-all-middleware.js#L39-L45
				 */
				/* eslint-enable max-len */
				parse: isUnboundedRequest,
				path: url,
			} );

			let items;
			let totalCount;

			if ( isUnboundedRequest ) {
				items = response;
				totalCount = items.length;
			} else {
				items = await response.json();
				totalCount = parseInt( response.headers.get( 'x-wp-total' ) );
			}

			const ids = items.map( item => item.id );
			const itemResources = items.reduce( ( resources, item ) => {
				resources[ getResourceName( `${ prefix }-item`, item.id ) ] = { data: item };
				return resources;
			}, {} );

			return {
				[ resourceName ]: {
					data: ids,
					totalCount,
				},
				...itemResources,
			};
		} catch ( error ) {
			return { [ resourceName ]: { error } };
		}
	} );
}

function update( resourceNames, data, fetch = apiFetch ) {
	const updateableTypes = [ 'items-query-products-item' ];
	const filteredNames = resourceNames.filter( name => {
		return updateableTypes.includes( getResourcePrefix( name ) );
	} );

	return filteredNames.map( async resourceName => {
		const { id, parent_id, type, ...itemData } = data[ resourceName ];
		let url = NAMESPACE;

		switch ( type ) {
			case 'variation':
				url += `/products/${ parent_id }/variations/${ id }`;
				break;
			case 'variable':
			case 'simple':
			default:
				url += `/products/${ id }`;
		}

		return fetch( { path: url, method: 'PUT', data: itemData } )
			.then( item => {
				return { [ resourceName ]: { data: item } };
			} )
			.catch( error => {
				return { [ resourceName ]: { error } };
			} );
	} );
}

export default {
	read,
	update,
};
