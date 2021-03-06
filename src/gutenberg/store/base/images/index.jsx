import reducer from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';
import * as controls from './controls';
import * as resolvers from './resolvers';

const {
    registerStore,
} = wp.data;

registerStore( 'ysc/base/images', { reducer, selectors, actions, controls, resolvers } );
