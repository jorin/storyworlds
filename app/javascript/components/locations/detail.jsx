import PropTypes from 'prop-types';
import React from 'react';
import Async from 'react-select/async';
import HtmlArea from 'components/ui/html_area';
import TagsEditor from 'components/ui/tags_editor';
import Events from 'components/worlds/events';
import FormatService from 'services/format_service';
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

  handleParent = parent => this.setState(({ location }) => ({ location: Object.assign({},
                                                                                      location, { ancestors: parent ? (parent.ancestors || []).concat(parent) : null,
                                                                                                  parent,
                                                                                                  parentId: parent ? parent.id : null }) }),
                                         () => this.handleSave({ fields: ['parentId'] }));

  handleRemoveAsParentForId = (id, e) => {
    e && e.preventDefault();
    const { locationsPath } = this.props;

    this.setState({ saving: true });
    $.ajax({
      data: { location: { parentId: null } },
      method: 'PATCH',
      url: `${locationsPath}/${id}`
    }).done(() => this.setState(({ location }) => ({ location: Object.assign({}, location, { contains: location.contains.filter(l => l.id !== id) }) })))
      .always(() => this.setState({ saving: false }));
  };

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

  isEditable = () => this.props.permissions.manage || this.state.location.creatorId === this.props.userId;

  renderDescription() {
    const { FIELD_DESCRIPTION } = this.constructor;
    const { descriptionEdit, editing, location: { description } } = this.state;
    const canEdit = this.isEditable();

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

  renderEditableHierarchy() {
    const { locationsPath } = this.props;
    const { location: { ancestors, contains, id, parent } } = this.state;
    const linkTo = ({ id, name }) => (
      <span>
        <a href={`${locationsPath}/${id}`}>{name}</a>
        <a href='#'
           className='ml-1 text-white'
           onClick={e => this.handleRemoveAsParentForId(id, e)}>×</a>
      </span>
    );
    const loadOptions = (search, callback) => {
      if (!search) {
        callback([]);
        return;
      }

      $.ajax({
        data: { search },
        method: 'GET',
        url: locationsPath
      }).done(({ locations }) => callback(locations.filter(l => l.id !== id && (!l.ancestry || !l.ancestry.split('/').includes(id.toString())))));
    };
    const recurseHierarchy = item => <li key={`${item.id}-${item.name}`}>
                                       {linkTo(item)}
                                       {item.children && !!item.children.length && <ul className='list-hierarchical'>{item.children.map(recurseHierarchy)}</ul>}
                                     </li>;

    return (
      <React.Fragment>
        <div className='row'>
          <div className='col-md-1 text-md-right my-auto'><div className='mb-1'>In</div></div>
          <div className={`col-md-${parent ? 11 : 4} my-auto`}>
            { parent ? <div className='mb-1'>
                         { ancestors && ancestors.filter(({ id }) => id !== parent.id).map(({ id, name }) => <React.Fragment key={`${id}-${name}`}><a href={`${locationsPath}/${id}`}>{name}</a> » </React.Fragment>) }
                         <a href={`${locationsPath}/${parent.id}`}>{parent.name}</a> <a href='#'
                                                                                        className='text-white'
                                                                                        onClick={e => { e.preventDefault(); this.handleParent(); }}>×</a></div>
                     : <Async className='form-select'
                              classNamePrefix='react-select'
                              formatOptionLabel={({ name }) => <span>{name}</span>}
                              loadOptions={loadOptions}
                              onChange={this.handleParent}
                              placeholder='Located in ...'
                              value={parent} /> }
          </div>
        </div>
        <div className='row mt-4'>
          <div className='col-md-1 text-md-right'>Contains</div>
          <div className='col-md-11'>
            <div className='row'>
              { contains &&
                contains.length ? FormatService.flatAncestryToTree(contains, id)
                                               .map(item => <div key={`${item.id}-${item.name}`} className='col-md-3'>
                                                               <div>{linkTo(item)}</div>
                                                               { item.children && !!item.children.length && <ul className='list-hierarchical'>{item.children.map(recurseHierarchy)}</ul> }
                                                            </div>)
                                : <div className='col-12 font-italic font-weight-light mb-3'>no other locations</div> }
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  renderHierarchy() {
    const { locationsPath } = this.props;
    const { location: { contains, parent } } = this.state;
    const canEdit = this.isEditable();
    const linkTo = ({ id, name }) => <a key={`${id}-${name}`} href={`${locationsPath}/${id}`}>{name}</a>;
    
    // don't render the section if can't edit and nothing to see here
    if (!canEdit && (!contains || !contains.length) && !parent) { return; }

    return (
      <div className='mb-5'>
        { canEdit ? this.renderEditableHierarchy()
                  : <React.Fragment>
                      { parent && <p>In: {linkTo(parent)}</p> }
                      { contains && !!contains.length && <p className='item-contains'>Contains: {contains.map(linkTo)}</p> }
                    </React.Fragment> }
      </div>
    );
  };

  renderTags() {
    const { tagsPath } = this.props;
    const { location, location: { taggings } } = this.state;

    return (
      <React.Fragment>
        <h2 className='h5 font-weight-light text-muted'>tags</h2>
        { this.isEditable() ? <TagsEditor handleUpdateTaggings={taggings => this.setState(({ location }) => ({ location: Object.assign({},
                                                                                                                                       location,
                                                                                                                                       { taggings }) }), this.handleSave)}
                                          taggings={taggings || []}
                                          tagsPath={tagsPath} />
                            : <div className= 'my-3'>
                                { taggings &&
                                  !!taggings.length ? taggings.map(({ tag: { name, slug } }) => <span key={slug}
                                                                                                      className='badge badge-secondary badge-pill font-weight-light mb-2 mr-2'>{name}</span>)
                                                    : <span className='font-italic font-weight-light small'>no tags</span> }
                              </div> }
      </React.Fragment>
    );
  };

  render() {
    const { charactersPath, eventsPath, locationsPath, permissions, tagsPath, timelineUnits, userId } = this.props;
    const { location } = this.state;

    return (
      <div className='container'>
        {this.renderDescription()}
    {this.renderHierarchy()}
    {this.renderTags()}
    <hr />
        <div className='location-content'>
          <div id='events'>
            <h2 className='h5 font-weight-light mb-n1 text-muted'>events</h2>
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
