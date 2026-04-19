import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { StudyToolbar } from '../components/StudyToolbar'
import { SentenceCard } from '../components/SentenceCard'
import { fetchSentencesForCategory } from '../lib/sheets'
import { getStatuses, supabaseConfigured, upsertStatus } from '../lib/supabase'
import { shuffleOrder } from '../lib/utils'
import type { Sentence } from '../types'

type Status = { is_checked: boolean; is_starred: boolean }

function emptyStatus(): Status {
  return { is_checked: false, is_starred: false }
}

/** filterChecked: 켜면 체크되지 않은(미완료) 문장만. filterStarred: 켜면 즐겨찾기만. 둘 다 켜면 AND */
function passesFilters(st: Status, filterChecked: boolean, filterStarred: boolean): boolean {
  if (!filterChecked && !filterStarred) return true
  if (filterChecked && filterStarred) return !st.is_checked && st.is_starred
  if (filterChecked) return !st.is_checked
  return st.is_starred
}

const SWIPE_MIN = 50

export function StudyPage() {
  const { id: rawId } = useParams()
  const categoryId = rawId ? decodeURIComponent(rawId) : ''

  const [sentences, setSentences] = useState<Sentence[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [statusById, setStatusById] = useState<Record<string, Status>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [blurHanzi, setBlurHanzi] = useState(false)
  const [blurMeaning, setBlurMeaning] = useState(false)
  const [blurPinyin, setBlurPinyin] = useState(false)
  const [filterChecked, setFilterChecked] = useState(false)
  const [filterStarred, setFilterStarred] = useState(false)

  const [slideIdx, setSlideIdx] = useState(0)
  const [dragX, setDragX] = useState(0)
  /** 시트 원래 순서(0,1,2,…)가 아니라 랜덤 버튼으로 섞인 순서인지 */
  const [orderIsRandom, setOrderIsRandom] = useState(false)

  useEffect(() => {
    if (!categoryId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [rows, statuses] = await Promise.all([
          fetchSentencesForCategory(categoryId),
          getStatuses(categoryId),
        ])
        if (cancelled) return
        const map: Record<string, Status> = {}
        for (const row of statuses) {
          map[row.sentence_id] = {
            is_checked: row.is_checked ?? false,
            is_starred: row.is_starred ?? false,
          }
        }
        setSentences(rows)
        setOrder(rows.length ? rows.map((_, i) => i) : [])
        setStatusById(map)
        setSlideIdx(0)
        setOrderIsRandom(false)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '문장을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoryId])

  const visibleOrderPositions = useMemo(() => {
    const out: number[] = []
    for (let pos = 0; pos < order.length; pos++) {
      const si = order[pos]
      if (si === undefined) continue
      const sentence = sentences[si]
      if (!sentence) continue
      const st = statusById[sentence.id] ?? emptyStatus()
      if (passesFilters(st, filterChecked, filterStarred)) {
        out.push(pos)
      }
    }
    return out
  }, [order, sentences, statusById, filterChecked, filterStarred])

  const maxVisible = Math.max(0, visibleOrderPositions.length - 1)
  const currentVisibleIdx = Math.min(slideIdx, maxVisible)

  const currentPos = visibleOrderPositions[currentVisibleIdx]
  const currentSentence =
    currentPos !== undefined ? sentences[order[currentPos]!] : undefined

  const goNext = useCallback(() => {
    setSlideIdx((s) => {
      const cap = Math.min(s, maxVisible)
      return Math.min(cap + 1, maxVisible)
    })
  }, [maxVisible])

  const goPrev = useCallback(() => {
    setSlideIdx((s) => {
      const cap = Math.min(s, maxVisible)
      return Math.max(cap - 1, 0)
    })
  }, [maxVisible])

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      setDragX(e.deltaX)
    },
    onSwiped: (e) => {
      setDragX(0)
      if (Math.abs(e.deltaX) < SWIPE_MIN) return
      if (e.deltaX < 0) goNext()
      else goPrev()
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  const handleShuffle = () => {
    if (sentences.length === 0) return
    setOrder(shuffleOrder(sentences.length))
    setSlideIdx(0)
    setOrderIsRandom(true)
  }

  const updateStatus = async (sentence: Sentence, patch: Partial<Status>) => {
    const prev = statusById[sentence.id] ?? emptyStatus()
    const next: Status = {
      is_checked: patch.is_checked ?? prev.is_checked,
      is_starred: patch.is_starred ?? prev.is_starred,
    }
    setStatusById((m) => ({ ...m, [sentence.id]: next }))
    await upsertStatus(categoryId, sentence.id, sentence.hanzi, patch, prev)
  }

  if (!categoryId) {
    return (
      <div className="p-6 text-center">
        <p className="text-stone-600">잘못된 주소입니다.</p>
        <Link className="mt-4 inline-block text-[#ff8243]" to="/">
          목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh min-h-[100dvh] flex-col bg-white">
      <StudyToolbar
        blurHanzi={blurHanzi}
        blurMeaning={blurMeaning}
        blurPinyin={blurPinyin}
        shuffleActive={orderIsRandom}
        filterChecked={filterChecked}
        filterStarred={filterStarred}
        onToggleBlurHanzi={() => setBlurHanzi((v) => !v)}
        onToggleBlurMeaning={() => setBlurMeaning((v) => !v)}
        onToggleBlurPinyin={() => setBlurPinyin((v) => !v)}
        onShuffle={handleShuffle}
        onToggleFilterChecked={() => setFilterChecked((v) => !v)}
        onToggleFilterStarred={() => setFilterStarred((v) => !v)}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-[480px] flex-1 flex-col px-4 pb-6">
        {loading ? (
          <p className="flex flex-1 items-center justify-center py-12 text-center text-stone-500">
            불러오는 중…
          </p>
        ) : error ? (
          <p className="flex flex-1 items-center justify-center py-12 text-center text-red-600">{error}</p>
        ) : sentences.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-12 text-center text-stone-500">
            <p>문장이 없습니다.</p>
            <p className="px-2 text-sm leading-relaxed text-stone-400">
              목록의 B열(이름)과 문장 시트 탭 이름이 같으면 자동으로 찾습니다. 여전히 안 되면 D열에 탭
              이름을, 또는 E열에 gid를 적어 주세요.
            </p>
          </div>
        ) : visibleOrderPositions.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-12 text-center text-stone-500">
            필터에 맞는 문장이 없습니다. 필터를 끄거나, 미완료/즐겨찾기 상태를 확인해 주세요.
          </p>
        ) : currentSentence ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <p className="mb-3 shrink-0 text-center text-sm text-stone-500">
              {currentVisibleIdx + 1} / {visibleOrderPositions.length}
            </p>
            <div {...swipeHandlers} className="mx-auto w-full max-w-[480px] shrink-0 select-none">
              <div
                className="will-change-transform"
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition:
                    dragX === 0
                      ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'none',
                }}
              >
                <SentenceCard
                  key={currentSentence.id}
                  sentence={currentSentence}
                  blurHanzi={blurHanzi}
                  blurMeaning={blurMeaning}
                  blurPinyin={blurPinyin}
                  isChecked={statusById[currentSentence.id]?.is_checked ?? false}
                  isStarred={statusById[currentSentence.id]?.is_starred ?? false}
                  statusDisabled={!supabaseConfigured}
                  onToggleCheck={() =>
                    updateStatus(currentSentence, {
                      is_checked: !(statusById[currentSentence.id]?.is_checked ?? false),
                    })
                  }
                  onToggleStar={() =>
                    updateStatus(currentSentence, {
                      is_starred: !(statusById[currentSentence.id]?.is_starred ?? false),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
