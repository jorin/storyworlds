import PropTypes from 'prop-types';
import React from 'react';

export default class Contributors extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contributors: props.contributors.map(c => JSON.parse(JSON.stringify(c))),
    };
  };

  static PERMISSION_READ = 'read';
  static PERMISSION_WRITE = 'write';

  handleAddContributors = (permission, e) => {
    if (e) { e.preventDefault(); }
    const { permissionsPath } = this.props;
    const { emails } = this.state;

    if (!emails || !emails.trim()) { return; }

    const email = emails.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().split(' ');

    $.ajax({
      data: { email, permission },
      method: 'POST',
      url: permissionsPath,
    }).done(newContributors => this.setState(prevState => {
      const contributors = prevState.contributors.slice(0);
      newContributors.forEach(c => {
        const index = contributors.findIndex(({ email }) => c.email === email);
        index !== -1 ? contributors[index] = c : contributors.push(c);
      });
      return { contributors, emails: null };
    }));
  };

  handleDeletePermission = (id, e) => {
    if (e) { e.preventDefault(); }
    const { permissionsPath } = this.props;

    $.ajax({
      method: 'DELETE',
      url: `${permissionsPath}/${id}`,
    }).done(() => this.setState(prevState => {
      const contributors = prevState.contributors.slice(0);     
      const deleteIndex = contributors.findIndex(({ permissionId }) => id === permissionId);
      contributors.splice(deleteIndex, 1);

      return { contributors };
    }));
  };

  handleTogglePermission = (id, oldPermission, e) => {
    if (e) { e.preventDefault(); }
    const { PERMISSION_READ, PERMISSION_WRITE } = this.constructor;
    const { permissionsPath } = this.props;
    const permission = { [PERMISSION_READ]: PERMISSION_WRITE,
                         [PERMISSION_WRITE]: PERMISSION_READ }[oldPermission];

    $.ajax({
      data: { worldPermission: { permission } },
      method: 'PATCH',
      url: `${permissionsPath}/${id}`,
    }).done(() => this.setState(prevState => {
      const contributors = prevState.contributors.slice(0);     
      const updateIndex = contributors.findIndex(({ permissionId }) => id === permissionId);
      contributors[updateIndex] = Object.assign({}, contributors[updateIndex], { permission });
      return { contributors };
    }));
  };

  renderContributorCol = ({ email, firstName, lastName,
                            permission, permissionId }) => {
    return (
      <div className='col-md-4' key={email}>
        <div className='contributor-cell'>
          <div className='contributor-controls float-left text-center'>
            <a href='#'
               className={`contributor-permission ${permission}`}
               onClick={e => this.handleTogglePermission(permissionId, permission, e)} />
            <a href='#'
               className='contributor-permission remove'
               onClick={e => this.handleDeletePermission(permissionId, e)} />
          </div>
          <div className='contributor-identity'>
            <div>{firstName} {lastName}</div>
            <small className='text-muted'>{email}</small>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { PERMISSION_READ, PERMISSION_WRITE } = this.constructor;
    const { contributors, emails } = this.state;

    return (
      <div>
        <div className='row'>{contributors.map(this.renderContributorCol)}</div>
        <h3>Add Contributors</h3>
        <input type='TEXT'
               className='form-control'
               onChange={({ target: { value } }) => this.setState({ emails: value })}
               placeholder='contributor1.email@example.com, contributor2.email@example.com, ...'
               value={emails || ''} />
        <p className='small form-text text-muted'>Enter user emails, if a matching user exists they will be added as the selected contributor type.</p>
        <div className='row'>
          <div className='col'>
            <a href='#'
               className='btn btn-info btn-block'
               onClick={e => this.handleAddContributors(PERMISSION_READ, e)}>Add as Readers</a>
          </div>
          <div className='col'>
            <a href='#'
               className='btn btn-success btn-block'
               onClick={e => this.handleAddContributors(PERMISSION_WRITE, e)}>Add as Writers</a>
          </div>
        </div>
      </div>
    );
  };
};

Contributors.propTypes = {
  contributors: PropTypes.array.isRequired,
  permissionsPath: PropTypes.string.isRequired,
};
