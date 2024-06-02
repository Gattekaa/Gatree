interface AddNewComponentProps {
  onClick: () => void
}

export default function AddNewComponentButton({ onClick }: AddNewComponentProps) {
  return (
    <div
      onClick={onClick}
      className="w-full h-[116px] cursor-pointer bg-gray-500/5 backdrop-blur-lg pb-4 flex flex-col rounded-md border border-transparent hover:border-white/20"
    >
      <header className="flex px-4 py-3.5 justify-between items-center">
        <div className="w-5 h-5 bg-slate-800 rounded-md" />
        <div className="w-5 h-5 bg-slate-800 rounded-md" />
      </header>
      <div className="px-4">
        <div className="w-full h-[50px] p-0 bg-slate-800 rounded-full flex justify-center items-center">
          <h2 className="text-white/60">
            Click to add a new link
          </h2>
        </div>
      </div>
    </div>
  )
}