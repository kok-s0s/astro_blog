const tagMap: Record<string, { label: string; slug: string }> = {
  上位机: { label: 'Host Computer', slug: 'host-computer' },
}

export function getEnTagLabel(tag: string) {
  return tagMap[tag]?.label ?? tag
}

export function getEnTagSlug(tag: string) {
  return tagMap[tag]?.slug ?? tag
}

export function getSourceTagFromEnSlug(slug: string) {
  return Object.entries(tagMap).find(([, value]) => value.slug === slug)?.[0] ?? slug
}
