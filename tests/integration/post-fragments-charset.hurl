# 1. POST a text/plain; charset=utf-8 type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

# Using email:password for auth
[BasicAuth]
user1@email.com:password1

# Body of POST request
`This is a fragment!`

# Expect a 201 POST response
HTTP/1.1 201

[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
# Check if saved as text/plain
jsonpath "$.fragment.type" == "text/plain"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 19

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Check if type if text/plain
Content-Type: text/plain; charset=utf-8
Content-Length: 19

[Asserts]
body == "This is a fragment!"
