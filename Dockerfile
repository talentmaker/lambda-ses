FROM docker.io/amazonlinux:2

RUN yum install -y golang

WORKDIR /go/src/github.com/talentmaker/lambda-ses

COPY . .

RUN go get -v .
RUN GOOS=linux GOARCH=amd64 go build -o main .
