import { createPortal } from 'react-dom';
import { Timer, X, Plus, Trash2, MoveDown, MoveRight } from 'lucide-react';

/**
 * タイマー設定モーダルコンポーネント
 */
export default function TimerSettingsModal({
  isOpen,
  displayMode,
  totalCycles,
  countdownMinutes,
  pomodoroSections,
  onClose,
  onDisplayModeChange,
  onTotalCyclesChange,
  onCountdownMinutesChange,
  onSectionChange,
  onAddSection,
  onRemoveSection,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fadeIn" onClick={onClose}>
      {/* モーダルコンテンツ */}
      <div
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-lg p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">タイマー設定</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 設定内容 */}
        <div className="space-y-6">
          {/* 表示モード */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">モード選択</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => onDisplayModeChange('countup')}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  displayMode === 'countup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⏱️ カウントアップ
              </button>
              <button
                onClick={() => onDisplayModeChange('countdown')}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  displayMode === 'countdown'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⏳ カウントダウン
              </button>
              <button
                onClick={() => onDisplayModeChange('interval')}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  displayMode === 'interval'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍅 ポモドーロ
              </button>
              <button
                onClick={() => onDisplayModeChange('flowmodoro')}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  displayMode === 'flowmodoro'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌊 フローモドーロ
              </button>
            </div>

            {/* モードの説明文 */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                {displayMode === 'countup' && (
                  <>
                    タイマーは停止するまでカウントアップします。
                    <br />
                    シンプルな使い方ができ、集中時間の把握に最適です。
                    <br />
                    <br />
                    ✅時間管理/没頭重視/シンプル
                    <br />
                    ✅ノンプレッシャー
                    <br />
                    ❌時間管理が必要
                    <br />
                    ❌休憩管理がない
                  </>
                )}

                {displayMode === 'countdown' && (
                  <>
                    設定した時間からカウントダウンします。
                    <br />
                    時間内にタスクを終わらせる意識を持つことで、集中力と緊張感を高めます。
                    <br />
                    <br />
                    ✅時間管理/締切重視/シンプル
                    <br />
                    ✅短時間集中
                    <br />
                    ❌休憩管理がない
                  </>
                )}
                {displayMode === 'interval' && (
                  <>
                    事前に設定した全セクションをサイクル数分繰り返します。
                    <br />
                    25分(作業)+5分(休憩)の基本ポモドーロから、自由にカスタマイズ可能です。
                    <br />
                    <br />
                    ✅習慣化/継続重視/リズム
                    <br />
                    ✅長時間作業に最適
                    <br />
                    ❌固定化されたサイクル
                  </>
                )}
                {displayMode === 'flowmodoro' && (
                  <>
                    タイマー停止までの作業時間に応じて適切な休憩時間を計算します。
                    <br />
                    (作業時間/5 = 休憩時間)
                    <br />
                    <br />
                    ✅創造/没頭重視/フロー
                    <br />
                    ✅ポモドーロをもっと柔軟に
                    <br />
                    ❌時間管理が必要
                    <br />
                  </>
                )}
              </p>
            </div>
          </div>

          {/* カウントダウン時間設定 - カウントダウンモードのみ */}
          {displayMode === 'countdown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">作業時間</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={countdownMinutes}
                    onChange={(e) => onCountdownMinutesChange(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                  />
                  <span className="text-sm text-gray-600">分</span>
                </div>
              </div>
            </div>
          )}

          {/* サイクル数設定 - ポモドーロモードのみ */}
          {displayMode === 'interval' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700">サイクル数</label>
                  <span className="text-xs text-gray-500">全セクションを何回繰り返すか</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={totalCycles}
                    onChange={(e) => onTotalCyclesChange(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                  />
                  <span className="text-sm text-gray-600">サイクル</span>
                </div>
              </div>
            </div>
          )}

          {/* ポモドーロセクション - ポモドーロモードのみ */}
          {displayMode === 'interval' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">セクション設定</label>
                <span className="text-xs text-gray-500">順番に繰り返します</span>
              </div>

              <div className="space-y-4">
                {pomodoroSections.map((section, index) => (
                  <div key={section.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {/* セクションヘッダー */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">セクション {index + 1}</span>
                      {pomodoroSections.length > 1 && (
                        <button
                          onClick={() => onRemoveSection(section.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* 作業時間・休憩時間（同じ行） */}
                    <div className="flex items-center justify-between">
                      {/* 作業時間 */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-gray-500">🔴</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={section.workMinutes}
                          onChange={(e) => onSectionChange(section.id, 'workMinutes', e.target.value)}
                          className="flex-1 max-w-[60px] px-2 py-1.5 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                        />
                        <span className="text-xs text-gray-600">分</span>
                      </div>

                      <MoveRight className="text-gray-400 px-1" />

                      {/* 休憩時間 */}
                      <div className="flex-1 flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500">🟢</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={section.breakMinutes}
                          onChange={(e) => onSectionChange(section.id, 'breakMinutes', e.target.value)}
                          className="flex-1 max-w-[60px] px-2 py-1.5 border border-gray-300 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center"
                        />
                        <span className="text-xs text-gray-600">分</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* セクション追加ボタン */}
              <button
                onClick={onAddSection}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">セクションを追加</span>
              </button>
            </div>
          )}

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
