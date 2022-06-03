// This is a helper class.
// Has zero impact on the code here, but is used in CICD.
// It simply reformats Jest's output in a way that looks
// better for GitHub Actions reports.
class GithubActionsReporter {
    constructor(globalConfig, options) {
      this._globalConfig = globalConfig
      this._options = options
    }
  
    onRunComplete(contexts, results) {
      results.testResults.forEach((testResultItem) => {
        const testFilePath = testResultItem.testFilePath
  
        testResultItem.testResults.forEach((result) => {
          if (result.status !== 'failed') {
            return
          }
  
          result.failureMessages.forEach((failureMessages) => {
            const newLine = '%0A'
            const message = failureMessages.replace(/\n/g, newLine)
            const captureGroup = message.match(/:([0-9]+):([0-9]+)/)
  
            if (!captureGroup) {
              console.log('Unable to extract line number from call stack')
              return
            }
  
            const [, line, col] = captureGroup
            console.log(
              `::error file=${testFilePath},line=${line},col=${col}::${message}`,
            )
          })
        })
      })
    }
  }
  
  module.exports = GithubActionsReporter