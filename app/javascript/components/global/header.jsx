import PropTypes from 'prop-types';
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import 'styles/global/header';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  };

  handleLoginSubmit = e => {
    const { email, password } = this.state;

    if (!email || !email.trim() || !password || !password.trim()) {
      e.preventDefault();
      return false;
    }
  };

  renderAnonymous() {
    const { authenticityToken, sessionsPath } = this.props;
    const { email, password } = this.state;

    return (
      <form action={sessionsPath}
            method='POST'
            onSubmit={this.handleLoginSubmit}
            ref={form => this.loginForm = form}>
        <input type='HIDDEN'
               name='authenticity_token'
               readOnly
               value={authenticityToken} />
        <div className='form-group'>
          <input className='form-control'
                 name='email'
                 onChange={({ target: { value } }) => this.setState({ email: value })}
                 placeholder='email'
                 type='email'
                 value={email || ''} />
        </div>
        <div className='form-group'>
          <input className='form-control'
                 name='password'
                 onChange={({ target: { value } }) => this.setState({ password: value })}
                 placeholder='password'
                 type='password'
                 value={password || ''} />
        </div>
        <div className='form-group'>
          <input type='SUBMIT'
                 className='btn btn-primary btn-block'
                 readOnly
                 value='Login' />
        </div>
      </form>
    );
  };

  renderTitle() {
    const { character, location, rootPath, world, worldsPath } = this.props;
    const item = character || location;

    return (
      <h1>
        { (item && item.name) || (world && world.name) || 'storyworlds ☉' }
        { item &&
          <div className='small'>
            <a href={`${worldsPath}/${world.slug}`} className='text-light'>{world.name}</a>
          </div>}
        { (item || world) &&
          <div className='small'>
            <a href={rootPath} className='text-muted'>storyworlds ☉</a>
          </div>}
      </h1>
    );
  };

  renderUser() {
    const { sessionsPath, usersPath, user: { firstName } } = this.props;
    const { Item } = Dropdown;

    return (
      <div className='text-right'>
        <DropdownButton alignRight
                        title={firstName}>
          <Item href={usersPath}>Settings</Item>
          <Item href={sessionsPath} data-method='DELETE'>Logout</Item>
        </DropdownButton>
      </div>
    );
  };

  render() {
    const { badge, user } = this.props;

    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm col-md-8'>{this.renderTitle()}</div>
          <div className='col-sm col-md-4'>
            <div className='header-user text-right'>
              {user ? this.renderUser() : this.renderAnonymous()}
              {badge && <span className={`badge ${badge.className}`}>{badge.text}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };
};

Header.propTypes = {
  authenticityToken: PropTypes.string.isRequired,
  badge: PropTypes.object,
  character: PropTypes.object,
  location: PropTypes.object,
  rootPath: PropTypes.string.isRequired,
  sessionsPath: PropTypes.string.isRequired,
  usersPath: PropTypes.string.isRequired,
  user: PropTypes.object,
  world: PropTypes.object,
  worldsPath: PropTypes.string.isRequired,
};
