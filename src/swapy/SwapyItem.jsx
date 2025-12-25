function SwapyItem({ slotId, itemId, children }) {
  return (
    <div data-swapy-slot={slotId} className="w-full">
      <div
        data-swapy-item={itemId}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center h-full"
      >
        {children}
      </div>
    </div>
  );
}

export default SwapyItem;
