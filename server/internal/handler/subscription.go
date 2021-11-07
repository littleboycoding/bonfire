package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

type Relay struct {
	clients []*Client
	DB      *gorm.DB
}

type Client struct {
	Name string
	Conn *net.Conn
}

func (r *Relay) Broadcast(c *Client, event string, data interface{}) {
	e := Event{event, data}

	wsutil.WriteServerText(*c.Conn, e.Json())
}

func (r *Relay) BroadcastAll(event string, data interface{}) {
	for _, client := range r.clients {
		go r.Broadcast(client, event, data)
	}
}

func (r *Relay) BroadcastFromClient(c *Client, event string, data interface{}) {
	for _, client := range r.clients {
		if client.Name == c.Name {
			continue
		}

		go r.Broadcast(client, event, data)
	}
}

func (r *Relay) Leave(c *Client) {
	for i, client := range r.clients {
		if c.Name == client.Name {
			log.Printf("%s has left the session !\n", c.Name)
			(*client.Conn).Close()
			r.clients[i] = r.clients[len(r.clients)-1]
			r.clients = r.clients[:len(r.clients)-1]
			break
		}
	}
}

func (s *Relay) Join(name string, w http.ResponseWriter, r *http.Request) (*Client, error) {
	for _, client := range s.clients {
		if name == client.Name {
			log.Printf("User with name `%s` has already connected", name)
			return nil, fmt.Errorf("User with name `%s` has already connected", name)
		}
	}

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		log.Fatal(err)
	}

	client := &Client{
		Name: name,
		Conn: &conn,
	}
	s.clients = append(s.clients, client)

	log.Printf("%s has connected !\n", name)

	return client, nil
}

func (relay *Relay) createHandler(c *Client, w http.ResponseWriter, r *http.Request) http.HandlerFunc {
	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		go func() {
			defer relay.Leave(c)

			r := wsutil.NewReader(*c.Conn, ws.StateServerSide)
			w := wsutil.NewWriter(*c.Conn, ws.StateServerSide, ws.OpText)
			decoder := json.NewDecoder(r)

			for {
				hdr, err := r.NextFrame()
				if err != nil {
					continue
				}

				if hdr.OpCode == ws.OpClose {
					return
				}

				var e Event
				if err := decoder.Decode(&e); err != nil {
					log.Println("Error parsing JSON")
					return
				}
				relay.eventHandler(&e, c, relay.DB)

				if err = w.Flush(); err != nil {
					return
				}
			}
		}()
	})

	return f
}

func (h *Handler) Subscription(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	q := r.URL.Query()
	if !q.Has("name") {
		writeError("Name is missing from query parameters", w)
		return
	}
	name := q.Get("name")

	client, err := h.Relay.Join(name, w, r)
	if err != nil {
		writeError(err.Error(), w)
		return
	}

	h.Relay.createHandler(client, w, r)(w, r)
}
