<!--
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-03-31 09:04:02
 * @LastEditors: wangjunwj wangjunwj@dinglicom.com
 * @LastEditTime: 2025-03-31 13:20:45
 * @FilePath: /leosmart/rules.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
1.所有页面必须适配主题。
2.页面必须在相应的文件下。
    pages下
        Login 登录页面
        InstallerMain 安装商角色的所有页面
        OwnerMain 业主的所有页面
        Register 所有注册页面
        common 公共页面
    components 是公共组件位置不涉及业务
    assets 静态资源文件
    hook hook文件夹
    config 配置文件夹
    i18 国际化文件夹
    routes 路由文件夹
    services 服务文件夹 包括api服务
    store 状态管理文件夹
    theme 主题文件夹
    types 类型文件夹
    utils 工具文件夹
3.每次更改只更改提示词提到的内容，没有提到的内容不能修改。
4.登录页面api相应数据处理是正确的。以后不要修改。
5.要做好公共组件的封装

// 图标容器规则
1. 图标容器必须提供足够空间，建议最小尺寸为40x40
2. 图标容器必须设置justifyContent: 'center'和alignItems: 'center'
3. 图标组件不应使用传入的props样式，而应使用自定义居中样式

// 列表项规则
1. 列表项应设置alignItems: 'center'确保内容垂直对齐
2. 列表项垂直内边距应至少为16，确保足够的触摸空间
3. 交互组件（如开关）应设置alignSelf: 'center'保证对齐

// 对齐一致性规则
1. 所有类似UI组件的容器尺寸和边距应保持一致
2. 图标尺寸应该统一，建议在16-24之间，根据用途选择合适大小
3. 所有交互元素应垂直居中对齐，避免视觉不协调

