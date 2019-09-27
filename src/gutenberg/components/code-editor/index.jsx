// External Dependencies.
import AceEditor from "react-ace";
import "brace/mode/css";
import "brace/mode/javascript";
import "brace/snippets/css";
import "brace/snippets/javascript";
import "brace/snippets/text";
import "brace/ext/language_tools";

// Import CSS
import "./editor.scss";

const { Component } = wp.element;

export default class CodeEditor extends Component {
  render() {
    return (
      <AceEditor
        className="ysc-component-code-editor"
        theme="textmate"
        onLoad={editor => {
          editor.renderer.setScrollMargin(16, 16, 16, 16);
          editor.renderer.setPadding(16);
        }}
        fontSize={12}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={false}
        width="100%"
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          printMargin: false,
          tabSize: 2
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
        {...this.props}
      />
    );
  }
}
