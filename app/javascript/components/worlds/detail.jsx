import PropTypes from 'prop-types';
import React from 'react';
import Contributors from './contributors';
import Events from './events';
import FiltersPanel from 'components/ui/filters_panel';
import FiltersService from 'services/filters_service';
import HtmlArea from 'components/ui/html_area';
import Items from './items';
import 'styles/ui/nav';
import 'styles/worlds/detail';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: FiltersService.retrieve(),
      world: JSON.parse(JSON.stringify(props.world)),
    };
  };

  static FIELD_DESCRIPTION = 'description';
  static FIELD_ID = 'id';
  static SECTION_CHARACTERS = 'Characters';
  static SECTION_CONTRIBUTORS = 'Contributors';
  static SECTION_EVENTS = 'Events';
  static SECTION_LOCATIONS = 'Locations';

  handleSave = (params = {}) => {
    const { fields } = params;
    const { FIELD_ID } = this.constructor;
    const { worldPath } = this.props;
    const { world } = this.state;
    const data = {
      world: fields ? [FIELD_ID].concat(fields)
                                .reduce((w, k) => Object.assign(w, { [k]: world[k] }), {})
                    : world
    };

    this.setState({ saving: true });
    $.ajax({
      data,
      method: 'PATCH',
      url: worldPath
    }).always(() => this.setState({ saving: false }));
  };

  renderDescription() {
    const { FIELD_DESCRIPTION } = this.constructor;
    const { permissions: { manage } } = this.props;
    const { descriptionEdit, editing, world: { description } } = this.state;

    return (
      <div className='form-group'>
        { editing === FIELD_DESCRIPTION ? (
            <HtmlArea focus
                      onBlur={e => this.setState(({ descriptionEdit, world }) => ({ descriptionEdit: null, editing: null, world: Object.assign({}, world, { description: descriptionEdit }) }), () => this.handleSave({ fields: FIELD_DESCRIPTION }))}
                      onChange={descriptionEdit => this.setState({ descriptionEdit })}
                      placeholder='description'
                      value={descriptionEdit} />
          ) : (
            <div className={`row ${manage ? 'editable-field' : ''}`}
                 onClick={e => manage && this.setState({ descriptionEdit: description, editing: FIELD_DESCRIPTION })}>
              <div className='col' 
                   dangerouslySetInnerHTML={{ __html: description || (manage ? '<div class="small text-center text-muted"><i>[...Add a description]</i></div>' : '') }} />
            </div>
          ) }
      </div>
    );
  };

  renderNav() {
    const { SECTION_CHARACTERS, SECTION_CONTRIBUTORS, SECTION_EVENTS, SECTION_LOCATIONS } = this.constructor;
    const { contributorsProps } = this.props;

    return (
      <ul className='sections-nav clearfix'>
        <li className='float-left'><a href='#events'>{SECTION_EVENTS}</a></li>
        <li className='float-left'><a href='#characters'>{SECTION_CHARACTERS}</a></li>
        <li className='float-left'><a href='#locations'>{SECTION_LOCATIONS}</a></li>
        {contributorsProps && <li className='float-left'><a href='#contributors'>{SECTION_CONTRIBUTORS}</a></li>}
      </ul>
    );
  };

  renderTimelineDescription() {
    const { world: { timelineUnits } } = this.props;

    return (
      <p className='small'>
        <b>Timeline:</b> { timelineUnits && !isNaN(parseInt(timelineUnits)) ? timelineUnits.split(':').map((u, i) => `${u} ${['months in year', 'days in month'][i]}`).join('; ')  : 'Standard' }
      </p>
    );
  };

  render() {
    const { SECTION_CHARACTERS, SECTION_CONTRIBUTORS, SECTION_EVENTS, SECTION_LOCATIONS } = this.constructor;
    const { charactersProps, contributorsProps, eventsProps, locationsProps,
            permissions, tagsPath, world: { timelineUnits }, userId } = this.props;
    const { filters, reload } = this.state;

    return (
      <div className='container'>
        {this.renderTimelineDescription()}
        {this.renderDescription()}
        <hr />
        <div className='world-content'>
          {this.renderNav()}
          <div id='events'>
            <h2>{SECTION_EVENTS}</h2>
            <Events filters={filters}
                    handleTriggerReload={() => this.setState(({ reload }) => ({ reload: !reload }))}
                    permissions={permissions}
                    tagsPath={tagsPath}
                    userId={userId}
                    {...eventsProps} />
          </div>
          <div id='characters'>
            <h2>{SECTION_CHARACTERS}</h2>
            <Items filters={filters}
                   permissions={permissions}
                   tagsPath={tagsPath}
                   timelineUnits={timelineUnits}
                   userId={userId}
                   {...charactersProps} />
          </div>
          <div id='locations'>
            <h2>{SECTION_LOCATIONS}</h2>
            <Items filters={filters}
                   permissions={permissions}
                   reload={reload}
                   tagsPath={tagsPath}
                   timelineUnits={timelineUnits}
                   userId={userId}
                   {...locationsProps} />
          </div>
          { contributorsProps &&
            <div id='contributors'>
              <h2>{SECTION_CONTRIBUTORS}</h2>
              <Contributors {...contributorsProps} />
            </div> }
        </div>
        <FiltersPanel filters={filters}
                      handleFiltersChange={filters => this.setState({ filters })}
                      tagsPath={tagsPath}
                      timelineUnits={timelineUnits} />
      </div>
    );
  };
};

Detail.propTypes = {
  charactersProps: PropTypes.object.isRequired,
  contributorsProps: PropTypes.object,
  eventsProps: PropTypes.object.isRequired,
  locationsProps: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  tagsPath: PropTypes.string.isRequired,
  userId: PropTypes.number,
  world: PropTypes.object.isRequired,
  worldPath: PropTypes.string.isRequired,
};
