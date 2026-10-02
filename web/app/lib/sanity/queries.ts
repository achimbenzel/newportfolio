/**
 * GROQ-Abfragen. Lokalisierung passiert direkt in der Abfrage:
 * coalesce(feld[$locale], feld.de) → gewünschte Sprache, sonst Deutsch.
 */

const imageFields = /* groq */ `
  asset,
  crop,
  hotspot,
  "alt": coalesce(alt[$locale], alt.de),
  "dimensions": asset->metadata.dimensions{ width, height }
`;

const projectSummaryFields = /* groq */ `
  "slug": slug.current,
  "title": coalesce(title[$locale], title.de),
  "category": coalesce(category[$locale], category.de),
  year,
  color,
  cover{ ${imageFields} }
`;

export const projectsQuery = /* groq */ `
  *[_type == "project" && defined(slug.current)]
  | order(coalesce(sortOrder, 999) asc, year desc) { ${projectSummaryFields} }
`;

export const featuredProjectsQuery = /* groq */ `
  *[_type == "project" && defined(slug.current) && featured == true]
  | order(coalesce(sortOrder, 999) asc, year desc)[0...$limit] { ${projectSummaryFields} }
`;

export const projectSlugsQuery = /* groq */ `
  *[_type == "project" && defined(slug.current)].slug.current
`;

export const projectQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    ${projectSummaryFields},
    client,
    "scope": coalesce(scope[$locale], scope.de),
    "industry": coalesce(industry[$locale], industry.de),
    software,
    "description": coalesce(description[$locale], description.de),
    "seo": { "title": coalesce(seo.title[$locale], seo.title.de), "description": coalesce(seo.description[$locale], seo.description.de) },
    content[]{
      _type,
      _key,
      _type == "imageBlock" => { image{ ${imageFields} }, "caption": coalesce(caption[$locale], caption.de) },
      _type == "imageGrid" => { images[]{ ${imageFields} } },
      _type == "textBlock" => { "heading": coalesce(heading[$locale], heading.de), "body": coalesce(body[$locale], body.de), align },
      _type == "videoEmbed" => { provider, videoId, "title": coalesce(title[$locale], title.de) }
    }
  }
`;

export const serviceQuery = /* groq */ `
  *[_type == "service" && page == $slug][0]{
    "title": coalesce(title[$locale], title.de),
    "intro": coalesce(intro[$locale], intro.de),
    "process": process[]{ "title": coalesce(title[$locale], title.de), "text": coalesce(text[$locale], text.de) }
  }
`;
