const example_error = {
  "error": {
    "code": 400,
    "message": "スクリプトエラーが発生しました。",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.apps.script.v1.ExecutionError",
        "errorMessage": "TypeError: Cannot read property 'length' of undefined",
        "errorType": "USER_TRIGGERED",
        "scriptStackTraceElements": [
          {
            "function": "myFunction",
            "lineNumber": 10
          }
        ]
      }
    ]
  }
}
