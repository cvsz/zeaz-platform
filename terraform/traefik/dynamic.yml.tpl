http:
  middlewares:
    zeaz-secure-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: false
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
        frameDeny: true

    zeaz-api-cors:
      headers:
        accessControlAllowMethods:
          - GET
          - POST
          - PUT
          - PATCH
          - DELETE
          - OPTIONS
        accessControlAllowHeaders:
          - Authorization
          - Content-Type
          - X-Requested-With
        accessControlAllowOriginList:
          %{ for origin in allowed_origins ~}
          - "${origin}"
          %{ endfor ~}
        accessControlMaxAge: 100
        addVaryHeader: true

    zeaz-rate-limit-soft:
      rateLimit:
        average: 100
        burst: 50
