const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace roots
const projectRoot = __dirname;
// This can be replaced with `find-up` or manual path as below
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to look for modules and prioritize local ones
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force React related packages to resolve to the mobile app's node_modules
const mobileNodeModules = path.resolve(projectRoot, 'node_modules');
config.resolver.extraNodeModules = {
    'react': path.resolve(mobileNodeModules, 'react'),
    'react-native': path.resolve(mobileNodeModules, 'react-native'),
    '@react-native-async-storage/async-storage': path.resolve(mobileNodeModules, '@react-native-async-storage/async-storage'),
    // Add other packages that might be duplicated
};

// 4. Update the block list to avoid indexing the entire monorepo's node_modules for conflicting packages
config.resolver.blockList = [
    new RegExp(`${workspaceRoot}/node_modules/react/.*`),
    new RegExp(`${workspaceRoot}/node_modules/react-native/.*`),
];

module.exports = config;

