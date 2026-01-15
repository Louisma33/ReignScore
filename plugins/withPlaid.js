const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPlaid(config) {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

            // Ensure file exists before trying to read it
            if (fs.existsSync(podfilePath)) {
                let podfile = await fs.promises.readFile(podfilePath, 'utf-8');
                const plaidLine = "pod 'Plaid', '~> 6.0'";
                if (!podfile.includes(plaidLine)) {
                    podfile = podfile.replace(
                        /target '.*' do/,
                        `$&\n  ${plaidLine}`
                    );
                    await fs.promises.writeFile(podfilePath, podfile);
                }
            }
            return config;
        },
    ]);
};
