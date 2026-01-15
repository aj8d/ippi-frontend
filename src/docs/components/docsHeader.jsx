import "@tailwindplus/elements";
import { Hourglass, UserPlus, FileChartLine, ChevronDown, Earth } from "lucide-react";

export default function DocsHeader() {
  return (
    <>
      <header class="bg-white">
        <nav aria-label="Global" class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          {/* logo */}
          <div class="flex lg:flex-1">
            <a href="/docs" class="-m-1.5 p-1.5">
              <span class="sr-only">ippi</span>
              <img src="../../../alarm-clock-microsoft.webp" alt="" class="h-8 w-auto" />
            </a>
          </div>
          <div class="flex lg:hidden">
            <button type="button" command="show-modal" commandfor="mobile-menu" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
              <span class="sr-only">Open main menu</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          {/* nav main要素 */}
          <el-popover-group class="hidden lg:flex lg:gap-x-12">
            <div class="relative">
              <button popovertarget="desktop-menu-product" class="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
                クイックスタート
                <ChevronDown class="size-4 text-gray-400" />
              </button>

              {/* クイックスタート flyout menu */}
              <el-popover
                id="desktop-menu-product"
                anchor="bottom"
                popover
                class="w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg outline-1 outline-gray-900/5 transition transition-discrete [--anchor-gap:--spacing(3)] backdrop:bg-transparent open:block data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
              >
                <div class="p-4">
                  <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Hourglass class="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div class="flex-auto">
                      <a href="/docs/quickstart" class="block font-semibold text-gray-900">
                        作業に集中したい
                        <span class="absolute inset-0"></span>
                      </a>
                      <p class="mt-1 text-gray-600">ippiがあなた好みの作業ツールになります。</p>
                    </div>
                  </div>
                  <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <FileChartLine class="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div class="flex-auto">
                      <a href="#" class="block font-semibold text-gray-900">
                        作業を可視化して共有したい
                        <span class="absolute inset-0"></span>
                      </a>
                      <p class="mt-1 text-gray-600">あなたの努力をフォロワーに見える形に。</p>
                    </div>
                  </div>
                  <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <UserPlus class="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div class="flex-auto">
                      <a href="#" class="block font-semibold text-gray-900">
                        プロフィールを充実させたい
                        <span class="absolute inset-0"></span>
                      </a>
                      <p class="mt-1 text-gray-600">上手く魅せるためのコツを紹介。</p>
                    </div>
                  </div>
                  <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div class="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Earth class="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div class="flex-auto">
                      <a href="#" class="block font-semibold text-gray-900">
                        他ユーザーとつながる
                        <span class="absolute inset-0"></span>
                      </a>
                      <p class="mt-1 text-gray-600">ippiのコミュニティについて知りましょう。</p>
                    </div>
                  </div>
                </div>
              </el-popover>
            </div>

            <a href="/docs/focus" class="text-sm/6 font-semibold text-gray-900">
              作業機能
            </a>
            <a href="/docs/profile" class="text-sm/6 font-semibold text-gray-900">
              プロフ機能
            </a>
            <a href="/docs/faq" class="text-sm/6 font-semibold text-gray-900">
              FAQ
            </a>
          </el-popover-group>
          <div class="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="/login" class="text-sm/6 font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 px-4 py-2">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <el-dialog>
          <dialog id="mobile-menu" class="backdrop:bg-transparent lg:hidden">
            <div tabindex="0" class="fixed inset-0 focus:outline-none">
              <el-dialog-panel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div class="flex items-center justify-between">
                  <a href="#" class="-m-1.5 p-1.5">
                    <span class="sr-only">ippi</span>
                    <img src="../../../alarm-clock-microsoft.webp" alt="" class="h-8 w-auto" />
                  </a>
                  <button type="button" command="close" commandfor="mobile-menu" class="-m-2.5 rounded-md p-2.5 text-gray-700">
                    <span class="sr-only">Close menu</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
                      <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
                <div class="mt-6 flow-root">
                  <div class="-my-6 divide-y divide-gray-500/10">
                    <div class="space-y-2 py-6">
                      <div class="-mx-3">
                        <button
                          type="button"
                          command="--toggle"
                          commandfor="products"
                          class="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          クイックスタート
                          <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="size-5 flex-none in-aria-expanded:rotate-180">
                            <path
                              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                              clip-rule="evenodd"
                              fill-rule="evenodd"
                            />
                          </svg>
                        </button>
                        <el-disclosure id="products" hidden class="mt-2 block space-y-2">
                          <a href="#" class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">
                            Analytics
                          </a>
                          <a href="#" class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">
                            Engagement
                          </a>
                          <a href="#" class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">
                            Security
                          </a>
                          <a href="#" class="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">
                            Integrations
                          </a>
                        </el-disclosure>
                      </div>
                      <a href="/docs/focus" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                        作業機能
                      </a>
                      <a href="/docs/profile" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                        プロフ機能
                      </a>
                      <a href="/docs/faq" class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                        FAQ
                      </a>
                    </div>
                    <div class="py-6">
                      <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                        Log in
                      </a>
                    </div>
                  </div>
                </div>
              </el-dialog-panel>
            </div>
          </dialog>
        </el-dialog>
      </header>
    </>
  );
}
