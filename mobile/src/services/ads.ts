import { InterstitialAd, BannerAd, TestIds } from 'react-native-google-mobile-ads';

export class AdService {
  private static interstitial: InterstitialAd;

  static initialize() {
    this.interstitial = InterstitialAd.createForAdRequest(
      __DEV__ ? TestIds.INTERSTITIAL : 'your-ad-unit-id'
    );
  }

  static async showInterstitial() {
    await this.interstitial.load();
    await this.interstitial.show();
  }
}
