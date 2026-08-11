import Image from "next/image";

export function Cobertura() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 lg:px-16">
      <div className="flex items-center gap-4">
        <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
          Tu Inbox más cercana
        </h2>
        <Image
          src="/icons/globe-location-pin.svg"
          alt=""
          width={48}
          height={48}
          className="hidden sm:block"
        />
      </div>
      <p className="max-w-2xl text-base text-black">
        Explora nuestras ubicaciones y elige la que mejor se adapte a tus
        necesidades de envío o recolección.
      </p>

      <div className="relative flex h-[480px] w-full items-start justify-center overflow-hidden rounded-xl sm:h-[629px]">
        <Image
          src="/images/mapa.png"
          alt="Mapa de cobertura Inbox"
          fill
          className="object-cover"
        />

        <div className="absolute left-1/2 top-9 flex w-full max-w-[560px] -translate-x-1/2 flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-center">
          <EstadoCiudadDropdown label="Estado" />
          <EstadoCiudadDropdown label="Ciudad" />
        </div>

        <div className="absolute right-6 top-9 hidden h-[53px] w-[280px] items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card sm:flex">
          <span className="font-display text-base text-secondary-dark">
            Buscar
          </span>
          <Image src="/icons/search2.svg" alt="" width={20} height={20} />
        </div>

        <div className="absolute bottom-6 left-6 hidden w-[205px] flex-col items-center gap-4 rounded-md bg-white px-4 py-4 shadow-card sm:flex">
          <p className="text-center text-xs font-semibold uppercase text-black">
            Indicadores
          </p>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/location-pin.png" alt="" width={22} height={28} />
              <span className="text-xs font-semibold text-black">Sucursal</span>
            </div>
            <CheckSwatch />
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icons/flag6.svg" alt="" width={22} height={22} />
              <span className="text-xs font-semibold text-black">
                Centro de distribución
              </span>
            </div>
            <CheckSwatch />
          </div>
        </div>
      </div>
    </section>
  );
}

function EstadoCiudadDropdown({ label }: { label: string }) {
  return (
    <div className="flex h-[53px] w-full items-center justify-between rounded-md border border-secondary-dark/50 bg-white px-6 shadow-card sm:w-[259px]">
      <span className="text-xs font-medium text-secondary-dark">{label}</span>
      <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 fill-secondary-dark" aria-hidden>
        <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      </svg>
    </div>
  );
}

function CheckSwatch() {
  return (
    <span className="flex h-[25px] w-[25px] items-center justify-center rounded-[3px] border-2 border-primary bg-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary" aria-hidden>
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  );
}

export function CoberturaCTA() {
  return (
    <section className="mx-6 flex flex-col items-center gap-10 rounded-xl bg-neutral-bg px-6 py-16 lg:mx-16">
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-3xl font-bold text-black sm:text-[50px]">
            Tu inbox más cercana
          </h2>
          <Image src="/icons/globe-location-pin.svg" alt="" width={40} height={40} className="hidden sm:block" />
        </div>
        <p className="text-base text-black">
          Explora nuestras ubicaciones y elige la que mejor se adapte a tus
          necesidades de envío o recolección.
        </p>
      </div>

      <div className="flex flex-col gap-14">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-xl font-medium text-black">
            Seleccione un estado del país
          </p>
          <EstadoCiudadDropdown label="Estado" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-xl font-medium text-black">
            Seleccione una ciudad del estado
          </p>
          <EstadoCiudadDropdown label="Ciudad" />
        </div>
      </div>
    </section>
  );
}
