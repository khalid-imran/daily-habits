import { MONTHS } from '../lib/dates'
import { ChevronLeft, ChevronRight } from './icons'

export default function MonthNav({ y, m, onPrev, onNext, onToday, isCurrent }) {
  return (
    <div className="month-nav">
      <button className="icon-btn" onClick={onPrev} aria-label="Previous month">
        <ChevronLeft />
      </button>
      <div className="month-label">
        {MONTHS[m]}, {y}
      </div>
      <button className="icon-btn" onClick={onNext} aria-label="Next month">
        <ChevronRight />
      </button>
      {!isCurrent && (
        <button className="link today-link" onClick={onToday}>
          Back to today
        </button>
      )}
    </div>
  )
}
