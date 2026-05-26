'use client'

export default function DeleteSurveyButton({ id, deleteAction }) {
  return (
    <form
      action={deleteAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm('Bạn chắc chắn muốn ẩn survey này?')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-500 border border-red-100 rounded-lg px-3 py-1.5 hover:border-red-300 transition-colors"
      >
        Xóa
      </button>
    </form>
  )
}
