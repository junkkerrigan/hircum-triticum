FROM golang:1.15.3-alpine AS base

WORKDIR /go/src/app

ENV GOOS "linux"
ENV GOARCH "arm"
ENV CGO_ENABLED 0

COPY go.mod .
COPY go.sum .
COPY cmd cmd
COPY internal internal

RUN adduser -D -g "" parser && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/* && \
    apk update && \
    apk add --no-cache git && \
    go get ./... && \
    mkdir -p bin && \
    go build -o bin/parser cmd/parser/main.go


FROM scratch

COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /go/src/app/bin/parser /bin/parser

USER parser

ENTRYPOINT ["/bin/parser"]
