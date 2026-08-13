export type DatosFacturacion = {
  rfc: string;
  regimenFiscal: string;
  cp: string;
  estado: string;
  ciudad: string;
  colonia: string;
  coloniaEspecificada: string;
  direccion: string;
  telefono: string;
  correo: string;
};

export function datosFacturacionVacios(): DatosFacturacion {
  return {
    rfc: "",
    regimenFiscal: "",
    cp: "",
    estado: "",
    ciudad: "",
    colonia: "",
    coloniaEspecificada: "",
    direccion: "",
    telefono: "",
    correo: "",
  };
}
