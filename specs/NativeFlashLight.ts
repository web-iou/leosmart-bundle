import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  open: () => void;
  close: () => void;
  notice: () => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeFlashLight',
) as Spec;
