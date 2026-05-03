import { z } from "zod";

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .refine((value): value is PageSize => (PAGE_SIZE_OPTIONS as readonly number[]).includes(value), {
      message: `pageSize must be one of ${PAGE_SIZE_OPTIONS.join(", ")}`,
    })
    .default(DEFAULT_PAGE_SIZE),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export function toSkipTake(params: PaginationParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}
