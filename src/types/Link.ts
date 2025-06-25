export interface Linker {
  linker: LinkerMeta; // serde(rename = "linker")
  langs: Record<string, Lang>;
  references: Record<string, Reference>;
  weapons: Record<string, Weapon>;
}

export interface LinkerMeta {
  version: string;
  name: string;
  root: string;
  categories: string[];
  references_categories: string[]; // serde(rename)
}

export interface Lang {
  home: string;
  bin: string;
  opts?: string[]; // #[serde(default)] -> 可选字段
}

export interface Reference {
  category: string;
  link: string;
}

export interface Weapon {
  home: string;
  lang: string;
  lang_opt?: string[]; // #[serde(default)] -> 可选
  file: string;
  opts?: string[]; // #[serde(default)] -> 可选
  category: string;
  src?: string; // #[serde(default)] -> 可选
}
