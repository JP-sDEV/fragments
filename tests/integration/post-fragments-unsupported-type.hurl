POST http://localhost:8080/v1/fragments
Content-Type: image/png

# Using email:password for auth
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 201
HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
# Checking if  "createErrorResponse" is being used to generate error
jsonpath "$.error.code" == 415
