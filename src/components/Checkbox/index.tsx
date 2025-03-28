import {Pressable, PressableProps} from 'react-native';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
export default ({value, style, ...rest}: {value: boolean} & PressableProps) => {
  const paperTheme = useTheme();
  return (
    <Pressable
      className=" size-6 justify-center items-center border-[#d9d9d9] rounded-full"
      style={{
        backgroundColor: value ? paperTheme.colors.primary : 'transparent',
        borderWidth: value ? 0 : 1,
      }}
      {...rest}>
      {value && <Icon name="check" color={'white'} size={14}></Icon>}
    </Pressable>
  );
};
