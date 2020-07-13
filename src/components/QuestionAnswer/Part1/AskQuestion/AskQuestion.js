import React,{Component} from 'react';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

import {Editor , EditorState , getDefaultKeyBinding , RichUtils} from 'draft-js';

import '../../../../../node_modules/draft-js/dist/Draft.css';

import './AskQuestion.css';



class AskQuestion extends Component {
    constructor(props) {
      super(props);
      this.state = {editorState: EditorState.createEmpty() , length : 150 , tags : [],value : "",};

      this.focus = () => this.refs.editor.focus();
      this.onChange = (editorState) => this.setState({editorState});

      this.handleKeyCommand = this._handleKeyCommand.bind(this);
      this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
      this.toggleBlockType = this._toggleBlockType.bind(this);
      this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    _handleKeyCommand(command, editorState) {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this.onChange(newState);
        return true;
      }
      return false;
    }

    _mapKeyToEditorCommand(e) {
      if (e.keyCode === 9 /* TAB */) {
        const newEditorState = RichUtils.onTab(
          e,
          this.state.editorState,
          4, /* maxDepth */
        );
        if (newEditorState !== this.state.editorState) {
          this.onChange(newEditorState);
        }
        return;
      }
      return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
      this.onChange(
        RichUtils.toggleBlockType(
          this.state.editorState,
          blockType
        )
      );
    }

    _toggleInlineStyle(inlineStyle) {
      this.onChange(
        RichUtils.toggleInlineStyle(
          this.state.editorState,
          inlineStyle
        )
      );
    }

    changeInput = (e) =>{
        this.setState({length : 150 - e.target.value.length})
    }
    keyPressed = (e) =>{
        this.setState({value : e.target.value})
        if(e.keyCode === 13){
            this.state.tags.push(e.target.value);
            this.setState({value : ""});
        }
    }

    changed = (e) => {
        this.setState({value : e.target.value})
    }
    removetag = (e,tag) => {
        console.log(tag,"Jeelln",e)
        let v = [...this.state.tags]
        const index = v.indexOf(e);
        v.splice(index,1);
        this.setState({tags : v});
    }

    render() {
      const {editorState} = this.state;

      // If the user changes block type before entering any text, we can
      // either style the placeholder or hide it. Let's just hide it now.
      let className = 'RichEditor-editor';
      var contentState = editorState.getCurrentContent();
      if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
          className += ' RichEditor-hidePlaceholder';
        }
      }
      const tags = [...this.state.tags];
      const container = tags.map(tag => {
      return <div key = {tag} className = "tag-add" >{tag} <div onClick = {this.removetag.bind(this,tag)}><i className="fa fa-window-close in-tag" aria-hidden="true"></i></div></div>
      });

      let l = false;
      if(this.state.tags.length >= 5)
        l = true;
      return (
        <Modal open={this.props.flag} onClose={this.props.close}>
            <h1 className = "ask-question-heading">Ask a Question</h1>
            <div className = "ask-modal-body">
                <div><input type = "text" maxLength= "150" className = "question-text" placeholder = "Your Question" onChange = {this.changeInput.bind(this)}></input><span className="badge badge-light">{this.state.length}</span></div>
                 <select className = "question-text"><option>Select Category</option></select>
                <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                    blockStyleFn={getBlockStyle}
                    customStyleMap={styleMap}
                    editorState={editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    keyBindingFn={this.mapKeyToEditorCommand}
                    onChange={this.onChange}
                    placeholder="Question Description..."
                    ref="editor"
                    spellCheck={true}
                    />
                </div>
                </div>
                <div className = "add-tags">
                    <p>Press enter to add new tag</p>
                    <input type = "text" placeholder = "Tag(max 5)" onKeyDown = {this.keyPressed} onChange = {this.changed.bind(this)} value = {this.state.value} disabled = {l}/>
                    <div className ="tags-max">
                    {container}
                    </div>
                    
                </div>
                <button type = "submit"  className = "submit-ask-question">SUBMIT QUESTION </button>
            </div>
            
        </Modal>
      );
    }
  }

  // Custom overrides for "code" style.
  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  }

  class StyleButton extends React.Component {
    constructor() {
      super();
      this.onToggle = (e) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
      };
    }

    render() {
      let className = 'RichEditor-styleButton';
      if (this.props.active) {
        className += ' RichEditor-activeButton';
      }

      return (
        <span className={className} onMouseDown={this.onToggle}>
          {this.props.label}
        </span>
      );
    }
  }

  const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
  ];

  const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };

  var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
  ];

  const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();
    
    return (
      <div className="RichEditor-controls">
        {INLINE_STYLES.map((type) =>
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };
  

export default AskQuestion;
  