/**
 * YSC Settings Page
 */

/**
 * Store
 */
import '../gutenberg/store';

import './style.scss';
import Container from './containers/container.jsx';

window.addEventListener( 'load', () => {
    wp.element.render(
        <Container data={ window.yscSettingsData } />,
        document.querySelector( '.ysc-admin-page' )
    );
} );
