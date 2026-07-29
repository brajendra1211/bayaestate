import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function uniqueLocalitySlug(name: string, cityId: string, ignoreId?: string) {
  const base = slugify(name) || "locality";
  let slug = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.locality.findUnique({
      where: { cityId_slug: { cityId, slug } },
    });
    if (!existing || existing.id === ignoreId) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

// Used when a lister types a locality that isn't in the picker yet — creates
// it unpublished so their listing is never blocked, while keeping it out of
// public SEO pages until an admin reviews and publishes it.
export async function findOrCreateLocality(name: string, cityId: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await prisma.locality.findFirst({ where: { cityId, name: trimmed } });
  if (existing) return existing;

  const slug = await uniqueLocalitySlug(trimmed, cityId);
  return prisma.locality.create({
    data: { name: trimmed, slug, cityId, published: false },
  });
}
