import PropTypes from 'prop-types';
import React from 'react';
import HtmlArea from 'components/ui/html_area';
import Events from 'components/worlds/events';
import 'styles/ui/nav';
import 'styles/worlds/detail';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      character: JSON.parse(JSON.stringify(props.character)),
    };
  };

  static FIELD_DESCRIPTION = 'description';
  static FIELD_ID = 'id';

  handleSave = (params = {}) => {
    const { fields } = params;
    const { FIELD_ID } = this.constructor;
    const { charactersPath } = this.props;
    const { character, character: { id } } = this.state;
    const data = {
      character: fields ? [FIELD_ID].concat(fields)
                                    .reduce((w, k) => Object.assign(w, { [k]: character[k] }), {})
                        : character
    };

    this.setState({ saving: true });
    $.ajax({
      data,
      method: 'PATCH',
      url: `${charactersPath}/${id}`
    }).always(() => this.setState({ saving: false }));
  };

  renderDescription() {
    const { FIELD_DESCRIPTION } = this.constructor;
    const { permissions: { manage }, userId } = this.props;
    const { descriptionEdit, editing, character: { creatorId, description } } = this.state;
    const canEdit = manage || creatorId === userId;

    return (
      <div className='form-group'>
        { editing === FIELD_DESCRIPTION ? (
            <HtmlArea focus
                      onBlur={e => this.setState(({ descriptionEdit, character }) => ({ descriptionEdit: null, editing: null, character: Object.assign({}, character, { description: descriptionEdit }) }), () => this.handleSave({ fields: FIELD_DESCRIPTION }))}
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

  render() {
    const { charactersPath, eventsPath, locationsPath, permissions, timelineUnits, userId } = this.props;
    const { character } = this.state;

    return (
      <div className='container'>
        {this.renderDescription()}
        <hr />
        <div className='character-content'>
          <div id='events'>
            <Events character={character}
                    charactersPath={charactersPath}
                    eventsPath={eventsPath}
                    locationsPath={charactersPath}
                    permissions={permissions}
                    timelineUnits={timelineUnits}
                    userId={userId} />
          </div>
        </div>
      </div>
    );
  };
};

Detail.propTypes = {
  character: PropTypes.object.isRequired,
  charactersPath: PropTypes.string.isRequired,
  eventsPath: PropTypes.string.isRequired,
  locationsPath: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  timelineUnits: PropTypes.string,
  userId: PropTypes.number,
};
