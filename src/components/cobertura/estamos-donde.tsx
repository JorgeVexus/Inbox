import Image from "next/image";

export function EstamosDonde() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 bg-neutral-bg px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-16">
      <div className="flex w-full max-w-[688px] flex-col gap-10">
        <div className="flex flex-col gap-6 text-black">
          <h2 className="font-display text-3xl font-bold sm:text-[50px]">
            Estamos donde tú estás
          </h2>
          <p className="text-sm">
            Contamos con más de 20 sucursales y una amplia red operativa que
            nos permite tener presencia en los 32 estados del país. Ya sea en
            ciudad o zonas de difícil acceso, tu envío llega seguro y a
            tiempo gracias a nuestra cobertura nacional confiable.
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex h-[201px] w-full max-w-[332px] flex-col items-center justify-center gap-4 rounded-md bg-white px-5 py-4 shadow-card">
            <div className="flex w-full items-center justify-between gap-4">
              <p className="font-display text-[28px] font-bold text-black">
                +20 sucursales
              </p>
              <Image src="/icons/store.svg" alt="" width={50} height={50} />
            </div>
            <p className="w-full text-xs font-medium text-black">
              Operamos desde puntos clave del país para optimizar tus envíos.
            </p>
          </div>

          <div className="flex h-[201px] w-full max-w-[332px] flex-col items-center justify-center gap-4 rounded-md bg-white px-5 py-4 shadow-card">
            <div className="flex w-full items-center justify-between gap-4">
              <p className="font-display text-[28px] font-bold text-black">
                En todo México
              </p>
              <Image
                src="/icons/south-america.svg"
                alt=""
                width={50}
                height={50}
              />
            </div>
            <p className="w-full text-xs font-medium text-black">
              Tu paquete llega a cualquier rincón de México, sin importar la
              distancia.
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-[300px] w-full max-w-[600px] shrink-0 lg:h-[420px]">
        <Image
          src="/images/cobertura-mapa-mexico.png"
          alt="Mapa de cobertura de Inbox en México"
          fill
          className="object-contain"
        />
      </div>
    </section>
  );
}
