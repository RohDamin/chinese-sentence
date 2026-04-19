import type { Category, Sentence } from '../types'

const SHEET_ID = '1MlH-7IthxGbq5byrPAQeiXohSdawZyGrE4nIRmXcT0k'

export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cur = ''
  let i = 0
  let inQuotes = false

  while (i < text.length) {
    const c = text[i]!
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      cur += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ',') {
      row.push(cur)
      cur = ''
      i++
      continue
    }
    if (c === '\r') {
      i++
      continue
    }
    if (c === '\n') {
      row.push(cur)
      cur = ''
      if (row.some((cell) => cell.length > 0) || rows.length === 0) {
        rows.push(row)
      }
      row = []
      i++
      continue
    }
    cur += c
    i++
  }
  row.push(cur)
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row)
  }
  return rows
}

/**
 * Google gviz CSV: `sheet` 이름이 탭과 정확히 일치하지 않으면 **첫 번째 시트(보통 "목록")**가 반환됩니다.
 * 그 경우 문장 대신 목록의 이름·설명 열이 한자/병음 칸에 섞여 보입니다.
 */
export async function fetchSheetCSV(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`시트를 불러오지 못했습니다 (${res.status})`)
  }
  const text = await res.text()
  return parseCSV(text)
}

/** 시트 탭의 gid(숫자)로 CSV를 가져옵니다. 탭 이름 불일치 문제를 피할 때 사용합니다. */
export async function fetchSheetCSVByGid(gid: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${encodeURIComponent(gid)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`시트를 불러오지 못했습니다 (${res.status})`)
  }
  const text = await res.text()
  return parseCSV(text)
}

export async function fetchCategories(): Promise<Category[]> {
  const rows = await fetchSheetCSV('목록')
  return rows
    .slice(1)
    .map((row) => ({
      id: row[0]?.trim() ?? '',
      name: row[1]?.trim() ?? '',
      description: row[2]?.trim() ?? '',
    }))
    .filter((c) => c.id)
}

/**
 * "목록" 시트에서 categoryId(id 열)에 해당하는 행을 찾아 문장 시트를 가리킵니다.
 * - E열(선택): 해당 문장 시트 탭의 **gid**(숫자만) — 있으면 가장 확실합니다.
 * - D열(선택): 탭 이름이 아래와 다를 때만 **정확한 탭 문자열**을 적습니다.
 * - D가 비어 있으면 **B열(name)** 을 탭 이름으로 씁니다. (많은 스프레드시트에서 탭이 `여행중국어 1`처럼 이름과 같고, id는 `travel1`만 다른 경우)
 * - B도 비면 **id(A열)** 로 요청합니다.
 */
export async function resolveSentenceSheetRef(categoryId: string): Promise<{
  tab: string
  gid?: string
}> {
  const rows = await fetchSheetCSV('목록')
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const id = (row[0] ?? '').trim()
    if (id !== categoryId) continue

    const gidRaw = (row[4] ?? '').trim()
    const gid = /^\d+$/.test(gidRaw) ? gidRaw : undefined
    const tabFromColD = (row[3] ?? '').trim()
    const name = (row[1] ?? '').trim()
    const tab = tabFromColD || name || id
    return gid ? { tab, gid } : { tab }
  }
  return { tab: categoryId }
}

function parseSentenceRows(rows: string[][]): Sentence[] {
  return rows
    .slice(1)
    .map((row) => ({
      id: String(row[0] ?? '').trim(),
      hanzi: row[1]?.trim() ?? '',
      pinyin: row[2]?.trim() ?? '',
      meaning: row[3]?.trim() ?? '',
    }))
    .filter((s) => s.id && s.hanzi)
}

/** 학습 페이지에서 사용: 목록 시트를 한 번 더 읽어 실제 문장 탭/gid를 해석한 뒤 문장을 가져옵니다. */
export async function fetchSentencesForCategory(categoryId: string): Promise<Sentence[]> {
  const ref = await resolveSentenceSheetRef(categoryId)
  const rows = ref.gid ? await fetchSheetCSVByGid(ref.gid) : await fetchSheetCSV(ref.tab)
  return parseSentenceRows(rows)
}
