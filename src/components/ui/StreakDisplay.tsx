type Props = {
  current: number
  longest: number
  color: string
  colorDark: string
}

export default function StreakDisplay({ current, longest, color, colorDark }: Props) {
  return (
    <div className="flex items-center gap-4 w-full">
      {/* Current streak */}
      <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: `${color}22`, border: `2px solid ${color}44` }}>
        <div className="text-3xl font-black mb-1">🔥 {current}</div>
        <p className="text-xs font-semibold" style={{ color: colorDark }}>Dagelijkse reeks</p>
      </div>

      {/* Longest streak */}
      <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: '#f0f9ff', border: '2px solid #bfdbfe' }}>
        <div className="text-3xl font-black mb-1">👑 {longest}</div>
        <p className="text-xs font-semibold text-blue-700">Record</p>
      </div>
    </div>
  )
}
