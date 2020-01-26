import PropTypes from 'prop-types';
import React from 'react';
import FormatService from 'services/format_service';
import { STANDARD_TIMELINE_PARSE_FORMAT } from 'constants/timeline';

export default class TimelineInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  };

  handleChange = e => {
    const { target: { value } } = e;
    const { onChange, timelineUnits } = this.props;

    const rawValue = FormatService.timelineEntryToValue(value, timelineUnits);
    if (!isNaN(rawValue)) { onChange(rawValue); }

    this.setState({ editValue: value });
  };

  handleFocus = e => {
    const { timelineUnits, value } = this.props;
    const editValue = value && FormatService.timelineValueToEntry(value, timelineUnits);
    this.setState({ editing: true, editValue });
  };
  
  displayValue = () => {
    const { timelineUnits, value } = this.props;

    return value && FormatService.timelineValueToDisplay(value, timelineUnits);
  };

  render() {
    const { placeholder } = this.props;
    const { editing, editValue } = this.state;

    return (
      <input type='TEXT'
             className='form-control text-center'
             onBlur={e => this.setState({ editing: false })}
             onChange={this.handleChange}
             onFocus={this.handleFocus}
             onKeyDown={({ keyCode, which }) => ((keyCode || which) === 13) && this.input && this.input.blur()}
             placeholder={editing ? STANDARD_TIMELINE_PARSE_FORMAT : placeholder}
             ref={input => this.input = input}
             value={(editing ? editValue : this.displayValue()) || ''} />
    );
  };
};

TimelineInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  timelineUnits: PropTypes.string,
  value: PropTypes.number
};
