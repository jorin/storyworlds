import PropTypes from 'prop-types';
import React from 'react';
import Create from './create';
import List from './list';
import 'styles/worlds/dashboard';

const Dashboard = ({ createProps, listProps, userId }) => {
  return (
    <div className='container'>
      <List anon={!userId}
            {...listProps} />
      {userId && <React.Fragment><hr /><Create {...createProps} /></React.Fragment>}
    </div>
  );
};

export default Dashboard;

Dashboard.propTypes = {
  createProps: PropTypes.object,
  listProps: PropTypes.object.isRequired,
  userId: PropTypes.number,
};
