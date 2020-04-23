import PropTypes from 'prop-types';
import React from 'react';
import FiltersService from 'services/filters_service';
import TimelineInput from 'components/ui/timeline_input';
import 'styles/ui/filters_panel';

export default class FiltersPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: Object.assign({}, this.props.filters),
      open: FiltersService.hasFilters(this.props.filters),
    };
  };

  applyFilters = () => {
    const { handleFiltersChange } = this.props;
    const { filters } = this.state;

    FiltersService.store(filters);
    handleFiltersChange(filters);
  };

  handleClearFilters = e => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    this.setState({ filters: {} }, this.applyFilters);
  };

  handleUpdate = (key, value, reload = false) => this.setState(prevState => {
    const filters = Object.assign({}, prevState.filters);

    value ? filters[key] = value : delete filters[key];

    return { filters };
  }, () => reload && this.applyFilters());

  render() {
    const { handleFiltersChange, timelineUnits } = this.props;
    const { filters, filters: { ends, starts, within }, open } = this.state;
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
  timelineUnits: PropTypes.string,
};

FiltersPanel.defaultProps = {
  filters: {},
};
