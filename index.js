// self implemented version of http request redirection
// It is a package which deals with the http client side logic which relates to Redirection
// programming logics:
// 1. send a request to server
// 2. check whether redirect headers are sent back
// 			2.1 if yes, check whether the maximal redirect times has been reached
// 				2.1.1 if yes, throw error
// 				2.1.2 if no, resend http request
// 			2.2 if no, return as normal
