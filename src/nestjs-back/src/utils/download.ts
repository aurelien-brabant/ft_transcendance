import { writeFileSync } from "fs";
import fetch, { RequestInit } from 'node-fetch';
import { join } from 'path';

export const downloadResource = async (resourceURI: string, output: string, initReq?: RequestInit) => {
  const res = await fetch(resourceURI, {
    ...(initReq ? initReq : {})
  });
  const abuf = await res.buffer();

  writeFileSync(output, abuf);
}
