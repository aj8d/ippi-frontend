function SwapyItem({ slotId, itemId, children, scrollable = false }) {
  return (
    <div data-swapy-slot={slotId} className="w-full h-96">
      <div
        data-swapy-item={itemId}
        className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-grab active:cursor-grabbing flex flex-col h-full ${
          scrollable ? 'overflow-hidden' : 'items-center justify-center'
        }`}
      >
        {scrollable ? <div className="flex-1 overflow-y-auto pr-2">{children}</div> : children}
      </div>
    </div>
  );
}

export default SwapyItem;
