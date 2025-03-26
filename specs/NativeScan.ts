import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  scanBarcodeFromImage: (image: string) => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeScan') as Spec;
