import App from './app';
import Jasmine from 'jasmine';
// import Logger from 'jet-logger';

const port = 8081;

if (process.argv[2] !== 'test') {
    const server = new App();
    server.start(port);
} else {
  const jasmine = new Jasmine();

  jasmine.loadConfig({
    spec_dir: "src",
    spec_files:  [
      "./controllers/**/*.test.ts"
    ],
    "stopSpecOnExpectationFailure": false,
    "random": true
  })

  // jasmine.onComplete((passed: boolean) => {
  //   if (passed) {
  //       Logger.info('All tests have passed :)');
  //   } else {
  //       Logger.err('At least one test has failed :(');
  //   }
  // });

  // npm test -- "path to the unit-test file" (i.e. controllers/DemoController)
  let testPath = process.argv[3];

    if (testPath) {
        testPath = `./src/${testPath}.test.ts`;
        jasmine.execute([testPath]);
    } else {
        jasmine.execute();
    }
}