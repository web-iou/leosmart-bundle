import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  ringing: (index: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRinging') as Spec;
