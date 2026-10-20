import { SITE_URL } from "@/lib/seo";

/**
 * Datos estructurados (schema.org) en una etiqueta `<script type="application/ld+json">`.
 * Solo recibe datos escritos por nosotros, nunca texto del visitante; aun así se escapa `<` para que
 * ningún valor pueda cerrar la etiqueta.
 */
export function JsonLd({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}

/** Migas de pan "Inicio › {nombre}" para las páginas internas (rutas de primer nivel). */
export function MigasJsonLd({ nombre, ruta }: { nombre: string; ruta: string }) {
  return (
    <JsonLd
      datos={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: nombre, item: `${SITE_URL}${ruta}` },
        ],
      }}
    />
  );
}
