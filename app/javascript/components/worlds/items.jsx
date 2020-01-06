import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';
import FormatService from 'services/format_service';
import HtmlArea from 'components/ui/html_area';
import Timeline from 'components/ui/timeline';
import 'styles/ui/html_area';
import 'styles/ui/timeline';

export default class Items extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: this.constructor.MODE_LIST,
    };
  };

  static MODE_LIST = 'list';
  static MODE_TIMELINE = 'timeline';

  componentDidMount() { this.loadItems(); };
  // allow reloading flag to catch an external change
  componentDidUpdate(prevProps, prevState) { prevProps.reload !== this.props.reload && this.loadItems(); };

  handleSave = e => {
    if (e) { e.preventDefault(); }
    const { itemKey, itemsKey, itemsPath } = this.props;
    const item = this.state[itemKey];
    const { id } = item;
    const method = id ? 'PATCH' : 'POST';
    const url = `${itemsPath}${id ? `/${id}` : ''}`;

    this.setState({ loading: true });
    $.ajax({
      data: { [itemKey]: item },
      method,
      url
    }).done(item => this.setState(prevState => {
      const items = prevState[itemsKey].slice(0);
      const index = items.findIndex(({ id }) => item.id === id);
      index === -1 ? items.push(item) : items[index] = item;
      items.sort(FormatService.sortByTimeline);

      return { [itemKey]: null, [itemsKey]: items };
    }))
      .fail(jqXHR => this.setState({ error: (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) || 'Failed to save' }))
      .always(() => this.setState({ loading: false }));
  };

  handleTimelineSelect = (item, e) => {
    const { itemKey } = this.props;
    const update = { selectedTimelineId: item && item.id };
    if (item && this.isEditable(item.creatorId)) {
      Object.assign(update, { [itemKey]: Object.assign({}, item) });
    }
    
    this.setState(update);
  };

  isEditable = creatorId => {
    const { permissions: { manage, write }, userId } = this.props;

    return manage || (write && creatorId === userId);
  };

  loadItems = () => {
    const { itemsKey, itemsPath } = this.props;

    this.setState({ loading: true });
    $.ajax({
      method: 'GET',
      url: itemsPath
    }).done(data => this.setState({ [itemsKey]: data[itemsKey] }))
      .always(() => this.setState({ loading: false }));
  };

  renderForm = () => {
    const { itemKey, itemLabel } = this.props;
    const { error, [itemKey]: { description, ends, id, name, starts } } = this.state;
    const handleUpdate = (field, value) => this.setState(prevState => ({ [itemKey]: Object.assign({}, prevState[itemKey], { [field]: value }) }));

    return (
      <div>
        { error && <Alert variant='danger' dismissible onClose={() => this.setState({ error: null })}>{error}</Alert> }
        <div className='text-right'>
          <a href='#'
             onClick={e => { e.preventDefault(); this.setState({ [itemKey]: null }); }}>×</a>
        </div>
        <div className='form-group'>
          <input type='TEXT'
                 className='form-control'
                 onChange={({ target: { value } }) => handleUpdate('name', value)}
                 placeholder='name'
                 value={name || ''} />
        </div>
        <div className='form-group'>
          <HtmlArea onChange={description => handleUpdate('description', description)}
                    placeholder='description'
                    value={description} />
        </div>
        <div className='row'>
          <div className='col-sm-5'>
            <div className='form-group'>
              <input type='TEXT'
                     className='form-control text-center'
                     onChange={({ target: { value } }) => handleUpdate('starts', value)}
                     placeholder='starts'
                     value={['number', 'string'].includes(typeof starts) ? starts : ''} />
            </div>
          </div>
          <div className='col-sm-2 text-center'>
            <div className='form-group'>
              <div className='form-control-plaintext text-light'>→</div>
            </div>
          </div>
          <div className='col-sm-5'>
            <div className='form-group'>
              <input type='TEXT'
                     className='form-control text-center'
                     onChange={({ target: { value } }) => handleUpdate('ends', value)}
                     placeholder='ends'
                     value={['number', 'string'].includes(typeof ends) ? ends : ''} />
            </div>
          </div>
        </div>
        <div className='form-group'>
          <a href='#'
             className='btn btn-primary btn-block'
             onClick={this.handleSave}>Save {itemLabel}</a>
        </div>
      </div>
    );
  };

  renderItemCol = item => {
    const { itemKey, itemsPath } = this.props;
    const { creatorId, description, id, name, starts, ends } = item;
    const editable = this.isEditable(creatorId);
    const colClass = this.state[itemKey] ? 'col-md-6 col-sm-12'
                                          : 'col-md-4 col-sm-6';

    return (
      <div className={colClass} key={id}>
        <div className={`detail-cell ${itemKey}-cell ${editable ? 'editable-field' : ''}`}
             onClick={e => editable && this.setState({ [itemKey]: Object.assign({}, item) })}>
          <a href={`${itemsPath}/${id}`}
             className='float-right small btn btn-info more-info'
             onClick={e => e.stopPropagation()}>View ↗</a>
          <p className='lead'>{name}</p>
          <div className='more-info'
               dangerouslySetInnerHTML={{ __html: description }} />
          {(typeof starts === 'number' ||
            typeof ends === 'number') && <div>{starts} → {ends}</div>}
        </div>
      </div>
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

  renderTimeline() {
    const { itemsKey } = this.props;

    return (
      <div className='col-md-8'>
        <Timeline height={window.innerHeight*0.75}
                  hoverRenderer={this.renderTimelineHover}
                  onClick={this.handleTimelineSelect}
                  spans={this.state[itemsKey]} />
      </div>
    );
  };

  renderTimelineHover = ({ ends, description, id, name, starts }) => {
    const { selectedTimelineId } = this.state;

    return (
      <React.Fragment>
        <div>{name}</div>
        { id === selectedTimelineId &&
          <div className='timeline-hover-content-block'
               dangerouslySetInnerHTML={{ __html: description }} /> }
        {(typeof starts === 'number' ||
          typeof ends === 'number') && <div>{starts} → {ends}</div>}
      </React.Fragment>
    );
  };

  render() {
    const { MODE_LIST } = this.constructor;
    const { itemKey, itemLabel, itemsKey, permissions: { write } } = this.props;
    const { loading, mode } = this.state;
    const item = this.state[itemKey];
    const items = this.state[itemsKey];

    return (
      <div className='loader-container'>
        {this.renderModes()}
        <div className='row'>
          <div className='col'>
            <div className='row'>
              { mode === MODE_LIST ? (items || []).map(this.renderItemCol)
                                   : this.renderTimeline() }
              {!item && write && (
                  <div className='col-md-4 col-sm-6'>
                    <a href='#'
                       className='btn btn-success btn-block'
                       onClick={e => { e.preventDefault();
                                       this.setState({ [itemKey]: {} }); }}>Add a {itemLabel}</a>
                  </div>
                ) }
            </div>
          </div>
          { item && <div className='col-md-4 col-sm-6'>
                      <div className='sidebar-form'>{this.renderForm()}</div>
                    </div> }
        </div>
        { loading && <div className='loader' /> }
      </div>
    );
  };
};

Items.propTypes = {
  itemKey: PropTypes.string.isRequired,
  itemLabel: PropTypes.string.isRequired,
  itemsKey: PropTypes.string.isRequired,
  itemsPath: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  reload: PropTypes.bool,
  userId: PropTypes.number,
};
