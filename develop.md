登录成功后，后端返回数据格式如下：

sub:panzhen@tsun-ess.com
clientId:app
iss:https://tsc2cloud.com
token_type:Bearer
access_token:jI97Off-E0nuyBX7CA8oVwnWx4YT7QNBuVvcokjUfJM_R5OdUL_0eQR6PHiCqQUY2huEZnRJ9JVyDjpyaBwQAHQ2b4MZrYmWk4b0MVNA8UDtN-KSv_PvAFAFhS_ztZcw
refresh_token:cfLANzHKnaXc5RcazO-4YVng8QyzHIQV67lzZcfNlztyL8UDohHPGDZHBLsnBRJfEuCK9jjtfqCbpHc7WtR9PBuFBo80tZu2F13Copu_iHpYW5fOiOng29lYBdRkgRaB
license:https://tsc2cloud.com
nbf:2025-03-22T07:32:29.468477669Z
user_id:1899691888713842690
exp:2025-03-22T19:32:29.468477669Z
expires_in:43199
iat:2025-03-22T07:32:29.468477669Z
jti:152444f2-1f4f-4507-ad75-3fc13495319e
username:panzhen@tsun-ess.com
use_info:{
    password:null
    username:panzhen@tsun-ess.com
    authorities:
    accountNonExpired:true
    accountNonLocked:true
    credentialsNonExpired:true
    enabled:true
    attributes:
    id:1899691888713842690
    deptId:null
    phone:null
    email:panzhen@tsun-ess.com
    userType:1
    name:panzhen@tsun-ess.com
}
登录后要缓存用户数据，
app支持多角色，userType等于1 是业主角色 不是1就是安装商或运营商角色，登录完成后要根据角色不同跳转到不同的页面，要把业主页面和安装商的页面分开

我们接下来划分包
pages下
Login 登录页面
InstallerMain 安装商角色的所有页面
OwnerMain 业主的所有页面
Register 所有注册页面
common 公共页面

接下来我们完成 服务条款和隐私政策页面
当用户点击 服务条款时 显示服务条款内容 内容在：
http://114.55.0.234/private/agreement_en.html
http://114.55.0.234/private/agreement_zh.html
要根据当前语言显示相应的内容

隐私政策地址为

http://114.55.0.234/private/privacy_en.html
http://114.55.0.234/private/privacy_zh.html
这里建议使用webview

写所有页面必须考虑主题 不要在页面中写死色值 要写到主题文件中
接下来完成找回密码功能 
当用户点击忘记密码跳转到重置密码页面
获取验证码接口：
'/admin/email/vld/' + {email},

修改密码接口为：
method: 'put',
    url: '/admin/register/email/change',


注册功能
注册功能 分三步 
第一步 选角色 角色有业主，安装商/运营商
第二步 填写信息 信息 包含 邮箱 邮箱验证码 密码 上级安装商运营商代码 公司名称（只有在角色是安装商/运营商的情况下才填写）
第三步 完成注册

接口 

获取验证码 
  url: /admin/email/reg/' + {email} 
  method:post

 注册接口
   url：/admin/register/mail
   method：post
   
   参数：
   
注册用户

countyCollapse allstring
注册国家/地区

timeZoneCollapse allstring
注册时区

lngCollapse allstring
注册语言

centerCollapse allstring
数据中心

userTypeCollapse allintegerint32
用户类型；业主:1;安装商:2

codeCollapse allstring
邮箱验证码

emailCollapse allstring
邮箱

phoneCollapse allstring
手机号码

usernameCollapse allstring
用户账号

passwordCollapse allstring
密码

companyNameCollapse allstring
公司名称

parentCompanyNameCollapse allstring
上级公司名称，不用传入

parentCodeCollapse allstring
安装商或上级公司Code

接下来我们完成业主登录后的页面
页面底部有tab 有设备 统计 我的
先完成设备页面 对于底部的tab进行抽离 他是业主的公共部分

接下来我们完成业主 我的 页面

接下来我们完成业主 统计 页面
 调用接口部分暂时空出来 

import { Modal } from 'react-native';

接下来我们优化国际化 
从后端获取支持的所有语言包接口为
url：/admin/trm/general
method：get

第一次打开app需要从后端获取国际化，然后进行缓存，当后面打开app时使用缓存的国际化，然后异步从后端获取最新的国际化并缓存，更新界面。
切换语言时，不用从后端再获取语言包。

接下来我们修改注册页面 增加选择国家和地区 默认选择用户所在的国家  当用户选择国家或地区后 下方出现该国家或地区的时区 用户可更换时区。这部分内容增加在最顶部，国家或地区数据 地区数据由后端接口提供，需要调用接口的地方空出来，后面处理。

接下来我们继续修改注册页面 注册第一步时需要选择站点 参照图片，获取站点的接口调用部分暂时空出来

接下来我们开发设备控制页面，当用户点击设备控制时跳转页面到设备控制页面，

接下里我们完成安装商/运营商的概览界面
 需要调用接口的部分暂时空出来

接下里我们完成安装商/运营商的概览界面当用户点击总设备，在线设备，离线设备，故障设备，跳转到监控页面并选中相应的筛选

接下来我们完善登录页面，点击更多，底部弹出，弹出框内有选择站点 切换主题 选择语言


