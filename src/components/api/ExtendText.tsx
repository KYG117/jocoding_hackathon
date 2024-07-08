import { Setting } from "../../Contexts";
import { parse, Parsed } from "./Parse";
import prompts from "./Prompts";

async function ExtendText(setting: Setting | null, parsed: Parsed) {

  console.log("Extending Text");

  let word_num: number;

  if(setting === null) return "";
  
  switch(setting.li) {
    case 100:
      word_num = 50;
      break;
    case 300:
      word_num = 150;
      break;  
    case 500:
      word_num = 300;
      break; 
    case 700:
      word_num = 400;
      break;
    case 900:
      word_num = 600;
      break;
    case 1100:
      word_num = 800;
      break;
    case 1500:
      word_num = 1000;
      break;
    default:
      word_num = 500;
  }

  const keyword_list = parsed.keywords;
  const translate_keyword = "Translate the following keywords in Korean into English. Do not answer anything else than the keywords. Seperate the keywords with a single comma(,). " + keyword_list.join(", ");
  const translated_keywords = await prompts(translate_keyword, "You should translate the following keywords into English.");

  const prompt = "Generate a "+ word_num + "-word " + setting.format + " which has lexile level " + setting.li.toString() + ". The text is about the following keywords: " + translated_keywords + ". A preceding chapter is as the following: \n" + parsed.sentences.map((words) => words.join(" ")).join(". ") + ".";

  const prompt_result = await prompts(prompt);
  return parse(prompt_result, keyword_list, true, parsed.title);
}

export default ExtendText;