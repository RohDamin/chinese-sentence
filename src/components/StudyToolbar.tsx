import { Link } from 'react-router-dom'

interface Props {
  blurHanzi: boolean
  blurMeaning: boolean
  blurPinyin: boolean
  filterChecked: boolean
  filterStarred: boolean
  onToggleBlurHanzi: () => void
  onToggleBlurMeaning: () => void
  onToggleBlurPinyin: () => void
  onShuffle: () => void
  onToggleFilterChecked: () => void
  onToggleFilterStarred: () => void
}

const pill = (active: boolean) =>
  `rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
    active
      ? 'bg-[#EA580C] text-white'
      : 'bg-stone-100 text-[#1A1A1A] hover:bg-stone-200'
  }`

function IconRound({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        active
          ? 'bg-[#EA580C] text-white'
          : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
      }`}
    >
      {children}
    </button>
  )
}

export function StudyToolbar({
  blurHanzi,
  blurMeaning,
  blurPinyin,
  filterChecked,
  filterStarred,
  onToggleBlurHanzi,
  onToggleBlurMeaning,
  onToggleBlurPinyin,
  onShuffle,
  onToggleFilterChecked,
  onToggleFilterStarred,
}: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[480px] items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <Link
            to="/"
            className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-[#1A1A1A] hover:bg-stone-200 sm:px-3 sm:text-sm"
          >
            ← 목록
          </Link>
          <button type="button" className={pill(blurHanzi)} onClick={onToggleBlurHanzi}>
            한자
          </button>
          <button type="button" className={pill(blurMeaning)} onClick={onToggleBlurMeaning}>
            뜻
          </button>
          <button type="button" className={pill(blurPinyin)} onClick={onToggleBlurPinyin}>
            병음
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconRound active={false} onClick={onShuffle} label="문장 순서 랜덤">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="3.5"
                y="3.5"
                width="17"
                height="17"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
              <circle cx="15.5" cy="8.5" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="8.5" cy="15.5" r="1.6" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.6" fill="currentColor" />
            </svg>
          </IconRound>
          <IconRound
            active={filterChecked}
            onClick={onToggleFilterChecked}
            label="학습 완료만 보기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </IconRound>
          <IconRound active={filterStarred} onClick={onToggleFilterStarred} label="즐겨찾기만 보기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={filterStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </IconRound>
        </div>
      </div>
    </div>
  )
}
