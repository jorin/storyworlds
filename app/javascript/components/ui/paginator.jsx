import PropTypes from 'prop-types';
import React from 'react';
import Creatable from 'react-select';

const Paginator = ({ loadedCount, handlePerPageChange, handlePage, perPage, total }) => !!total && total > loadedCount &&
  <div className='my-3 text-center paginator'>
    <div className='d-inline-block lead my-2 text-center pagination-count'>
      {loadedCount} of {total}
    </div> 
    <div className='align-items-center small'>
      <a href='#' onClick={e => { e.preventDefault(); handlePage(); }}><strong>Load</strong></a> another
      <Creatable className='d-inline-block ml-2 form-select per-page-select' onChange={({ value }) => handlePerPageChange(value)}
                 classNamePrefix='react-select'
                 onInputChange={value => { const perPage = value && parseInt(value, 10); perPage && !isNaN(perPage) && handlePerPageChange(perPage); }}
                 options={[...new Set([5, 10, 25].concat(perPage))].map(value => ({ label: value, value }))}
                 value={{ label: perPage, value: perPage }} />
    </div>
  </div>;

export default Paginator;

Paginator.propTypes = {
  loadedCount: PropTypes.number,
  handlePerPageChange: PropTypes.func,
  handlePage: PropTypes.func.isRequired,
  perPage: PropTypes.number,
  total: PropTypes.number,
};

Paginator.defaultProps = {
  events: [],
  perPage: 5,
  total: 0,
};
