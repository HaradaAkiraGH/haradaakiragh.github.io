// Кодирование билда в компактную base64-ссылку и обратно
export interface SharedBuild {
  c: string;   // id персонажа
  w: number;   // индекс оружия в char.weapons
  s: number;   // индекс эхо-сета в char.echoSets
  cr: number;  // crit rate, %
  cd: number;  // crit dmg, %
  atk: number; // бонус атаки, %
}

export function encodeBuild(b: SharedBuild): string {
  const json = JSON.stringify(b);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBuild(code: string): SharedBuild | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json);
    if (typeof obj.c !== 'string') return null;
    return {
      c: obj.c,
      w: Number(obj.w) || 0,
      s: Number(obj.s) || 0,
      cr: Number(obj.cr) || 70,
      cd: Number(obj.cd) || 170,
      atk: Number(obj.atk) || 100,
    };
  } catch {
    return null;
  }
}