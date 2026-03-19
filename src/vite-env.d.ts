/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare class Stringified<T> extends String {
  private ___stringified: T;
}

interface JSON {
  stringify<T>(
    value: T,
    replacer?: (key: string, value: any) => any,
    space?: string | number
  ): string & Stringified<T>;
  parse<T>(text: Stringified<T>, reviver?: (key: any, value: any) => any): T;
  parse(text: string, reviver?: (key: any, value: any) => any): any;
}

declare type Optional<Type> = {
  [Property in keyof Type]?: Type[Property];
};

declare module "swiper";
