# Hallmark scan notes

- `apps/web/app/(public)/claimables/[slug]/page.tsx`: sloplint cannot resolve the `DossierSectionHeading` component. Each referenced ID is emitted on a real `<h2>` within its labelled section. This is an analyzer limitation; the accessible heading relationship is present in rendered markup.
