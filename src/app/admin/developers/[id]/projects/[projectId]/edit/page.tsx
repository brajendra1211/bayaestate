import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/ProjectForm";
import { SingleImageField } from "@/components/SingleImageField";
import {
  updateProject,
  deleteProject,
  createProjectFloorPlan,
  deleteProjectFloorPlan,
  moveProjectFloorPlan,
  createProjectFaq,
  deleteProjectFaq,
  moveProjectFaq,
  createProjectLandmark,
  deleteProjectLandmark,
  createProjectReraPhase,
  deleteProjectReraPhase,
} from "../../../../../actions";

type Params = Promise<{ id: string; projectId: string }>;
type SearchParams = Promise<{ saved?: string; error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  floorplan: "Enter a configuration name and area for the floor plan.",
  faq: "Enter both a question and an answer.",
  landmark: "Enter a category, name, and distance for the landmark.",
  rera: "Enter both a phase label and a RERA number.",
};

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { id, projectId } = await params;
  const { saved, error } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      images: { orderBy: { order: "asc" } },
      developer: true,
      floorPlans: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      landmarks: { orderBy: { order: "asc" } },
      reraPhases: { orderBy: { order: "asc" } },
    },
  });
  if (!project || project.developerId !== id) notFound();

  const amenityOptions = await prisma.amenity.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="px-4 py-8 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Edit project — {project.developer.name}
        </h1>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="developerId" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete project
          </button>
        </form>
      </div>

      {saved === "1" && (
        <p className="mt-4 max-w-3xl rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Saved.</p>
      )}
      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 max-w-3xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <ProjectForm
          action={updateProject}
          developerId={id}
          submitLabel="Save changes"
          amenityOptions={amenityOptions}
          defaultValues={{
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            city: project.city,
            locality: project.locality,
            address: project.address,
            priceMin: project.priceMin,
            priceMax: project.priceMax,
            possessionDate: project.possessionDate
              ? project.possessionDate.toISOString().slice(0, 10)
              : null,
            amenities: project.amenities,
            reraNumber: project.reraNumber,
            highlights: project.highlights,
            brochureUrl: project.brochureUrl,
            youtubeUrl: project.youtubeUrl,
            sitePlanUrl: project.sitePlanUrl,
            projectType: project.projectType,
            totalUnits: project.totalUnits,
            projectSizeAcres: project.projectSizeAcres,
            launchDate: project.launchDate ? project.launchDate.toISOString().slice(0, 10) : null,
            totalTowers: project.totalTowers,
            pricePerSqft: project.pricePerSqft,
            priceListUrl: project.priceListUrl,
            carParkingSpaces: project.carParkingSpaces,
            unitLiftRatio: project.unitLiftRatio,
            approvalDate: project.approvalDate ? project.approvalDate.toISOString().slice(0, 10) : null,
            constructionStatusNote: project.constructionStatusNote,
            metaTitle: project.metaTitle,
            metaDescription: project.metaDescription,
            images: project.images.map((image) => ({ url: image.url })),
          }}
        />
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Floor plans & pricing</h2>
        <p className="mt-1 text-sm text-slate-500">
          Shown as a configuration table on the project page (e.g. 2 BHK — 1,100 sqft — ₹85L).
        </p>

        <form action={createProjectFloorPlan} className="mt-4 space-y-3 rounded-xl border border-slate-100 p-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="developerId" value={id} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input
              type="text"
              name="configuration"
              required
              placeholder="e.g. 2 BHK"
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:col-span-1"
            />
            <input
              type="number"
              name="areaSqft"
              required
              min={1}
              placeholder="Area (sqft)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              name="price"
              min={0}
              placeholder="Price (INR, optional)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <SingleImageField name="imageUrl" label="Floor plan diagram (optional)" />
        </form>

        {project.floorPlans.length > 0 && (
          <ul className="mt-4 space-y-2">
            {project.floorPlans.map((plan, index) => (
              <li
                key={plan.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  {plan.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={plan.imageUrl} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{plan.configuration}</p>
                    <p className="text-xs text-slate-500">
                      {plan.areaSqft.toLocaleString("en-IN")} sqft
                      {plan.price ? ` · ₹${plan.price.toLocaleString("en-IN")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveProjectFloorPlan}>
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="developerId" value={id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={index === 0} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">↑</button>
                  </form>
                  <form action={moveProjectFloorPlan}>
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="developerId" value={id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" disabled={index === project.floorPlans.length - 1} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">↓</button>
                  </form>
                  <form action={deleteProjectFloorPlan}>
                    <input type="hidden" name="id" value={plan.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="developerId" value={id} />
                    <button type="submit" className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Nearby landmarks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Shown as a distance list under &quot;Around this project&quot;.
        </p>

        <form action={createProjectLandmark} className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="developerId" value={id} />
          <input
            type="text"
            name="category"
            required
            placeholder="e.g. Metro"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Sector 21 Station"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            name="distanceKm"
            required
            step="0.1"
            min={0}
            placeholder="Distance (km)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Add
          </button>
        </form>

        {project.landmarks.length > 0 && (
          <ul className="mt-4 space-y-2">
            {project.landmarks.map((landmark) => (
              <li key={landmark.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{landmark.category}:</span>{" "}
                  {landmark.name} — {landmark.distanceKm} km
                </span>
                <form action={deleteProjectLandmark}>
                  <input type="hidden" name="id" value={landmark.id} />
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="developerId" value={id} />
                  <button type="submit" className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">RERA phases</h2>
        <p className="mt-1 text-sm text-slate-500">
          For projects registered in multiple phases. Leave empty to just use the single RERA number above.
        </p>

        <form action={createProjectReraPhase} className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-3">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="developerId" value={id} />
          <input
            type="text"
            name="label"
            required
            placeholder="e.g. Phase 1"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            name="reraNumber"
            required
            placeholder="RERA number"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Add
          </button>
        </form>

        {project.reraPhases.length > 0 && (
          <ul className="mt-4 space-y-2">
            {project.reraPhases.map((phase) => (
              <li key={phase.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{phase.label}:</span> {phase.reraNumber}
                </span>
                <form action={deleteProjectReraPhase}>
                  <input type="hidden" name="id" value={phase.id} />
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="developerId" value={id} />
                  <button type="submit" className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">FAQs</h2>
        <p className="mt-1 text-sm text-slate-500">Shown as an expandable FAQ section on the project page.</p>

        <form action={createProjectFaq} className="mt-4 space-y-2 rounded-xl border border-slate-100 p-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="developerId" value={id} />
          <input
            type="text"
            name="question"
            required
            placeholder="Question"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <textarea
            name="answer"
            required
            rows={2}
            placeholder="Answer"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Add FAQ
          </button>
        </form>

        {project.faqs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {project.faqs.map((faq, index) => (
              <li key={faq.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{faq.question}</p>
                    <p className="mt-1 text-slate-600">{faq.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <form action={moveProjectFaq}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="developerId" value={id} />
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" disabled={index === 0} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">↑</button>
                    </form>
                    <form action={moveProjectFaq}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="developerId" value={id} />
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" disabled={index === project.faqs.length - 1} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40">↓</button>
                    </form>
                    <form action={deleteProjectFaq}>
                      <input type="hidden" name="id" value={faq.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="developerId" value={id} />
                      <button type="submit" className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
