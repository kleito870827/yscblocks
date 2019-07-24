import * as selectors from './selectors';

const {
    registerStore,
} = wp.data;

registerStore( 'ysc/base/components', {
    selectors,
    reducer( state ) {
        return state;
    },
} );
