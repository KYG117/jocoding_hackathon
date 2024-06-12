import './css/shadcn.css'
import './css/MainPage.css'
import '../index.css'

import deleteKeyword from '../assets/deleteKeyword.svg'
import exitIcon from '../assets/exitIcon.svg'

import Sidebar from './Sidebar'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ReactNode, useState } from 'react'
import { useContexts } from '@/Contexts'
import TranslateSetting from './api/TranslateSettings'
import { useNavigate } from 'react-router-dom'
// import { LucideTable2 } from 'lucide-react'

interface DictionaryPopupProps {
  word: string;
  description: string;
}

interface ParagraphBoxProps {
  children: ReactNode
}

interface KeywordBlockProps {
  children: ReactNode
  index: number
}

interface FormatBlockProps {
  children: ReactNode
}

const DictionaryPopup = ({word, description}: DictionaryPopupProps) => {
    return (
      <div id="dictionaryPopup">
        <div className='rightAlign'>
          <img src={exitIcon}/>
        </div>
        <div className="textTitle">{word}</div>
        <div className="textRegular">{description}</div>
      </div>
    )
  }

const CurrentSettingBlock = () => {
  const navigate = useNavigate();
  const { currentSetting, removeKeyword } = useContexts();

  const KeywordBlock = ({children, index}: KeywordBlockProps) => {
    return (
      <div className='keywordBlock'>
        <span>{children}</span>
        <img src={deleteKeyword} onClick={() => removeKeyword(index)}></img>
      </div>
    )
  }
  
  const FormatBlock = ({children}: FormatBlockProps) => {
    return (
      <div id='formatBlock' className='textSubTitle'>
        {children}
      </div>
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
        <div className='currentKeywords'>
          {
            <FormatBlock>{currentSetting()?.format}</FormatBlock>
          }
        </div>
      </div>
      <Button className='currentSettingEditButton' variant="secondary" onClick={() => navigate("/settings/"+currentSetting()?.id.toString())}>편집설정</Button>
    </div>
  )
}

function ParagraphBox({children}: ParagraphBoxProps) {
  return (<div className='paragraphBox'>{children}</div>)
}

function extractTitleAndContent(str: string, startChar: string, endChar: string): { title: string, content: string } {
  // Find the index of the start character
  const startIndex = str.indexOf(startChar);
  if (startIndex === -1) {
    console.error(`Start character "${startChar}" not found in string.`);
    return { title: '', content: '' }; // startChar not found
  }

  // Find the index of the end character, starting from the position after startChar
  const endIndex = str.indexOf(endChar, startIndex + 1);
  if (endIndex === -1) {
    console.error(`End character "${endChar}" not found in string.`);
    return { title: '', content: '' }; // endChar not found
  }

  // Extract the substring between startChar and endChar
  const title = str.slice(startIndex, endIndex+1);

  // Extract the substring after endChar
  const content = str.slice(endIndex + 1);

  return { title, content };
}

function MainPage() {
  const { currentSetting, addHistoryByText } = useContexts();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleClick = async () => {
    if (title !== "" || content !== "") await addHistoryByText(`${title} ${content}`);
    const newText = await TranslateSetting(currentSetting());
    let genText = extractTitleAndContent(newText, '<', '>');
    setTitle(genText['title']); // Set the title part
    setContent(genText['content']); // Set the content part
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
          <ParagraphBox>
            <span className="highlight">{title}</span>
            <br /> {/* This adds a line break after the title */}
            <span>{content}</span>
          </ParagraphBox>
        </div>
      </div>

      <div className='mainSideView sectionBorder'>
        <DictionaryPopup word='Artificial' description='1. 이건 하나의 예시'/>

        <div id="evaluationCointainer" className='space-y-5'>
          <div className='space-y-3'>
            <RadioGroup defaultValue="comfortable" >
              <div className='textSubTitle'>글은 만족스러운가요?</div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="up" id="r1" />
                <Label className='textTitle' htmlFor="r1">👍</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="down" id="r2" />
                <Label className='textTitle' htmlFor="r2">👎</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className='space-y-3'>
            <RadioGroup defaultValue="comfortable" >
              <div className='textSubTitle'>글의 내용이 이해되나요?</div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="up" id="r1" />
                <Label className='textTitle' htmlFor="r1">⭕</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="down" id="r2" />
                <Label className='textTitle' htmlFor="r2">❌</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Button variant={'default'} onClick={handleClick}>새로운 글</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MainPage
