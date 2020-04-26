import PropTypes from 'prop-types';
import React from 'react';
import Async from 'react-select/async';
import FormatService from 'services/format_service';

export default class TagsEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  };

  handleRemoveTag = (slug, e) => {
    if (e) { e.preventDefault(); }
    const { handleUpdateTaggings } = this.props;
    const taggings = this.props.taggings.slice(0);
    const taggingIndex = taggings.findIndex(({ tag }) => slug === tag.slug);
    if (taggings[taggingIndex].id) {
      taggings[taggingIndex] = Object.assign({}, taggings[taggingIndex], { _destroy: true });
    } else { taggings.splice(taggingIndex, 1); }

    handleUpdateTaggings(taggings);
  };

  handleSelectTag = ({ value }) => {
    const { handleUpdateTaggings } = this.props;
    const taggings = this.props.taggings.slice(0);
    const taggingIndex = taggings.findIndex(({ tag }) => tag.slug === value.slug);
    // just undestroy a persisted assignment
    if (taggingIndex !== -1) {
      taggings[taggingIndex] = Object.assign({}, taggings[taggingIndex], { _destroy: false });
    }
    // or add a new tag assignment
    else { taggings.push({ tag: value }); }

    handleUpdateTaggings(taggings);
  };

  renderTagInput = () => {
    const { taggings, tagsPath } = this.props;

    const loadOptions = (search, callback) => {
      if (!search) {
        callback([]);
        return;
      }

      $.ajax({
        data: { search },
        method: 'GET',
        url: tagsPath
      }).done(({ tags }) => {
        const existingSlugs = (taggings || []).filter(({ _destroy }) => !_destroy)
                                              .map(({ tag: { slug } }) => slug);
        const options = tags.filter(({ slug }) => !existingSlugs.includes(slug))
                            .map(t => ({ label: t.name, value: t }));
        const slug = FormatService.slugify(search);
        
        // allow adding this slug if it's not in the options or existing
        !tags.find(t => slug === t.slug) && !existingSlugs.includes(slug) &&
          options.push({ label: `Add tag '${search}'`, value: { name: search, slug } });

        callback(options);
      });
    };

    return (
      <Async className='form-select'
             classNamePrefix='react-select'
             loadOptions={loadOptions}
             onChange={this.handleSelectTag}
             placeholder='Select or Add Tag'
             value={null} />
    );
  };

  render() {
    const { stacked, taggings } = this.props;

    return (
      <div className='tags-editor'>
        <div className='row'>
          <div className={`${stacked ? 'col-12' : 'col-md-4'} mb-3`}>{this.renderTagInput()}</div>
          <div className={`${stacked ? 'col-12' : 'col-md-8'} mb-3`}>
            { taggings.filter(({ _destroy }) => !_destroy)
                      .map(({ tag: { name, slug } }) => <span key={slug} className='badge badge-secondary badge-pill font-weight-light mb-2 mr-2'>
                                                          {name} | <a href='#' onClick={e => this.handleRemoveTag(slug, e)}>×</a>
                                                        </span>) }
          </div>
        </div>
      </div>
    );
  };
};

TagsEditor.propTypes = {
  handleUpdateTaggings: PropTypes.func.isRequired,
  stacked: PropTypes.bool,
  taggings: PropTypes.array,
  tagsPath: PropTypes.string.isRequired,
};

TagsEditor.defaultProps = {
  stacked: false,
  taggings: [],
};
