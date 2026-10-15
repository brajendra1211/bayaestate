"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

export async function submitProjectEnquiry(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!projectId || !slug || !name || !phone) {
    redirect(`/projects/${slug}?enquiry=error`);
  }

  const session = await auth();
  const buyerId = session?.user.role === "BUYER" ? session.user.id : null;

  const enquiry = await prisma.enquiry.create({
    data: {
      projectId,
      buyerId,
      name,
      phone,
      email: email || null,
      message: message || null,
    },
    include: {
      project: { select: { name: true, developer: { select: { contactPhone: true, contactEmail: true } } } },
    },
  });

  if (enquiry.project) {
    await notifyUser(
      { phone: enquiry.project.developer.contactPhone, email: enquiry.project.developer.contactEmail },
      `New enquiry on "${enquiry.project.name}" from ${name} (${phone}).${message ? ` Message: ${message}` : ""}`,
      "New enquiry on your project"
    );
  }

  redirect(`/projects/${slug}?enquiry=sent`);
}
