import { z } from 'zod'

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().positive('Error.PageMustBePositive').default(1),
  limit: z.coerce
    .number()
    .nonnegative('Error.LimitMustBeNonNegative')
    .max(100, 'Error.LimitMustBeLessThan100')
    .default(10)
})

export const PaginationResSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalRows: z.number(),
  totalPages: z.number()
})

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>
export type PaginationResType = z.infer<typeof PaginationResSchema>
