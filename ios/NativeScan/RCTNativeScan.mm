//
//  RCTNativeScan.m
//  leosmart
//
//  Created by cc on 2025/3/25.
//

#import "RCTNativeScan.h"
#import <Vision/Vision.h>

@implementation RCTNativeScan
RCT_EXPORT_MODULE()
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeScanSpecJSI>(params);
}
- (void)scanBarcodeFromImage:(NSString *)image resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject{
  NSURL *imageUrl=[NSURL URLWithString:image];
  CIImage *ciImage = [CIImage imageWithContentsOfURL:imageUrl];
  VNDetectBarcodesRequest *barcodeRequest = [[VNDetectBarcodesRequest alloc] initWithCompletionHandler:^(VNRequest *request, NSError * _Nullable error) {
      if (error) {
        reject(@"SCAN_ERROR", @"条形码识别失败", error);
          return;
      }
      NSArray<VNBarcodeObservation *> *results = request.results;
    
      for (VNBarcodeObservation *observation in results) {
          NSString *detectedValue = observation.payloadStringValue;
          resolve(detectedValue);
          return;
      }

      // ❌ 没有匹配的条形码
          reject(@"NO_MATCHING_BARCODE", @"未检测到匹配的条形码", nil);
  }];

  VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCIImage:ciImage options:@{}];
  [handler performRequests:@[barcodeRequest] error:nil];
}
 
@end
