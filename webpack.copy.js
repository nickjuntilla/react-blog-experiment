var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = {
    context: path.join(__dirname, 'src'),
    devServer: {
        // This is required for webpack-dev-server if using a version <3.0.0.
        // The path should be an absolute path to your build destination.
        outputPath: path.join(__dirname, 'build')
    },
    plugins: [
        new CopyWebpackPlugin([

            // Copy directory contents to {output}/to/directory/
            //{ from: 'src/global/**/*', to: 'build/global/**/*' },


            // Copy glob results, relative to context
            {
                context: '/main/global',
                from: '**/*',
                to: '/global'
            },


        ], {
            // ignore: [
            //     // Doesn't copy any files with a txt extension
            //     '*.txt',
            //
            //     // Doesn't copy any file, even if they start with a dot
            //     { glob: '**/*', dot: true }
            // ],

            // By default, we only copy modified files during
            // a watch or webpack-dev-server build. Setting this
            // to `true` copies all files.
            copyUnmodified: true
        })
    ]
};
