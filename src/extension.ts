import * as vscode from 'vscode';
import { WordCounter } from './wordCounter';
import { FormatProvider, formatCurrentFile, formatSelectedWords } from './formatter';

function activate(context: vscode.ExtensionContext) {
  //格式化
  let formatSelected = vscode.commands.registerCommand('extension.formatSelected', formatSelectedWords)
  let formatFile = vscode.commands.registerCommand('extension.formatFile', formatCurrentFile)
  const formattingProvider = new FormatProvider();
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