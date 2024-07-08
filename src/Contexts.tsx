import { ReactNode, createContext, useContext, useState } from "react";
import { Parsed } from "./components/api/Parse";
import keywordGen from "./components/api/KeywordGen";

const generateId = () => {
  let counter = 1;
  return function () {
    return counter++;
  }
};

const generateSettingId = generateId();
const generateHistoryId = generateId();

export type HiddenKeyword = {
  keyword: string;
  score: number;
}

export type Setting = {
  name: string;
  keywords: string[];
  additional_keywords: HiddenKeyword[];
  format: string;
  li: number;
  custom: boolean;
  id: number;
};

export type SettingInput = {
  name: string;
  keywords: string[];
  format: string;
  li: number;
  custom: boolean;
};

export type Format = {
  formatEN: string;
  formatKR: string;
}

export type HistoryTree = {
  id: number;
  name: string;
  page: Parsed;
  selection: string;
  ancestors: number[];
  children: HistoryTree[];
}

export type History = {
  id: number;
  tree: HistoryTree;
  currentNode: number;
  currentNodeAncestors: number[];
  idCount: number;
}

export type ContextData = {
  settings: Setting[];
  currentSetting: () => Setting | null;
  getSettingById: (id: number) => Setting | null;
  addSetting: (setting: SettingInput) => Promise<Setting | null> | null;
  changeSetting: (setting: SettingInput, id: number, additional_keywords?: HiddenKeyword[]) => Promise<Setting | null> | null;
  setSetting: (id: number) => Setting | null;
  removeKeyword: (idx: number, id?: number) => Promise<Setting | null> | null;
  changeFormat: (format: string, id?: number) => Promise<Setting | null> | null;
  getPredefinedFormats: () => Format[];
  
  histories: History[];
  addHistory: (history: Parsed) => History | null;
  getHistoryById: (id: number) => History | null;
  extendHistory: (history: Parsed, id: number, selection: string) => History | null;

  mainPageText: Parsed;
  setMainText: (page: Parsed) => Parsed | null;
  currentTextId: number;
  setTextId: (id: number) => number;
};

const Context = createContext<ContextData>({
  settings: [],
  currentSetting: () => null,
  getSettingById: () => null,
  addSetting: () => null,
  changeSetting: () => null,
  setSetting: () =>  null,
  removeKeyword: () => null,
  changeFormat: () => null,
  getPredefinedFormats: () => [],
  histories: [],
  addHistory: () => null,
  getHistoryById: () => null,
  extendHistory: () => null,
  mainPageText: {title: "", sentences: [], keywords: []},
  setMainText: () => null,
  currentTextId: 0,
  setTextId: () => 0
});

const defaultSetting: Setting = {
  name: "test",
  keywords: ["인공지능", "컴퓨터", "언어"],
  additional_keywords: [
    {keyword: "머신러닝", score: 0}, 
    {keyword: "딥러닝", score: 0},
    {keyword: "데이터 과학", score: 0},
    {keyword: "자연어 처리", score: 0},
    {keyword: "알고리즘", score: 0},
    {keyword: "신경망", score: 0},
    {keyword: "로보틱스", score: 0},
    {keyword: "컴퓨터 비전", score: 0},
    {keyword: "프로그래밍", score: 0},
    {keyword: "소프트웨어 개발", score: 0}
  ],
  format: "news",
  li: 700,
  custom: false,
  id: 100
};

const formats: Format[] = [
  {formatEN: "news", formatKR: "뉴스"},
  {formatEN: "fiction", formatKR: "소설"},
  {formatEN: "academicPaper", formatKR: "논문"},
  {formatEN: "chapter of a fiction", formatKR: "소설(챕터)"}
  // {formatEN: "non-fiction", formatKR: "논픽션"},
  // {formatEN: "poem", formatKR: "시"}
];

export function ContextProvider({ children }: { children: ReactNode }) {
  const [ settings, setSettings ] = useState<Setting[]>([defaultSetting]);
  const [ currentId, setCurrentId ] = useState(100);
  const [ histories, setHistories ] = useState<History[]>([]);
  const [ mainPageText, setMainPageText ] = useState<Parsed>({title: "", sentences: [], keywords: []});
  const [ currentTextId, setCurrentTextId ] = useState(0);

  const getSettingById = (id: number) => {
    return settings.find((setting: Setting) => setting.id === id) || null;
  };
  const addSetting = async (setting: SettingInput) => {
    const hk = await keywordGen(setting.keywords);
    const hkg = hk.map((key) => {return {keyword: key, score: 0}});
    const newSetting = {id: generateSettingId(), name: setting.name, keywords: setting.keywords, additional_keywords: hkg, format: setting.format, li: setting.li, custom: setting.custom};
    setSettings([newSetting, ...settings]);
    setCurrentId(newSetting.id);
    return newSetting;
  };
  const changeSetting = async (setting: SettingInput, id: number, additional_keywords?: HiddenKeyword[]) => {
    if(!getSettingById(id)) return null;
    let newSetting: Setting;
    if(additional_keywords){
      newSetting = {id: id, name: setting.name, keywords: setting.keywords, additional_keywords: additional_keywords, format: setting.format, li: setting.li, custom: setting.custom};
    } else {
      const hk = await keywordGen(setting.keywords);
      const hkg = hk.map((key) => {return {keyword: key, score: 0}});
      newSetting = {id: id, name: setting.name, keywords: setting.keywords, additional_keywords: hkg, format: setting.format, li: setting.li, custom: setting.custom};
    }
    setSettings([newSetting, ...settings.filter((setting) => setting.id !== id)]);
    setCurrentId(id);
    return newSetting;
  }
  const setSetting = (id: number) => {
    if(!getSettingById(id)) return null;
    setCurrentId(id);
    return getSettingById(id);
  }
  const currentSetting = () => {
    const foundSetting = getSettingById(currentId);
    return foundSetting?foundSetting:null
  }
  const removeKeyword = (idx: number, id: number = currentId) => {
    const foundSetting = getSettingById(id);
    if(foundSetting === null) return null;
    if(foundSetting.keywords.length <= idx) return null;
    const newSetting = {
      name: foundSetting.name,
      format: foundSetting.format,
      li: foundSetting.li,
      custom: foundSetting.custom,
      keywords: foundSetting.keywords.filter((s, i) => i !== idx)
    }
    return changeSetting(newSetting, id);
  }
  const changeFormat = (format: string, id: number = currentId) => {
    const foundSetting = getSettingById(id);
    if(foundSetting === null) return null;
    const newSetting = {
      name: foundSetting.name,
      format: format,
      li: foundSetting.li,
      custom: foundSetting.custom,
      keywords: foundSetting.keywords,
    }
    return changeSetting(newSetting, id);
  }
  const getPredefinedFormats = () => formats;

  const extendTree = (tree: HistoryTree, branch: HistoryTree, ancestors: number[]): HistoryTree => {
    if(ancestors.length === 0) return {id: tree.id, page: tree.page, name: tree.page.sentences[0].join(" "), selection: tree.selection, ancestors: tree.ancestors, children: tree.children.concat([branch])};
    if(ancestors[0] === 0 || ancestors[0] === 1) return extendTree(tree, branch, ancestors.slice(1));
    const nextChild = tree.children.find((child) => child.id === ancestors[0]);
    if(nextChild) {
      return {id: tree.id, page: tree.page, name: tree.page.sentences[0].join(" "), selection: tree.selection, ancestors: tree.ancestors, children: tree.children.filter((child) => child.id !== ancestors[0]).concat([extendTree(nextChild, branch, ancestors.slice(1))])};
    } else {
      return tree;
    }
  }

  const addHistory = (page: Parsed) => {
    const newHistory = {id: generateHistoryId(), tree: {id: 1, page: page, name: page.sentences[0].join(" "), selection: "", ancestors: [0], children: []}, currentNode: 1, currentNodeAncestors: [0], idCount: 1};
    setHistories([newHistory, ...histories]);
    return newHistory;
  }
  const getHistoryById = (id: number) => {
    return histories.find((history: History) => history.id === id) || null;
  }
  const extendHistory = (history: Parsed, id: number, selection: string) => {
    const foundHistory = getHistoryById(id);
    if(!foundHistory) return null;
    const extendedTree = extendTree(foundHistory.tree, {id: foundHistory.idCount + 1, page: history, name: history.sentences[0].join(" "), selection: selection, ancestors: foundHistory.currentNodeAncestors.concat([foundHistory.currentNode]), children: []}, foundHistory.currentNodeAncestors.concat([foundHistory.currentNode]));
    console.log("previous tree: ");
    console.log(foundHistory.tree);
    console.log("extended tree: ");
    console.log(extendedTree);
    const newHistory = {id: id, tree: extendedTree, currentNode: foundHistory.idCount + 1, currentNodeAncestors: foundHistory.currentNodeAncestors.concat([foundHistory.currentNode]), idCount: foundHistory.idCount + 1};
    setHistories([newHistory, ...histories.filter((history) => history.id !== id)].sort((a, b) => a.id - b.id));
    console.log(newHistory);
    return newHistory;
  }

  const setMainText = (page: Parsed) => {
    setMainPageText(page);
    return page;
  }

  const setTextId = (id: number) => {
    setCurrentTextId(id);
    return id;
  }

  return (
    <Context.Provider
      value={{
        settings,
        currentSetting,
        getSettingById,
        addSetting,
        changeSetting,
        setSetting,
        removeKeyword,
        changeFormat,
        getPredefinedFormats,
        histories,
        addHistory,
        getHistoryById,
        extendHistory,
        mainPageText,
        setMainText,
        currentTextId,
        setTextId
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useContexts = () => useContext(Context);