import * as vscode from 'vscode';
import { WordCounter } from './wordCounter';

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
    // para = para.replace(/([.?!,;:])\s*([`'"`])/g, '$1$2');//去除标点和引号之间空格
    // para = para.replace(/([`'"`])\s+([a-zA-Z0-9%])/g, '$1$2');//去除引号和字符之间空格
    // para = para.replace(/([.?!,;:])([`'"`])([a-zA-Z0-9%])/g, '$1$2 $3');//在标点，引号，字符结构中，字符前面加一个空格
    // para = para.replace(/([.?!,;:])([`'"`])\s([a-zA-Z])/g, (match, punct, quote, char) => {
    //   if (punct === '.' || punct === '!' || punct === '?') {
    //     char = char.toUpperCase();
    //   }
    //   return punct + quote + " " + char;
    // });//引语句末
    // para = para.replace(/([a-zA-Z0-9%])["]([a-zA-Z0-9%])/g, '$1 "$2');
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
class formatProvider implements vscode.DocumentFormattingEditProvider {
  async provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions): Promise<vscode.TextEdit[]> {
    formatCurrentFile();
    const startPos = new vscode.Position(0, 0);
    const endPos = document.lineAt(document.lineCount - 1).range.end;
    const textEdit = new vscode.TextEdit(new vscode.Range(startPos, endPos), document.getText());
    return [textEdit];
  }
}
function activate(context: vscode.ExtensionContext) {
  //格式化
  let formatSelected = vscode.commands.registerCommand('extension.formatSelected', formatSelectedWords)
  let formatFile = vscode.commands.registerCommand('extension.formatFile', formatCurrentFile)
  const formattingProvider = new formatProvider();
  const selector: vscode.DocumentSelector = [
    { pattern: "**/*.txt" }
  ];
  const providerRegistration = vscode.languages.registerDocumentFormattingEditProvider(selector, formattingProvider);
  context.subscriptions.push(formatSelected)
  context.subscriptions.push(formatFile)
  context.subscriptions.push(providerRegistration)
  //字数统计
  const wordCounter = new WordCounter();
  context.subscriptions.push(wordCounter);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate,
};