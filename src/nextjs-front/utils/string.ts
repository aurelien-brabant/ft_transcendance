export const toAscii = (src: string) =>
    src.normalize('NFD').replace(/[\u0300-\u036f]/g, '');