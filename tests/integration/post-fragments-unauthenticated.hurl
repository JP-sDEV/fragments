# 1. POST a text/plain; charset=utf-8 type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

# Using email:password for auth
[BasicAuth]
user1@email.com:wrongpassword

# Body of POST request
`This is a fragment!`

# Expect a 401 POST response
HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Unauthorized"
