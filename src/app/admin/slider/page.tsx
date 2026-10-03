import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SingleImageField } from "@/components/SingleImageField";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide, moveHeroSlide } from "../actions";

type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function AdminSliderPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { saved, error } = await searchParams;
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home slider</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Manage the rotating banner shown at the top of the homepage. Add a few slides for a
          professional, auto-playing carousel — leave it empty to show the regular hero instead.
        </p>
      </div>

      {saved === "1" && (
        <p className="mt-4 max-w-2xl rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
      )}
      {error === "image" && (
        <p className="mt-4 max-w-2xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Upload an image for the slide.
        </p>
      )}

      <div className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Add slide</h2>
        <form action={createHeroSlide} className="mt-3 space-y-3">
          <SingleImageField name="imageUrl" label="Slide image" />
          <div>
            <label className="text-sm font-medium text-slate-700">Title (optional)</label>
            <input
              type="text"
              name="title"
              placeholder="Find your dream home today"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Subtitle (optional)</label>
            <input
              type="text"
              name="subtitle"
              placeholder="Verified listings across the city"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Button text (optional)</label>
              <input
                type="text"
                name="ctaText"
                placeholder="Explore now"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Button link (optional)</label>
              <input
                type="text"
                name="ctaLink"
                placeholder="/properties"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Add slide
          </button>
        </form>
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold text-slate-900">All slides ({slides.length})</h2>

        {slides.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No slides yet — add one above to turn on the homepage slider.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {slides.map((slide, index) => (
              <li key={slide.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 gap-3 sm:flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="h-20 w-32 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="flex flex-row gap-1 sm:flex-col">
                    <form action={moveHeroSlide}>
                      <input type="hidden" name="id" value={slide.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={index === 0}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveHeroSlide}>
                      <input type="hidden" name="id" value={slide.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={index === slides.length - 1}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        ↓
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateHeroSlide} className="flex-1 space-y-2">
                  <input type="hidden" name="id" value={slide.id} />
                  <input type="hidden" name="imageUrl" value={slide.imageUrl} />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        name="title"
                        defaultValue={slide.title ?? undefined}
                        placeholder="Title"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        name="subtitle"
                        defaultValue={slide.subtitle ?? undefined}
                        placeholder="Subtitle"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        name="ctaText"
                        defaultValue={slide.ctaText ?? undefined}
                        placeholder="Button text"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        name="ctaLink"
                        defaultValue={slide.ctaLink ?? undefined}
                        placeholder="Button link"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" name="active" defaultChecked={slide.active} className="h-4 w-4 rounded border-slate-300" />
                        Active
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Save
                      </button>
                    </div>
                </form>
                <form action={deleteHeroSlide} className="shrink-0 self-start">
                  <input type="hidden" name="id" value={slide.id} />
                  <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
