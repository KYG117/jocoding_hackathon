import './css/shadcn.css'
import './css/MainPage.css'
import '../index.css'

import deleteKeyword from '../assets/deleteKeyword.svg'
import exitIcon from '../assets/exitIcon.svg'

import Sidebar from './Sidebar'
import HistoryView from './HistoryView'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ReactNode, useState } from 'react'
import { useContexts } from '@/Contexts'
import TranslateSetting from './api/TranslateSettings'
import { useNavigate } from 'react-router-dom'
// import { LucideTable2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import dictionaryCall from './api/DictionaryCall'
import keywordGen from './api/KeywordGen'
import ExtendText from './api/ExtendText'

interface DictionaryPopupProps {
  word: string;
  description: string[];
  onClick: () => void;
}

interface ParagraphBoxProps {
  children: ReactNode
}

interface KeywordBlockProps {
  children: ReactNode
  index: number
}

interface FormatBlockProps {
  format: string | undefined
}

export type DictionaryItem = {
  word: string;
  description: string[];
}

const formSchema = z.object({
  isSatisfied: z.string(),
  isUnderstandable: z.string(),
})

const DictionaryPopup = ({word, description, onClick}: DictionaryPopupProps) => {
    return (
      <div id="dictionaryPopup">
        <div className='float-right' onClick={onClick}>
          <img src={exitIcon}/>
        </div>
        <div className="textTitle mb-[4px]">{word}</div>
        {
          description.map((comp, ix) => {
            let className = "textRegular float-left";
            if (ix === 0) {
              className = "partOfSpeech mb-[4px]";
            } else if (ix === 1) {
              className = "textSubTitle float-left mb-[4px]";
            }
            return (<div className={className} key={"description-"+ix.toString()}>{comp}</div>)
          })
        }
      </div>
    )
  }

const CurrentSettingBlock = () => {
  const navigate = useNavigate();
  const { currentSetting, removeKeyword, changeFormat, getPredefinedFormats } = useContexts();

  const KeywordBlock = ({children, index}: KeywordBlockProps) => {
    return (
      <div className='keywordBlock'>
        <span>{children}</span>
        <img src={deleteKeyword} onClick={() => removeKeyword(index)}></img>
      </div>
    )
  }
  
  const FormatBlock = ({format}: FormatBlockProps) => {
    return (
      <Select onValueChange={(value) => changeFormat(value)} defaultValue={format} >
        <SelectTrigger>
          <SelectValue placeholder="Format"/>
        </SelectTrigger>
        <SelectContent>
          {
            getPredefinedFormats().map((entry) => (
              <SelectItem value={entry.formatEN} key={entry.formatEN}>{entry.formatKR}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className='currentSettingBlock'>
      <div className='currentSettingIcon'></div>
      <div className='textSubTitle currentSettingSubTitle'>
        <div>필수 키워드</div>
        <div>유형/형식</div>
      </div>
      <div className='currentSettingTagBlock'>
        <div className='currentKeywords'>
        {
          currentSetting()?.keywords.map((keyword, idx) => (
            <KeywordBlock key={"keywordblock-"+keyword} index={idx}>{keyword}</KeywordBlock>
          ))
        }
        </div>
        <div className='currentKeywords textSubTitle'>
            <FormatBlock format={currentSetting()?.format}/>
        </div>
      </div>
      <Button className='currentSettingEditButton' variant="secondary" onClick={() => navigate("/settings/"+currentSetting()?.id.toString())}>편집설정</Button>
    </div>
  )
}

function ParagraphBox({children}: ParagraphBoxProps) {
  return (<div className='paragraphBox'>{children}</div>)
}

function MainPage() {
  const { currentSetting, changeSetting, addHistory, extendHistory, mainPageText, setMainText, setTextId, currentTextId, getHistoryById } = useContexts();
  const [ isDictionaryVisible, setIsDictionaryVisible ] = useState(false);
  const [ selectedWord, setSelectedWord ] = useState([-1, -1]);
  const [ dictionaryItem, setDictionaryItem ] = useState<DictionaryItem>({word: "", description: []});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isSatisfied: "",
      isUnderstandable: "",
    },
  })
  
  const handleClick = async () => {
    setSelectedWord([-1, -1]);
    setMainText({title: "로딩중...", sentences: [], keywords: []});
    const newText = await TranslateSetting(currentSetting());
    setMainText(newText === "" ? {title: "생성 중 오류가 발생했습니다. 다시 시도해 주세요.", sentences: [], keywords: []} : newText);
    if(newText !== ""){
      const thisPage = addHistory(newText);
      if (thisPage !== null) setTextId(thisPage.id);
    }
  }

  const handleExtend = async () => {
    const previousChapter = mainPageText;
    setMainText({title: "로딩중...", sentences: [], keywords: []});
    const newText = await ExtendText(currentSetting(), mainPageText);
    const sumText = {title: previousChapter.title, sentences: previousChapter.sentences.concat(newText === "" ? [] : newText.sentences), keywords: previousChapter.keywords};
    setMainText(newText === "" ? {title: "생성 중 오류가 발생했습니다. 다시 시도해 주세요.", sentences: [], keywords: []} : sumText);
    if(newText !== ""){
      extendHistory(newText, currentTextId, "");
    }
  }

  const callDictionary = (word: string, isw: [number, number]) => async () => {
    setSelectedWord(isw);
    setDictionaryItem({word: "로딩중...", description: []});
    setIsDictionaryVisible(true);
    const result = await dictionaryCall(word);
    setDictionaryItem(result);
  }
    
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const deltaLi = (values.isUnderstandable === "up" ? 20 : -20);
    const deltaScore = (values.isSatisfied === "up" ? 1 : -1);
    const curSet = currentSetting();
    if(curSet === null) return;
    const hkg = curSet.additional_keywords.map((hk) => {return {keyword: hk.keyword, score: hk.score + deltaScore}});
    const probs = hkg.map((hk) => 1 / (1 + Math.exp(hk.score))) // Sigmoid function for normalizing scores
    const tot = probs.reduce((sum, current) => sum + current, 0);
    let rtot = Math.random() * tot;
    let badkeyIndex = -1;
    for (let i = 0; i < probs.length; i++) {
      rtot -= probs[i];
      if (rtot < 0) {
        badkeyIndex = i;
        break;
      }
    }
    if (badkeyIndex === -1) badkeyIndex = probs.length - 1;
    const newkey = await keywordGen(curSet.keywords.concat(hkg.filter((_, ix) => ix !== badkeyIndex).map((hk) => hk.keyword)), true, hkg[badkeyIndex].keyword);
    await changeSetting(
      {name: curSet.name, keywords: curSet.keywords, format: curSet.format, li: curSet.li + deltaLi, custom: curSet.custom},
      curSet.id, hkg.filter((_, ix) => ix !== badkeyIndex).concat([{keyword: newkey[0], score: 0}])
    );
    handleClick();
  }

  return (
    <>
      <div className='sidebarView sectionBorder'>
        <Sidebar isSettings={false}/>
      </div>

      <div className='mainView sectionBorder'>
        <div className='sectionBorderOnlyBottom'>
          <CurrentSettingBlock/>
        </div>
        <div>
          <ScrollArea className="h-[740px] w-[783px]">
            <ParagraphBox>
              <span className="highlight">{mainPageText.title}</span><br/>
              {mainPageText.sentences.map((sentence, is) => sentence.map((word, iw) => {
                let className = "hover:bg-[#E0E0E0] hover:rounded-lg"
                if (selectedWord[0] === is && selectedWord[1] === iw) {
                  className = "bg-[#fed7aa] rounded-lg"
                }

                return (<span className={className} onClick={callDictionary(word, [is, iw])} key={word+is.toString()+"-"+iw.toString()}>
                  {word + ((iw === sentence.length - 1 && is !== mainPageText.sentences.length - 1) ? ". " : " ")}
                </span>);
              }))}
            </ParagraphBox>
          </ScrollArea>
          <div className='warnText'>
            ❗위의 글은 실제 사실과 다를 수 있으니 주의 바랍니다.
          </div>
        </div>
      </div>

      <div className='mainSideView sectionBorder'>
        <div id="evaluationCointainer">
          <Form {...form}>
            <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="isSatisfied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-bold'>글은 만족스러운가요?</FormLabel>
                    <FormControl>
                    <RadioGroup
                        className="flex space-x-5"
                        onValueChange={field.onChange}
                        defaultValue={field.value}>

                      <FormItem className="flex items-baseline space-x-1">
                        <FormControl>
                          <RadioGroupItem value="up" id="r1" />
                        </FormControl>
                        <FormLabel className='text-[20px]' htmlFor="r1">👍</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-baseline space-x-1">
                        <FormControl>
                          <RadioGroupItem value="down" id="r2" />
                        </FormControl>
                        <FormLabel className='text-[20px]' htmlFor="r2">👎</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUnderstandable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-bold'>글의 내용이 이해되나요?</FormLabel>
                    <FormControl>
                    <RadioGroup
                        className="flex space-x-5"
                        onValueChange={field.onChange}
                        defaultValue={field.value}>

                      <FormItem className="flex items-baseline space-x-1">
                        <FormControl>
                          <RadioGroupItem value="up" id="r1" />
                        </FormControl>
                        <FormLabel className='text-[20px]' htmlFor="r1">⭕</FormLabel>
                      </FormItem>

                      <FormItem className="flex items-baseline space-x-1">
                        <FormControl>
                          <RadioGroupItem value="down" id="r2" />
                        </FormControl>
                        <FormLabel className='text-[20px]' htmlFor="r2">❌</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Button variant={'default'} type="submit">새로운 글</Button>
              </div>
            </form>
          </Form>
          <div>
            <button onClick={handleExtend}>이어서 생성</button>
          </div>
        </div>
        {isDictionaryVisible && <DictionaryPopup 
            word={dictionaryItem.word} 
            description={dictionaryItem.description} 
            onClick={() => {
              setSelectedWord([-1, -1]);
              setIsDictionaryVisible(false)
            }}/>}
      </div>
      {getHistoryById(currentTextId) && <div className="historyView sectionBorder"><HistoryView history={getHistoryById(currentTextId)!}/></div>}
    </>
  )
}

export default MainPage

