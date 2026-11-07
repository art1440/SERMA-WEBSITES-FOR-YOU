import type { NicheId } from "@/data/niches";
import { barbershopViews } from "./barbershop";
import { beautyViews } from "./beauty";
import { contractorViews } from "./contractor";
import { restaurantViews } from "./restaurant";
import { salonViews } from "./salon";
import { serviceViews } from "./service";
import type { NicheViews } from "./types";

export type * from "./types";

/** Fictional sample data for the dashboard's inner sections, per industry. */
export const NICHE_VIEWS: Record<NicheId, NicheViews> = {
  barbershop: barbershopViews,
  salon: salonViews,
  beauty: beautyViews,
  restaurant: restaurantViews,
  contractor: contractorViews,
  service: serviceViews,
};
