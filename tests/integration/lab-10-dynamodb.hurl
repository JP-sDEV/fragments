# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{
    "service": "DynamoDB"
}

# Check that the response status code is 201
HTTP/1.1 201

# 2. Capture the Location header and fragment ID
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 3. GET the fragment info using the captured Location URL
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

# Check that the response status code is 200 and metadata properties are as expected
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" > 0

# 4. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`DynamoDB is **great**.`

# Check that the response status code is 201
HTTP/1.1 201

[Captures]
response_body: body

# 5. Capture the Location header and second fragment ID
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 6. GET the fragment info using the captured Location URL
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

# Check that the response status code is 200 and metadata properties are as expected
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" > 0

# 7. GET all fragments for the authorized user without expanding them
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# Check that the response status code is 200 and includes the two IDs
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" includes {{fragment1_id}}
jsonpath "$.fragments[*]" includes {{fragment2_id}}

# 8. DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# 9. Check that the response status code is 200
HTTP/1.1 200

# 10. Try to GET the first fragment again
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# 11. Check that the response status code is 404 (not found)
HTTP/1.1 404

# 12. GET all fragments for the authorized user without expanding them a second time
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# Check that the response status code is 200 and includes only the second ID
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.fragments[*]" not includes {{fragment1_id}}
jsonpath "$.fragments[*]" includes {{fragment2_id}}
