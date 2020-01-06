import PropTypes from 'prop-types';
import React from 'react';

export default class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = { worlds: [] };
  };

  componentDidMount() { this.loadPage(); }

  loadPage = () => {
    const { worldsPath } = this.props;

    this.setState({ loading: true });
    $.ajax({
      dataType: 'json',
      method: 'GET',
      url: worldsPath
    }).done(({ worlds }) => this.setState({ worlds }))
      .always(() => this.setState({ loading: false }));
  };

  renderBadgeForId = id => {
    const { createdIds, permissions } = this.props;
    const badge = { badgeType: 'light', text: 'PUBLIC' };

    if (createdIds && createdIds.includes(id)) { Object.assign(badge, { badgeType: 'primary', text: 'CREATOR' }); }
    else if (permissions && permissions[id]) { Object.assign(badge, { badgeType: permissions[id], text: permissions[id].toUpperCase() }); }

    const { badgeType, text } = badge;
    return <span className={`badge badge-${badgeType}`}>{text}</span>;
  };

  render() {
    const { anon, worldPath } = this.props;
    const { loading, worlds } = this.state;

    return (
      <div>
        <h2>Explore Worlds</h2>
        <div className='loader-container'>
          <table className='table'>
            <tbody>
              { worlds.map(({ id, name, slug }) => (
                  <tr key={`world-${slug}`}>
                    <td><a href={worldPath.replace(':slug', slug)}>{name}</a></td>
                    {!anon && <td className='text-center'>{this.renderBadgeForId(id)}</td>}
                  </tr>
                )) }
            </tbody>
          </table>
          { loading && <div className='loader' /> }
        </div>
      </div>
    );
  };
};

List.propTypes = {
  anon: PropTypes.bool,
  createdIds: PropTypes.array,
  permissions: PropTypes.object,
  worldPath: PropTypes.string.isRequired,
  worldsPath: PropTypes.string.isRequired,
};
