import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import Async from 'react-select/async';
import FormatService from 'services/format_service';
import HtmlArea from 'components/ui/html_area';
import TimelineInput from 'components/ui/timeline_input';
import TimelineLabel from 'components/ui/timeline_label';

const Relationships = ({ character, charactersPath, location, locationsPath, permissions: { write }, relationshipsPath, timelineUnits }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [relationship, setRelationship] = useState(null);
  const [relationships, setRelationships] = useState([]);

  const relatableId = (character || location).id;
  const relatableType = (character && 'Character') || (location && 'Location');
  const relationshipFor = character || location;

  const handleSave = e => {
    e && e.preventDefault();

    const { id } = relationship;
    const data = { relationship: Object.assign({}, relationship) };
    const method = id ? 'PATCH' : 'POST';
    const url = `${relationshipsPath}${id ? `/${id}` : ''}`;

    setLoading(true);

    $.ajax({ data, method, url })
      .done(() => {
        setRelationship(null);
        loadRelationships();
      })
      .fail(jqXHR => setError((jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error) || 'Failed to save relationship'))
      .always(() => setLoading(false));
  };

  const loadRelationships = () => {
    setLoading(true);
    const data = { relationship: { relatableId, relatableType } };

    $.ajax({
      data,
      method: 'GET',
      url: relationshipsPath
    }).done(({ relationships }) => setRelationships(relationships))
      .always(() => setLoading(false));
  };

  const renderSelect = attr => {
    const applyCharacter = attr === 'character';
    const { ends, starts } = relationshipFor;
    const relatableIdsByType = relatableType => relationships.filter(r => relatableType === r.relatableType)
                                                             .map(({ relatableId }) => relatableId);
    const existingCharacterIds = relationships.map(({ characterId }) => characterId)
                                              .concat(relatableIdsByType('Character'));
    const existingLocationIds = relatableIdsByType('Location');

    const loadOptions = (search, callback) => {
      let options = [], searchPromises = 0;
      const data = { ends, search, sort: 'name', starts };
      const searchPaths = applyCharacter ? [charactersPath] : [charactersPath, locationsPath];

      searchPaths.forEach(url => {
        searchPromises++;

        $.ajax({ data, method: 'GET', url })
         .done(response => {
           searchPromises--;
           options = options.concat(response[Object.keys(response).find(k => url.includes(k))]
                                    .map(m => Object.assign({ relatableType: url === charactersPath ? 'Character' : 'Location' }, m)));

           !searchPromises &&
             callback(options.filter(o => character ? o.id !== character.id || o.relatableType !== 'Character'
                                                    : o.id !== location.id || o.relatableType !== 'Location')
                             .map(o => ({ label: o.name, value: o })));
         });
      });
    };

    return (
      <Async className='form-select text-left'
             classNamePrefix='react-select'
             defaultInputValue={relationship[attr] && relationship[attr].name}
             loadOptions={loadOptions}
             onChange={({ value }) => {
               const update = applyCharacter ? { character: value, characterId: value.id }
                                             : { relatable: value, relatableId: value.id, relatableType: value.relatableType };

               setRelationship(Object.assign({}, relationship, update));
             }}
             onFocus={({ currentTarget }) => currentTarget.select()} />
    );
  };

  const renderForm = () => {
    const { character, description, ends, inverseName, name, relatable, starts } = relationship;
    const handleUpdate = (field, value) => setRelationship(Object.assign({}, relationship, { [field]: value }));
    const isCharacter = character && relatableType === 'Character' && relatableId === character.id;
    const [characterInput, relatableInput] = isCharacter ? [<div className='form-control-plaintext text-light'>{character.name}</div>, renderSelect('relatable')]
                                                         : [renderSelect('character'), <div className='form-control-plaintext text-light'>{relatable.name}</div>];

    return (
      <div>
        <div className='text-right'><a href='#' onClick={e => { e.preventDefault(); setRelationship(null); }}>×</a></div>
        { error && <Alert variant='danger' dismissible onClose={() => setError(null)}>{error}</Alert> }
        <div className='form-group'>
          <div className='row'>
            <div className='col-md-4 text-center text-md-right'>{characterInput}</div>
            <div className='col-md-4'>
              <input type='TEXT'
                     className='form-control text-center'
                     onChange={({ target: { value } }) => handleUpdate('name', value)}
                     placeholder='relationship'
                     value={name || ''} />
            </div>
            <div className='col-md-4 text-center text-md-left'>{relatableInput}</div>
          </div>
        </div>
        <div className='form-group'>
          <div className='row'>
            <div className='col-md-4 text-center text-md-right'>
              <div className='form-control-plaintext text-light'>{(relatable && relatable.name) || <div className='text-muted'>Select Relation</div>}</div>
            </div>
            <div className='col-md-4'>
              <input type='TEXT'
                     className='form-control text-center'
                     onChange={({ target: { value } }) => handleUpdate('inverseName', value)}
                     placeholder={name || 'relationship'}
                     value={inverseName || ''} />
            </div>
            <div className='col-md-4 text-center text-md-left'>
              <div className='form-control-plaintext text-light'>{(character && character.name) || <div className='text-muted'>Select Character</div>}</div>
            </div>
          </div>
        </div>
        <div className='form-group'>
          <label>description</label>
          <HtmlArea onChange={description => handleUpdate('description', description)}
                    placeholder='additional description'
                    value={description} />
        </div>
        <div className='row'>
          <div className='col-sm-5'>
            <div className='form-group'>
              <label>starts</label>
              <TimelineInput onChange={starts => handleUpdate('starts', starts)}
                             placeholder='starts'
                             timelineUnits={timelineUnits}
                             value={starts} />
              { relationshipFor && typeof relationshipFor.starts === 'number' && <small className='form-text text-muted text-center'>&gt;= {FormatService.timelineValueToDisplay(relationshipFor.starts, timelineUnits)}</small> }
            </div>
          </div>
          <div className='col-sm-2 text-center'>
            <div className='form-group'>
              <div className='form-control-plaintext text-light'><br />→</div>
            </div>
          </div>
          <div className='col-sm-5'>
            <div className='form-group'>
              <label className='float-md-right'>ends</label>
              <TimelineInput onChange={ends => handleUpdate('ends', ends)}
                             placeholder='ends'
                             timelineUnits={timelineUnits}
                             value={ends} />
              { relationshipFor && typeof relationshipFor.ends === 'number' && <small className='form-text text-muted text-center'>&lt;= {FormatService.timelineValueToDisplay(relationshipFor.ends, timelineUnits)}</small> }
            </div>
          </div>
        </div>
        <div className='form-group'>
          <a href='#'
             className='btn btn-primary btn-block'
             onClick={handleSave}>Save Relationship</a>
        </div>
      </div>
    );
  };

  const renderRelationshipRow = relationship => {
    const ownsRelationship = relatableType === 'Character' && character.id === relationship.character.id;
    const relatedTo = ownsRelationship ? relationship.relatable : relationship.character;
    const relatedToCharacter = !ownsRelationship || relationship.relatableType === 'Character';

    return (
      <tr className={write ? 'editable-field' : ''}
          key={`relationship-${relationship.id}`}
          onClick={write ? e => setRelationship(relationship) : null}>
        <td>{ (ownsRelationship || !relationship.inverseName) ? relationship.name : relationship.inverseName }</td>
        <td>
          <a href={`${relatedToCharacter ? charactersPath : locationsPath}/${relatedTo.id}`}
             className={`${relatedToCharacter ? 'character' : 'location'}-label`}
             onClick={e => e.stopPropagation()}>{relatedTo.name}</a>
        </td>
        <td>
          <TimelineLabel starts={relationship.starts}
                         ends={relationship.ends}
                         timelineUnits={timelineUnits} />
          {relationship.description}
        </td>
      </tr>
    );
  };

  useEffect(loadRelationships, []);

  return (
    <div className='loader-container'>
      { write &&
          <div className='subsection-controls'>
            { relationship ? renderForm()
                           : <a href='#'
                                className='btn btn-light'
                                onClick={e => { e.preventDefault();
                                                setRelationship(character ? { character, characterId: character.id }
                                                                          : { relatable: location,
                                                                              relatableId: location.id,
                                                                              relatableType: 'Location' }) }}>+ Add Relationship</a> }
          </div> }
      { !!relationships.length && (
          <table className='table my-3'>
            <thead>
              <tr>
                <th>Relationship</th>
                <th>Relation</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>{relationships.map(renderRelationshipRow)}</tbody>
          </table>
        ) }
      { loading && <div className='loader' /> }
    </div>
  );
};

Relationships.propTypes = {
  character: PropTypes.object,
  charactersPath: PropTypes.string.isRequired,
  locationsPath: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  timelineUnits: PropTypes.string,
  userId: PropTypes.number,
};

export default Relationships;
