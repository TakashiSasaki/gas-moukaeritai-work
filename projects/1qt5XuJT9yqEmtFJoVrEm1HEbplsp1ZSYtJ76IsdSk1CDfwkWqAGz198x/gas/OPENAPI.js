const OPENAPI =
{
  "openapi": "3.0.3",
  "info": {
    "title": "Echo API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://script.google.com/macros/s/AKfycbwtkfh8j8KYzya2-qzGqyPY8CkMk_7q57io0k1abpvZY9mxoOG_h0U4FrQ54pMR-aum/exec"
    }
  ],
  "paths": {
    "/echo": {
      "get": {
        "summary": "Echo API",
        "description": "任意のパラメータを受け取ります。",
        "operationId": "getEcho",
        "parameters": [
          {
            "name": "param",
            "in": "query",
            "description": "任意のパラメータ",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功したレスポンス",
            "content": {
              "application/json; charset=utf-8": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "エコーメッセージ"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Echo API",
        "description": "任意のパラメータを受け取ります。",
        "operationId": "postEcho",
        "parameters": [
          {
            "name": "param",
            "in": "query",
            "description": "任意のパラメータ",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "成功したレスポンス",
            "content": {
              "application/json; charset=utf-8": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "エコーメッセージ"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
