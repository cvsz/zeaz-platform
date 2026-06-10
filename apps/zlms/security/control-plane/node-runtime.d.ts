declare module 'node:*' {
  export const mkdir: any;
  export const open: any;
  export const readFile: any;
  export const readdir: any;
  export const rename: any;
  export const rm: any;
  export const writeFile: any;
  export const basename: any;
  export const dirname: any;
  export const join: any;
  export const createHash: any;
}

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  pid: number;
  exitCode?: number;
};

declare const console: {
  error: (...args: unknown[]) => void;
};
