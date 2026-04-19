import { useEffect, useState } from 'react'
import { CategoryList } from '../components/CategoryList'
import { fetchCategories } from '../lib/sheets'
import type { Category } from '../types'

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchCategories()
        if (!cancelled) {
          setCategories(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto min-h-svh max-w-[480px] bg-white pb-8">
      <header className="border-b border-stone-100 px-4 py-6 text-center">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">문장 목록</h1>
      </header>
      {loading ? (
        <p className="px-4 py-8 text-center text-stone-500">불러오는 중…</p>
      ) : error ? (
        <p className="px-4 py-8 text-center text-red-600">{error}</p>
      ) : categories.length === 0 ? (
        <p className="px-4 py-8 text-center text-stone-500">카테고리가 없습니다.</p>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  )
}
