import * as selectors from './selectors';

const {
    registerStore,
} = wp.data;

registerStore( 'ysc/base/utils', {
    selectors,
    reducer( state ) {
        return state;
    },
} );
