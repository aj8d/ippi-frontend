import DocsHeader from "../components/docsHeader";
import DocsFooter from "../components/docsFooter";

export default function Introduction() {
  return (
    <>
      {/* navigation */}
      <DocsHeader />

      {/* 背景固定 */}
      <div class="fixed inset-0 -z-10 overflow-hidden">
        <div class="absolute inset-0 bg-cyan-100 opacity-50"></div>
      </div>

      {/* main要素 */}
      <main>
        <div class="relative isolate px-6 lg:px-8">
          <div class="mx-auto max-w-2xl py-40">
            <div class="text-center">
              <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Lorem ipsum dolor sit amet</h1>
              <p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas mollitia velit optio esse vel minus ut, soluta recusandae. Totam optio harum nihil accusantium ipsum quaerat id inventore
                placeat cum consectetur? Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos officia ipsa doloribus totam, quisquam ipsam sunt! Cumque omnis iste quod, accusantium a eius
                maiores ipsam corrupti. Dolor assumenda quos quod?
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* footer */}
      <DocsFooter />
    </>
  );
}
