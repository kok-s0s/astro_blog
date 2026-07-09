import { defineCollection, z } from 'astro:content'

const roadmap = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
})

export const collections = { roadmap }
