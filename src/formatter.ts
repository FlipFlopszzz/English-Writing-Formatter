import * as vscode from 'vscode';

class FormatProvider implements vscode.DocumentFormattingEditProvider {
  async provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): Promise<vscode.TextEdit[]> {
    formatCurrentFile();
    const startPos = new vscode.Position(0, 0);
    const endPos = document.lineAt(document.lineCount - 1).range.end;
    const textEdit = new vscode.TextEdit(new vscode.Range(startPos, endPos), document.getText());
    return [textEdit];
  }
}

function englishFormatter(textToProcess: string): string {
  let lines = textToProcess.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let para = lines[i]//一个段落
    para = para.replace(/\s{2,}/g, " ")
    para = para.charAt(0).toUpperCase() + para.slice(1);//段落首字母大写
    para = para.replace(/([.,;:?!])\s*/g, '$1 ');//标点后一个空格
    para = para.replace(/([.?!:;])\s([a-z])/g, (match, punctuation, lowercaseLetter) => {
      return punctuation + ' ' + lowercaseLetter.toUpperCase();
    });//标点后首字母大写
    para = para.replace(/([a-zA-Z0-9%])\s([.,?!:;])/g, '$1$2');//去除字符和标点之间的空格
    lines[i] = para
  }

  lines = lines.map(line => line.replace(/^\s+/, ''));// 处理齐头式（去除段落缩进）
  return lines.join('\n').replace(/^\s*[\r\n]/gm, "");// 重新组合文本
}

function formatSelectedWords() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const fileExtension = document.fileName.split('.').pop();
    if (fileExtension === 'txt') {
      const selection = editor.selection;
      const word = document.getText(selection)
      const newWord = englishFormatter(word)
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, newWord);
      });
    } else {
      vscode.window.showErrorMessage('This formatter is only available to .txt file.')
    }
  }
}
function formatCurrentFile() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const fileExtension = document.fileName.split('.').pop();
    if (fileExtension === 'txt') {
      const fullText = document.getText();
      const newFullText = englishFormatter(fullText);
      editor.edit((editBuilder) => {
        editBuilder.replace(new vscode.Range(0, 0, document.lineCount, 0), newFullText);
      });
    } else {
      vscode.window.showErrorMessage('This formatter is only available to .txt file.');
    }
  }
}

export {
  formatCurrentFile,
  formatSelectedWords,
  FormatProvider
}