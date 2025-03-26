//
//  RCTNativeRinging.m
//  leosmart
//
//  Created by cc on 2025/3/25.
//

#import "RCTNativeRinging.h"
#import <AVFoundation/AVFoundation.h>

@implementation RCTNativeRinging
RCT_EXPORT_MODULE()
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRingingSpecJSI>(params);
}
- (void)ringing:(double)index{
  AudioServicesPlaySystemSound(index);
}
@end
