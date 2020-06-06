import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';
import Async from 'react-select/async';
import FiltersService from 'services/filters_service';
import FormatService from 'services/format_service';
import HtmlArea from 'components/ui/html_area';
import Paginator from 'components/ui/paginator';
import TagsEditor from 'components/ui/tags_editor';
import Timeline from 'components/ui/timeline';
import TimelineInput from 'components/ui/timeline_input';
import TimelineLabel from 'components/ui/timeline_label';
import 'styles/ui/html_area';
import 'styles/ui/paginator';
import 'styles/ui/timeline';

export default class Events extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      mode: this.constructor.MODE_LIST,
      perPage: 5,
      total: 0
    };
  };

  static MODE_LIST = 'list';
  static MODE_TIMELINE = 'timeline';

  componentDidMount() { this.loadEvents(); };

  componentDidUpdate(prevProps, prevState) {
    !FiltersService.equal(prevProps.filters, this.props.filters) && this.handleRefresh();
  };

  handleRefresh = () => this.setState({ events: [] }, this.loadEvents);

  handleSave = e => {
    if (e) { e.preventDefault(); }
    const { eventsPath, handleTriggerReload, location } = this.props;
    const { event, event: { id }, events, perPage } = this.state;
    const reloadEventsCount = events.length || perPage;
    const data = { event: Object.assign({}, event) };
    if (location) { data.event.locationId = location.id; }
    else { data.location = this.state.location; }
    const method = id ? 'PATCH' : 'POST';
    const url = `${eventsPath}${id ? `/${id}` : ''}`;

    this.setState({ loading: true });
    $.ajax({
      data,
      method,
      url
    }).done(event => this.setState(prevState => {
      const events = prevState.events.slice(0);
      const index = events.findIndex(({ id }) => event.id === id);

      // update the existing event if its been loaded into the page
      if (index !== -1) {
        events[index] = event;
        events.sort(FormatService.sortByTimeline);
      }

      // but reset events if it hasn't been loaded already
      return { error: null, event: null, events: id ? events : [], location: null };
    }), () => {
      // just reload the current payload of events if this was a new event
      if (!id) { this.loadEvents(0, reloadEventsCount); }
      handleTriggerReload && location && handleTriggerReload();
    })
      .fail(jqXHR => this.setState({ error: (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) || 'Failed to save event' }))
      .always(() => this.setState({ loading: false }));
  };

  handleTimelineSelect = (event, e) => {
    const update = { selectedEventId: event && event.id };
    if (event && this.isEditable(event.creatorId)) {
      Object.assign(update, { event: Object.assign({}, event), location: null });
    }
    
    this.setState(update);
  };

  handleToggleParticipant = (characterId, e) => {
    if (e) { e.preventDefault(); }

    this.setState(({ event }) => {
      const participants = event.participants.slice(0);
      const index = participants.findIndex(p => p.characterId === characterId);

      // toggle _destroy flag for persisted characters
      if (participants[index].id) {
        const participant = Object.assign({}, participants[index]);
        participant._destroy = !participant._destroy;
        participants[index] = participant;
      }
      // just remove something not persisted
      else { participants.splice(index, 1); }

      return { event: Object.assign({}, event, { participants }) };
    });
  };

  isEditable = creatorId => {
    const { permissions: { manage, write }, userId } = this.props;

    return manage || (write && creatorId === userId);
  };

  loadEvents = (from = this.state.events.length, perPage = this.state.perPage) => {
    const { character, eventsPath, filters, location } = this.props;
    const { reverseOrder } = this.state;
    const data = { characterId: character && character.id,
                   locationId: location && location.id,
                   from,
                   perPage };
    Object.assign(data, FiltersService.asParams(filters));
    if (reverseOrder) { Object.assign(data, { sortBy: 'ends', sortOrder: 'desc' }); }

    this.setState({ loading: true });
    $.ajax({
      data,
      method: 'GET',
      url: eventsPath
    }).done(({ events, total }) => this.setState(prevState => ({ events: prevState.events.concat(events), total })))
      .always(() => this.setState({ loading: false }));
  };

  renderAddLocation = () => {
    const { timelineUnits } = this.props;
    const { location } = this.state;
    const handleUpdate = (field, value) => this.setState(({ location }) => ({ location: Object.assign({}, location, { [field]: value }) }));

    return location ? (
      <div className='form-group'>
        <div className='row mb-3'>
          <div className='col-md-11'>
            <input type='TEXT'
                   className='form-control'
                   onChange={({ target: { value } }) => handleUpdate('name', value)}
                   placeholder='location name'
                   value={location.name || ''} />
          </div>
          <div className='col-md-1'>
            <a href='#'
               className='btn btn-block btn-secondary'
               onClick={e => { e.preventDefault(); this.setState({ location: null }); }}>×</a>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-2'>
            <TimelineInput onChange={starts => handleUpdate('starts', starts)}
                           placeholder='location starts'
                           timelineUnits={timelineUnits}
                           value={location.starts} />
          </div>
          <div className='col-md-1 text-center'>
            <div className='form-control-plaintext text-light'>→</div>
          </div>
          <div className='col-md-2'>
            <TimelineInput onChange={ends => handleUpdate('ends', ends)}
                           placeholder='location ends'
                           timelineUnits={timelineUnits}
                           value={location.ends} />
          </div>
          <div className='col-md-3'>
            <input type='TEXT'
                   className='form-control'
                   onChange={({ target: { value } }) => handleUpdate('coordinateX', value)}
                   placeholder='x coordinate'
                   value={location.coordinateX || ''} />
          </div>
          <div className='col-md-3'>
            <input type='TEXT'
                   className='form-control'
                   onChange={({ target: { value } }) => handleUpdate('coordinateY', value)}
                   placeholder='y coordinate'
                   value={location.coordinateY || ''} />
          </div>
        </div>
      </div>
    ) : (
      <div className='row'>
        <div className='col-sm-9 col-md-10'>
          {this.renderLocationSelect()}
        </div>
        <div className='col-sm-3 col-md-2'>
          <a href='#'
             className='btn btn-block  btn-success'
             onClick={e => { e.preventDefault(); this.setState({ location: {} }); }}>
            + New
          </a>
        </div>
      </div>
    );
  };

  renderCharacterSelect = () => {
    const { charactersPath } = this.props;
    const { event: { ends, participants, starts } } = this.state;

    const loadOptions = (search, callback) => {
      $.ajax({
        data: { ends, search, sort: 'name', starts },
        method: 'GET',
        url: charactersPath
      }).done(({ characters }) => {
        const existingCharacterIds = (participants || []).map(({ characterId }) => characterId).filter(Boolean);
        this.setState({ characters });
        callback(characters.filter(({ id }) => !existingCharacterIds.includes(id))
                           .map(c => ({ label: c.name, value: c })));
      });
    };

    return (
      <Async className='form-select'
             classNamePrefix='react-select'
             loadOptions={loadOptions}
             onChange={({ value }) => this.setState(({ event }) => {
               const participants = (event.participants || []).slice(0);
               participants.push({ character: value, characterId: value.id });
               return { event: Object.assign({}, event, { participants }) };
             })} />
    );
  };

  renderEvent = event => {
    const { timelineUnits } = this.props;
    const { creatorId, description, ends, id, location, name, participants, starts, taggings } = event;
    const editable = this.isEditable(creatorId);

    return (
      <div className={`form-group detail-cell ${editable ? 'editable-field' : ''}`}
           key={`event-${id}`}
           onClick={e => editable && this.setState({ event: Object.assign({}, event) })}>
        <div className='row'>
          <div className='col-sm-2'>
            <TimelineLabel starts={starts}
                           ends={ends}
                           timelineUnits={timelineUnits} />
          </div>
          <div className='col-sm-10'>
            <h3>
              <div>{name}</div>
              <small className='location-label text-muted'>{location.name}</small>
            </h3>
            <div className='more-info'>
              { participants &&
                !!participants.length &&
                <p>
                  {participants.map(({ character: { id, name } }) => <span className='character-label text-muted' key={`character-${id}`}>{name}</span>)}
                </p> }
              <div dangerouslySetInnerHTML={{ __html: description }} />
              { taggings &&
                !!taggings.length &&
                taggings.map(({ tag: { name, slug } }) => <span key={slug}
                                                                className='badge badge-secondary badge-pill font-weight-light mb-2 mr-2'>{name}</span>) }
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderForm() {
    const { character, tagsPath, timelineUnits } = this.props;
    const { error, event: { description, ends, id, name, participants, starts, taggings } } = this.state;
    const location = this.props.location || this.state.event.location;
    const handleUpdate = (field, value) => this.setState(({ event }) => ({ event: Object.assign({}, event, { [field]: value }) }));
    const eventFor = character || location;

    return (
      <div>
        <div className='text-right'>
          <a href='#'
             onClick={e => { e.preventDefault(); this.setState({ event: null }); }}>×</a>
        </div>
        { error && <Alert variant='danger' dismissible onClose={() => this.setState({ error: null })}>{error}</Alert> }
        { !this.props.location &&
            <div className='form-group'>
              <label className='required'>location</label>
              { id ? <div className='location-label'>{location.name}</div>
                  : this.renderAddLocation() }
            </div> }
        <div className='row'>
          <div className='col-sm-5'>
            <div className='form-group'>
              <label className='required'>starts</label>
              <TimelineInput onChange={starts => handleUpdate('starts', starts)}
                             placeholder='starts'
                             timelineUnits={timelineUnits}
                             value={starts} />
              { eventFor && typeof eventFor.starts === 'number' && <small className='form-text text-muted text-center'>&gt;= {FormatService.timelineValueToDisplay(eventFor.starts, timelineUnits)}</small> }
            </div>
          </div>
          <div className='col-sm-2 text-center'>
            <div className='form-group'>
              <div className='form-control-plaintext text-light'><br />→</div>
            </div>
          </div>
          <div className='col-sm-5'>
            <div className='form-group'>
              <label className='required float-right'>ends</label>
              <TimelineInput onChange={ends => handleUpdate('ends', ends)}
                             placeholder='ends'
                             timelineUnits={timelineUnits}
                             value={ends} />
              { eventFor && typeof eventFor.ends === 'number' && <small className='form-text text-muted text-center'>&lt;= {FormatService.timelineValueToDisplay(eventFor.ends, timelineUnits)}</small> }
            </div>
          </div>
        </div>
        <div className='form-group'>
          <label className='required'>name</label>
          <input type='TEXT'
                 className='form-control'
                 onChange={({ target: { value } }) => handleUpdate('name', value)}
                 placeholder='name'
                 value={name || ''} />
        </div>
        <div className='form-group'>
          <label className='required'>description</label>
          <HtmlArea onChange={description => handleUpdate('description', description)}
                    placeholder='description'
                    value={description} />
        </div>
        <label>participants</label>
        <div className='form-group'>
          {this.renderCharacterSelect()}
        </div>
        <div className='form-group'>
          <div className='row'>{participants && participants.map(this.renderParticipantCol)}</div>
        </div>
        <label>tags</label>
        <div className='form-group'>
          <TagsEditor handleUpdateTaggings={taggings => handleUpdate('taggings', taggings)}
                      taggings={taggings || []}
                      tagsPath={tagsPath} />
        </div>
        <div className='form-group'>
          <a href='#'
             className='btn btn-primary btn-block'
             onClick={this.handleSave}>Save Event</a>
        </div>
      </div>
    );
  };

  renderLocationSelect = () => {
    const { locationsPath } = this.props;

    const loadOptions = (search, callback) => {
      $.ajax({
        data: { search, sort: 'name' },
        method: 'GET',
        url: locationsPath
      }).done(({ locations }) => {
        this.setState({ locations });
        callback(locations.map(l => ({ label: l.name, value: l })));
      });
    };

    return (
      <Async className='form-select'
             classNamePrefix='react-select'
             loadOptions={loadOptions}
             onChange={({ value }) => this.setState(({ event }) => ({ event: Object.assign({}, event, { location: value, locationId: value.id }) }))} />
    );
  };

  renderModes() {
    const { MODE_LIST, MODE_TIMELINE } = this.constructor;
    const { mode } = this.state;
    const renderLink = m => <a href='#'
                               className={mode === m ? 'active' : ''}
                               onClick={e => { e.preventDefault();
                                               this.setState({ mode: m }); }}>{m}</a>;

    return <p className='view-mode'>{renderLink(MODE_LIST)} | {renderLink(MODE_TIMELINE)}</p>;
  };

  renderParticipantCol = ({ character, id, _destroy }) => {
    const removeOnSave = id && _destroy;

    return (
      <div className='col-sm-3' key={`character-${character.id}`}>
        <div className='character-label'>
          <span className={removeOnSave ? 'remove-on-save' : ''}>
            {character.name}
          </span> <a href='#'
                     onClick={e => this.handleToggleParticipant(character.id, e)}>{removeOnSave ? '+' : '×'}</a>
        </div>
      </div>
    );
  };

  renderTimeline() {
    const { event, events } = this.state;

    return (
      <div>
        <Timeline height={window.innerHeight*0.75}
                  hoverRenderer={this.renderTimelineHover}
                  onClick={this.handleTimelineSelect}
                  spans={events} />
      </div>
    );
  };

  renderTimelineHover = ({ ends, description, id, name, starts }) => {
    const { timelineUnits } = this.props;
    const { selectedEventId } = this.state;

    return (
      <React.Fragment>
        <div>{name}</div>
        { id === selectedEventId &&
          <div className='timeline-hover-content-block'
               dangerouslySetInnerHTML={{ __html: description }} /> }
        <TimelineLabel starts={starts}
                       ends={ends}
                       timelineUnits={timelineUnits} />
      </React.Fragment>
    );
  };

  render() {
    const { MODE_LIST } = this.constructor;
    const { character, permissions: { write } } = this.props;
    const { loading, event, events, mode, perPage, reverseOrder, total } = this.state;

    return (
      <div className='loader-container'>
        { write &&
            <div className='subsection-controls'>
              { event ? this.renderForm()
                      : <a href='#'
                           className='btn btn-light'
                           onClick={e => { e.preventDefault();
                                          this.setState({ event: character ? { participants: [{ character,
                                                                                                characterId: character.id }] }
                                                                           : {},
                                                          location: null }); }}>+ Add Event</a> }
            </div> }
        <a href='#'
           className={`float-right sort-order ${ reverseOrder ? 'desc' : '' }`}
           onClick={e => {
                      e.preventDefault();
                      this.setState(prevState => ({ events: [],
                                                    reverseOrder: !prevState.reverseOrder }),
                                    () => this.loadEvents(0, events.length || perPage));
                    }} />
        {this.renderModes()}
        { mode === MODE_LIST ? (events || []).map(this.renderEvent)
                             : this.renderTimeline() }
        <div className='row'>
          <div className='col-sm-4'>
            <Paginator loadedCount={events.length}
                       handlePerPageChange={perPage => this.setState({ perPage })}
                       handlePage={this.loadEvents}
                       perPage={perPage}
                       total={total} />
          </div>
        </div>
        { loading && <div className='loader' /> }
      </div>
    );
  };
};

Events.propTypes = {
  character: PropTypes.object,
  charactersPath: PropTypes.string.isRequired,
  eventsPath: PropTypes.string.isRequired,
  filters: PropTypes.object,
  location: PropTypes.object,
  locationsPath: PropTypes.string.isRequired,
  handleTriggerReload: PropTypes.func,
  permissions: PropTypes.object.isRequired,
  tagsPath: PropTypes.string.isRequired,
  timelineUnits: PropTypes.string,
  userId: PropTypes.number,
};
