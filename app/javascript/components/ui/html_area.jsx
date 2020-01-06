import PropTypes from 'prop-types';
import React from 'react';
import { ContentState, Editor, EditorState, RichUtils, SelectionState } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';

export default class HtmlArea extends React.Component {
  constructor(props) {
    super(props);
    const { value } = props;

    const editorState = value ? this.valueToEditorState(value) 
                              : EditorState.createEmpty();

    this.state = { editorState, };
  };

  componentDidUpdate(prevProps, prevState) {
    // if an external change updated value, propagate new value
    if (prevProps.value !== this.props.value &&
        this.props.value !== this.state.html) {
      const editorState = this.valueToEditorState(this.props.value || '');
      const html = stateToHTML(editorState.getCurrentContent());
      this.setState({ editorState, html });
    }
  };

  handleChange = editorState => {
    const { onChange } = this.props;
    const html = stateToHTML(editorState.getCurrentContent());

    onChange(html);
    this.setState({ editorState, html });
  };

  handleKeyCommand = (command, fromEditorState) => {
    const editorState = RichUtils.handleKeyCommand(fromEditorState, command);
    if (editorState) {
      this.setState({ editorState });
      return 'handled';
    }
    return 'not-handled';
  };

  cursorAtEnd(editorState) {
    const lastBlock = editorState.getCurrentContent().getBlockMap().last();
    const key = lastBlock.getKey();
    const offset = lastBlock.getLength();

    return EditorState.acceptSelection(editorState,
                                       new SelectionState({ anchorKey: key,
                                                            anchorOffset: offset,
                                                            focusKey: key,
                                                            focusOffset: offset }));
  };

  safeProps = () => {
    const props = Object.assign({}, this.props);

    // don't override props we are building inside the component with passed props
    // ... this will allow pass-through config of the editor (eg, placeholder prop)
    ['onChange', 'value'].forEach(p => delete props[p]);

    return props;
  };

  valueToEditorState = value => this.cursorAtEnd(EditorState.createWithContent(stateFromHTML(value)));

  render() {
    const { focus } = this.props;
    const { editorState } = this.state;

    return (
      <Editor editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.handleChange}
              ref={focus ? editor => editor && editor.focus() : () => {}}
              {...this.safeProps()} />
    );
  };
};

HtmlArea.propTypes = {
  focus: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};
