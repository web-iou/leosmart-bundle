import React from 'react';
import RolePageTemplate from '../common/RolePageTemplate';

interface InstallerMainScreenProps {
  navigation: any;
}

const InstallerMainScreen: React.FC<InstallerMainScreenProps> = ({ navigation }) => {
  return (
    <RolePageTemplate
      navigation={navigation}
      title="安装商/运营商主页"
      description="安装商或运营商角色专用页面"
      alternateRoleName="业主"
      alternateRouteName="OwnerMain"
    />
  );
};

export default InstallerMainScreen; 