package main

import (
	"log"
	"net/http"

	"gitlab.com/hmajid2301/articles/example-fizz-project/internal/server"
)

func main() {
	router, err := server.NewRouter()
	if err != nil {
		log.Fatal(err)
	}
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}
	srv.ListenAndServe()
}
