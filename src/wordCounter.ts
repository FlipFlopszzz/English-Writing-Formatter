import * as vscode from 'vscode';

export class WordCounter {
  private statusBarItem: vscode.StatusBarItem;
  private disposable: vscode.Disposable;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      1000
    );

    let subscriptions: vscode.Disposable[] = [];

    subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => {
      this.updateWordCount();
    }));

    subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
      this.updateWordCount();
    }));

    subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document === vscode.window.activeTextEditor?.document) {
        this.updateWordCount();
      }
    }));

    this.updateWordCount();
    this.disposable = vscode.Disposable.from(...subscriptions);
  }

  private updateWordCount() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      this.statusBarItem.hide();
      return;
    }

    const document = editor.document;
    const selection = editor.selection;

    const fullText = document.getText();
    const selectedText = document.getText(selection);

    const totalWords = this.getWordCount(fullText);
    const selectedWords = this.getWordCount(selectedText);

    const totalChars = this.getCharacterCount(fullText);
    const selectedChars = this.getCharacterCount(selectedText);

    // 根据是否有选中内容来决定显示格式
    if (selectedWords > 0) {
      this.statusBarItem.text = `Words: ${selectedWords}/${totalWords}`;
      this.statusBarItem.tooltip = `Selected/Total Characters: ${selectedChars}/${totalChars}`;
    } else {
      this.statusBarItem.text = `Words: ${totalWords}`;
      this.statusBarItem.tooltip = `Total Characters: ${totalChars}`;
    }

    this.statusBarItem.show();
  }

  private getWordCount(text: string): number {
    const words = text.trim().replace(/\s+/g, ' ').split(' ');
    return words[0] === '' ? 0 : words.length;
  }

  private getCharacterCount(text: string): number {
    return text.replace(/\s/g, '').length;
  }

  public dispose() {
    this.statusBarItem.dispose();
    this.disposable.dispose();
  }
}