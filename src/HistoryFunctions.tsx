import { History } from './Contexts';

export const getCurrentNode = (history: History) => {
  let scope = history.tree;
  history.currentNodeAncestors.forEach((ancestor) => {
    if(ancestor !== 0) {
      const newScope = scope.children.find((child) => child.id === ancestor);
      if(newScope) {
        scope = newScope;
      }
      else return null;
    }
  })
  return scope;
}

export const getConcatText = (history: History) => {
  let scope = history.tree;
  let text: string[][] = [];
  history.currentNodeAncestors.forEach((ancestor) => {
    if(ancestor !== 0) {
      const newScope = scope.children.find((child) => child.id === ancestor);
      if(newScope) {
        text = text.concat(newScope.page.sentences);
        scope = newScope;
      }
      else return [];
    }
  })
  text = text.concat(scope.page.sentences);
  return text;
}