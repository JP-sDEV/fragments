# 1. POST a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

# Using email:password for auth
[BasicAuth]
user1@email.com:password1

# Body of POST request
`This is a fragment!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"
createdDate: jsonpath "$.fragment.created"

# 2. Edit the fragment previously posted
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`edited fragment`

HTTP/1.1 200
