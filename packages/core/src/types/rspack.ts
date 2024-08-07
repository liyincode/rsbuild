import type * as Rspack from '@rspack/core';
import type RspackChain from 'rspack-chain';
import type { TransformHandler } from './plugin';

export type { Rspack, RspackChain };

declare module '@rspack/core' {
  interface Compiler {
    __rsbuildTransformer?: Record<string, TransformHandler>;
  }
}

export interface BundlerPluginInstance {
  [index: string]: any;
  apply: (compiler: any) => void;
}

export type RspackConfig = Omit<Rspack.Configuration, 'plugins'> & {
  // Use a loose type here, so that user can pass webpack plugins
  plugins?: BundlerPluginInstance[];
};

/** T[] => T */
type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never;

export type RspackRule = GetElementType<
  NonNullable<NonNullable<RspackConfig['module']>['rules']>
>;

export type RspackSourceMap = {
  version: number;
  sources: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
  sourcesContent?: string[];
  names?: string[];
};
