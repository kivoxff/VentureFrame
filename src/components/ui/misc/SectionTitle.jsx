function SectionTitle({ title }) {
  return (
    <div className="flex justify-between items-end gap-4 mb-8">
      <div>
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{title}</h2>
        <div className="h-1 w-20 bg-rose-600 mt-2"></div>
      </div>
      <button className="text-rose-600 font-semibold hover:underline">View All</button>
    </div>
  )
}

export default SectionTitle;