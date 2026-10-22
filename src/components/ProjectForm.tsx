"use client";

import { useState, type ChangeEvent } from "react";
import { parseAmenitiesString } from "@/lib/amenities";
import { SingleImageField } from "@/components/SingleImageField";

type ImageItem = { url: string };

type ProjectFormValues = {
  id?: string;
  developerId: string;
  name: string;
  description: string;
  status: "UPCOMING" | "UNDER_CONSTRUCTION" | "READY_TO_MOVE";
  city: string;
  locality: string | null;
  address: string | null;
  priceMin: number | null;
  priceMax: number | null;
  possessionDate: string | null;
  amenities: string | null;
  reraNumber: string | null;
  highlights: string | null;
  brochureUrl: string | null;
  youtubeUrl: string | null;
  sitePlanUrl: string | null;
  projectType: string | null;
  totalUnits: number | null;
  projectSizeAcres: number | null;
  launchDate: string | null;
  totalTowers: number | null;
  pricePerSqft: number | null;
  priceListUrl: string | null;
  carParkingSpaces: number | null;
  unitLiftRatio: string | null;
  approvalDate: string | null;
  constructionStatusNote: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  images: ImageItem[];
};

export function ProjectForm({
  action,
  developerId,
  defaultValues,
  submitLabel,
  amenityOptions,
}: {
  action: (formData: FormData) => void | Promise<void>;
  developerId: string;
  defaultValues?: Partial<ProjectFormValues>;
  submitLabel: string;
  amenityOptions: { id: string; name: string }[];
}) {
  const [images, setImages] = useState<ImageItem[]>(defaultValues?.images ?? []);
  const selectedAmenities = parseAmenitiesString(defaultValues?.amenities ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(defaultValues?.brochureUrl ?? null);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [brochureError, setBrochureError] = useState<string | null>(null);
  const [priceListUrl, setPriceListUrl] = useState<string | null>(defaultValues?.priceListUrl ?? null);
  const [priceListUploading, setPriceListUploading] = useState(false);
  const [priceListError, setPriceListError] = useState<string | null>(null);

  async function handleDocumentUpload(
    event: ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
    setBusy: (busy: boolean) => void,
    setErr: (err: string | null) => void
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);

    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/upload/document", { method: "POST", body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      const data = await response.json();
      setUrl(data.url);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Upload failed");
    }

    setBusy(false);
    event.target.value = "";
  }

  const handleBrochureFile = (event: ChangeEvent<HTMLInputElement>) =>
    handleDocumentUpload(event, setBrochureUrl, setBrochureUploading, setBrochureError);
  const handlePriceListFile = (event: ChangeEvent<HTMLInputElement>) =>
    handleDocumentUpload(event, setPriceListUrl, setPriceListUploading, setPriceListError);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }
        const data = await response.json();
        setImages((prev) => [...prev, { url: data.url }]);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed");
      }
    }

    setUploading(false);
    event.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((image) => image.url !== url));
  }

  return (
    <form action={action} className="space-y-6">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="developerId" value={developerId} />
      {images.map((image) => (
        <input key={image.url} type="hidden" name="images" value={image.url} />
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Project name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={defaultValues?.name}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "UPCOMING"}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Possession date</label>
          <input
            type="date"
            name="possessionDate"
            defaultValue={defaultValues?.possessionDate ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">City</label>
          <input
            type="text"
            name="city"
            required
            defaultValue={defaultValues?.city}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Locality</label>
          <input
            type="text"
            name="locality"
            defaultValue={defaultValues?.locality ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Address</label>
          <input
            type="text"
            name="address"
            defaultValue={defaultValues?.address ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Price from (INR)</label>
          <input
            type="number"
            name="priceMin"
            min={0}
            defaultValue={defaultValues?.priceMin ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Price to (INR)</label>
          <input
            type="number"
            name="priceMax"
            min={0}
            defaultValue={defaultValues?.priceMax ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">RERA registration number</label>
          <input
            type="text"
            name="reraNumber"
            placeholder="e.g. PRM/KA/RERA/1251/…"
            defaultValue={defaultValues?.reraNumber ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">
            Leave blank if this project isn&apos;t RERA-registered yet.
          </p>
        </div>

        <div className="sm:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Key facts</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Optional — shown as a details grid and stats row on the project page. Leave any blank to hide it.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Project type</label>
          <input
            type="text"
            name="projectType"
            placeholder="e.g. Residential"
            defaultValue={defaultValues?.projectType ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Total units</label>
          <input
            type="number"
            name="totalUnits"
            min={0}
            defaultValue={defaultValues?.totalUnits ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Project size (acres)</label>
          <input
            type="number"
            name="projectSizeAcres"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.projectSizeAcres ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Total towers</label>
          <input
            type="number"
            name="totalTowers"
            min={0}
            defaultValue={defaultValues?.totalTowers ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Launch date</label>
          <input
            type="date"
            name="launchDate"
            defaultValue={defaultValues?.launchDate ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Approval date</label>
          <input
            type="date"
            name="approvalDate"
            defaultValue={defaultValues?.approvalDate ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Base price (₹/sqft)</label>
          <input
            type="number"
            name="pricePerSqft"
            min={0}
            defaultValue={defaultValues?.pricePerSqft ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Car parking spaces</label>
          <input
            type="number"
            name="carParkingSpaces"
            min={0}
            defaultValue={defaultValues?.carParkingSpaces ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Unit : lift ratio</label>
          <input
            type="text"
            name="unitLiftRatio"
            placeholder="e.g. 1:4"
            defaultValue={defaultValues?.unitLiftRatio ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Construction status notes</label>
          <p className="mt-1 text-xs text-slate-500">
            Optional — a short paragraph on phase/construction progress, shown under &quot;Possession &amp; construction status&quot;.
          </p>
          <textarea
            name="constructionStatusNote"
            rows={3}
            defaultValue={defaultValues?.constructionStatusNote ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={defaultValues?.description}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Highlights</label>
          <p className="mt-1 text-xs text-slate-500">One per line — shown as a bulleted list on the project page.</p>
          <textarea
            name="highlights"
            rows={4}
            defaultValue={defaultValues?.highlights ?? undefined}
            placeholder={"Located 5 mins from the highway\nOnly 4 towers, low density\nEarthquake-resistant structure"}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Amenities</label>
          {amenityOptions.length === 0 ? (
            <p className="mt-1 text-xs text-slate-400">
              No amenities set up yet — add some from the admin Amenities page.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {amenityOptions.map((amenity) => (
                <label key={amenity.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity.name}
                    defaultChecked={selectedAmenities.some(
                      (name) => name.toLowerCase() === amenity.name.toLowerCase()
                    )}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {amenity.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">SEO meta title</label>
          <input
            type="text"
            name="metaTitle"
            defaultValue={defaultValues?.metaTitle ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">SEO meta description</label>
          <input
            type="text"
            name="metaDescription"
            defaultValue={defaultValues?.metaDescription ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Brochure (PDF)</label>
        <p className="mt-1 text-xs text-slate-500">
          Upload a PDF brochure — visitors will see a download button on the project page.
        </p>
        <input type="hidden" name="brochureUrl" value={brochureUrl ?? ""} />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleBrochureFile}
            disabled={brochureUploading}
            className="block text-sm text-slate-500 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition hover:file:bg-blue-700 disabled:file:cursor-not-allowed disabled:file:opacity-60"
          />
          {brochureUploading && <p className="text-xs text-slate-500">Uploading…</p>}
        </div>
        {brochureError && <p className="mt-1 text-xs text-red-600">{brochureError}</p>}
        {brochureUrl && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View uploaded brochure
            </a>
            <button type="button" onClick={() => setBrochureUrl(null)} className="text-xs font-medium text-red-600 hover:underline">
              Remove
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Price list (PDF)</label>
        <p className="mt-1 text-xs text-slate-500">
          Optional — a separate downloadable price list, distinct from the brochure.
        </p>
        <input type="hidden" name="priceListUrl" value={priceListUrl ?? ""} />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePriceListFile}
            disabled={priceListUploading}
            className="block text-sm text-slate-500 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition hover:file:bg-blue-700 disabled:file:cursor-not-allowed disabled:file:opacity-60"
          />
          {priceListUploading && <p className="text-xs text-slate-500">Uploading…</p>}
        </div>
        {priceListError && <p className="mt-1 text-xs text-red-600">{priceListError}</p>}
        {priceListUrl && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <a href={priceListUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View uploaded price list
            </a>
            <button type="button" onClick={() => setPriceListUrl(null)} className="text-xs font-medium text-red-600 hover:underline">
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">YouTube video link</label>
          <input
            type="url"
            name="youtubeUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={defaultValues?.youtubeUrl ?? undefined}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">Optional — shown as an embedded video on the project page.</p>
        </div>
        <SingleImageField name="sitePlanUrl" label="Site plan (optional)" defaultValue={defaultValues?.sitePlanUrl} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Photos</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFiles}
          disabled={uploading}
          className="mt-1 block text-sm"
        />
        {uploading && <p className="mt-1 text-xs text-slate-500">Uploading…</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((image) => (
              <div key={image.url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image.url)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
