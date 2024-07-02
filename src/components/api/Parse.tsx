export type Parsed = {
  keywords: string[];
  title: string;
  sentences: string[][];
}

export const parse = (text: string, keywords: string[], extend: boolean = false, prevTitle?: string): Parsed => {
  const si = text.indexOf("<");
  const ei = text.indexOf(">", si+1);
  const title = (extend && prevTitle) ? prevTitle : ((si < 0 || ei < 0) ? "" : text.slice(si, ei+1));
  const content = text.slice(ei+1);
  const lines = content.split(".");
  const sentences = lines.map((line) => line.split(" ").map((word) => word.trim()));
  return {keywords: keywords, title: title, sentences: sentences};
}