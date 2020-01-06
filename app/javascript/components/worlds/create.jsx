import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';
import Select from 'react-select';
import FormatService from 'services/format_service';
import HtmlArea from 'components/ui/html_area';
import 'styles/ui/html_area';

export default class Create extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      world: { timelineUnits: 'years', },
    };
  };

  handleCreate = e => {
    if (e) { e.preventDefault(); }
    const { worldPath, worldsPath } = this.props;
    const world = Object.assign({}, this.state.world);
    if (!world.slug ||
        !world.slug.trim) { world.slug = FormatService.slugify(world.name); }

    this.setState({ creating: true, error: null });
    this.resetFocus();
    $.ajax({
      data: { world },
      method: 'POST',
      url: worldsPath
    }).done(({ slug }) => window.location = worldPath.replace(':slug', slug))
      .fail(jqXHR => this.setState({ error: (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) || 'Create failed.' }, this.resetFocus))
      .always(() => this.setState({ creating: false }));
  };

  handleFieldChange = (field, value, e) => {
    if (e) { e.preventDefault(); }

    this.setState(({ world }) => ({ world: Object.assign({}, world, { [field]: value }) }));
  };

  resetFocus = () => this.container && this.container.scrollIntoView();

  renderForm() {
    const { timelineUnitsOptions } = this.props;
    const { world: { description, name, open, slug, timelineUnits } } = this.state;

    return (
      <React.Fragment>
        <p className='text-muted'>Add a new world with a unique timeline and characters</p>
        <div className='form-group'>
          <label className='required'>name</label>
          <input type='TEXT'
                 className='form-control'
                 onChange={({ target: { value } }) => this.handleFieldChange('name', value)}
                 placeholder='name'
                 value={name || ''} />
        </div>
        <div className='form-group'>
          <label className='required'>slug</label>
          <input type='TEXT'
                 className={`form-control ${!slug ? 'auto-slug' : ''}`}
                 onChange={({ target: { value } }) => this.handleFieldChange('slug', value)}
                 placeholder={(!name || !name.trim()) ? 'slug' : FormatService.slugify(name)}
                 tabIndex='-1'
                 value={slug || ''} />
          <small className='form-text text-muted'>Unique identifier for the world, it'll be used for identifying the world, for example, in urls</small>
        </div>
        <div className='form-group'>
          <label>description</label>
          <HtmlArea onChange={description => this.handleFieldChange('description', description)}
                    placeholder='description'
                    value={description} />
        </div>
        <div className='form-group'>
          <label>privacy</label>
          <div className='labeled-checkbox'
             onClick={e => this.handleFieldChange('open', !open, e)}>
            <span className={`checkbox ${open ? '' : 'checked'}`} />
            <span>{open ? 'Open' : 'Private'}</span>
          </div>
          <small className='form-text text-muted'>
            { open ? 'Anyone can see the world; you decide who can contribute.'
                   : 'Only users you designate can see the world; you decide who can read, and who can contribute.' }
          </small>
        </div>
        <div className='form-group'>
          <label>timeline</label>
          <Select className='form-select'
                  classNamePrefix='react-select'
                  isClearable
                  onChange={option => this.handleFieldChange('timelineUnits', option && option.value)}
                  options={timelineUnitsOptions}
                  value={timelineUnitsOptions.find(({ value }) => timelineUnits === value)} />
          <small className='form-text text-muted'>Display selection for the start and duration of events, characters, and locations (fractions will still be OK).</small>
        </div>
        <hr />
        <div className='form-group'>
          <a href='#'
             className='btn btn-block btn-primary'
             onClick={this.handleCreate}>Create World</a>
        </div>
      </React.Fragment>
    );
  };

  renderFrontispiece() {
    const { inited } = this.state;

    return (
      <div className={`frontispiece text-center ${inited ? 'hide-for-frontispiece' : 'show-for-frontispiece'}`}
           onClick={e => this.setState({ inited: true })}
           onMouseEnter={e => this.setState({ inited: true })}>
        <h2>
          <span className='big-icon'>☉</span>
          <br/>
          Create a World
        </h2>
        <small className='text-muted'>A new world is an entirely blank canvas, without access to other worlds, events, characters, or locations, so make sure you want one!</small>
      </div>
    );
  };

  render() {
    const { creating, error, inited } = this.state;

    return (
      <React.Fragment>
        {this.renderFrontispiece()}
        <div className={`loader-container ${inited ? 'show-for-frontispiece' : 'hide-for-frontispiece'}`} ref={div => this.container = div}>
          { error && <Alert variant='danger' dismissible onClose={() => this.setState({ error: null })}>{error}</Alert> }
          <h2>Create a World</h2>
          {this.renderForm()}
          { creating && <div className='loader' /> }
        </div>
      </React.Fragment>
    );
  };
};

Create.propTypes = {
  timelineUnitsOptions: PropTypes.array.isRequired,
  worldPath: PropTypes.string.isRequired,
  worldsPath: PropTypes.string.isRequired,
};
