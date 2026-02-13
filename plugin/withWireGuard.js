const { withAndroidManifest, withInfoPlist, withEntitlementsPlist, withPlugins } = require('@expo/config-plugins');

const withWireGuardAndroid = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        // Add permissions
        if (!androidManifest.manifest['uses-permission']) {
            androidManifest.manifest['uses-permission'] = [];
        }

        const permissions = [
            'android.permission.INTERNET',
            'android.permission.FOREGROUND_SERVICE',
            'android.permission.BIND_VPN_SERVICE'
        ];

        permissions.forEach(permission => {
            if (!androidManifest.manifest['uses-permission'].some(p => p.$['android:name'] === permission)) {
                androidManifest.manifest['uses-permission'].push({
                    $: { 'android:name': permission }
                });
            }
        });

        // Service declaration is handled by the react-native-wireguard-vpn library's AndroidManifest.xml
        // merging process, so we don't need to duplicate it here.

        return config;
    });
};

const withWireGuardIOS = (config) => {
    // Update Info.plist
    config = withInfoPlist(config, async (config) => {
        const infoPlist = config.modResults;
        infoPlist.NSFaceIDUsageDescription = infoPlist.NSFaceIDUsageDescription || "This app uses Face ID to secure your VPN connection.";
        return config;
    });

    // Update Entitlements
    config = withEntitlementsPlist(config, async (config) => {
        const entitlements = config.modResults;
        if (!entitlements['com.apple.developer.networking.networkextension']) {
            entitlements['com.apple.developer.networking.networkextension'] = [];
        }
        if (!entitlements['com.apple.developer.networking.networkextension'].includes('packet-tunnel-provider')) {
            entitlements['com.apple.developer.networking.networkextension'].push('packet-tunnel-provider');
        }

        // App Groups are often required for sharing conf between app and extension
        // entitlements['com.apple.security.application-groups'] = ['group.com.your.app.bundle.id'];

        return config;
    });

    return config;
};

const withWireGuard = (config) => {
    return withPlugins(config, [
        withWireGuardAndroid,
        withWireGuardIOS
    ]);
};

module.exports = withWireGuard;
