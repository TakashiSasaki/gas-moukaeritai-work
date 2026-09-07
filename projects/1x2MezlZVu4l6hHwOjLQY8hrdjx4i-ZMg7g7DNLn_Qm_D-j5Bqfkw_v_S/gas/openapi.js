const OPENAPI =
{
  "openapi": "3.1.0",
  "info": {
    "title": "Personal memopad",
    "description": "Personal memopad",
    "version": "v0.0.4"
  },
  "servers": [
    {
      "url": "https://script.google.com/macros/s/AKfycbwzSMu0kC9yr2c253w4g-gJIHFSWexQntjx9KqVm6AzbngyGPU9wmeTZPGFOT8FHtQV/exec"
    }
  ],
  "paths": {
    "/hello": {
      "get": {
        "summary": "Hello Endpoint",
        "description": "Returns a simple 'hello' message.",
        "operationId": "getHello",
        "responses": {
          "200": {
            "description": "Successful response indicating the server is healthy.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "response": {
                      "type": "object",
                      "properties": {
                        "result": {
                          "type": "string"
                        }
                      },
                      "example": {
                        "result": "Hello, world!"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/getEmail": {
      "get": {
        "summary": "Get Email Address",
        "description": "Returns the email address of the authenticated user.",
        "operationId": "getEmail",
        "responses": {
          "200": {
            "description": "Email address of the authenticated user.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string"
                    }
                  },
                  "example": {
                    "email": "user@example.com"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/getActiveUserLocale": {
      "get": {
        "summary": "Get Active User Locale",
        "description": "Returns the locale setting of the authenticated active user.",
        "operationId": "getActiveUserLocale",
        "responses": {
          "200": {
            "description": "Locale setting of the authenticated active user.",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/read": {
      "get": {
        "summary": "Read Data from Cache",
        "description": "Reads and returns data associated with a given title from the user cache.",
        "operationId": "readData",
        "parameters": [
          {
            "name": "title",
            "in": "query",
            "required": true,
            "description": "Title of the data to read from cache.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Data associated with the provided title.",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/write": {
      "post": {
        "summary": "メモパッドに情報を保存する",
        "description": "タイトルをキーとして任意のテキストをメモパッドに保存します。",
        "operationId": "writeData",
        "parameters": [
          {
            "name": "title",
            "in": "query",
            "required": true,
            "description": "メモパッドにテキストを保存するためのキーを指定します。",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "description": "メモパッドに保存するテキストをリクエストボディに格納します。",
          "required": true,
          "content": {
            "text/plain": {
              "schema": {
                "type": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful write operation.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "response": {
                      "type": "object",
                      "properties": {
                        "result": {
                          "type": "string"
                        }
                      },
                      "example": {
                        "result": "Write operation successful."
                      }
                    }
                  }
                }
              }
            }
          },
        }
      }
    }
  },
  "components": {
    "schemas": {}
  }
}