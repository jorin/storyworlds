import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = { user: Object.assign({}, props.user) };
  };

  handleUpdateAccount = e => {
    if (e) { e.preventDefault(); }
    const { userPath } = this.props;
    const { user, user: { confirmPassword, password } } = this.state;

    if (password !== confirmPassword) {
      this.setState({ validating: true });
      return;
    }

    const data = ['firstName', 'lastName', 'password'].reduce((data, key) => {
      const value = user[key];
      if (value && value.trim()) { Object.assign(data, { [key]: value }); }
      return data;
    }, {});

    if (!Object.keys(data).length) { return; }

    this.setState({ loading: true });
    $.ajax({
      data,
      method: 'PATCH',
      url: userPath
    }).done(() => this.setState(prevState => ({ user: Object.assign({}, prevState.user, { confirmPassword: null, password: null }) })))
      .fail(jqXHR => this.setState({ error: (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) || 'Failed to save' }))
      .always(() => this.setState({ loading: false }));
  };

  renderUserField = (key, label, error, type='TEXT') => {
    const { user } = this.state;
 
    return (
      <div className='form-group'>
        <label>{label}</label>
        <input className={`form-control ${error ? 'is-invalid' : ''}`}
               onChange={({ target: { value } }) => this.setState(prevState => ({ user: Object.assign({}, prevState.user, { [key]: value }) }))}
               type={type}
               value={user[key] || ''} />
        { error && <p className='form-text text-danger'>{error}</p> }
      </div>
    );
  };

  render() {
    const { user: { email } } = this.props;
    const { error, loading, user: { confirmPassword, password }, validating } = this.state;
    const passwordError = validating && confirmPassword !== password && 'Password and password confirmation do not match.';

    return (
      <div className='container loader-container'>
        { error && <Alert variant='danger' dismissible onClose={() => this.setState({ error: null })}>{error}</Alert> }
        <h2>Account</h2>
        <div className='form-group'>
          <label>Email</label>
          <div className='form-control-static text-muted'>{email}</div>
        </div>
        {this.renderUserField('firstName', 'First Name')}
        {this.renderUserField('lastName', 'Last Name')}
        {this.renderUserField('password', 'Password', passwordError, 'PASSWORD')}
        {this.renderUserField('confirmPassword', 'Confirm Password', passwordError && ' ', 'PASSWORD')}
        <a className='btn btn-block btn-primary'
           href='#'
           onClick={this.handleUpdateAccount}>Save</a>

        { loading && <div className='loader' /> }
      </div>
    );
  };
};

Settings.propTypes = {
  user: PropTypes.object.isRequired,
  userPath: PropTypes.string.isRequired,
  usersPath: PropTypes.string.isRequired,
};
