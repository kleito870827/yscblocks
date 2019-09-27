import * as actions from './actions';

export function * getTemplates() {
    const query = '/ysc/v1/get_templates/';
    const templates = yield actions.apiFetch( { path: query } );

    return actions.setTemplates( templates );
}

export function * getTemplateData( id ) {
    const query = `/ysc/v1/get_template_data/?id=${ id }`;
    const data = yield actions.apiFetch( { path: query } );

    if ( ! data.id ) {
        data.id = id;
    }

    return actions.setTemplateData( data );
}
