import PropTypes from 'prop-types';
import React from 'react';
import HtmlArea from 'components/ui/html_area';
import TagsEditor from 'components/ui/tags_editor';
import Events from 'components/worlds/events';
import 'styles/ui/nav';
import 'styles/worlds/detail';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      location: JSON.parse(JSON.stringify(props.location)),
    };
  };

  static FIELD_DESCRIPTION = 'description';
  static FIELD_ID = 'id';

  handleSave = (params = {}) => {
    const { fields } = params;
    const { FIELD_ID } = this.constructor;
    const { locationsPath } = this.props;
    const { location, location: { id } } = this.state;
    const data = {
      location: fields ? [FIELD_ID].concat(fields)
                                   .reduce((w, k) => Object.assign(w, { [k]: location[k] }), {})
                       : location
    };

    this.setState({ saving: true });
    $.ajax({
      data,
      method: 'PATCH',
      url: `${locationsPath}/${id}`
    }).always(() => this.setState({ saving: false }));
  };

  renderDescription() {
    const { FIELD_DESCRIPTION } = this.constructor;
    const { permissions: { manage }, userId } = this.props;
    const { descriptionEdit, editing, location: { creatorId, description } } = this.state;
    const canEdit = manage || creatorId === userId;

    return (
      <div className='form-group'>
        { editing === FIELD_DESCRIPTION ? (
            <HtmlArea focus
                      onBlur={e => this.setState(({ descriptionEdit, location }) => ({ descriptionEdit: null, editing: null, location: Object.assign({}, location, { description: descriptionEdit }) }), () => this.handleSave({ fields: FIELD_DESCRIPTION }))}
                      onChange={descriptionEdit => this.setState({ descriptionEdit })}
                      placeholder='description'
                      value={descriptionEdit} />
          ) : (
            <div className={`row ${canEdit ? 'editable-field' : ''}`}
                 onClick={e => canEdit && this.setState({ descriptionEdit: description, editing: FIELD_DESCRIPTION })}>
              <div className='col' 
                   dangerouslySetInnerHTML={{ __html: description || (canEdit ? '<div class="small text-center text-muted"><i>[...Add a description]</i></div>' : '') }} />
            </div>
          ) }
      </div>
    );
  };

  renderTags() {
    const { permissions: { manage }, tagsPath, userId } = this.props;
    const { location, location: { creatorId, taggings } } = this.state;

    return manage || creatorId === userId ? <TagsEditor handleUpdateTaggings={taggings => this.setState(({ location }) => ({ location: Object.assign({},
                                                                                                                                                     location,
                                                                                                                                                     { taggings }) }), this.handleSave)}
                                                        taggings={taggings || []}
                                                        tagsPath={tagsPath} />
                                          : <div className= 'my-3'>
                                              { taggings &&
                                                !!taggings.length &&
                                                taggings.map(({ tag: { name, slug } }) => <span key={slug}
                                                                                                className='badge badge-secondary badge-pill font-weight-light mb-2 mr-2'>{name}</span>) }
                                            </div>;
  };

  render() {
    const { charactersPath, eventsPath, locationsPath, permissions, tagsPath, timelineUnits, userId } = this.props;
    const { location } = this.state;

    return (
      <div className='container'>
        {this.renderDescription()}
        {this.renderTags()}
        <hr />
        <div className='location-content'>
          <div id='events'>
            <Events charactersPath={charactersPath}
                    eventsPath={eventsPath}
                    location={location}
                    locationsPath={locationsPath}
                    permissions={permissions}
                    tagsPath={tagsPath}
                    timelineUnits={timelineUnits}
                    userId={userId} />
          </div>
        </div>
      </div>
    );
  };
};

Detail.propTypes = {
  charactersPath: PropTypes.string.isRequired,
  eventsPath: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  locationsPath: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  tagsPath: PropTypes.string.isRequired,
  userId: PropTypes.number,
};
