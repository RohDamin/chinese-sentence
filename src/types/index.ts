export interface Category {
  id: string
  name: string
  description: string
}

export interface Sentence {
  id: string
  hanzi: string
  pinyin: string
  meaning: string
}

export interface SentenceStatusRow {
  sentence_id: string
  is_checked: boolean
  is_starred: boolean
}
