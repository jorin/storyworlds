import React from 'react';
import ReactDOM from 'react-dom';

const RenderService = {
  render: (id, Component) => {
    const node = document.getElementById(id);
    const props = JSON.parse(node.getAttribute('data-props'));

    ReactDOM.render(<Component {...props} />, node);
  },
};

export default RenderService;
