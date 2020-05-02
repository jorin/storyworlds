import PropTypes from 'prop-types';
import React from 'react';
import Async from 'react-select/async';
import FiltersService from 'services/filters_service';
import TimelineInput from 'components/ui/timeline_input';
import 'styles/ui/filters_panel';

export default class FiltersPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: Object.assign({}, this.props.filters),
      open: FiltersService.hasFilters(this.props.filters),
      tags: []
    };
  };

  componentDidMount() {
    const { filters, tagsPath } = this.props;
    const id = [].concat(filters.tagsExclude).concat(filters.tagsInclude).filter(Boolean);

    if (id.length) {
      $.ajax({
        data: { id },
        method: 'GET',
        url: tagsPath
      }).done(({ tags }) => this.setState({ tags }));
    }
  };

  applyFilters = () => {
    const { handleFiltersChange } = this.props;
    const { filters } = this.state;

    FiltersService.store(filters);
    handleFiltersChange(filters);
  };

  handleClearFilters = e => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    this.setState({ filters: {}, tags: [] }, this.applyFilters);
  };

  handleRemoveTag = (slug, e) => this.setState(prevState => {
    const filters = Object.assign({}, prevState.filters);
    const tags = prevState.tags.slice(0);
    const { id } = tags.splice(tags.findIndex(t => slug === t.slug), 1)[0];
    filters.tagsExclude = filters.tagsExclude && filters.tagsExclude.filter(tagId => tagId !== id);
    filters.tagsInclude = filters.tagsInclude && filters.tagsInclude.filter(tagId => tagId !== id);

    return { filters, tags };
  }, this.applyFilters);

  handleSelectTag = ({ value }) => this.setState(prevState => {
    const { exclude } = prevState;
    const filters = Object.assign({}, prevState.filters);
    const tags = prevState.tags.concat(value);
    const tagsKey = `tags${exclude ? 'Exclude' : 'Include'}`;

    filters[tagsKey] = (filters[tagsKey] || []).concat(value.id);

    return { filters, tags };
  }, this.applyFilters);

  handleUpdate = (key, value, reload = false) => this.setState(prevState => {
    const filters = Object.assign({}, prevState.filters);

    value ? filters[key] = value : delete filters[key];

    return { filters };
  }, () => reload && this.applyFilters());

  renderTagSelection() {
    const { tagsPath } = this.props;
    const { tags } = this.state;

    const loadOptions = (search, callback) => {
      if (!search) {
        callback([]);
        return;
      }

      $.ajax({
        data: { search },
        method: 'GET',
        url: tagsPath
      }).done(data => {
        const options = data.tags.filter(({ slug }) => !tags.map(({ slug }) => slug).includes(slug))
                                 .map(t => ({ label: t.name, value: t }));

        callback(options);
      });
    };

    return (
      <Async className='form-select'
             classNamePrefix='react-select'
             loadOptions={loadOptions}
             menuPlacement='top'
             onChange={this.handleSelectTag}
             placeholder='Add a Tag Filter'
             value={null} />
    );
  };

  render() {
    const { handleFiltersChange, timelineUnits } = this.props;
    const { exclude, filters, filters: { ends, starts, tagsAnd, tagsInclude, within }, open, tags } = this.state;
    const hasFilters = FiltersService.hasFilters(filters);

    return (
      <div className={`filters-panel ${ hasFilters ? 'has-filters' : '' } ${ open ? 'open' : '' }`}>
        <div className='container'>
          <div className='row'>
            <div className='col'>
              <div className={`filters-panel-header py-1 ${ hasFilters ? '' : 'text-muted' }`}
                   onClick={e => this.setState(({ open }) => ({ open: !open }))}>
                Filters { hasFilters && <a href='#' className='small text-muted text-decoration-none' onClick={this.handleClearFilters}>[× clear all]</a> }
              </div>
              <div className='filters-panel-content'>
                <div className='row mb-3'>
                  <div className='col-md-4'>
                    <label className='small'>after</label>
                    <TimelineInput onBlur={this.applyFilters}
                                   onChange={starts => this.handleUpdate('starts', starts)}
                                   timelineUnits={timelineUnits}
                                   value={starts} />
                  </div>
                  <div className='col-md-1 my-3 my-md-auto pt-md-4 text-center'>→</div>
                  <div className='col-md-4'>
                    <label className='small'>before</label>
                    <TimelineInput onBlur={this.applyFilters}
                                   onChange={ends => this.handleUpdate('ends', ends)}
                                   timelineUnits={timelineUnits}
                                   value={ends} />
                  </div>
                  <div className='col-md-3 my-3 my-md-auto pt-md-4'>
                    <div className='labeled-checkbox'
                         onClick={e => this.handleUpdate('within', !within, true)}>
                      <span className={`checkbox ${within ? '' : 'checked'}`} />
                      <span>{within ? 'Within Range' : 'Overlaps Range'}</span>
                    </div>
                  </div>
                </div>
                <label className='d-block small my-3'>tags</label>
                <div className='row my-3 tags-filters'>
                  <div className='col-md-4 mb-3'>
                    <div className='labeled-checkbox small mb-3'
                         onClick={e => this.setState(({ exclude }) => ({ exclude: !exclude }))}>
                      <span className={`checkbox ${exclude ? '' : 'checked'}`} />
                      <span>{exclude ? 'Exclude with Tag' : 'Include with Tag'}</span>
                    </div>
                    {this.renderTagSelection()}
                  </div>
                  <div className='col-md-8'>
                    {tags.map(({ id, name, slug }) => <span key={slug} className={`badge badge-${tagsInclude && tagsInclude.includes(id) ? 'secondary' : 'dark not-badge'} badge-pill font-weight-light mb-2 mr-2`}>
                                                        {name} | <a href='#' onClick={e => { e.preventDefault(); this.handleRemoveTag(slug); }}>×</a>
                                                      </span>)}
                    <span className='labeled-checkbox small ml-3 my-2 text-nowrap'
                         onClick={e => this.handleUpdate('tagsAnd', !tagsAnd, true)}>
                      <span className={`checkbox ${tagsAnd ? 'checked' : ''}`} />
                      <span>{tagsAnd ? 'Require all' : 'Include any with'} tags</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

FiltersPanel.propTypes = {
  filters: PropTypes.object,
  handleFiltersChange: PropTypes.func.isRequired,
  tagsPath: PropTypes.string.isRequired,
  timelineUnits: PropTypes.string,
};

FiltersPanel.defaultProps = {
  filters: {},
};
