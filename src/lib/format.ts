const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number, listingType: "SALE" | "RENT") {
  const formatted = inrFormatter.format(price);
  return listingType === "RENT" ? `${formatted}/mo` : formatted;
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  VILLA: "Villa",
  INDEPENDENT_HOUSE: "Independent House",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
  OFFICE: "Office",
};

export const IMAGE_CATEGORY_LABELS: Record<string, string> = {
  EXTERIOR: "Exterior",
  LIVING_ROOM: "Living Room",
  BEDROOM: "Bedroom",
  KITCHEN: "Kitchen",
  BATHROOM: "Bathroom",
  DINING: "Dining",
  BALCONY: "Balcony",
  FLOOR_PLAN: "Floor Plan",
  OTHER: "Other",
};

export const IMAGE_CATEGORIES = Object.keys(IMAGE_CATEGORY_LABELS) as Array<
  keyof typeof IMAGE_CATEGORY_LABELS
>;
