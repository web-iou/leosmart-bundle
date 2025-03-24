import {useLayoutEffect} from 'react';
import {StatusBar} from 'react-native';

export const useStatusBarHidden = () => {
  useLayoutEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);
};
