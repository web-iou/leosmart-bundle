//
//  RCTNativePopover.m
//  TSun_App
//
//  Created by cc on 2025/3/21.
//

#import "RCTNativePopover.h"
#import "FTPopOverMenu.h"
@implementation RCTNativePopover
RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativePopoverSpecJSI>(params);
}

- (UIViewController*) getRootVC {
    UIViewController *root = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
    while (root.presentedViewController != nil) {
        root = root.presentedViewController;
    }
    
    return root;
}
//根据unicode解析iconfont中的图标
-(UIImage *) imageForIconName: (NSDictionary *) icon {
  
  NSString *glyph = [icon objectForKey: @"glyph"];
  NSNumber *size = [icon objectForKey: @"size"];
  NSString *color = [icon objectForKey: @"color"];
  UIColor *uiColor = [self ColorFromHexCode: color];
  UIFont *font =[UIFont fontWithName:@"iconfont" size:[size floatValue]];
    NSAttributedString *attributedString = [[NSAttributedString alloc] initWithString:glyph attributes:@{NSFontAttributeName: font, NSForegroundColorAttributeName: uiColor}];
    
    CGSize iconSize = [attributedString size];
    UIGraphicsBeginImageContextWithOptions(iconSize, NO, 0.0);
    [attributedString drawAtPoint:CGPointMake(0, 0)];
    
    UIImage *iconImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return iconImage;
}

-(void)show:(double)anchorViewId menuItems:(NSArray *)menuItems icons:(NSArray *)icons config:(JS::NativePopover::PopOverMenuConfiguration &)config resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject{
  FTPopOverMenuConfiguration *ftConfig = [FTPopOverMenuConfiguration new];

  // 应用配置
  std::optional<double> menuWidth = config.menuWidth();
  if (menuWidth.has_value()) {
    ftConfig.menuWidth = menuWidth.value();
  }
  
  std::optional<double> menuTextMargin = config.menuTextMargin();
  if (menuTextMargin.has_value()) {
    ftConfig.menuTextMargin = menuTextMargin.value();
  }
  
  std::optional<double> menuIconMargin = config.menuIconMargin();
  if (menuIconMargin.has_value()) {
    ftConfig.menuIconMargin = menuIconMargin.value();
  }
  
  std::optional<double> menuRowHeight = config.menuRowHeight();
  if (menuRowHeight.has_value()) {
    ftConfig.menuRowHeight = menuRowHeight.value();
  }
  
  std::optional<double> menuCornerRadius = config.menuCornerRadius();
  if (menuCornerRadius.has_value()) {
    ftConfig.menuCornerRadius = menuCornerRadius.value();
  }
  
  NSString *textColor = config.textColor();
  if (textColor) {
    ftConfig.textColor = [self ColorFromHexCode:textColor];
  }
  
  NSString *backgroundColor = config.backgroundColor();
  if (backgroundColor) {
    ftConfig.backgroundColor = [self ColorFromHexCode:backgroundColor];
  }
  
  NSString *borderColor = config.borderColor();
  if (borderColor) {
    ftConfig.borderColor = [self ColorFromHexCode:borderColor];
  }
  
  std::optional<double> borderWidth = config.borderWidth();
  if (borderWidth.has_value()) {
    ftConfig.borderWidth = borderWidth.value();
  }
  
  NSString *textAlignment = config.textAlignment();
  if (textAlignment) {
    if ([textAlignment isEqualToString:@"left"]) {
      ftConfig.textAlignment = NSTextAlignmentLeft;
    } else if ([textAlignment isEqualToString:@"center"]) {
      ftConfig.textAlignment = NSTextAlignmentCenter;
    } else if ([textAlignment isEqualToString:@"right"]) {
      ftConfig.textAlignment = NSTextAlignmentRight;
    }
  }
  
  std::optional<bool> ignoreImageOriginalColor = config.ignoreImageOriginalColor();
  if (ignoreImageOriginalColor.has_value()) {
    ftConfig.ignoreImageOriginalColor = ignoreImageOriginalColor.value();
  }
  
  std::optional<bool> allowRoundedArrow = config.allowRoundedArrow();
  if (allowRoundedArrow.has_value()) {
    ftConfig.allowRoundedArrow = allowRoundedArrow.value();
  }
  
  std::optional<double> animationDuration = config.animationDuration();
  if (animationDuration.has_value()) {
    ftConfig.animationDuration = animationDuration.value();
  }
  
  NSString *selectedTextColor = config.selectedTextColor();
  if (selectedTextColor) {
    ftConfig.selectedTextColor = [self ColorFromHexCode:selectedTextColor];
  }
  
  NSString *selectedCellBackgroundColor = config.selectedCellBackgroundColor();
  if (selectedCellBackgroundColor) {
    ftConfig.selectedCellBackgroundColor = [self ColorFromHexCode:selectedCellBackgroundColor];
  }
  
  NSString *separatorColor = config.separatorColor();
  if (separatorColor) {
    ftConfig.separatorColor = [self ColorFromHexCode:separatorColor];
  }
  
  NSString *shadowColor = config.shadowColor();
  if (shadowColor) {
    ftConfig.shadowColor = [self ColorFromHexCode:shadowColor];
  }
  
  std::optional<double> shadowOpacity = config.shadowOpacity();
  if (shadowOpacity.has_value()) {
    ftConfig.shadowOpacity = shadowOpacity.value();
  }
  
  std::optional<double> shadowRadius = config.shadowRadius();
  if (shadowRadius.has_value()) {
    ftConfig.shadowRadius = shadowRadius.value();
  }
  
  std::optional<double> shadowOffsetX = config.shadowOffsetX();
  std::optional<double> shadowOffsetY = config.shadowOffsetY();
  if(shadowOffsetX.has_value()){
    ftConfig.shadowOffsetX=shadowOffsetX.value();
  }
  if(shadowOffsetY.has_value()){
    ftConfig.shadowOffsetY=shadowOffsetY.value();
  }

  NSString *coverBackgroundColor = config.coverBackgroundColor();
  if (coverBackgroundColor) {
    ftConfig.coverBackgroundColor = [self ColorFromHexCode:coverBackgroundColor];
  }
  
  std::optional<double> horizontalMargin = config.horizontalMargin();
  if (horizontalMargin.has_value()) {
    ftConfig.horizontalMargin = horizontalMargin.value();
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    // 查找锚点视图
    UIView *anchorView = [[self getRootVC].view viewWithTag:(NSInteger)anchorViewId];
    if (!anchorView) {
      reject(@"no_view", @"Could not find view with given ID", nil);
      return;
    }
    
    // 处理图标
    NSMutableArray *menuIcons = [[NSMutableArray alloc] init];
    for (NSString *icon in icons) {
      
      if(icon == nil || [icon isKindOfClass:[NSNull class]]){
        [menuIcons addObject:icon];
      }else{
        UIImage *image = [UIImage imageWithContentsOfFile:icon];
        [menuIcons addObject:image];
      }
    }
    
    // 创建配置
    

    
    // 应用配置并显示弹出菜单
    [FTPopOverMenu showForSender:anchorView
                   withMenuArray:menuItems
                      imageArray:menuIcons
                      configuration:ftConfig
                      doneBlock:^(NSInteger selectedIndex) {
                        resolve(@(selectedIndex));
                      }
                   dismissBlock:^{}];
  });
}
- (UIColor *) ColorFromHexCode:(NSString *)hexString {
    NSString *cleanString = [hexString stringByReplacingOccurrencesOfString:@"#" withString:@""];
    if([cleanString length] == 3) {
        cleanString = [NSString stringWithFormat:@"%@%@%@%@%@%@",
                       [cleanString substringWithRange:NSMakeRange(0, 1)],[cleanString substringWithRange:NSMakeRange(0, 1)],
                       [cleanString substringWithRange:NSMakeRange(1, 1)],[cleanString substringWithRange:NSMakeRange(1, 1)],
                       [cleanString substringWithRange:NSMakeRange(2, 1)],[cleanString substringWithRange:NSMakeRange(2, 1)]];
    }
    if([cleanString length] == 6) {
        cleanString = [cleanString stringByAppendingString:@"ff"];
    }
    
    unsigned int baseValue;
    [[NSScanner scannerWithString:cleanString] scanHexInt:&baseValue];
    
    float red = ((baseValue >> 24) & 0xFF)/255.0f;
    float green = ((baseValue >> 16) & 0xFF)/255.0f;
    float blue = ((baseValue >> 8) & 0xFF)/255.0f;
    float alpha = ((baseValue >> 0) & 0xFF)/255.0f;
    
    return [UIColor colorWithRed:red green:green blue:blue alpha:alpha];
}

@end
