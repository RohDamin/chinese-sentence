import { useState } from 'react'
import type { Sentence } from '../types'
import { CardStatusIcons } from './CardStatusIcons'
import { speakChinese } from '../lib/speech'

interface Props {
  sentence: Sentence
  blurHanzi: boolean
  blurMeaning: boolean
  blurPinyin: boolean
  isChecked: boolean
  isStarred: boolean
  statusDisabled?: boolean
  onToggleCheck: () => void
  onToggleStar: () => void
}

type Field = 'hanzi' | 'pinyin' | 'meaning'

export function SentenceCard({
  sentence,
  blurHanzi,
  blurMeaning,
  blurPinyin,
  isChecked,
  isStarred,
  statusDisabled,
  onToggleCheck,
  onToggleStar,
}: Props) {
  const [revealed, setRevealed] = useState<Record<Field, boolean>>({
    hanzi: false,
    pinyin: false,
    meaning: false,
  })

  /** 토글 ON이면 글자는 투명 처리하고 점선 밑줄만 보이게 함. 줄을 누르면 다시 표시 */
  const lineClass = (blurOn: boolean, revealedField: boolean, visibleTextClass: string) => {
    const hidden = blurOn && !revealedField
    return [
      'cursor-pointer select-none transition-[color,text-decoration-color] duration-200 ease-out',
      hidden
        ? 'text-transparent underline decoration-dotted decoration-2 decoration-stone-400 underline-offset-[0.25em]'
        : `${visibleTextClass} no-underline`,
    ].join(' ')
  }

  const toggleReveal = (field: Field, blurOn: boolean, e: React.MouseEvent | React.KeyboardEvent) => {
    if (!blurOn) return
    e.stopPropagation()
    setRevealed((r) => ({ ...r, [field]: !r[field] }))
  }

  const handleCardSpeak = () => {
    speakChinese(sentence.hanzi)
  }

  const lineKey =
    (field: Field, blurOn: boolean) => (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      toggleReveal(field, blurOn, e)
    }

  return (
    <div
      className="relative flex h-[min(68vh,460px)] min-h-[22rem] w-full max-w-[480px] cursor-pointer flex-col rounded-3xl bg-white px-5 pb-8 pt-12 shadow-[0_8px_30px_rgba(0,0,0,0.08)] outline-none ring-[#EA580C] focus-visible:ring-2"
      tabIndex={0}
      onClick={handleCardSpeak}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardSpeak()
        }
      }}
      aria-label="카드를 눌러 중국어 음성 재생"
    >
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <CardStatusIcons
          isChecked={isChecked}
          isStarred={isStarred}
          disabled={statusDisabled}
          onToggleCheck={onToggleCheck}
          onToggleStar={onToggleStar}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-y-auto px-1">
        <p
          className={`text-center font-['Noto_Sans_SC',sans-serif] text-[clamp(1.65rem,7vw,2.5rem)] leading-snug ${lineClass(blurHanzi, revealed.hanzi, 'text-[#1A1A1A]')}`}
          onClick={(e) => toggleReveal('hanzi', blurHanzi, e)}
          onKeyDown={lineKey('hanzi', blurHanzi)}
        >
          {sentence.hanzi}
        </p>
        <p
          className={`text-center text-[15px] leading-relaxed sm:text-base ${lineClass(blurPinyin, revealed.pinyin, 'text-[#666]')}`}
          onClick={(e) => toggleReveal('pinyin', blurPinyin, e)}
          onKeyDown={lineKey('pinyin', blurPinyin)}
        >
          {sentence.pinyin}
        </p>
        <p
          className={`text-center text-[17px] leading-relaxed ${lineClass(blurMeaning, revealed.meaning, 'text-[#333]')}`}
          onClick={(e) => toggleReveal('meaning', blurMeaning, e)}
          onKeyDown={lineKey('meaning', blurMeaning)}
        >
          {sentence.meaning}
        </p>
      </div>
    </div>
  )
}
