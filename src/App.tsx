import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigation';
// ... existing imports ...

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      {/* ... existing navigation content ... */}
    </NavigationContainer>
  );
} 