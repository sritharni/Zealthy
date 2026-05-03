import { db } from "@/lib/db";

export const medicationCatalogService = {
  async list() {
    return db.medicationCatalog.findMany({
      orderBy: [{ medicationName: "asc" }, { dosage: "asc" }],
      select: {
        id: true,
        medicationName: true,
        dosage: true,
      },
    });
  },
};
