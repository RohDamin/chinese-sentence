interface Props {
  isChecked: boolean
  isStarred: boolean
  disabled?: boolean
  onToggleCheck: () => void
  onToggleStar: () => void
}

function iconBtn(active: boolean) {
  return [
    'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
    active
      ? 'border-[#ff8243] bg-[#ff8243]/10 text-[#ff8243]'
      : 'border-stone-200 bg-white/90 text-stone-400 shadow-sm hover:border-stone-300 hover:text-stone-600',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' ')
}

export function CardStatusIcons({
  isChecked,
  isStarred,
  disabled,
  onToggleCheck,
  onToggleStar,
}: Props) {
  return (
    <div className="pointer-events-auto flex gap-1.5">
      <button
        type="button"
        className={iconBtn(isChecked)}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          onToggleCheck()
        }}
        aria-pressed={isChecked}
        aria-label="학습 완료"
      >
        <span
          className={`text-[1.65rem] leading-none ${isChecked ? '' : 'opacity-40 saturate-0'}`}
          aria-hidden
        >
          ✅
        </span>
      </button>
      <button
        type="button"
        className={iconBtn(isStarred)}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar()
        }}
        aria-pressed={isStarred}
        aria-label="즐겨찾기"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={isStarred ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  )
}
