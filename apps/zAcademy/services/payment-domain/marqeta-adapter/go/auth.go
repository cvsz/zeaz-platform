package marqeta

import "encoding/base64"

func basicAuthHeader(appToken, accessToken string) string {
	raw := appToken + ":" + accessToken
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(raw))
}
