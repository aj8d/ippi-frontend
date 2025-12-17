function SwapyItem({ slotId, itemId, children }) {
  return (
    <div data-swapy-slot={slotId} className="w-full">
      <div
        data-swapy-item={itemId}
        className="relative bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-grab active:cursor-grabbing h-160 flex flex-col items-center justify-center"
      >
        <div className="text-gray-400 hover:text-gray-600">{children}</div>
      </div>
    </div>
  );
}

export default SwapyItem;
