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
  return std::make_shared<facebook::react::NativeFlashLightSpecJSI>(params);
}

- (UIViewController*) getRootVC {
    UIViewController *root = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
    while (root.presentedViewController != nil) {
        root = root.presentedViewController;
    }
    
    return root;
}
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
-(void) show:(double)anchorViewId menuItems:(NSArray *)menuItems icons:(NSArray *)icons resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject{
    dispatch_async(dispatch_get_main_queue(), ^{
      UIView *anchorView = [[self getRootVC].view viewWithTag:(NSInteger)anchorViewId];
       if (!anchorView) {
         reject(@"no_view", @"Could not find view with given ID", nil);
         return;
       }
      NSMutableArray *menuIcons = [[NSMutableArray alloc] init];
  
      for (NSDictionary *icon in icons) {
        UIImage *iconImage = [self imageForIconName:icon];
        [menuIcons addObject:iconImage];
          }
       [FTPopOverMenu showForSender:anchorView
                       withMenuArray:menuItems
                         imageArray:menuIcons
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
