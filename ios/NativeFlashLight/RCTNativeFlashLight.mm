#import "RCTNativeFlashLight.h"
#import <AVFoundation/AVFoundation.h>



@implementation RCTNativeFlashLight
// ✅ 让类显式遵循协议
RCT_EXPORT_MODULE()


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeFlashLightSpecJSI>(params);
}

- (void)open {
  AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
   if (device && [device hasTorch]) {
     NSError *error = nil;
     [device lockForConfiguration:&error];
     if (!error) {
       device.torchMode = AVCaptureTorchModeOn;
       [device unlockForConfiguration];
     }
   }

}
- (void)close{
  AVCaptureDevice *device = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
   if (device && [device hasTorch]) {
     NSError *error = nil;
     [device lockForConfiguration:&error];
     if (!error) {
       device.torchMode = AVCaptureTorchModeOff;
       [device unlockForConfiguration];
     }
   }
}
- (void)notice{
  AudioServicesPlaySystemSound(1057);
}
@end
