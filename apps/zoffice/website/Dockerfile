FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
EXPOSE 80
USER nginx
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget --spider http://localhost:80/ || exit 1
