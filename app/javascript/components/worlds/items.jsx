import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';
import FiltersService from 'services/filters_service';
import FormatService from 'services/format_service';
import HtmlArea from 'components/ui/html_area';
import Paginator from 'components/ui/paginator';
import TagsEditor from 'components/ui/tags_editor';
import Timeline from 'components/ui/timeline';
import TimelineInput from 'components/ui/timeline_input';
import TimelineLabel from 'components/ui/timeline_label';
import 'styles/ui/html_area';
import 'styles/ui/timeline';

export default class Items extends React.Component {
  constructor(props) {
    super(props);

    const { itemsKey } = this.props;

    this.state = {
      [itemsKey]: [],
      mode: this.constructor.MODE_LIST,
      perPage: 5,
      total: 0
    };
  };

  static MODE_LIST = 'list';
  static MODE_TIMELINE = 'timeline';
  static SORT_BY_NAME = 'name';

  componentDidMount() { this.loadItems(); };
  // allow reloading flag to catch an external change
  componentDidUpdate(prevProps, prevState) {
    if (!FiltersService.equal(prevProps.filters, this.props.filters)) { this.handleRefresh(); }
    else if (prevProps.reload !== this.props.reload) { this.loadItems(); }
  };

  handleRefresh = () => this.setState({ [this.props.itemsKey]: [] }, this.loadItems);

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

  loadItems = (from = this.state[this.props.itemsKey].length, perPage = this.state.perPage) => {
    const { filters, itemsKey, itemsPath } = this.props;
    const { reverseOrder, sortBy } = this.state;
    const data = { from, perPage };
    Object.assign(data, FiltersService.asParams(filters));
    if (reverseOrder) { Object.assign(data, { sortBy: 'ends', sortOrder: 'desc' }); }
    if (sortBy) { Object.assign(data, { sortBy }); }

    this.setState({ loading: true });
    $.ajax({
      data,
      method: 'GET',
      url: itemsPath
    }).done(data => this.setState(prevState => ({ [itemsKey]: prevState[itemsKey].concat(data[itemsKey]), total: data.total })))
      .always(() => this.setState({ loading: false }));
  };

  renderForm = () => {
    const { itemKey, itemLabel, tagsPath, timelineUnits } = this.props;
    const { error, [itemKey]: { description, ends, id, name, starts, taggings } } = this.state;
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
              <TimelineInput onChange={starts => handleUpdate('starts', starts)}
                             placeholder='starts'
                             timelineUnits={timelineUnits}
                             value={starts} />
            </div>
          </div>
          <div className='col-sm-2 text-center'>
            <div className='form-group'>
              <div className='form-control-plaintext text-light'>→</div>
            </div>
          </div>
          <div className='col-sm-5'>
            <div className='form-group'>
              <TimelineInput onChange={ends => handleUpdate('ends', ends)}
                             placeholder='ends'
                             timelineUnits={timelineUnits}
                             value={ends} />
            </div>
          </div>
        </div>
        <div className='form-group'>
          <TagsEditor handleUpdateTaggings={taggings => handleUpdate('taggings', taggings)}
                      stacked
                      taggings={taggings || []}
                      tagsPath={tagsPath} />
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
    const { itemKey, itemsPath, timelineUnits } = this.props;
    const { creatorId, description, id, name, starts, ends, taggings } = item;
    const editable = this.isEditable(creatorId);
    const colClass = this.state[itemKey] ? 'col-sm-12'
                                         : 'col-md-4 col-sm-6';

    return (
      <div className={colClass} key={id}>
        <div className={`detail-cell ${itemKey}-cell ${editable ? 'editable-field' : ''}`}
             onClick={e => editable && this.setState({ [itemKey]: Object.assign({}, item) })}>
          <a href={`${itemsPath}/${id}`}
             className='float-right small btn btn-info more-info'
             onClick={e => e.stopPropagation()}>View ↗</a>
          <p><span className='lead'>{name}</span>{this.renderItemColAncestry(item)}</p>
          <div className='more-info'
               dangerouslySetInnerHTML={{ __html: description }} />
          <TimelineLabel starts={starts}
                         ends={ends}
                         timelineUnits={timelineUnits} />
          <div className= 'my-3'>
            { taggings &&
              !!taggings.length &&
              taggings.map(({ tag: { name, slug } }) => <span key={slug}
                                                              className='badge badge-secondary badge-pill font-weight-light mb-2 mr-2'>{name}</span>) }
          </div>
        </div>
      </div>
    );
  };

  renderItemColAncestry = item => {
    const { itemsPath } = this.props;
    const { contains, parent } = item;
    const linkTo = ({ id, name }) => <a key={`${id}-${name}`}
                                        href={`${itemsPath}/${id}`}
                                        onClick={e => e.stopPropagation()}>{name}</a>;

    return (
      <React.Fragment>
        { parent && <span className='d-block small text-muted'>In: {linkTo(parent)}</span> }
        { contains && !!contains.length && <span className='d-block small item-contains text-muted'>
                                             Contains: {contains.map(linkTo)}
                                           </span> }
      </React.Fragment>
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

  renderSorts() {
    const { SORT_BY_NAME } = this.constructor;
    const { itemsKey } = this.props;
    const { perPage, reverseOrder, sortBy } = this.state;
    const reloadCount = this.state[itemsKey].length || perPage;
    const refreshCallback = () => this.loadItems(0, reloadCount);
    const sortByName = sortBy === SORT_BY_NAME;

    return (
      <div className='float-right'>
        <a href='#'
           className='sort-toggler mr-3'
           onClick={e => {
                      e.preventDefault();
                      this.setState(({ sortBy }) => ({ [itemsKey]: [],
                                                       sortBy: (sortBy !== SORT_BY_NAME) && SORT_BY_NAME }), refreshCallback);
                    }}>
          <span className={sortByName ? 'text-white' : ''}>name</span>
          <span className={`mx-2 sort-toggler-indicator ${sortByName ? 'left' : 'right'}`} />
          <span className={sortByName ? '' : 'text-white'}>timeline</span>
        </a>
        <a href='#'
           className={`sort-order ${ reverseOrder ? 'desc' : '' }`}
           onClick={e => {
                      e.preventDefault();
                      this.setState(({ reverseOrder }) => ({ [itemsKey]: [],
                                                             reverseOrder: !reverseOrder }), refreshCallback);
                    }} />
      </div>
    );
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
    const { timelineUnits } = this.props;
    const { selectedTimelineId } = this.state;

    return (
      <React.Fragment>
        <div>{name}</div>
        { id === selectedTimelineId &&
          <div className='timeline-hover-content-block'
               dangerouslySetInnerHTML={{ __html: description }} /> }
        {(typeof starts === 'number' ||
          typeof ends === 'number') && <div>{FormatService.timelineValueToDisplay(starts, timelineUnits)} → {FormatService.timelineValueToDisplay(ends, timelineUnits)}</div>}
      </React.Fragment>
    );
  };

  render() {
    const { MODE_LIST } = this.constructor;
    const { itemKey, itemLabel, itemsKey, permissions: { write } } = this.props;
    const { loading, mode, perPage, total } = this.state;
    const item = this.state[itemKey];
    const items = this.state[itemsKey];

    return (
      <div className='loader-container'>
        {this.renderSorts()}
        {this.renderModes()}
        <div className='row'>
          <div className='col'>
            <div className='row'>
              { mode === MODE_LIST ? (items || []).map(this.renderItemCol)
                                   : this.renderTimeline() }
              { items.length < total && (
                  <div className='col-md-4 col-sm-6 mb-5'>
                    <Paginator className='in-item-grid mt-n2 mt-sm-3'
                               loadedCount={items.length}
                               handlePerPageChange={perPage => this.setState({ perPage })}
                               handlePage={this.loadItems}
                               perPage={perPage}
                               total={total} />
                  </div>
                ) }
              {!item && write && (
                  <div className='col-md-4 col-sm-6 d-flex align-items-center'>
                    <a href='#'
                       className='btn btn-success btn-block'
                       onClick={e => { e.preventDefault();
                                       this.setState({ [itemKey]: {} }); }}>Add a {itemLabel}</a>
                  </div>
                ) }
            </div>
          </div>
          { item && <div className='col-md-6 col-sm-8'>
                      <div className='sidebar-form'>{this.renderForm()}</div>
                    </div> }
        </div>
        { loading && <div className='loader' /> }
      </div>
    );
  };
};

Items.propTypes = {
  filters: PropTypes.object,
  itemKey: PropTypes.string.isRequired,
  itemLabel: PropTypes.string.isRequired,
  itemsKey: PropTypes.string.isRequired,
  itemsPath: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  reload: PropTypes.bool,
  tagsPath: PropTypes.string.isRequired,
  timelineUnits: PropTypes.string,
  userId: PropTypes.number,
};
