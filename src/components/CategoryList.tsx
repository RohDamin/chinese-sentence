import { Link } from 'react-router-dom'
import type { Category } from '../types'

interface Props {
  categories: Category[]
}

export function CategoryList({ categories }: Props) {
  return (
    <ul className="flex flex-col gap-3 px-4 pb-8">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            to={`/study/${encodeURIComponent(c.id)}`}
            className="block rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-md transition hover:border-[#ff8243]/40 hover:shadow-lg active:scale-[0.99]"
          >
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{c.name}</h2>
            {c.description ? (
              <p className="mt-1 text-sm leading-snug text-[#333]">{c.description}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
