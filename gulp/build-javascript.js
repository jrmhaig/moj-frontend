const { readFileSync } = require('fs')

const { glob } = require('glob')
const gulp = require('gulp')

const { compileScripts } = require('./tasks/scripts')

gulp.task('build:javascript', async () => {
  const modulePaths = await glob('moj/components/**/*.{cjs,js,mjs}', {
    cwd: 'src',
    ignore: ['**/*.spec.{cjs,js,mjs}'],
    nodir: true
  })

  // Create Rollup bundle(s)
  for (const modulePath of [
    ...modulePaths,

    // Build entry scripts last to restore modules
    // removed from components due to tree-shaking
    'moj/version.mjs',
    'moj/helpers.mjs',
    'moj/all.mjs'
  ]) {
    await compileScripts(modulePath, {
      srcPath: 'src',
      destPath: 'package',

      // Customise output
      output: [
        {
          entryFileNames: '[name].mjs',
          preserveModules: true,
          preserveModulesRoot: 'src'
        },
        {
          file: modulePath.replace('.mjs', '.js'),
          format: 'umd',
          name: 'MOJFrontend'
        }
      ]
    })()
  }
})

gulp.task(
  'build:javascript-minified',
  compileScripts('all.mjs', {
    srcPath: 'src/moj',
    destPath: 'package/moj',

    // Customise output
    output: [
      {
        compact: true,
        file: 'moj-frontend.min.js',
        format: 'umd',
        name: 'MOJFrontend'
      },
      {
        banner: readFileSync('node_modules/jquery/dist/jquery.js', 'utf8'),
        compact: true,
        file: 'all.jquery.min.js',
        format: 'umd',
        name: 'MOJFrontend'
      }
    ]
  })
)
