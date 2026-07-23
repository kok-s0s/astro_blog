import { defineCollection, z } from 'astro:content'

const roadmap = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
})

const enPosts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

export const collections = { roadmap, 'en-roadmap': roadmap, 'en-posts': enPosts }
